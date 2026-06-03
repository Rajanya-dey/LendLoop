import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  Store,
  Laptop,
  CheckCircle,
  TrendingUp,
  Globe,
  Award,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  DollarSign,
  Home,
  School,
  Activity,
  FileText,
  Calculator,
  Shield
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Tooltip as RechartsTooltip
} from "recharts";
import { Loan, LoanStatus } from "../types";

interface MarketplaceProps {
  loans: Loan[];
  onFundLoan: (loanId: string, amount: number) => Promise<void>;
  userAvailableCapital: number;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Business":
      return <Store className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    case "Home":
      return <Home className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    case "Education":
      return <School className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
    case "Consolidation":
      return <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
    case "Medical":
      return <Activity className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
    default:
      return <Globe className="w-5 h-5 text-slate-650 dark:text-slate-400" />;
  }
};

const getLoanRiskMetrics = (loan: Loan) => {
  // Deterministic values based on Rating and Loan ID to ensure consistency and realism
  let baseCredit = 720;
  let baseDTI = 28;
  let baseRepayment = 95;

  const idNum = parseInt(loan.id.replace(/\D/g, "")) || 42;

  switch (loan.rating) {
    case "A+":
      baseCredit = 810 + (idNum % 30);
      baseDTI = 10 + (idNum % 8);
      baseRepayment = 99 + (idNum % 2) / 10;
      break;
    case "A":
      baseCredit = 760 + (idNum % 30);
      baseDTI = 16 + (idNum % 10);
      baseRepayment = 97 + (idNum % 3) / 10;
      break;
    case "B+":
      baseCredit = 710 + (idNum % 35);
      baseDTI = 22 + (idNum % 12);
      baseRepayment = 94 + (idNum % 4) / 10;
      break;
    case "B":
      baseCredit = 660 + (idNum % 35);
      baseDTI = 30 + (idNum % 12);
      baseRepayment = 90 + (idNum % 6) / 10;
      break;
    case "C":
      baseCredit = 600 + (idNum % 40);
      baseDTI = 40 + (idNum % 15);
      baseRepayment = 82 + (idNum % 10) / 10;
      break;
  }

  // To draw a nice radar chart, we normalize inputs to 0-100 scale:
  // Credit Score: 500 to 850 scale
  const normCredit = Math.round(((baseCredit - 500) / 350) * 100);
  // DTI: Lower DTI is better risk-wise, so we represent "Debt capacity" as 100 - DTI
  const normDTICapacity = Math.round(100 - baseDTI);
  // Repayment: directly percentage
  const normRepayment = Math.round(baseRepayment);
  // Yield grade / Rate contribution (higher interest is good for yield, but has its own factor)
  const normYieldFactor = Math.round(Math.min(100, loan.interestRate * 6));

  return {
    raw: {
      creditScore: baseCredit,
      dti: baseDTI,
      repaymentHistory: baseRepayment,
    },
    chartData: [
      { subject: "Credit", value: Math.max(15, Math.min(100, normCredit)), raw: `${baseCredit} FICO` },
      { subject: "Debt Security", value: Math.max(15, Math.min(100, normDTICapacity)), raw: `${baseDTI}% DTI` },
      { subject: "Repay Ratio", value: Math.max(15, Math.min(100, normRepayment)), raw: `${baseRepayment.toFixed(1)}% On-Time` },
      { subject: "Yield Alpha", value: Math.max(15, Math.min(100, normYieldFactor)), raw: `${loan.interestRate}% APR` },
    ]
  };
};

