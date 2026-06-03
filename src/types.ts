export enum UserRole {
  BORROWER = "borrower",
  LENDER = "lender"
}

export enum LoanStatus {
  PENDING = "PENDING_APPROVAL",
  FUNDED = "REPAYMENT_DUE",
  COMPLETED = "COMPLETED"
}

export type LoanRating = "A+" | "A" | "B+" | "B" | "C";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  avatarUrl: string;
  creditScore: number;
  availableCapital: number;
}

export interface Loan {
  id: string; // LL-xxxxx or randomized
  borrowerId: string;
  borrowerName: string;
  borrowerAvatar: string;
  title: string;
  category: "Business" | "Home" | "Education" | "Consolidation" | "Medical" | "Other";
  description: string;
  amountRequired: number;
  amountFunded: number;
  interestRate: number; // e.g. 8.5
  tenureMonths: number; // 12, 24, 36, etc.
  status: LoanStatus;
  rating: LoanRating;
  endsAt: string; // ISO string
  createdAt: string; // ISO string
}

export type TransactionType = "repayment" | "disbursement" | "funding" | "deposit";

export interface Transaction {
  id: string;
  userId: string;
  loanId: string;
  loanTitle: string;
  amount: number; // absolute value
  type: TransactionType;
  date: string; // ISO string
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: "info" | "success" | "warning";
}

