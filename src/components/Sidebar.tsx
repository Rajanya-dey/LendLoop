import {
  LayoutDashboard,
  Coins,
  Briefcase,
  History,
  PlusCircle,
  Settings,
  LogOut,
  UserCheck
} from "lucide-react";
import { UserRole, UserProfile } from "../types";

interface SidebarProps {
  currentRole: UserRole;
  profile: UserProfile | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  currentRole,
  profile,
  activeTab,
  setActiveTab,
  onLogout,
  isOpenOnMobile = false,
  onCloseMobile,
}: SidebarProps) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "loans", label: "Loans", icon: Coins },
    { id: "investments", label: "Investments", icon: Briefcase },
    { id: "transactions", label: "Transactions", icon: History },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenOnMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 top-16 bg-slate-950/40 dark:bg-slate-950/60 z-40 lg:hidden transition-opacity cursor-pointer animate-fade-in"
        />
      )}

      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-64px)] w-64 flex flex-col p-6 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 z-50 lg:translate-x-0 ${
          isOpenOnMobile ? "translate-x-0 shadow-2xl bg-white dark:bg-slate-900" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Profile Header Block */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-emerald-950 flex items-center justify-center text-teal-700 dark:text-emerald-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {profile?.name || "Alex Rivers"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentRole === UserRole.LENDER ? "Verified Lender" : "Verified Borrower"}
            </p>
          </div>
        </div>

        {/* Navigation Options */}
        <nav className="flex-grow flex flex-col gap-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  onCloseMobile?.();
                }}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl font-semibold text-sm transition-all text-left ${
                  isActive
                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white"
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Section: Actions */}
        <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              setActiveTab("new_request");
              onCloseMobile?.();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-950 dark:bg-emerald-600 dark:text-white hover:opacity-90 rounded-xl font-bold text-sm text-white mb-6 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New {currentRole === UserRole.LENDER ? "Investment" : "Request"}</span>
          </button>

          <div className="flex flex-col gap-1">
            <button
              onClick={() => {
                setActiveTab("settings");
                onCloseMobile?.();
              }}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl font-semibold text-sm transition-all text-left ${
                activeTab === "settings"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => {
                onLogout();
                onCloseMobile?.();
              }}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl font-semibold text-sm transition-all text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
