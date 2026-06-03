import { useState, FormEvent } from "react";
import {
  Settings,
  Moon,
  Sun,
  Database,
  UserCheck,
  Globe,
  Key,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import { UserProfile } from "../types";

interface SettingsProps {
  profile: UserProfile | null;
  onUpdateProfile: (updatedProfile: Partial<UserProfile>) => Promise<void>;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function SettingsComponent({
  profile,
  onUpdateProfile,
  isDarkMode,
  onToggleDarkMode,
}: SettingsProps) {
  const [name, setName] = useState(profile?.name || "Alex Rivers");
  const [email, setEmail] = useState(profile?.email || "alex.rivers@lendloop.com");
  const [isUpdating, setIsUpdating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setSaveSuccess(false);
    try {
      await onUpdateProfile({ name, email });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in max-w-4xl mx-auto">
      {/* Settings Header */}
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Settings className="w-7 h-7 text-emerald-600" />
          Platform Settings
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Manage your credentials, verify database interfaces, and toggle visual display parameters.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left side options: profile and visual themes */}
        <div className="md:col-span-7 space-y-6">
          {/* Profile form */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              Lender Headshot & Details
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Registered Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {saveSuccess && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Profile Changes Saved Perfectly!
                  </span>
                )}
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="ml-auto px-5 py-2.5 bg-slate-950 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 hover:opacity-90 disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save Details"}
                </button>
              </div>
            </form>
          </div>

          {/* Theme custom settings card */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              Visual Display Parameters
            </h3>

            <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Dark Ambient Mode Color</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">Toggle eye-safe night rendering themes for dark surroundings.</p>
              </div>

              {/* Slider Toggle */}
              <button
                type="button"
                onClick={onToggleDarkMode}
                className={`w-14 h-8 rounded-full p-1 transition-colors outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDarkMode ? "bg-emerald-500" : "bg-slate-250"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md transform transition-transform ${
                    isDarkMode ? "translate-x-6" : "translate-x-0"
                  }`}
                >
                  {isDarkMode ? <Moon className="w-3.5 h-3.5 text-emerald-600" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                </div>
              </button>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Device In-Iframe Scale</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">Optimizes density mapping inside standard embedding wrappers.</p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg">
                Compact Level-1
              </span>
            </div>
          </div>
        </div>

        {/* Right side connection / security info */}
        <div className="md:col-span-5 space-y-6">
          {/* Active backend connection credentials card */}
          <div className="bg-slate-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
            <h3 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              Firebase Database Integrations
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">State Database Target</p>
                <p className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  Firebase Firestore Cloud DB
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Project ID</p>
                <p className="text-xs font-mono text-slate-350 bg-slate-900 p-2.5 rounded-lg border border-slate-800 break-all select-all">
                  elated-guild-453107-j3
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Database Sync Authority</p>
                <p className="text-xs text-slate-350 leading-relaxed">
                  Real-time synchronization using onSnapshot listeners for loans and transactional state matrices. Fully compliant with rule-version 2 ABAC fortress gates!
                </p>
              </div>
            </div>
          </div>

          {/* Secure compliance certificate panel */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">Identity Verified</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                Alex's account holds authenticated Tier-1 verified status credentials. Secure hashing ensures all bid balances and loans remain fully restricted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
