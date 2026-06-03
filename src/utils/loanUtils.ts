import { Loan, LoanStatus, Transaction } from "../types";

export interface RepaymentStatus {
  isOverdue: boolean;
  daysOverdue: number;
  dueDate: Date;
  monthlyPayment: number;
  totalPaidInstalments: number;
}

/**
 * Calculates monthly EMI using the standard amortization formula.
 */
export function calculateMonthlyPayment(principal: number, interestRate: number, tenureMonths: number): number {
  const monthlyRate = interestRate / 100 / 12;
  if (monthlyRate === 0) return principal / tenureMonths;
  const x = Math.pow(1 + monthlyRate, tenureMonths);
  return (principal * monthlyRate * x) / (x - 1);
}

/**
 * Computes whether a specific loan has a repayment that is overdue by more than 5 days.
 */
export function getLoanRepaymentStatus(loan: Loan, transactions: Transaction[]): RepaymentStatus {
  const monthlyPayment = calculateMonthlyPayment(loan.amountRequired, loan.interestRate, loan.tenureMonths);

  if (loan.status !== LoanStatus.FUNDED) {
    return {
      isOverdue: false,
      daysOverdue: 0,
      dueDate: new Date(loan.createdAt),
      monthlyPayment,
      totalPaidInstalments: 0,
    };
  }

  // Find all successful repayments for this loan
  const repayments = transactions.filter(
    (t) => t.loanId === loan.id && t.type === "repayment"
  );

  const totalPaidInstalments = repayments.length;
  const nextInstalmentIndex = totalPaidInstalments + 1;

  // Let's calculate the due date for the next instalment.
  // It is due nextInstalmentIndex months after createdAt.
  const dueDate = new Date(loan.createdAt);
  dueDate.setMonth(dueDate.getMonth() + nextInstalmentIndex);

  const today = new Date();
  
  // Calculate difference in days
  const timeDiff = today.getTime() - dueDate.getTime();
  const daysOverdue = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  const isOverdue = daysOverdue > 5;

  return {
    isOverdue,
    daysOverdue: isOverdue ? daysOverdue : 0,
    dueDate,
    monthlyPayment,
    totalPaidInstalments,
  };
}

/**
 * Scans all active loans for any repayments that are overdue by more than 5 days.
 * Returns lists of scanned items and overdue status pairings.
 */
export function scanActiveLoans(loans: Loan[], transactions: Transaction[]): {
  overdueLoans: { loan: Loan; status: RepaymentStatus }[];
  allLoansWithStatus: { loan: Loan; status: RepaymentStatus }[];
} {
  const allLoansWithStatus = loans.map((loan) => ({
    loan,
    status: getLoanRepaymentStatus(loan, transactions),
  }));

  const overdueLoans = allLoansWithStatus.filter((item) => item.status.isOverdue);

  return {
    overdueLoans,
    allLoansWithStatus,
  };
}
