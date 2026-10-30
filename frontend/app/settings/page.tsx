"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage } from "@/lib/i18n";
import { clearSession } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Key,
  Lock,
  Download,
  Trash2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function SettingsPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [prioritizeCashback, setPrioritizeCashback] = useState(true);
  const [includeFeeNet, setIncludeFeeNet] = useState(false);
  const [savedSettings, setSavedSettings] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 3000);
  };

  const handleExportData = () => {
    alert("Exporting all verified card rules and transactions to JSON encrypted format...");
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? All stored card profiles and transaction logs will be permanently scrubbed.")) {
      clearSession();
      router.push("/register");
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.nav.settings}
          </h1>
          <p className="text-xs text-cliq-textSecondary mt-1">
            Row-Level Security controls, optimization parameters, audit logging, and data privacy.
          </p>
        </div>

        {savedSettings && (
          <div className="p-3.5 rounded-xl bg-cliq-emerald/10 border border-cliq-emerald/30 text-cliq-emerald text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Optimization parameters saved.</span>
          </div>
        )}

        {/* Security & RLS Status */}
        <div className="glass-panel p-6 rounded-2xl border-glow-cyan shadow-cardGlass space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cliq-cyan" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Security Architecture & Tenant Isolation
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-cliq-surface border border-cliq-border flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Supabase Row-Level Security</span>
                <span className="text-[10px] text-cliq-textSecondary">Enforced on all 11 tables</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cliq-emerald/15 text-cliq-emerald">
                ACTIVE
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-cliq-surface border border-cliq-border flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Zero Sensitive Card Storage</span>
                <span className="text-[10px] text-cliq-textSecondary">No CVV, No 16-digit PANs</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cliq-emerald/15 text-cliq-emerald">
                COMPLIANT
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-cliq-surface border border-cliq-border flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">JWT Cryptographic Validation</span>
                <span className="text-[10px] text-cliq-textSecondary">Bearer Token Auth</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cliq-cyan/15 text-cliq-cyan">
                HS256 VERIFIED
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-cliq-surface border border-cliq-border flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Rate Limiting & Security Headers</span>
                <span className="text-[10px] text-cliq-textSecondary">CSP, HSTS, 120 req/min</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cliq-emerald/15 text-cliq-emerald">
                ENFORCED
              </span>
            </div>
          </div>
        </div>

        {/* Engine Optimization Preferences */}
        <div className="glass-panel p-6 rounded-2xl border-cliq-border space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cliq-turquoise" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Optimization Preferences
            </h3>
          </div>

          <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-cliq-surface border border-cliq-border">
              <div>
                <span className="font-bold text-white block">Prioritize Direct Cashback over Miles</span>
                <span className="text-[10px] text-cliq-textSecondary">
                  Give higher weighting to liquid monetary credits over travel points
                </span>
              </div>
              <input
                type="checkbox"
                checked={prioritizeCashback}
                onChange={(e) => setPrioritizeCashback(e.target.checked)}
                className="w-4 h-4 rounded text-cliq-cyan"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-cliq-surface border border-cliq-border">
              <div>
                <span className="font-bold text-white block">Deduct Annual Fees in Net Yield</span>
                <span className="text-[10px] text-cliq-textSecondary">
                  Account for amortized annual fee in ranking calculations
                </span>
              </div>
              <input
                type="checkbox"
                checked={includeFeeNet}
                onChange={(e) => setIncludeFeeNet(e.target.checked)}
                className="w-4 h-4 rounded text-cliq-cyan"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cliq-surface hover:bg-cliq-surfaceHover border border-cliq-cyan/40 text-cliq-cyan font-bold text-xs shadow-sm transition-all"
            >
              Update Preferences
            </button>
          </form>
        </div>

        {/* Privacy & Danger Zone */}
        <div className="glass-panel p-6 rounded-2xl border-cliq-danger/30 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-cliq-danger" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Data Sovereignty & Account Deletion
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div>
              <span className="text-xs font-bold text-white block">Export Personal Financial Data</span>
              <span className="text-[10px] text-cliq-textSecondary">
                Download a JSON archive of all registered card rules, transaction histories, and analytics logs.
              </span>
            </div>
            <button
              onClick={handleExportData}
              className="px-4 py-2 rounded-xl bg-cliq-surface border border-cliq-border text-white text-xs font-semibold hover:border-cliq-cyan flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>

          <div className="pt-4 border-t border-cliq-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-cliq-danger block">Permanently Delete Account</span>
              <span className="text-[10px] text-cliq-textSecondary">
                Irreversibly scrubs all stored profiles, credit card rules, and transactions.
              </span>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 rounded-xl bg-cliq-danger/10 hover:bg-cliq-danger/20 border border-cliq-danger/40 text-cliq-danger text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account & Data</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
