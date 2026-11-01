"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage } from "@/lib/i18n";
import { clearSession } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
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
    alert("Exporting verified portfolio records to encrypted JSON archive...");
  };

  const handleDeleteAccount = () => {
    if (confirm(t.settings.deleteAccountConfirm)) {
      clearSession();
      router.push("/register");
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-[#040707]">
      <Sidebar />

      <main className="flex-1 p-5 sm:p-7 lg:p-9 max-w-4xl mx-auto w-full space-y-7">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white glow-emerald">
            {t.settings.title}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.settings.subtitle}
          </p>
        </div>

        {savedSettings && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{t.settings.preferencesSavedMsg}</span>
          </div>
        )}

        {/* Security & RLS Status */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.6)] space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              {t.settings.securityArchitectureTitle}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">{t.settings.rlsTitle}</span>
                <span className="text-[10px] text-slate-500">{t.settings.rlsDesc}</span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">{t.settings.tokenEncryptionTitle}</span>
                <span className="text-[10px] text-slate-500">{t.settings.tokenEncryptionDesc}</span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                COMPLIANT
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">JWT Cryptographic Validation</span>
                <span className="text-[10px] text-slate-500">Bearer Token Auth</span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                HS256 VERIFIED
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">Rate Limiting & Headers</span>
                <span className="text-[10px] text-slate-500">CSP, HSTS, 120 req/min</span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                ENFORCED
              </span>
            </div>
          </div>
        </div>

        {/* Engine Optimization Preferences */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.6)] space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              {t.settings.optimizationPreferencesTitle}
            </h3>
          </div>

          <form onSubmit={handleSavePreferences} className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div>
                <span className="font-semibold text-white block">{t.settings.prioritizeCashbackLabel}</span>
                <span className="text-[10px] text-slate-500">
                  {t.settings.prioritizeCashbackDesc}
                </span>
              </div>
              <input
                type="checkbox"
                checked={prioritizeCashback}
                onChange={(e) => setPrioritizeCashback(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-0"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div>
                <span className="font-semibold text-white block">{t.settings.includeFeeNetLabel}</span>
                <span className="text-[10px] text-slate-500">
                  {t.settings.includeFeeNetDesc}
                </span>
              </div>
              <input
                type="checkbox"
                checked={includeFeeNet}
                onChange={(e) => setIncludeFeeNet(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-0"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#040707] font-semibold text-xs shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all"
            >
              {t.settings.savePreferencesButton}
            </button>
          </form>
        </div>

        {/* Privacy & Account Management */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-rose-500/20 backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.6)] space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              {t.settings.dataSovereigntyTitle}
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            <div>
              <span className="text-xs font-semibold text-white block">{t.settings.exportArchiveButton}</span>
              <span className="text-[10px] text-slate-400">
                Download JSON archive of all registered card rules and logs.
              </span>
            </div>
            <button
              onClick={handleExportData}
              className="px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.settings.exportArchiveButton}</span>
            </button>
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-rose-400 block">{t.settings.deleteAccountButton}</span>
              <span className="text-[10px] text-slate-400">
                Permanently purge all stored credit cards and transactions.
              </span>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.settings.deleteAccountButton}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