export default function Marketplace({
  loans,
  onFundLoan,
  userAvailableCapital,
}: MarketplaceProps) {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("default");
  const [fundingAmount, setFundingAmount] = useState<{ [loanId: string]: string }>({});
  const [activeFundId, setActiveFundId] = useState<string | null>(null);
  const [fundingSuccess, setFundingSuccess] = useState<string | null>(null);
  const [customInvestAmount, setCustomInvestAmount] = useState<{ [loanId: string]: number }>({});
  const [calcExpanded, setCalcExpanded] = useState<{ [loanId: string]: boolean }>({});
  const [activeTool, setActiveTool] = useState<{ [loanId: string]: "calc" | "risk" | null }>({});

  // Filter and sort loans based on search, selected category, and interest rate / size sorting
  const filteredLoans = loans
    .filter((loan) => {
      const matchesSearch =
        loan.title.toLowerCase().includes(search.toLowerCase()) ||
        loan.borrowerName.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = filterCategory === "All" || loan.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "rate-desc") {
        return b.interestRate - a.interestRate;
      }
      if (sortBy === "rate-asc") {
        return a.interestRate - b.interestRate;
      }
      if (sortBy === "amount-desc") {
        return b.amountRequired - a.amountRequired;
      }
      if (sortBy === "amount-asc") {
        return a.amountRequired - b.amountRequired;
      }
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0; // default order
    });

  const handleFundSubmit = async (loanId: string) => {
    const amountStr = fundingAmount[loanId];
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid positive amount.");
      return;
    }

    if (amount > userAvailableCapital) {
      alert(`The funding amount exceeds your current available capital of $${userAvailableCapital.toLocaleString()}`);
      return;
    }

    try {
      await onFundLoan(loanId, amount);
      setFundingSuccess(loanId);
      setActiveFundId(null);
      setTimeout(() => setFundingSuccess(null), 3000);
    } catch (e) {
      alert("Failed funding loan. Please try again.");
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
            Loan Marketplace
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Find and fund verified peer-to-peer loan requests from our global community.
          </p>
        </div>

        {/* Filter and Search options */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search loans or borrowers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all min-w-[240px]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <SlidersHorizontal className="absolute left-3.5 top-[13px] w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-10 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer min-w-[160px]"
              >
                <option value="All">All Categories</option>
                <option value="Business">Business</option>
                <option value="Home">Home</option>
                <option value="Education">Education</option>
                <option value="Consolidation">Debt Consolidation</option>
                <option value="Medical">Medical</option>
                <option value="Other">Other</option>
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <TrendingUp className="absolute left-3.5 top-[13px] w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-10 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer min-w-[200px]"
              >
                <option value="default">Sort: Balanced</option>
                <option value="newest">Sort: Newest Listed</option>
                <option value="rate-desc">Rate: High to Low (High Yield)</option>
                <option value="rate-asc">Rate: Low to High (Low Risk)</option>
                <option value="amount-desc">Goal: High to Low</option>
                <option value="amount-asc">Goal: Low to High</option>
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Bento summary stats bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-shadow">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Market Average Yield</span>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-955 dark:text-white">12.4%</p>
            <p className="text-emerald-600 dark:text-text-emerald-400 text-xs font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +0.8% this month
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-shadow">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Active Opportunities</span>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-955 dark:text-white">2,410</p>
            <p className="text-slate-400 text-xs font-semibold mt-1">Across 12 global industries</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-shadow">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Funding Volume (24h)</span>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-955 dark:text-white">$1.2M</p>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1 rounded-full mt-3">
              <div className="bg-emerald-500 h-full w-3/4 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Category-based Filtering Tabs */}
      <div className="space-y-3.5 bg-slate-50/50 dark:bg-slate-900/30 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Filter Loan Offerings by Sector
          </span>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Available: {filteredLoans.length} of {loans.length} listings
          </span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {[
            { value: "All", label: "All Sectors", icon: <Globe className="w-4 h-4" /> },
            { value: "Business", label: "Business", icon: <Store className="w-4 h-4" /> },
            { value: "Home", label: "Home", icon: <Home className="w-4 h-4" /> },
            { value: "Education", label: "Education", icon: <School className="w-4 h-4" /> },
            { value: "Consolidation", label: "Debt Consolidation", icon: <FileText className="w-4 h-4" /> },
            { value: "Medical", label: "Medical", icon: <Activity className="w-4 h-4" /> },
            { value: "Other", label: "Other Sectors", icon: <SlidersHorizontal className="w-4 h-4" /> },
          ].map((cat) => {
            const isSelected = filterCategory === cat.value;
            const count = loans.filter((loan) => {
              const matchesSearch =
                loan.title.toLowerCase().includes(search.toLowerCase()) ||
                loan.borrowerName.toLowerCase().includes(search.toLowerCase());
              return matchesSearch && (cat.value === "All" || loan.category === cat.value);
            }).length;

            return (
              <button
                key={cat.value}
                onClick={() => setFilterCategory(cat.value)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-slate-950 text-white dark:bg-emerald-600 dark:text-white shadow-md shadow-emerald-505/20"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750"
                }`}
              >
                <span className={isSelected ? "text-white" : "text-emerald-600 dark:text-emerald-400"}>
                  {cat.icon}
                </span>
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black leading-none ${
                  isSelected 
                    ? "bg-white/20 text-white" 
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Marketplace Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredLoans.length === 0 ? (
          <div className="col-span-1 md:col-span-2 bg-white dark:bg-slate-800 border border-dashed border-slate-350 dark:border-slate-700 rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-4">
            <SlidersHorizontal className="w-12 h-12 text-slate-400 dark:text-slate-500 animate-pulse" />
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Matching Deals Found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Try loosening your filters, choosing a different category, or adjusting your search keyword.
              </p>
            </div>
            <button
              onClick={() => {
                setFilterCategory("All");
                setSortBy("default");
                setSearch("");
              }}
              className="px-4 py-2 text-xs font-bold bg-slate-950 dark:bg-emerald-600 hover:opacity-90 text-white rounded-xl transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredLoans.map((loan) => {
            const percent = Math.round((loan.amountFunded / loan.amountRequired) * 100);
            const isFundActive = activeFundId === loan.id;
            const isSuccess = fundingSuccess === loan.id;

            return (
              <div
                key={loan.id}
                className={`bg-white dark:bg-slate-800 border rounded-2xl overflow-hidden transition-all duration-350 flex flex-col justify-between shadow-sm relative ${
                  isFundActive
                    ? "border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/20"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-350 dark:hover:border-slate-650"
                }`}
              >
                <div className="p-6 space-y-4">
                  {/* Borrower and title info */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                        {getCategoryIcon(loan.category)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-slate-950 dark:text-white truncate">{loan.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">by {loan.borrowerName}</p>
                      </div>
                    </div>
                    <span className="px-2 py-[2px] rounded-lg text-[10px] font-black tracking-wide bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 uppercase">
                      {loan.rating} Rating
                    </span>
                  </div>

                  {/* Progress parameters */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500 dark:text-slate-400">Amount Required</span>
                      <span className="text-slate-950 dark:text-white font-extrabold">${loan.amountRequired.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 dark:bg-emerald-400 h-full rounded-full" style={{ width: `${Math.min(100, percent)}%` }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 font-bold">
                      <span>{percent}% Funded</span>
                      <span>Ends in 12 days</span>
                    </div>
                  </div>

                  {/* Rate vs Tenure details */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Yield rate</p>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white">{loan.interestRate}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Tenure period</p>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white">{loan.tenureMonths} Months</p>
                    </div>
                  </div>

                  {/* Projected Returns Calculator */}
                  <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
                    <button
                      onClick={() => setCalcExpanded({ ...calcExpanded, [loan.id]: !calcExpanded[loan.id] })}
                      className="w-full flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <Calculator className="w-4 h-4 text-emerald-500" />
                        <span>Projected Returns</span>
                      </div>
                      <span className="text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        {calcExpanded[loan.id] ? "Hide Calc" : "Calculate"}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${calcExpanded[loan.id] ? "rotate-180" : ""}`} />
                      </span>
                    </button>

                    {calcExpanded[loan.id] && (() => {
                      const currentVal = customInvestAmount[loan.id] ?? 1000;
                      const r = (loan.interestRate / 100) / 12;
                      const n = loan.tenureMonths;
                      const monthlyPayout = r === 0 
                        ? (currentVal / n) 
                        : (currentVal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
                      const totalRepaid = monthlyPayout * n;
                      const totalProfit = totalRepaid - currentVal;

                      return (
                        <div className="mt-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl p-3 border border-slate-100 dark:border-slate-800/80 space-y-3">
                          {/* Investment slider and controls */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 dark:text-slate-400">
                              <span>My Investment</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold font-mono text-xs">
                                ${currentVal.toLocaleString()}
                              </span>
                            </div>

                            {/* Preset Quick Selectors */}
                            <div className="grid grid-cols-4 gap-1">
                              {[250, 500, 1000, 2500].map((preset) => (
                                <button
                                  key={preset}
                                  onClick={() => setCustomInvestAmount({ ...customInvestAmount, [loan.id]: preset })}
                                  className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                    currentVal === preset
                                      ? "bg-slate-950 border-slate-950 text-white dark:bg-emerald-600 dark:border-emerald-600"
                                      : "bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-305 hover:bg-slate-50"
                                  }`}
                                >
                                  ${preset}
                                </button>
                              ))}
                            </div>

                            {/* Custom Range Slider */}
                            <input
                              type="range"
                              min="100"
                              max={Math.max(5000, loan.amountRequired - loan.amountFunded)}
                              step="50"
                              value={currentVal}
                              onChange={(e) => setCustomInvestAmount({ ...customInvestAmount, [loan.id]: Number(e.target.value) })}
                              className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 dark:accent-emerald-400 focus:outline-none"
                            />
                          </div>

                          {/* Output Grid */}
                          <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="bg-white dark:bg-slate-850 p-2 rounded-lg border border-slate-100 dark:border-slate-800/60 shadow-xs">
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Monthly Payout</p>
                              <p className="text-xs font-black text-slate-900 dark:text-white font-mono mt-0.5">
                                ${monthlyPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                            <div className="bg-white dark:bg-slate-850 p-2 rounded-lg border border-slate-100 dark:border-slate-800/60 shadow-xs">
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Profit</p>
                              <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                                +${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>

                          {/* Dynamic detailed summary */}
                          <div className="bg-emerald-50/40 dark:bg-emerald-950/10 p-2 rounded-lg text-[10px] text-slate-500 dark:text-emerald-450 leading-relaxed flex items-start gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>
                              Investing <strong>${currentVal.toLocaleString()}</strong> gains a total of <strong>${totalRepaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> over <strong>{loan.tenureMonths} months</strong>.
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Live Fund Form Actions */}
                  {isSuccess ? (
                    <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 dark:bg-slate-900 dark:border-emerald-800 p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Capital Invested Successfully!</span>
                    </div>
                  ) : isFundActive ? (
                    <div className="space-y-3 pt-2">
                      <div className="flex h-11 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500">
                        <div className="bg-slate-50 dark:bg-slate-900 px-3 flex items-center justify-center border-r border-slate-200 dark:border-slate-700">
                          <DollarSign className="w-4 h-4 text-slate-400" />
                        </div>
                        <input
                          type="number"
                          placeholder="Contribution (e.g. 1000)"
                          value={fundingAmount[loan.id] || ""}
                          onChange={(e) =>
                            setFundingAmount({ ...fundingAmount, [loan.id]: e.target.value })
                          }
                          className="w-full bg-white dark:bg-slate-900 px-3 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveFundId(null)}
                          className="w-1/3 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleFundSubmit(loan.id)}
                          className="w-2/3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all"
                        >
                          Confirm Bid
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (loan.status === LoanStatus.COMPLETED) {
                          alert("This loan is already fully funded!");
                          return;
                        }
                        setActiveFundId(loan.id);
                      }}
                      disabled={loan.status === LoanStatus.COMPLETED}
                      className={`w-full py-2.5 rounded-xl font-bold text-sm text-center transition-all shadow-sm ${
                        loan.status === LoanStatus.COMPLETED
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                          : "bg-slate-950 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white hover:opacity-90 active:scale-95"
                      }`}
                    >
                      {loan.status === LoanStatus.COMPLETED ? "Fully Funded" : "Fund Loan"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Promo Featured Card */}
        <div className="bg-slate-950 border border-slate-800 dark:border-slate-700 rounded-2xl overflow-hidden relative group cursor-pointer h-full min-h-[380px] flex flex-col justify-between">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIPxcVT606JvfhZaZEt7mm2fAQANpvCvAh2lC4qcxNRgOOtq0q5OGT9rRnZzut5R4r046VkcbsTCAuDy8oOQxCN0MFh028AKDdkgbokf48IYFNE4ln3g8Bbz3GyqJmwiaItbGtsrtl5vdpoO6OLbKSfMOYpMIAAOEzdH6nOPzcOspugpwr-l7Tb4Js8QfK9tsAQ71cgI9o5yJCh9b1ebDb1pRk8VORi7SGQMKwNHcYA8ppoxyz2_az8_8PJfShOp59x4S3Ayk9R3jk"
            alt="Asset evaluation"
            className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 p-6 flex flex-col justify-end z-20">
            <span className="bg-emerald-555 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 px-3 py-1 text-[10px] font-black rounded-lg uppercase w-fit mb-3">
              New Feature
            </span>
            <h2 className="text-xl font-black text-white mb-2">Auto-Invest Pro</h2>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Set your target metrics (rates, credit risk, sectors) and let our intelligent algorithm automate diversified capital matching.
            </p>
            <button
              onClick={() => alert("Auto-Invest Pro settings will run on your active profile parameters!")}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl text-xs tracking-tight transition-all active:scale-95 text-center"
            >
              Configure Auto-Invest
            </button>
          </div>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6 gap-4">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-450">
          {filteredLoans.length === 0
            ? "Showing 0 of 0 loans"
            : `Showing 1 to ${filteredLoans.length} of ${loans.length} loans`}
        </span>
        <div className="flex items-center gap-1.5">
          <button className="p-2 border border-slate-200 dark:border-slate-750 dark:text-slate-300 rounded-xl hover:bg-slate-50 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 flex items-center justify-center bg-slate-950 text-white rounded-xl text-xs font-bold shadow-sm">
            1
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-450 hover:bg-slate-50 rounded-xl">
            2
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-450 hover:bg-slate-50 rounded-xl">
            3
          </button>
          <span className="px-2 text-slate-400 text-sm">...</span>
          <button className="p-2 border border-slate-200 dark:border-slate-750 dark:text-slate-300 rounded-xl hover:bg-slate-50 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
