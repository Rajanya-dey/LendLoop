import { useState } from "react";
import {
  Bell,
  HelpCircle,
  Sun,
  Moon,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Info,
  Trash2,
  X,
  Menu
} from "lucide-react";
import { UserRole, UserProfile, AppNotification } from "../types";

interface HeaderProps {
  currentRole: UserRole;
  profile: UserProfile | null;
  onRoleSwitch: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: string) => void;
  onClearNotification: (id: string) => void;
  onToggleMobileSidebar: () => void;
}

export default function Header({
  currentRole,
  profile,
  onRoleSwitch,
  activeTab,
  setActiveTab,
  isDarkMode,
  onToggleDarkMode,
  notifications,
  onMarkAllAsRead,
  onMarkAsRead,
  onClearNotification,
  onToggleMobileSidebar,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-12 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      {/* Left section: Branding and Navigation */}
      <div className="flex items-center gap-4 md:gap-8">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 -ml-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          LendLoop
        </span>
        <div className="hidden md:flex items-center ml-8 gap-6 h-full">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`font-semibold text-sm py-4 border-b-2 transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400"
                  : "border-transparent text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("marketplace")}
              className={`font-semibold text-sm py-4 border-b-2 transition-all cursor-pointer ${
                activeTab === "marketplace"
                  ? "border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400"
                  : "border-transparent text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Explore
            </button>
            <button
              onClick={() => setActiveTab("loans")}
              className={`font-semibold text-sm py-4 border-b-2 transition-all cursor-pointer ${
                activeTab === "loans"
                  ? "border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400"
                  : "border-transparent text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Portfolio
            </button>
          </nav>
        </div>
      </div>

      {/* Right section: Global Actions */}
      <div className="flex items-center gap-4">
        {/* Borrower / Lender mode switch */}
        <button
          onClick={() =>
            onRoleSwitch(
              currentRole === UserRole.LENDER ? UserRole.BORROWER : UserRole.LENDER
            )
          }
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-950 dark:bg-emerald-500 text-white hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          {currentRole === UserRole.LENDER ? "Borrower Mode" : "Lender Mode"}
        </button>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Dark Mode toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* Notifications Trigger & Popover Dropdown Container */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all relative cursor-pointer ${
                showNotifications ? "bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white" : ""
              }`}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[9px] font-black leading-none text-white bg-rose-500 rounded-full shrink-0 min-w-[16px] h-4 flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 animate-fade-in right-0 origin-top-right">
                {/* Header of popover */}
                <div className="p-4 flex items-center justify-between bg-slate-50 dark:bg-slate-900/40">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-950 dark:text-white">Ledger Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-450 px-2 py-0.5 rounded-md font-bold">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    {unreadCount > 0 && (
                      <button
                        onClick={() => onMarkAllAsRead()}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-450 hover:underline cursor-pointer"
                      >
                        Read all
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Notifications list */}
                <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center space-y-2">
                      <Bell className="w-8 h-8 text-slate-350 dark:text-slate-600 mx-auto animate-bounce" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-305">Clear Citadel Record</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">There are no new alerts or ledger activities.</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-4 flex items-start gap-3 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-850/50 relative group ${
                          !n.isRead ? "bg-emerald-50/20 dark:bg-emerald-950/10" : ""
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {n.type === "success" ? (
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                          ) : n.type === "warning" ? (
                            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/45 flex items-center justify-center">
                              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-blue-105 dark:bg-blue-950/45 flex items-center justify-center">
                              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-0.5 min-w-0 pr-6">
                          <div className="flex items-center gap-1.5">
                            <h4 className={`text-xs font-bold truncate ${!n.isRead ? "text-slate-950 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>
                              {n.title}
                            </h4>
                            {!n.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-350 break-words">
                            {n.message}
                          </p>
                          <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 block">
                            {n.time}
                          </span>
                        </div>

                        {/* Dropdown item actions: Mark as Read and Dismiss */}
                        <div className="absolute right-3 top-3.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!n.isRead && (
                            <button
                              onClick={() => onMarkAsRead(n.id)}
                              className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-xs cursor-pointer"
                              title="Mark as Read"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onClearNotification(n.id)}
                            className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-400 hover:text-rose-500 dark:hover:text-amber-500 shadow-xs cursor-pointer"
                            title="Dismiss"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer bar */}
                {notifications.length > 0 && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/40 text-center">
                    <button
                      onClick={() => onMarkAllAsRead()}
                      className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                    >
                      Mark All as Read
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Help */}
          <button className="hidden sm:inline-flex p-2 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer">
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* User profile image */}
          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-90 active:scale-95 transition-all">
            <img
              src={
                profile?.avatarUrl ||
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAeqVBVXVEfQ9eCsfto6iKeAqKQUtKaVXKRYg4jX8qHmR-hma28Tlb3q2sbLM8TtUiibcrUgDTcc5i_JhDfbL8W4nk-SiAsYQQpQOfr-sMTJQ4RTHksx3e773vg0SXepVKK49KsYUReSbNX1kXamHdq_y0QrxaDZ7d909EIMjATJ5QuIPDObWMaJaVK9IgzfEXNk1qj2o-o4N0v7to1gFRXyOufcPggnXSLmdPo_9G3hxaomWlAxyQ5uCdeuzujpGJMfNQNugWdeH7T"
              }
              alt="User headshot"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

