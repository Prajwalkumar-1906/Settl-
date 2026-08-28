export type SplitType = 'equal' | 'exact' | 'percent' | 'shares';

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

export type AdminRole = 'superadmin' | 'support';

export type ExpenseCategory = 
  | 'Food' 
  | 'Travel' 
  | 'Housing' 
  | 'Entertainment' 
  | 'Shopping' 
  | 'Utilities' 
  | 'Other';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  phone?: string | null;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  createdAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'admin' | 'member';
  user: User;
  joinedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string | null;
  type: 'trip' | 'flat' | 'event' | 'other';
  currency: Currency;
  inviteCode: string;
  qrCodeUrl?: string | null;
  createdById: string;
  createdAt: string;
  members: GroupMember[];
}

export interface ExpenseSplit {
  id: string;
  expenseId: string;
  userId: string;
  amount: number;
  percentage?: number | null;
  shares?: number | null;
}

export interface Expense {
  id: string;
  groupId: string;
  paidById: string;
  amount: number;
  currency: Currency;
  category: ExpenseCategory;
  description: string;
  splitType: SplitType;
  receiptUrl?: string | null;
  createdAt: string;
  status: 'confirmed' | 'pending' | 'disputed';
  splits: ExpenseSplit[];
  carbonEstimateKg?: number | null;
}

export interface NetBalance {
  userId: string;
  user: User;
  netAmount: number; // positive = creditor (owed money), negative = debtor (owes money)
  totalPaid: number;
  totalOwed: number;
}

export interface OptimizedTransaction {
  id: string;
  fromUser: User;
  toUser: User;
  amount: number;
  currency: Currency;
  isSuggested: boolean;
}

export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: Currency;
  status: 'pending' | 'completed';
  settledAt: string;
  roundUpDonation?: number | null;
  paymentNote?: string | null;
}

export interface Donation {
  id: string;
  groupId: string;
  userId: string;
  amount: number;
  charityName: string;
  status: 'pledged' | 'transferred';
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  groupId: string;
  actorId: string;
  actorName: string;
  actionType: 'EXPENSE_ADDED' | 'EXPENSE_UPDATED' | 'SETTLEMENT_COMPLETED' | 'MEMBER_JOINED' | 'DONATION_MADE' | 'DISPUTE_RAISED';
  details: string;
  timestamp: string;
}

export interface GroupBalancesSummary {
  groupId: string;
  currency: Currency;
  balances: NetBalance[];
  naiveTransactions: OptimizedTransaction[];
  optimizedTransactions: OptimizedTransaction[];
  reductionPercentage: number;
  totalGroupSpend: number;
  totalRoundUpDonations: number;
  totalCarbonFootprintKg: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserAuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface AdminAuthResponse {
  admin: Admin;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
