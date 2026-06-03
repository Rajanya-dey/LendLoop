import { useState, useEffect } from "react";
import {
  Check,
  Home,
  School,
  Upload,
  CheckCircle,
  HelpCircle,
  ArrowRight
} from "lucide-react";
import { Loan, LoanStatus, UserProfile } from "../types";

interface NewLoanRequestProps {
  profile: UserProfile | null;
  onSubmitLoan: (loanData: {
    title: string;
    category: "Business" | "Home" | "Education" | "Consolidation" | "Medical" | "Other";
    description: string;
    amountRequired: number;
    interestRate: number;
    tenureMonths: number;
  }) => Promise<void>;
  onClose: () => void;
}

export default function NewLoanRequest({
  profile,
  onSubmitLoan,
  onClose,
}: NewLoanRequestProps) {
  const [step, setStep] = useState(1);
  const [loanAmount, setLoanAmount] = useState(15000);
  const [tenure, setTenure] = useState(12);
  const [category, setCategory] = useState<"Business" | "Home" | "Education" | "Consolidation" | "Medical" | "Other">("Business");
  const [reason, setReason] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Estimates variables
  const [monthlyRepayment, setMonthlyRepayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalRepayment, setTotalRepayment] = useState(0);
  const processingFee = 45.00;

  // Recalculate repayments on amount/tenure changes
  useEffect(() => {
    const annualRate = 0.085; // 8.5% fixed for simulation
    const monthlyRate = annualRate / 12;
    const payment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -tenure));
    const totalPayable = payment * tenure;
    const interest = totalPayable - loanAmount;

    setMonthlyRepayment(payment);
    setTotalInterest(interest);
    setTotalRepayment(totalPayable);
  }, [loanAmount, tenure]);

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBackStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFormSubmit = async () => {
    if (!termsAccepted) {
      alert("Please agree to the marketplace terms before submitting.");
      return;
    }

    const titlePrefixMap = {
      Business: "Business Expansion Funding",
      Home: "Home Improvement Renovation",
      Education: "Academic Tuition Assistance",
      Consolidation: "Debt Consolidation Support",
      Medical: "Medical Care and Procedures",
      Other: "Personal Growth Project Funding"
    };

    await onSubmitLoan({
      title: titlePrefixMap[category],
      category,
      description: reason || "Funding support for modern personal and commercial developmental initiatives via LendLoop.",
      amountRequired: loanAmount,
      interestRate: 8.5,
      tenureMonths: tenure
    });

    setShowSuccess(true);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 animate-fade-in">
      {/* 3-Step Indicator Header */}
      <div className="flex items-center justify-between mb-12 max-w-2xl mx-auto">
        <div onClick={() => step > 1 && setStep(1)} className="flex flex-col items-center gap-2 group cursor-pointer">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
            step > 1
              ? "bg-emerald-500 text-white"
              : step === 1
              ? "bg-slate-900 text-white dark:bg-emerald-600 ring-4 ring-slate-100"
              : "bg-slate-100 text-slate-400 dark:bg-slate-800"
          }`}>
            {step > 1 ? <Check className="w-4 h-4" /> : "1"}
          </div>
          <span className={`text-[11px] font-bold tracking-tight uppercase ${step === 1 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Amount</span>
        </div>

        <div className="h-[2px] flex-grow bg-slate-200 dark:bg-slate-700 mx-4 rounded-full overflow-hidden">
          <div className={`h-full bg-slate-900 dark:bg-emerald-600 transition-all duration-500 ${step >= 2 ? "w-full" : "w-0"}`} />
        </div>

        <div onClick={() => step > 2 && setStep(2)} className="flex flex-col items-center gap-2 group cursor-pointer">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
            step > 2
              ? "bg-emerald-500 text-white"
              : step === 2
              ? "bg-slate-900 text-white dark:bg-emerald-600 ring-4 ring-slate-100"
              : "bg-slate-100 text-slate-400 dark:bg-slate-800"
          }`}>
            {step > 2 ? <Check className="w-4 h-4" /> : "2"}
          </div>
          <span className={`text-[11px] font-bold tracking-tight uppercase ${step === 2 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Purpose</span>
        </div>

        <div className="h-[2px] flex-grow bg-slate-200 dark:bg-slate-700 mx-4 rounded-full overflow-hidden">
          <div className={`h-full bg-slate-900 dark:bg-emerald-600 transition-all duration-500 ${step === 3 ? "w-full" : "w-0"}`} />
        </div>

        <div className="flex flex-col items-center gap-2 group">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
            step === 3
              ? "bg-slate-900 text-white dark:bg-emerald-600 ring-4 ring-slate-100"
              : "bg-slate-100 text-slate-400 dark:bg-slate-800"
          }`}>
            3
          </div>
          <span className={`text-[11px] font-bold tracking-tight uppercase ${step === 3 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Review</span>
        </div>
      </div>

      {/* Grid Layout Form Content + Sticky summary widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main form segments */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1 panel */}
          {step === 1 && (
            <section className="space-y-6">
              <div className="mb-4">
                <h1 className="text-2xl font-black text-slate-950 dark:text-white mb-1">How much do you need?</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Specify your loan requirements to see instant repayment estimates.</p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl space-y-8 shadow-sm">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Loan Amount</label>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      ${loanAmount.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="50000"
                    step="500"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-150 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 dark:accent-emerald-400 outline-none"
                  />
                  <div className="flex justify-between mt-2 text-xs text-slate-400 font-semibold">
                    <span>$1,000</span>
                    <span>$50,000</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wider text-slate-400 uppercase mb-4">
                    Repayment Period
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {[12, 24, 36].map((months) => (
                      <button
                        key={months}
                        onClick={() => setTenure(months)}
                        className={`py-3 font-bold text-sm rounded-xl border transition-all ${
                          tenure === months
                            ? "bg-slate-950 text-white dark:bg-emerald-600 dark:text-white border-transparent"
                            : "border-slate-200 dark:border-slate-700 text-slate-750 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-705"
                        }`}
                      >
                        {months} Mo
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleNextStep}
                  className="w-full py-3.5 bg-slate-950 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </section>
          )}

          {/* Step 2 panel */}
          {step === 2 && (
            <section className="space-y-6">
              <div className="mb-4">
                <h1 className="text-2xl font-black text-slate-955 dark:text-white mb-1">Tell us the purpose</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Lenders are more likely to fund projects with clear, professional descriptions.</p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl space-y-6 shadow-sm">
                <div>
                  <label className="block text-xs font-bold tracking-wider text-slate-400 uppercase mb-4">
                    Loan Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { id: "Business", label: "Business", color: "text-blue-500" },
                      { id: "Home", label: "Home", color: "text-emerald-500" },
                      { id: "Education", label: "Education", color: "text-purple-500" },
                      { id: "Consolidation", label: "Consolidation", color: "text-amber-500" },
                      { id: "Medical", label: "Medical", color: "text-red-500" },
                      { id: "Other", label: "Other", color: "text-slate-500" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setCategory(item.id as any)}
                        className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all text-center ${
                          category === item.id
                            ? "border-emerald-500 dark:border-emerald-450 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-350 font-bold"
                            : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-lg font-extrabold">{item.label[0]}</span>
                        <span className="text-xs font-bold">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wider text-slate-400 uppercase mb-2">
                    Detailed Reason
                  </label>
                  <textarea
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Explain how you will use the funds and your plan for secure repayment..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 font-medium text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 outline-none transition-colors"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleBackStep}
                    className="w-1/3 py-3.5 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-250 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="w-2/3 py-3.5 bg-slate-950 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm"
                  >
                    Preview Summary
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Step 3 panel */}
          {step === 3 && (
            <section className="space-y-6">
              <div className="mb-4">
                <h1 className="text-2xl font-black text-slate-950 dark:text-white mb-1">Review & Submit</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Double check your request details before it is published to the live marketplace.</p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl space-y-6 shadow-sm">
                <div className="grid grid-cols-2 gap-6 border-b border-slate-100 dark:border-slate-700 pb-6">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Requested Capital</span>
                    <span className="text-xl font-extrabold text-slate-950 dark:text-slate-100">${loanAmount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Category</span>
                    <span className="text-xl font-extrabold text-slate-950 dark:text-slate-100">{category}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Loan Season/Tenure</span>
                    <span className="text-xl font-extrabold text-slate-950 dark:text-slate-100">{tenure} Months</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Simulated Rate (Est.)</span>
                    <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">8.5% p.a.</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-2">Commitment Statement</span>
                  <p className="italic text-sm text-slate-800 dark:text-slate-350">
                    "{reason || "Supporting growth, building options and securing high value development outcomes with LendLoop."}"
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 text-emerald-500 rounded bg-white dark:bg-slate-900 border-slate-300 focus:ring-emerald-500 focus:outline-none"
                  />
                  <label htmlFor="terms" className="text-xs text-slate-500 dark:text-slate-450 leading-snug cursor-pointer select-none">
                    I explicitly agree to the <span className="text-emerald-600 dark:text-emerald-450 font-bold underline cursor-pointer">LendLoop Marketplace Terms</span>, including credit check authorization and repayment policy contracts.
                  </label>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-700/80">
                  <button
                    onClick={handleBackStep}
                    className="w-1/3 py-3.5 border border-slate-200 dark:border-slate-750 text-slate-750 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleFormSubmit}
                    className="w-2/3 py-3.5 bg-slate-950 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold rounded-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>Submit Loan Request</span>
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right summary estimates bar (sticky-like) */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-slate-950 text-white p-6 rounded-2xl border border-slate-850 dark:border-slate-700 relative overflow-hidden shadow-xl">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-505/10 rounded-full blur-3xl" />
            <h3 className="text-lg font-black block border-b border-slate-800 pb-3 mb-4">Quick Summary</h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-semibold">Monthly Repayment</span>
                <span className="font-extrabold text-emerald-400">
                  ${monthlyRepayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-semibold">Total Interest (8.5%)</span>
                <span className="text-slate-200 font-bold">
                  ${totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-semibold">Processing Fee</span>
                <span className="text-slate-200 font-bold">${processingFee.toFixed(2)}</span>
              </div>
              <div className="pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-300">Total To Payback</span>
                  <span className="text-xl font-black text-white">
                    ${(totalRepayment + processingFee).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <p className="text-[11px] leading-relaxed text-slate-400">
                These estimates are calculated using standard amortization. Final values and terms may be finalized depending on investor bids.
              </p>
            </div>
          </div>

          <div className="mt-6 px-4">
            <div className="flex -space-x-2.5 mb-2">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrrIJvVGCTsQEtyBnrAhk72GfmV_si21UaRg2sOcIxBy1eRSrMPBhok5NtwAVsvTjWqL2SaoZGVgWw7p9V8OrrIIK126xLGApTINUWDXhFwYZkjhaAuMAMrM9_VRBk0HaMp8Fxsg5HDt8eu-RZsPfk5VxLF_PF8DXoKTVSQFt-wFwLuugzY2HDwo7kgKIe145IU-KzQ57_gCigqGPORyj49W9mGtlpsvK-E-XlmgVDEavDclcqOyXFQn4NlPqC7AKbrPX1oHrYp1CF"
                alt="Active lender 1"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border-2 border-slate-100 dark:border-slate-900 object-cover"
              />
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_18Xn70_52Y6OZEmoqpHK6Dv-jGdolpnnftsCl9TSFTFgbLHCnuguBZ6Qb8nyEZeYAvr_2Tkz6vnV6ncBFXzG9y10HeRZep9JadMVVu4HQH5PvlIq80cD9PiD4MDjJHhZeAS7W_0MLwIBN7V6i_gCYmntA5hT-vw-Jz6Cu3o5N5mPiY8fHW1UIEQFsQES5MK4LTXkjUYHNX7Mi497qubanPN-iGVpiP5uoZhi2kGzNbbxMAhgE-qLlrw7fAkRgdmWUCIKjKx0hEQZ"
                alt="Active lender 2"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border-2 border-slate-100 dark:border-slate-900 object-cover"
              />
              <div className="w-8 h-8 rounded-full border-2 border-slate-100 dark:border-slate-900 bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center">
                +48
              </div>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Active lenders are currently reviewing {category} category requests.
            </p>
          </div>
        </div>
      </div>

      {/* Success Modal overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Request Published successfully!</h2>
            <p className="text-sm text-slate-550 dark:text-slate-400 mb-6">
              Your loan application is now live on the LendLoop Marketplace. Our verified investor networks can view and fund your project!
            </p>
            <button
              onClick={() => {
                setShowSuccess(false);
                onClose();
              }}
              className="w-full py-3 bg-slate-955 text-white dark:bg-emerald-600 dark:hover:bg-emerald-400 font-bold text-sm rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md"
            >
              View Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
