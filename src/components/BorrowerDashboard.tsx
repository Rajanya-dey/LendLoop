import {
  Banknote,
  CalendarCheck,
  Award,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Download,
  Flame,
  ArrowUpRight,
  ArrowDownLeft,
  Settings,
  Calculator,
  AlertTriangle
} from "lucide-react";
import { Loan, LoanStatus, Transaction, UserProfile } from "../types";
import { scanActiveLoans, getLoanRepaymentStatus } from "../utils/loanUtils";

interface BorrowerDashboardProps {
  loans: Loan[];
  transactions: Transaction[];
  onAddNewRequest: () => void;
  onPayNow: (loanId: string) => void;
  onDownloadStatements: () => void;
  onOpenCalculator: () => void;
  profile: UserProfile | null;
}

export default function BorrowerDashboard({
  loans,
  transactions,
  onAddNewRequest,
  onPayNow,
  onDownloadStatements,
  onOpenCalculator,
  profile,
}: BorrowerDashboardProps) {

  // Scan active loans for overdue repayments
  const { overdueLoans, allLoansWithStatus } = scanActiveLoans(loans, transactions);
  const hasOverdue = overdueLoans.length > 0;

  // Filter borrower statistics
  const borrowedAmount = loans.reduce((acc, l) => acc + l.amountRequired, 45200);
  
  // Calculate next or overdue payment amount
  const nextPayment = hasOverdue 
    ? overdueLoans.reduce((sum, item) => sum + item.status.monthlyPayment, 0)
    : 1245.50;
    
  const creditScore = hasOverdue ? Math.max(300, 782 - 45 * overdueLoans.length) : 782; // Credit score drops temporarily if overdue repayments are detected!

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Welcome Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
            Good morning, {profile?.name || "Alex"}
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Your portfolio is in good standing with <span className="font-bold text-emerald-600 dark:text-emerald-400">{loans.length} active loans</span>.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={onOpenCalculator}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-705 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Repayment Calculator</span>
          </button>
          <button
            onClick={onAddNewRequest}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 dark:bg-emerald-600 hover:opacity-90 dark:hover:bg-emerald-500 text-white text-sm font-bold shadow-sm transition-all active:scale-95 text-center cursor-pointer"
          >
            Request a New Loan
          </button>
        </div>
      </section>

      {/* Summary Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Borrowed */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl flex flex-col justify-between h-40 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Borrowed</span>
            <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <Banknote className="w-5 h-5" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-950 dark:text-white">
              ${borrowedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +8% from last quarter
            </p>
          </div>
        </div>

        {/* Next Payment Due / Overdue Status */}
        <div className={`p-6 rounded-2xl flex flex-col justify-between h-40 hover:shadow-lg transition-all border ${
          hasOverdue 
            ? "bg-red-50/15 dark:bg-rose-950/20 border-red-200 dark:border-rose-900/50" 
            : "bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800"
        }`}>
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {hasOverdue ? "Overdue Repayments" : "Next Payment Due"}
            </span>
            <span className={`p-2 rounded-lg ${
              hasOverdue 
                ? "bg-red-100 dark:bg-red-950/80 text-red-650 dark:text-red-400" 
                : "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
            }`}>
              {hasOverdue ? <AlertTriangle className="w-5 h-5 animate-pulse" /> : <CalendarCheck className="w-5 h-5" />}
            </span>
          </div>
          <div>
            <p className={`text-3xl font-black ${hasOverdue ? "text-red-650 dark:text-red-400" : "text-slate-950 dark:text-white"}`}>
              ${nextPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className={`text-xs font-bold mt-2 ${hasOverdue ? "text-red-650 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`}>
              {hasOverdue 
                ? `ACTION REQUIRED: Overdue by ${Math.max(...overdueLoans.map(l => l.status.daysOverdue))} days!`
                : "Due on October 12, 2023"
              }
            </p>
          </div>
        </div>

        {/* Credit Score */}
        <div className="bg-slate-950 dark:bg-slate-800 text-white p-6 rounded-2xl flex flex-col justify-between h-40 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-slate-400">Credit Score</span>
            <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Award className="w-5 h-5" />
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white">{creditScore}</p>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" /> Excellent standing
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Dashboard layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Active Loans Section */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Active Loans</span>
              {hasOverdue && (
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-400 rounded-full animate-bounce">
                  Overdue Alert
                </span>
              )}
            </h2>
            <button className="text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center gap-1 hover:underline">
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Overdue alert banner if anything is overdue */}
          {hasOverdue && (
            <div className="flex items-start gap-3.5 p-4 bg-red-55 border border-red-200 dark:border-red-900/40 rounded-2xl text-red-900 dark:text-red-300">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h4 className="text-sm font-extrabold text-red-800 dark:text-red-450">Immediate Attention Required</h4>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1 leading-relaxed">
                  You have <strong>{overdueLoans.length} portfolio item(s)</strong> with repayment cycles overdue by more than 5 days. Late fees may initiate and credit ratings are subject to depreciation. Please execute repayments below.
                </p>
              </div>
            </div>
          )}

          {/* Active Loans list */}
          {loans.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center text-slate-500 dark:text-slate-400">
              No active loans found. Create one by clicking Request a New Loan above!
            </div>
          ) : (
            allLoansWithStatus.map(({ loan, status }) => {
              const amountLeft = loan.amountRequired - loan.amountFunded;
              const percent = Math.round((loan.amountFunded / loan.amountRequired) * 100);
              const isOverdue = status.isOverdue;

              return (
                <div
                  key={loan.id}
                  className={`border p-6 rounded-3xl relative overflow-hidden transition-all hover:shadow-md ${
                    isOverdue 
                      ? "bg-red-50/10 dark:bg-rose-950/10 border-red-300 dark:border-red-900/60 shadow-md shadow-red-50/20" 
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {/* Overdue Accent Ribbon */}
                  {isOverdue && (
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-red-500" />
                  )}

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isOverdue 
                          ? "bg-red-100 dark:bg-rose-950 text-red-600 dark:text-red-400" 
                          : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                      }`}>
                        <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{loan.title}</span>
                          {isOverdue && (
                            <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-red-500 text-white rounded-md">
                              Overdue
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Loan ID: {loan.id} • Issued {new Date(loan.createdAt).toLocaleDateString("en-US", { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    
                    {isOverdue ? (
                      <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/80 text-red-750 dark:text-red-400 border border-red-200/50 dark:border-red-900/50 font-extrabold text-xs self-start md:self-auto uppercase tracking-wide flex items-center gap-1.5 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Repayment Due ({status.daysOverdue}d Overdue)
                      </span>
                    ) : loan.status === LoanStatus.FUNDED ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 font-bold text-xs self-start md:self-auto uppercase">
                        Funded
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 font-bold text-xs self-start md:self-auto uppercase">
                        In Funding Process
                      </span>
                    )}
                  </div>

                  {/* Overdue precise warnings */}
                  {isOverdue && (
                    <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-rose-955/20 border border-red-200/45 dark:border-red-900/35 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-650 dark:text-red-405 shrink-0" />
                      <span className="text-xs font-bold text-red-800 dark:text-red-400">
                        Monthly instalment of ${status.monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} was due on {status.dueDate.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  )}

                  {/* Progress segment */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Repayment Progress</span>
                      <span className="text-slate-950 dark:text-white font-extrabold">{percent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-550 ${
                          isOverdue ? "bg-red-500" : "bg-emerald-500 dark:bg-emerald-400"
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Metadata segment */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100 dark:border-slate-700">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-455 dark:text-slate-400">
                        Interest Rate
                      </p>
                      <p className="text-sm font-bold text-slate-950 dark:text-white">{loan.interestRate}% APR</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-455 dark:text-slate-400">
                        Remaining
                      </p>
                      <p className="text-sm font-bold text-slate-950 dark:text-white">
                        ${amountLeft.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-455 dark:text-slate-400">
                        Total Term
                      </p>
                      <p className="text-sm font-bold text-slate-950 dark:text-white">{loan.tenureMonths} Months</p>
                    </div>
                    <div className="flex justify-end items-end">
                      {loan.status === LoanStatus.FUNDED ? (
                        <button
                          onClick={() => onPayNow(loan.id)}
                          className={`w-full md:w-auto px-4 py-2 font-bold text-xs rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer ${
                            isOverdue 
                              ? "bg-red-600 text-white" 
                              : "bg-slate-950 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white"
                          }`}
                        >
                          Pay Now
                        </button>
                      ) : (
                        <button className="w-full md:w-auto px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                          Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Transactions and Marketing */}
        <div className="space-y-6">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Recent Transactions</h2>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <div className="space-y-6">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex justify-between items-center group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-150 dark:bg-slate-700 flex items-center justify-center text-slate-550 dark:text-slate-300 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950 transition-colors">
                      {tx.type === "repayment" || tx.type === "funding" ? (
                        <ArrowUpRight className="w-4 h-4 text-red-500" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {tx.loanTitle}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold ${tx.type === "repayment" || tx.type === "funding" ? "text-red-500" : "text-emerald-500"}`}>
                    {tx.type === "repayment" || tx.type === "funding" ? "-" : "+"}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={onDownloadStatements}
              className="w-full mt-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Download Statements
            </button>
          </div>

          {/* Marketing CTA Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 relative overflow-hidden h-48 flex flex-col justify-end shadow-lg border border-slate-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <h4 className="text-lg font-black mb-1 relative z-10">Expand Your Horizons</h4>
            <p className="text-xs text-slate-300 mb-4 tracking-tight leading-relaxed relative z-10">
              Low interest rates are available starting at 4.5% APR for consolidation loans this month.
            </p>
            <button
              onClick={onAddNewRequest}
              className="w-fit px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-lg text-xs relative z-10 transition-all active:scale-95"
            >
              Apply Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
