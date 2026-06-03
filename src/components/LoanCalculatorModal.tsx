import { useState, useEffect } from "react";
import { X, Calculator, Info, Calendar, Percent, Landmark } from "lucide-react";

interface LoanCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoanCalculatorModal({ isOpen, onClose }: LoanCalculatorModalProps) {
  const [principal, setPrincipal] = useState<number>(10000);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenure, setTenure] = useState<number>(24); // in months

  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalRepayment, setTotalRepayment] = useState<number>(0);

  useEffect(() => {
    // PMT formula: P * (r * (1 + r)^n) / ((1 + r)^n - 1)
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = tenure;

    if (monthlyRate === 0) {
      const payment = principal / numberOfPayments;
      setMonthlyPayment(payment);
      setTotalInterest(0);
      setTotalRepayment(principal);
    } else {
      const x = Math.pow(1 + monthlyRate, numberOfPayments);
      const payment = (principal * monthlyRate * x) / (x - 1);
      
      const totalRepay = payment * numberOfPayments;
      const totalInt = totalRepay - principal;

      setMonthlyPayment(payment);
      setTotalInterest(totalInt);
      setTotalRepayment(totalRepay);
    }
  }, [principal, interestRate, tenure]);

  if (!isOpen) return null;

  const interestPercentage = totalRepayment > 0 ? (totalInterest / totalRepayment) * 100 : 0;
  const principalPercentage = 100 - interestPercentage;

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Loan Repayment Calculator</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Estimate your dynamic amortization mapping</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Input fields */}
            <div className="space-y-6">
              {/* Principal Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-slate-400" />
                    Principal Amount
                  </label>
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-700 px-3 py-1 rounded-xl">
                    <span className="text-xs font-bold text-slate-450">$</span>
                    <input 
                      type="number"
                      value={principal}
                      onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                      className="w-20 text-right bg-transparent text-sm font-extrabold text-slate-900 dark:text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
                <input 
                  type="range"
                  min="1000"
                  max="100000"
                  step="500"
                  value={principal}
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-400"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>$1,000</span>
                  <span>$50,000</span>
                  <span>$100,000</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Percent className="w-4 h-4 text-slate-400" />
                    Interest Rate (APR)
                  </label>
                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-700 px-3 py-1 rounded-xl">
                    <input 
                      type="number"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Math.max(0, Math.min(100, Number(e.target.value))))}
                      className="w-12 text-right bg-transparent text-sm font-extrabold text-slate-900 dark:text-white focus:outline-none"
                    />
                    <span className="text-xs font-bold text-slate-450">%</span>
                  </div>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="36"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-400"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>1%</span>
                  <span>18%</span>
                  <span>36%</span>
                </div>
              </div>

              {/* Tenure months */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Repayment Tenure
                  </label>
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-700 px-3 py-1 rounded-xl">
                    <input 
                      type="number"
                      value={tenure}
                      onChange={(e) => setTenure(Math.max(1, Number(e.target.value)))}
                      className="w-10 text-right bg-transparent text-sm font-extrabold text-slate-900 dark:text-white focus:outline-none"
                    />
                    <span className="text-[10px] font-bold text-slate-450">Mo</span>
                  </div>
                </div>
                <input 
                  type="range"
                  min="3"
                  max="60"
                  step="1"
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-400"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>3 Mo</span>
                  <span>30 Mo</span>
                  <span>60 Mo</span>
                </div>
              </div>

            </div>

            {/* Calculations Output */}
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-6">
              <div>
                <p className="text-xs uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 mb-1">
                  Estimated Monthly Payment
                </p>
                <h2 className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                  ${monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
              </div>

              <div className="space-y-3.5 border-t border-slate-200/50 dark:border-slate-800 pt-5">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-500 dark:text-slate-450">Principal Amount</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">
                    ${principal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-500 dark:text-slate-455">Total Interest Payable</span>
                  <span className="font-extrabold text-amber-600 dark:text-amber-400">
                    ${totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm pt-3.5 border-t border-dashed border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white">Total Repayment</span>
                  <span className="font-black text-slate-900 dark:text-white text-lg">
                    ${totalRepayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Progress/Ratio Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-extrabold text-slate-450">
                  <span>Principal: {principalPercentage.toFixed(0)}%</span>
                  <span>Interest: {interestPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-amber-500 dark:bg-amber-600 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-emerald-500 dark:bg-emerald-450 h-full transition-all duration-305" 
                    style={{ width: `${principalPercentage}%` }}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Quick Notice Banner */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-105/50 dark:border-blue-900/40">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-800 dark:text-blue-350 leading-relaxed font-medium">
              This calculation is an estimate for informational purposes only. The actual rate offered during application matches your final credit standing check, current market demand, and chosen loan tier option.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
