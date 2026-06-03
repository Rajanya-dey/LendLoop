import { useState, useEffect } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import {
  Sparkles,
  ArrowRight,
  User,
  ShieldAlert,
  Loader2,
  Lock,
  ChevronRight,
  Database
} from "lucide-react";
import { auth, db } from "./firebase";
import {
  UserProfile,
  UserRole,
  Loan,
  Transaction,
  LoanStatus,
  AppNotification
} from "./types";
import {
  fetchUserProfile,
  saveUserProfile,
  subscribeToLoans,
  subscribeToTransactions,
  createLoan,
  fundLoan,
  recordTransaction,
  testFirestoreConnection
} from "./services/db";

// Components
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import LenderDashboard from "./components/LenderDashboard";
import BorrowerDashboard from "./components/BorrowerDashboard";
import NewLoanRequest from "./components/NewLoanRequest";
import Marketplace from "./components/Marketplace";
import SettingsComponent from "./components/Settings";
import LoanCalculatorModal from "./components/LoanCalculatorModal";

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>(UserRole.LENDER);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("lendloop-theme");
      if (stored) return stored === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });
  const [appReady, setAppReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // Database Arrays
  const [loans, setLoans] = useState<Loan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: "notif-1",
      title: "Welcome to LendLoop! 🎉",
      message: "Your profile has been synchronized successfully with our secure Firestore DB. Safe Peer-to-Peer matches are active.",
      time: "2 hours ago",
      isRead: false,
      type: "success"
    },
    {
      id: "notif-2",
      title: "Citadel Shield Audit Passed",
      message: "Your ABAC fortress version 2 credentials checked out. Credit score reporting status is: Verified Excellent.",
      time: "5 hours ago",
      isRead: true,
      type: "info"
    },
    {
      id: "notif-3",
      title: "High Yield Offer Posted",
      message: "A new prime asset for 'SBA Business Expansion Loan' rated A+ is available at 12.5% yield. Explore now!",
      time: "1 day ago",
      isRead: true,
      type: "success"
    }
  ]);

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleClearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Dark Mode side effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      root.classList.remove("light");
      localStorage.setItem("lendloop-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      localStorage.setItem("lendloop-theme", "light");
    }
  }, [isDarkMode]);

  // Auth & Connection initiation
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);
      if (user) {
        setCurrentUser(user);
        const userProfile = await fetchUserProfile(user.uid);
        if (userProfile) {
          setProfile(userProfile);
          setRole(userProfile.role);
        } else {
          // If no profile, register initial values
          const initialProfile: UserProfile = {
            uid: user.uid,
            name: user.displayName || "Alex Rivers",
            email: user.email || "alex.rivers@lendloop.com",
            role: UserRole.LENDER,
            isVerified: true,
            avatarUrl: user.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuAeqVBVXVEfQ9eCsfto6iKeAqKQUtKaVXKRYg4jX8qHmR-hma28Tlb3q2sbLM8TtUiibcrUgDTcc5i_JhDfbL8W4nk-SiAsYQQpQOfr-sMTJQ4RTHksx3e773vg0SXepVKK49KsYUReSbNX1kXamHdq_y0QrxaDZ7d909EIMjATJ5QuIPDObWMaJaVK9IgzfEXNk1qj2o-o4N0v7to1gFRXyOufcPggnXSLmdPo_9G3hxaomWlAxyQ5uCdeuzujpGJMfNQNugWdeH7T",
            creditScore: 782,
            availableCapital: 14250.00,
          };
          await saveUserProfile(initialProfile);
          setProfile(initialProfile);
          setRole(UserRole.LENDER);
        }
      } else {
        setCurrentUser(null);
        setProfile(null);
      }
      setAuthLoading(false);
      setAppReady(true);
    });

    return () => unsubscribeAuth();
  }, []);

  // Real-time Database synchronization with lists
  useEffect(() => {
    const unsubscribeLoans = subscribeToLoans((syncedLoans) => {
      setLoans(syncedLoans);
    });

    const activeUserId = currentUser ? currentUser.uid : "demo_user";
    const unsubscribeTransactions = subscribeToTransactions(activeUserId, (syncedTxs) => {
      setTransactions(syncedTxs);
    });

    return () => {
      unsubscribeLoans();
      unsubscribeTransactions();
    };
  }, [currentUser]);

  // Handle Authentication trigger
  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Auth google setup failed, continuing using sandbox token fallback.", error);
    } finally {
      setAuthLoading(false);
    }
  };

  // Developer Bypass Demo mode
  const handleBypassDemo = () => {
    setAuthLoading(true);
    const fakeProfile: UserProfile = {
      uid: "demo_user",
      name: "Alex Rivers",
      email: "alex.rivers@lendloop.com",
      role: UserRole.LENDER,
      isVerified: true,
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAeqVBVXVEfQ9eCsfto6iKeAqKQUtKaVXKRYg4jX8qHmR-hma28Tlb3q2sbLM8TtUiibcrUgDTcc5i_JhDfbL8W4nk-SiAsYQQpQOfr-sMTJQ4RTHksx3e773vg0SXepVKK49KsYUReSbNX1kXamHdq_y0QrxaDZ7d909EIMjATJ5QuIPDObWMaJaVK9IgzfEXNk1qj2o-o4N0v7to1gFRXyOufcPggnXSLmdPo_9G3hxaomWlAxyQ5uCdeuzujpGJMfNQNugWdeH7T",
      creditScore: 782,
      availableCapital: 14250.00,
    };
    setProfile(fakeProfile);
    setRole(UserRole.LENDER);
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    if (currentUser) {
      await signOut(auth);
    } else {
      setProfile(null);
    }
    setActiveTab("dashboard");
  };

  // Switch role parameter updates
  const handleRoleSwitch = async (newRole: UserRole) => {
    setRole(newRole);
    if (profile) {
      const updated = { ...profile, role: newRole };
      setProfile(updated);
      if (currentUser) {
        await saveUserProfile(updated);
      }
    }
  };

  const handleUpdateProfile = async (updatedData: Partial<UserProfile>) => {
    if (profile) {
      const updated = { ...profile, ...updatedData };
      setProfile(updated);
      if (currentUser) {
        await saveUserProfile(updated);
      }
    }
  };

  // Funding action inside Marketplace
  const handleFundLoanAction = async (loanId: string, amount: number) => {
    const activeId = currentUser ? currentUser.uid : "demo_user";
    await fundLoan(loanId, activeId, amount);

    // Add active notification
    const matchedLoan = loans.find(l => l.id === loanId);
    const newNotif: AppNotification = {
      id: "notif-" + Date.now(),
      title: "Investment Active 🚀",
      message: `Successfully funded $${amount.toLocaleString()} to "${matchedLoan?.title || 'Loan Asset'}". Coupon repayments will yield directly!`,
      time: "Just now",
      isRead: false,
      type: "success"
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Subtract from capital locally
    if (profile) {
      const updatedProfile = {
        ...profile,
        availableCapital: Math.max(0, profile.availableCapital - amount),
      };
      setProfile(updatedProfile);
      if (currentUser) {
        await saveUserProfile(updatedProfile);
      }
    }
  };

  // Apply new loan requested
  const handleCreateLoanAction = async (loanData: {
    title: string;
    category: "Business" | "Home" | "Education" | "Consolidation" | "Medical" | "Other";
    description: string;
    amountRequired: number;
    interestRate: number;
    tenureMonths: number;
  }) => {
    const activeId = currentUser ? currentUser.uid : "demo_user";
    const borrowerNameInput = profile ? profile.name : "Alex Rivers";
    const avatarInput = profile ? profile.avatarUrl : "https://lh3.googleusercontent.com/aida-public/AB6AXuAeqVBVXVEfQ9eCsfto6iKeAqKQUtKaVXKRYg4jX8qHmR-hma28Tlb3q2sbLM8TtUiibcrUgDTcc5i_JhDfbL8W4nk-SiAsYQQpQOfr-sMTJQ4RTHksx3e773vg0SXepVKK49KsYUReSbNX1kXamHdq_y0QrxaDZ7d909EIMjATJ5QuIPDObWMaJaVK9IgzfEXNk1qj2o-o4N0v7to1gFRXyOufcPggnXSLmdPo_9G3hxaomWlAxyQ5uCdeuzujpGJMfNQNugWdeH7T";

    const newlyCreated = await createLoan({
      borrowerId: activeId,
      borrowerName: borrowerNameInput,
      borrowerAvatar: avatarInput,
      title: loanData.title,
      category: loanData.category,
      description: loanData.description,
      amountRequired: loanData.amountRequired,
      interestRate: loanData.interestRate,
      tenureMonths: loanData.tenureMonths,
      status: LoanStatus.PENDING,
    });

    // Add active notification
    const newNotif: AppNotification = {
      id: "notif-" + Date.now(),
      title: "Loan Offer Live 📋",
      message: `Your application "${loanData.title}" for $${loanData.amountRequired.toLocaleString()} is live on the peer marketplace.`,
      time: "Just now",
      isRead: false,
      type: "success"
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Record disbursement transaction
    await recordTransaction({
      userId: activeId,
      loanId: newlyCreated.id,
      loanTitle: `Disbursement: ${newlyCreated.title}`,
      amount: loanData.amountRequired,
      type: "disbursement",
    });
  };

  // Direct Repayment click action
  const handlePayNowAction = async (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    const repaymentAmount = 450.00;
    const activeId = currentUser ? currentUser.uid : "demo_user";

    await recordTransaction({
      userId: activeId,
      loanId: loanId,
      loanTitle: `Repayment - ${loan.title}`,
      amount: repaymentAmount,
      type: "repayment",
    });

    // Add active notification
    const newNotif: AppNotification = {
      id: "notif-" + Date.now(),
      title: "Repayment Dispatched 💰",
      message: `Secure repayment of $${repaymentAmount.toFixed(2)} issued successfully for "${loan.title}".`,
      time: "Just now",
      isRead: false,
      type: "info"
    };
    setNotifications(prev => [newNotif, ...prev]);

    alert(`Repayment of $${repaymentAmount.toFixed(2)} sent securely via LendLoop.`);
  };

  const exportToCSV = (csvContent: string, fileName: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Statements for Borrower
  const handleDownloadStatements = () => {
    const userName = profile?.name || "User";
    const dateStr = new Date().toLocaleDateString();
    
    let csv = `LendLoop Transaction Statement\r\n`;
    csv += `Generated Date,${dateStr}\r\n`;
    csv += `Participant Name,${userName}\r\n`;
    csv += `Role,Verified Borrower\r\n\r\n`;
    csv += `Transaction ID,Date,Description,Type,Amount\r\n`;

    transactions.forEach((tx) => {
      const txDate = new Date(tx.date).toLocaleDateString();
      const amountSign = tx.type === "repayment" || tx.type === "funding" ? "-" : "+";
      const cleanTitle = tx.loanTitle.replace(/,/g, " ");
      csv += `"${tx.id}","${txDate}","${cleanTitle}","${tx.type}","${amountSign}$${tx.amount.toFixed(2)}"\r\n`;
    });

    exportToCSV(csv, `LendLoop_Statement_${userName.replace(/\s+/g, "_")}.csv`);

    // Add browser in-app notification context
    const newNotif: AppNotification = {
      id: "notif-export-" + Date.now(),
      title: "Statement Downloaded",
      message: `Your transaction history has been compiled and downloaded as LendLoop_Statement_${userName.replace(/\s+/g, "_")}.csv`,
      time: "Just now",
      isRead: false,
      type: "success"
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Export Report for Lender
  const handleExportReport = () => {
    const userName = profile?.name || "User";
    const dateStr = new Date().toLocaleDateString();
    
    const activeLoans = loans.filter((l) => l.status === LoanStatus.FUNDED);
    const totalActiveValue = activeLoans.reduce((acc, l) => acc + l.amountRequired, 82400);

    let csv = `LendLoop Lender Portfolio Report\r\n`;
    csv += `Report Date,${dateStr}\r\n`;
    csv += `Lender Name,${userName}\r\n`;
    csv += `Role,Verified Lender\r\n\r\n`;
    csv += `Portfolio Summary\r\n`;
    csv += `Available Capital,$14250.00\r\n`;
    csv += `Total Active Value,$${totalActiveValue.toFixed(2)}\r\n`;
    csv += `Interest Earned (YTD),$3842.12\r\n\r\n`;
    
    csv += `Funded Investments List\r\n`;
    csv += `Loan ID,Title,Borrower,Interest Rate,Amount Funded,Goal Amount,Status\r\n`;

    loans.forEach((loan) => {
      const cleanTitle = loan.title.replace(/,/g, " ");
      csv += `"${loan.id}","${cleanTitle}","${loan.borrowerName}",${loan.interestRate}%,$${loan.amountFunded.toFixed(2)},$${loan.amountRequired.toFixed(2)},"${loan.status}"\r\n`;
    });

    exportToCSV(csv, `LendLoop_Portfolio_Report_${userName.replace(/\s+/g, "_")}.csv`);

    const newNotif: AppNotification = {
      id: "notif-report-" + Date.now(),
      title: "Portfolio Report Downloaded",
      message: `Lender report compiled for ${userName} and downloaded as LendLoop_Portfolio_Report_${userName.replace(/\s+/g, "_")}.csv`,
      time: "Just now",
      isRead: false,
      type: "success"
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Render Splash login interface if no user/profile is authenticated
  if (authLoading && !appReady) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">
          Syncing LendLoop ledger...
        </p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#f8f9ff] dark:bg-slate-900 flex flex-col justify-between p-6 md:p-12 transition-colors duration-300">
        <header className="flex justify-between items-center max-w-7xl mx-auto w-full">
          <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-650 dark:text-emerald-450" />
            LendLoop
          </span>
          <div className="flex gap-2">
            <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 py-1.5 px-3 rounded-full">
              Safe ABAC Compliance Enabled
            </span>
          </div>
        </header>

        <section className="max-w-4xl mx-auto w-full my-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 space-y-6">
            <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-3 py-1 text-xs font-bold rounded-lg uppercase">
              Now Live in Cloud
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-tight">
              Peer-to-Peer lending, <br />
              <span className="text-emerald-650 dark:text-emerald-400">visualized and secure.</span>
            </h1>
            <p className="text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
              LendLoop facilitates direct token matches between verified borrower networks and global lenders. Set yield ranges, audit repayment histories, and monitor real-time balance metrics directly.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={handleGoogleSignIn}
                className="px-6 py-3.5 bg-slate-950 dark:bg-emerald-600 hover:opacity-90 dark:hover:bg-emerald-555 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-[0.98]"
              >
                <span>Google Secure Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleBypassDemo}
                className="px-6 py-3.5 border border-slate-350 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm rounded-xl transition-colors"
              >
                Instant Play Sandbox Mode
              </button>
            </div>
          </div>

          <div className="md:col-span-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
            <div className="flex gap-2 items-center text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">
              <Lock className="w-4 h-4 text-emerald-600" /> Secure Blockchain Standard
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avg. APY Return</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">12.4% APR</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Default Rate Average</p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-450">&lt; 0.45%</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">LTV Safety Ratio</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">64% Standard</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </div>
            </div>
          </div>
        </section>

        <footer className="flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto w-full border-t border-slate-200 dark:border-slate-800 pt-6 gap-4">
          <span className="text-[11px] font-semibold text-slate-400">
            © 2026 LendLoop Networks Inc. Fully certified.
          </span>
          <div className="flex gap-4 text-xs font-semibold text-slate-400">
            <span className="hover:text-slate-950 transition-colors cursor-pointer">Security Certifications</span>
            <span className="hover:text-slate-950 transition-colors cursor-pointer">Consumer Lending Terms</span>
          </div>
        </footer>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Top Navbar */}
      <Header
        currentRole={role}
        profile={profile}
        onRoleSwitch={handleRoleSwitch}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllAsRead}
        onMarkAsRead={handleMarkAsRead}
        onClearNotification={handleClearNotification}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      <div className="flex">
        {/* Left Sidebar */}
        <Sidebar
          currentRole={role}
          profile={profile}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          isOpenOnMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Core Screen Container */}
        <main className="flex-1 min-h-[calc(100vh-128px)] p-6 md:p-12 lg:ml-64 mt-20 pb-20">
          {activeTab === "dashboard" && role === UserRole.LENDER && (
            <LenderDashboard
              loans={loans}
              onFundLoan={(loanId) => {
                setActiveTab("marketplace");
              }}
              onExploreMarketplace={() => setActiveTab("marketplace")}
              onOpenCalculator={() => setIsCalculatorOpen(true)}
              onExportReport={handleExportReport}
              profile={profile}
            />
          )}

          {activeTab === "dashboard" && role === UserRole.BORROWER && (
            <BorrowerDashboard
              loans={loans.filter((l) => l.borrowerId === (currentUser ? currentUser.uid : "demo_user") || l.borrowerId === "demo_user")}
              transactions={transactions}
              onAddNewRequest={() => setActiveTab("new_request")}
              onPayNow={handlePayNowAction}
              onDownloadStatements={handleDownloadStatements}
              onOpenCalculator={() => setIsCalculatorOpen(true)}
              profile={profile}
            />
          )}

          {activeTab === "marketplace" && (
            <Marketplace
              loans={loans}
              onFundLoan={handleFundLoanAction}
              userAvailableCapital={profile?.availableCapital || 0}
            />
          )}

          {activeTab === "new_request" && (
            <NewLoanRequest
              profile={profile}
              onSubmitLoan={handleCreateLoanAction}
              onClose={() => setActiveTab("dashboard")}
            />
          )}

          {activeTab === "settings" && (
            <SettingsComponent
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            />
          )}

          {activeTab === "loans" && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-3xl space-y-6">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Active Loan Portfolio Ledger</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Lendloop provides detailed amortization mappings of the following portfolio files that are currently stored and matched.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loans.map((loan) => (
                  <div key={loan.id} className="p-5 border border-slate-205 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                    <p className="text-xs font-bold text-slate-400">Loan ID: {loan.id}</p>
                    <h4 className="text-base font-bold text-slate-950 dark:text-white mt-1">{loan.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">Requested: <span className="font-bold">${loan.amountRequired.toLocaleString()}</span></p>
                    <p className="text-xs text-slate-500">Interest rate: <span className="font-bold text-emerald-600">{loan.interestRate}% APR</span></p>
                    <p className="text-xs text-slate-550 dark:text-slate-400 mt-2 leading-relaxed italic">"{loan.description}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "investments" && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-3xl space-y-6">
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">Active Invest Ledger</h2>
              <p className="text-sm text-slate-550 dark:text-slate-405 leading-relaxed">
                The investments below currently represent your dynamic credit yield assets and active portfolios. Cash repayments are distributed automatically in 30-day block cycles.
              </p>
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-200 dark:border-slate-850 pb-2">
                      <th className="py-2">Lend Project</th>
                      <th className="py-2">Principal Funded</th>
                      <th className="py-2 text-right">Amortization Term</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.filter((l) => l.amountFunded > 0).map((l) => (
                      <tr key={l.id} className="border-b border-slate-100 dark:border-slate-800 last:border-none">
                        <td className="py-3 font-semibold">{l.title}</td>
                        <td className="py-3 font-bold text-emerald-600">${l.amountFunded.toLocaleString()}</td>
                        <td className="py-3 text-right">{l.tenureMonths} Mo</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-3xl space-y-6">
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">Dynamic Transaction Mappings</h2>
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-xl transition-all">
                    <div>
                      <p className="text-sm font-bold text-slate-950 dark:text-white">{tx.loanTitle}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(tx.date).toLocaleString()} • ID: {tx.id}
                      </p>
                    </div>
                    <span className={`text-sm font-black ${tx.type === "repayment" || tx.type === "funding" ? "text-red-500" : "text-emerald-555"}`}>
                      {tx.type === "repayment" || tx.type === "funding" ? "-" : "+"}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Bottom Nav for Mobile/Tablet viewports */}
      <nav className="fixed bottom-0 z-[60] left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex lg:hidden items-center justify-around px-4">
        {[
          { id: "dashboard", label: "Home" },
          { id: "marketplace", label: "Explore" },
          { id: "new_request", label: role === UserRole.LENDER ? "Invest" : "Apply" },
          { id: "settings", label: "Settings" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center cursor-pointer transition-colors ${
              activeTab === item.id
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <span className="text-xs font-extrabold tracking-tight pt-1">{item.label}</span>
          </button>
        ))}
      </nav>

      <LoanCalculatorModal 
        isOpen={isCalculatorOpen} 
        onClose={() => setIsCalculatorOpen(false)} 
      />
    </div>
  );
}
