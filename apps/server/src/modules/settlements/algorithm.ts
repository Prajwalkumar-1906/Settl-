import { User, Expense, Settlement, NetBalance, OptimizedTransaction, Currency, GroupBalancesSummary, Donation } from 'shared-types';

export interface UserBalance {
  user: User;
  netAmount: number;
  totalPaid: number;
  totalOwed: number;
}

/**
 * Calculates net balance for every group member based on expense splits and completed settlements.
 */
export function calculateNetBalances(
  members: User[],
  expenses: Expense[],
  settlements: Settlement[]
): Map<string, UserBalance> {
  const balanceMap = new Map<string, UserBalance>();

  // Initialize all members with zero net balance
  for (const member of members) {
    balanceMap.set(member.id, {
      user: member,
      netAmount: 0,
      totalPaid: 0,
      totalOwed: 0,
    });
  }

  // Process expenses
  for (const expense of expenses) {
    // Only account for confirmed expenses
    if (expense.status === 'disputed') continue;

    // Credit the payer
    const payerId = expense.paidById || (expense as any).paidBy;
    const payerBalance = balanceMap.get(payerId);
    if (payerBalance) {
      payerBalance.totalPaid += expense.amount;
      payerBalance.netAmount += expense.amount;
    }

    // Debit each split user
    for (const split of expense.splits) {
      const splitBalance = balanceMap.get(split.userId);
      if (splitBalance) {
        splitBalance.totalOwed += split.amount;
        splitBalance.netAmount -= split.amount;
      }
    }
  }

  // Process existing completed settlements
  for (const settlement of settlements) {
    if (settlement.status !== 'completed') continue;

    // Payer sent money -> net balance increases (debt reduced)
    const fromBalance = balanceMap.get(settlement.fromUserId);
    if (fromBalance) {
      fromBalance.netAmount += settlement.amount;
    }

    // Recipient received money -> net balance decreases (credit reduced)
    const toBalance = balanceMap.get(settlement.toUserId);
    if (toBalance) {
      toBalance.netAmount -= settlement.amount;
    }
  }

  // Round net amounts to 2 decimal places to prevent floating point inaccuracies
  for (const balance of balanceMap.values()) {
    balance.netAmount = Math.round(balance.netAmount * 100) / 100;
    balance.totalPaid = Math.round(balance.totalPaid * 100) / 100;
    balance.totalOwed = Math.round(balance.totalOwed * 100) / 100;
  }

  return balanceMap;
}

/**
 * Naive debt calculator: generates direct debts for every single expense split.
 */
export function calculateNaiveTransactions(
  expenses: Expense[],
  settlements: Settlement[],
  membersMap: Map<string, User>,
  currency: Currency
): OptimizedTransaction[] {
  // Map of pairwise debt: `${fromId}->${toId}` => amount
  const debtPairMap = new Map<string, number>();

  for (const expense of expenses) {
    if (expense.status === 'disputed') continue;
    const payerId = expense.paidById || (expense as any).paidBy;

    for (const split of expense.splits) {
      if (split.userId === payerId) continue;
      const key = `${split.userId}->${payerId}`;
      const existing = debtPairMap.get(key) || 0;
      debtPairMap.set(key, existing + split.amount);
    }
  }

  // Subtract completed settlements
  for (const settlement of settlements) {
    if (settlement.status !== 'completed') continue;
    const key = `${settlement.fromUserId}->${settlement.toUserId}`;
    const existing = debtPairMap.get(key) || 0;
    debtPairMap.set(key, existing - settlement.amount);
  }

  const naiveTransactions: OptimizedTransaction[] = [];
  let counter = 1;

  for (const [key, amount] of debtPairMap.entries()) {
    const roundedAmount = Math.round(amount * 100) / 100;
    if (roundedAmount > 0.01) {
      const [fromId, toId] = key.split('->');
      const fromUser = membersMap.get(fromId);
      const toUser = membersMap.get(toId);

      if (fromUser && toUser) {
        naiveTransactions.push({
          id: `naive-${counter++}`,
          fromUser,
          toUser,
          amount: roundedAmount,
          currency,
          isSuggested: false,
        });
      }
    }
  }

  return naiveTransactions;
}

