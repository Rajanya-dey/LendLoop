import { useState } from "react";
import {
  Download,
  Rocket,
  TrendingUp,
  Briefcase,
  Layers,
  MoreVertical,
  Award,
  Calendar,
  Calculator
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Loan, LoanStatus, UserProfile } from "../types";

// Constant Data for Charts in Lender Dashboard
const CHART_DATA = [
  { name: 'Jan', value: 12000 },
  { name: 'Feb', value: 16000 },
  { name: 'Mar', value: 14000 },
  { name: 'Apr', value: 24000 },
  { name: 'May', value: 31000 },
  { name: 'Jun', value: 45000 },
];

const DIVERSIFICATION_DATA = [
  { name: 'Real Estate', value: 60, color: '#10b981' }, // emerald-500
  { name: 'SME Loans', value: 25, color: '#3b82f6' }, // blue-500
  { name: 'Personal', value: 15, color: '#f59e0b' }, // amber-500
];

interface LenderDashboardProps {
  loans: Loan[];
  onFundLoan: (loanId: string) => void;
  onExploreMarketplace: () => void;
  onOpenCalculator: () => void;
  onExportReport: () => void;
  profile: UserProfile | null;
}

export default function LenderDashboard({
  loans,
  onFundLoan,
  onExploreMarketplace,
  onOpenCalculator,
  onExportReport,
  profile,
}: LenderDashboardProps) {
  const [returnType, setReturnType] = useState("Expected Returns (6mo)");

  // Sum active value of funded items
  const activeLoans = loans.filter((l) => l.status === LoanStatus.FUNDED);
  const totalActiveValue = activeLoans.reduce((acc, l) => acc + l.amountRequired, 82400);
  const availableCapital = 14250.00;
  const interestEarned = 3842.12;

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
            Welcome back, {profile?.name || "Alex"}.
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Your portfolio grew by <span className="font-bold text-emerald-600 dark:text-emerald-400">4.2%</span> this month.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={onOpenCalculator}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-705 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Repayment Calculator</span>
          </button>
          <button 
            onClick={onExportReport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
          <button
            onClick={onExploreMarketplace}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-sm font-semibold hover:opacity-95 transition-all shadow-sm cursor-pointer"
          >
            <Rocket className="w-4 h-4" />
            <span>Explore Marketplace</span>
          </button>
        </div>
      </header>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Available Capital */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg dark:hover:shadow-slate-950/40 transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full">
              +12.5%
            </span>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-1">Available Capital</p>
            <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white">
              ${availableCapital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
        </div>

        {/* Total Active Value */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg dark:hover:shadow-slate-950/40 transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Briefcase className="w-5 h-5" />
            </span>
            <span className="text-blue-600 dark:text-blue-400 text-sm font-bold bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-full">
              Avg. 9.8%
            </span>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-1">Total Active Value</p>
            <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white">
              ${totalActiveValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
        </div>

        {/* Interest Earned (YTD) */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg dark:hover:shadow-slate-950/40 transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Layers className="w-5 h-5" />
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-sm font-bold bg-slate-50 dark:bg-slate-700/50 px-2.5 py-1 rounded-full">
              24 Active
            </span>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-1">Interest Earned (YTD)</p>
            <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white">
              ${interestEarned.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
        </div>
      </div>

      {/* Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Investment Overview Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Overview of Investments
            </h3>
            <select
              value={returnType}
              onChange={(e) => setReturnType(e.target.value)}
              className="bg-slate-50 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
            >
              <option>Expected Returns (6mo)</option>
              <option>Historical Growth</option>
            </select>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLTV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-700" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [`$${value}`, "Amount"]}
                />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorLTV)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diversification Donut */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Diversification
          </h3>
          <div className="flex flex-col items-center justify-center flex-1 relative min-h-[220px]">
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">LTV Ratio</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">64%</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={DIVERSIFICATION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {DIVERSIFICATION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Share"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            {DIVERSIFICATION_DATA.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="text-xs font-bold text-slate-950 dark:text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Investments List */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Active Investments State
          </h3>
          <button
            onClick={onExploreMarketplace}
            className="text-emerald-600 dark:text-emerald-400 hover:underline hover:text-emerald-700 font-bold text-sm tracking-tight"
          >
            View Marketplace
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Borrower & Loan</th>
                <th className="px-6 py-4">Amount Funded</th>
                <th className="px-6 py-4">Progress</th>
                <th className="px-6 py-4">Return Rate</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loans.map((loan) => {
                const percent = Math.round((loan.amountFunded / loan.amountRequired) * 100);
                return (
                  <tr key={loan.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={loan.borrowerAvatar}
                          alt="Borrower"
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{loan.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {loan.borrowerName} • {loan.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        ${loan.amountFunded.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        of ${loan.amountRequired.toLocaleString()} goal
                      </p>
                    </td>
                    <td className="px-6 py-4 max-w-[140px]">
                      <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-1">
                        <div
                          className="bg-emerald-500 dark:bg-emerald-400 h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-550 dark:text-slate-400 font-bold">{percent}% Funded</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-extrabold text-slate-950 dark:text-white">{loan.interestRate}%</span>
                    </td>
                    <td className="px-6 py-4">
                      {loan.status === LoanStatus.FUNDED ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-850 dark:text-emerald-400 text-[10px] font-extrabold tracking-wide uppercase">
                          Funded
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/85 text-blue-900 dark:text-blue-450 text-[10px] font-extrabold tracking-wide uppercase">
                          Pending Approval
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {loan.status !== LoanStatus.FUNDED && (
                        <button
                          onClick={() => onFundLoan(loan.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all"
                        >
                          Fund
                        </button>
                      )}
                      <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-800 ml-2">
                        <MoreVertical className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
