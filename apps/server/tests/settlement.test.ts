import { describe, it, expect } from 'vitest';
import { User, Expense, Settlement, Currency } from 'shared-types';
import {
  calculateNetBalances,
  calculateNaiveTransactions,
  minimizeCashFlow,
  generateGroupSummary,
} from '../src/modules/settlements/algorithm';

describe('Settl Minimum Cash Flow Engine', () => {
  const alice: User = { id: 'u1', name: 'Alice', email: 'alice@example.com', isEmailVerified: true, createdAt: new Date().toISOString() };
  const bob: User = { id: 'u2', name: 'Bob', email: 'bob@example.com', isEmailVerified: true, createdAt: new Date().toISOString() };
  const charlie: User = { id: 'u3', name: 'Charlie', email: 'charlie@example.com', isEmailVerified: true, createdAt: new Date().toISOString() };
  const david: User = { id: 'u4', name: 'David', email: 'david@example.com', isEmailVerified: true, createdAt: new Date().toISOString() };
  const emma: User = { id: 'u5', name: 'Emma', email: 'emma@example.com', isEmailVerified: true, createdAt: new Date().toISOString() };

  const members = [alice, bob, charlie, david, emma];
  const currency: Currency = 'USD';

  it('handles simple 2-person equal split correctly', () => {
    const expenses: Expense[] = [
      {
        id: 'e1',
        groupId: 'g1',
        paidById: 'u1', // Alice paid 100
        amount: 100,
        currency: 'USD',
        category: 'Food',
        description: 'Dinner',
        splitType: 'equal',
        createdAt: new Date().toISOString(),
        status: 'confirmed',
        splits: [
          { id: 's1', expenseId: 'e1', userId: 'u1', amount: 50 },
          { id: 's2', expenseId: 'e1', userId: 'u2', amount: 50 },
        ],
      },
    ];

    const summary = generateGroupSummary([alice, bob], expenses, [], [], currency, 'g1');

    expect(summary.balances.find(b => b.userId === 'u1')?.netAmount).toBe(50);
    expect(summary.balances.find(b => b.userId === 'u2')?.netAmount).toBe(-50);
    expect(summary.optimizedTransactions.length).toBe(1);
    expect(summary.optimizedTransactions[0].fromUser.id).toBe('u2');
    expect(summary.optimizedTransactions[0].toUser.id).toBe('u1');
    expect(summary.optimizedTransactions[0].amount).toBe(50);
  });

  it('cancels out circular debts completely (3-person cycle)', () => {
    const expenses: Expense[] = [
      {
        id: 'e1',
        groupId: 'g1',
        paidById: 'u1', // Alice pays 90 for all 3
        amount: 90,
        currency: 'USD',
        category: 'Food',
        description: 'Breakfast',
        splitType: 'equal',
        createdAt: new Date().toISOString(),
        status: 'confirmed',
        splits: [
          { id: 's1', expenseId: 'e1', userId: 'u1', amount: 30 },
          { id: 's2', expenseId: 'e1', userId: 'u2', amount: 30 },
          { id: 's3', expenseId: 'e1', userId: 'u3', amount: 30 },
        ],
      },
      {
        id: 'e2',
        groupId: 'g1',
        paidById: 'u2', // Bob pays 90 for all 3
        amount: 90,
        currency: 'USD',
        category: 'Travel',
        description: 'Taxi',
        splitType: 'equal',
        createdAt: new Date().toISOString(),
        status: 'confirmed',
        splits: [
          { id: 's4', expenseId: 'e2', userId: 'u1', amount: 30 },
          { id: 's5', expenseId: 'e2', userId: 'u2', amount: 30 },
          { id: 's6', expenseId: 'e2', userId: 'u3', amount: 30 },
        ],
      },
      {
        id: 'e3',
        groupId: 'g1',
        paidById: 'u3', // Charlie pays 90 for all 3
        amount: 90,
        currency: 'USD',
        category: 'Entertainment',
        description: 'Museum tickets',
        splitType: 'equal',
        createdAt: new Date().toISOString(),
        status: 'confirmed',
        splits: [
          { id: 's7', expenseId: 'e3', userId: 'u1', amount: 30 },
          { id: 's8', expenseId: 'e3', userId: 'u2', amount: 30 },
          { id: 's9', expenseId: 'e3', userId: 'u3', amount: 30 },
        ],
      },
    ];

    const summary = generateGroupSummary([alice, bob, charlie], expenses, [], [], currency, 'g1');

    summary.balances.forEach(b => {
      expect(b.netAmount).toBe(0);
    });

    expect(summary.optimizedTransactions.length).toBe(0);
  });

  it('dramatically simplifies transactions in a complex 5-person trip', () => {
    const expenses: Expense[] = [
      {
        id: 'e1',
        groupId: 'g1',
        paidById: 'u1', // Alice paid 500 for hotel (all 5)
        amount: 500,
        currency: 'USD',
        category: 'Housing',
        description: 'Airbnb Villa',
        splitType: 'equal',
        createdAt: new Date().toISOString(),
        status: 'confirmed',
        splits: members.map(m => ({ id: `s1_${m.id}`, expenseId: 'e1', userId: m.id, amount: 100 })),
      },
      {
        id: 'e2',
        groupId: 'g1',
        paidById: 'u2', // Bob paid 250 for rental car (all 5)
        amount: 250,
        currency: 'USD',
        category: 'Travel',
        description: 'Rental Car SUV',
        splitType: 'equal',
        createdAt: new Date().toISOString(),
        status: 'confirmed',
        splits: members.map(m => ({ id: `s2_${m.id}`, expenseId: 'e2', userId: m.id, amount: 50 })),
      },
      {
        id: 'e3',
        groupId: 'g1',
        paidById: 'u3', // Charlie paid 150 for dinner (Alice, Bob, Charlie)
        amount: 150,
        currency: 'USD',
        category: 'Food',
        description: 'Seafood Restaurant',
        splitType: 'equal',
        createdAt: new Date().toISOString(),
        status: 'confirmed',
        splits: [
          { id: 's3_u1', expenseId: 'e3', userId: 'u1', amount: 50 },
          { id: 's3_u2', expenseId: 'e3', userId: 'u2', amount: 50 },
          { id: 's3_u3', expenseId: 'e3', userId: 'u3', amount: 50 },
        ],
      },
      {
        id: 'e4',
        groupId: 'g1',
        paidById: 'u4', // David paid 200 for gas & toll (David & Emma)
        amount: 200,
        currency: 'USD',
        category: 'Travel',
        description: 'Gasoline and Highway Tolls',
        splitType: 'equal',
        createdAt: new Date().toISOString(),
        status: 'confirmed',
        splits: [
          { id: 's4_u4', expenseId: 'e4', userId: 'u4', amount: 100 },
          { id: 's4_u5', expenseId: 'e4', userId: 'u5', amount: 100 },
        ],
      },
    ];

    const summary = generateGroupSummary(members, expenses, [], [], currency, 'g1');

    // Conservation of money: sum of all net balances must equal 0
    const totalNetSum = summary.balances.reduce((acc, curr) => acc + curr.netAmount, 0);
    expect(Math.abs(totalNetSum)).toBeLessThan(0.01);

    // Optimized transaction count must be significantly lower than naive
    expect(summary.naiveTransactions.length).toBeGreaterThan(summary.optimizedTransactions.length);
    expect(summary.reductionPercentage).toBeGreaterThanOrEqual(40);
  });

  it('accounts for completed settlements', () => {
    const expenses: Expense[] = [
      {
        id: 'e1',
        groupId: 'g1',
        paidById: 'u1',
        amount: 100,
        currency: 'USD',
        category: 'Food',
        description: 'Lunch',
        splitType: 'equal',
        createdAt: new Date().toISOString(),
        status: 'confirmed',
        splits: [
          { id: 's1', expenseId: 'e1', userId: 'u1', amount: 50 },
          { id: 's2', expenseId: 'e1', userId: 'u2', amount: 50 },
        ],
      },
    ];

    const settlements: Settlement[] = [
      {
        id: 'set1',
        groupId: 'g1',
        fromUserId: 'u2',
        toUserId: 'u1',
        amount: 50,
        currency: 'USD',
        status: 'completed',
        settledAt: new Date().toISOString(),
      },
    ];

    const summary = generateGroupSummary([alice, bob], expenses, settlements, [], currency, 'g1');

    expect(summary.balances.find(b => b.userId === 'u1')?.netAmount).toBe(0);
    expect(summary.balances.find(b => b.userId === 'u2')?.netAmount).toBe(0);
    expect(summary.optimizedTransactions.length).toBe(0);
  });
});