/**
 * Min Cash Flow Algorithm:
 * Reduces N-way group debts to the minimum number of transactions using a Greedy Max-Heap / Min-Heap strategy.
 * Time Complexity: O(N log N)
 */
export function minimizeCashFlow(
  netBalances: UserBalance[],
  currency: Currency
): OptimizedTransaction[] {
  // Filter creditors (> 0.01) and debtors (< -0.01)
  const creditors: { user: User; amount: number }[] = [];
  const debtors: { user: User; amount: number }[] = [];

  for (const item of netBalances) {
    const amount = Math.round(item.netAmount * 100) / 100;
    if (amount > 0.01) {
      creditors.push({ user: item.user, amount });
    } else if (amount < -0.01) {
      debtors.push({ user: item.user, amount: Math.abs(amount) });
    }
  }

  const transactions: OptimizedTransaction[] = [];
  let txCounter = 1;

  // Greedily match largest debtor with largest creditor
  while (creditors.length > 0 && debtors.length > 0) {
    // Sort creditors descending by amount
    creditors.sort((a, b) => b.amount - a.amount);
    // Sort debtors descending by debt amount
    debtors.sort((a, b) => b.amount - a.amount);

    const largestCreditor = creditors[0];
    const largestDebtor = debtors[0];

    const settledAmount = Math.round(Math.min(largestCreditor.amount, largestDebtor.amount) * 100) / 100;

    if (settledAmount > 0.009) {
      transactions.push({
        id: `settle-opt-${txCounter++}`,
        fromUser: largestDebtor.user,
        toUser: largestCreditor.user,
        amount: settledAmount,
        currency,
        isSuggested: true,
      });
    }

    largestCreditor.amount = Math.round((largestCreditor.amount - settledAmount) * 100) / 100;
    largestDebtor.amount = Math.round((largestDebtor.amount - settledAmount) * 100) / 100;

    if (largestCreditor.amount <= 0.01) {
      creditors.shift();
    }
    if (largestDebtor.amount <= 0.01) {
      debtors.shift();
    }
  }

  return transactions;
}

/**
 * Computes full summary for a group, including net balances, naive transactions, and min-cash-flow optimized plan.
 */
export function generateGroupSummary(
  members: User[],
  expenses: Expense[],
  settlements: Settlement[],
  donations: Donation[],
  currency: Currency,
  groupId: string
): GroupBalancesSummary {
  const membersMap = new Map<string, User>(members.map(m => [m.id, m]));
  const balanceMap = calculateNetBalances(members, expenses, settlements);
  const netBalancesList: UserBalance[] = Array.from(balanceMap.values());

  const balances: NetBalance[] = netBalancesList.map(b => ({
    userId: b.user.id,
    user: b.user,
    netAmount: b.netAmount,
    totalPaid: b.totalPaid,
    totalOwed: b.totalOwed,
  }));

  const naiveTransactions = calculateNaiveTransactions(expenses, settlements, membersMap, currency);
  const optimizedTransactions = minimizeCashFlow(netBalancesList, currency);

  const naiveCount = naiveTransactions.length;
  const optCount = optimizedTransactions.length;
  let reductionPercentage = 0;
  if (naiveCount > 0) {
    reductionPercentage = Math.round(((naiveCount - optCount) / naiveCount) * 100);
  }

  const totalGroupSpend = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalRoundUpDonations = donations.reduce((acc, curr) => acc + curr.amount, 0);
  const totalCarbonFootprintKg = expenses.reduce((acc, curr) => acc + (curr.carbonEstimateKg || 0), 0);

  return {
    groupId,
    currency,
    balances,
    naiveTransactions,
    optimizedTransactions,
    reductionPercentage,
    totalGroupSpend: Math.round(totalGroupSpend * 100) / 100,
    totalRoundUpDonations: Math.round(totalRoundUpDonations * 100) / 100,
    totalCarbonFootprintKg: Math.round(totalCarbonFootprintKg * 10) / 10,
  };
}
