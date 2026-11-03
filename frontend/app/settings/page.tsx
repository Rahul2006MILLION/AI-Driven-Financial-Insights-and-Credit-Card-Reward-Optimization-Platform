"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage } from "@/lib/i18n";
import { apiFetch, clearSession, API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ToastContainer, useToast } from "@/components/Toast";
import {
  ShieldCheck,
  Download,
  Trash2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Lock,
} from "lucide-react";

interface Preferences {
  prioritize_cashback: boolean;
  prioritize_miles: boolean;
  include_annual_fee_in_net: boolean;
  monthly_spend_target: number | null;
  budget_alert_threshold: number;
}

export default function SettingsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { session, logout } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const [prefsLoading, setPrefsLoading] = useState(true);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prioritizeCashback, setPrioritizeCashback] = useState(true);
  const [includeFeeNet, setIncludeFeeNet] = useState(false);
  const [budgetAlertThreshold, setBudgetAlertThreshold] = useState(80);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [exporting, setExporting] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    apiFetch<Preferences>("/profile/preferences")
      .then((prefs) => {
        setPrioritizeCashback(prefs.prioritize_cashback);
        setIncludeFeeNet(prefs.include_annual_fee_in_net);
        setBudgetAlertThreshold(Number(prefs.budget_alert_threshold));
      })
      .catch(() => {
        // Use defaults if endpoint fails
      })
      .finally(() => setPrefsLoading(false));
  }, []);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrefsSaving(true);
    try {
      await apiFetch("/profile/preferences", {
        method: "PUT",
        body: JSON.stringify({
          prioritize_cashback: prioritizeCashback,
          include_annual_fee_in_net: includeFeeNet,
          budget_alert_threshold: budgetAlertThreshold,
        }),
      });
      addToast(t.settings.preferencesSavedMsg, "success");
    } catch (err: any) {
      addToast(err.message || t.settings.savePrefsFailed, "error");
    } finally {
      setPrefsSaving(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const session = apiFetch as any;
      // Direct fetch to get blob
      const { getStoredSession } = await import("@/lib/api");
      const stored = getStoredSession();
      const res = await fetch(`${API_BASE_URL}/auth/export`, {
        headers: stored?.accessToken ? { Authorization: `Bearer ${stored.accessToken}` } : {},
      });
      if (!res.ok) throw new Error(t.settings.exportFailedShort);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disp = res.headers.get("content-disposition") || "";
      const match = disp.match(/filename="([^"]+)"/);
      a.download = match ? match[1] : "cliq_export.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      addToast(t.settings.exportDownloaded, "success");
    } catch (err: any) {
      addToast(err.message || t.settings.exportFailed, "error");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE MY ACCOUNT") {
      addToast(t.settings.typeToConfirmToast, "warning");
      return;
    }
    if (!deletePassword) {
      addToast(t.settings.enterPassword, "warning");
      return;
    }
    setDeleting(true);
    try {
      await apiFetch("/auth/account", {
        method: "DELETE",
        body: JSON.stringify({
          password: deletePassword,
          confirmation: deleteConfirmText,
        }),
      });
      clearSession();
      router.push("/register");
    } catch (err: any) {
      addToast(err.message || t.settings.deleteFailed, "error");
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-[#0E1013]">
      <Sidebar />

      <main className="flex-1 p-5 sm:p-7 lg:p-9 max-w-4xl mx-auto w-full space-y-7">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            {t.settings.title}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.settings.subtitle}
          </p>
        </div>

        {/* Security Status */}
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
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">{t.settings.statusActive}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">{t.settings.tokenEncryptionTitle}</span>
                <span className="text-[10px] text-slate-500">{t.settings.tokenEncryptionDesc}</span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">{t.settings.statusCompliant}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">{t.settings.jwtTitle}</span>
                <span className="text-[10px] text-slate-500">{t.settings.jwtDesc}</span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">{t.settings.statusHs256}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">{t.settings.rateLimitTitle}</span>
                <span className="text-[10px] text-slate-500">{t.settings.rateLimitDesc}</span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">{t.settings.statusEnforced}</span>
            </div>
          </div>
        </div>

        {/* Optimization Preferences */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.6)] space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              {t.settings.optimizationPreferencesTitle}
            </h3>
          </div>

          {prefsLoading ? (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t.settings.loadingPrefs}
            </div>
          ) : (
            <form onSubmit={handleSavePreferences} className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div>
                  <span className="font-semibold text-white block">{t.settings.prioritizeCashbackLabel}</span>
                  <span className="text-[10px] text-slate-500">{t.settings.prioritizeCashbackDesc}</span>
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
                  <span className="text-[10px] text-slate-500">{t.settings.includeFeeNetDesc}</span>
                </div>
                <input
                  type="checkbox"
                  checked={includeFeeNet}
                  onChange={(e) => setIncludeFeeNet(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-0"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div>
                  <span className="font-semibold text-white block">{t.settings.budgetAlertTitle}</span>
                  <span className="text-[10px] text-slate-500">{t.settings.budgetAlertDesc}</span>
                </div>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={budgetAlertThreshold}
                  onChange={(e) => setBudgetAlertThreshold(Number(e.target.value))}
                  className="w-16 px-2 py-1 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs text-center focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={prefsSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#0E1013] font-semibold text-xs shadow-[0_0_15px_rgba(76,192,63,0.35)] transition-all disabled:opacity-60"
              >
                {prefsSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {t.settings.savePreferencesButton}
              </button>
            </form>
          )}
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
                {t.settings.exportDesc}
              </span>
            </div>
            <button
              onClick={handleExportData}
              disabled={exporting}
              className="px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors disabled:opacity-60"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{t.settings.exportArchiveButton}</span>
            </button>
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-rose-400 block">{t.settings.deleteAccountButton}</span>
              <span className="text-[10px] text-slate-400">
                {t.settings.deleteDesc}
              </span>
            </div>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="px-4 py-2 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.settings.deleteAccountButton}</span>
            </button>
          </div>
        </div>

        {/* Password Reset Link */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-white block">{t.settings.changePassword}</span>
            <span className="text-[10px] text-slate-500">{t.settings.changePasswordDesc}</span>
          </div>
          <a
            href="/forgot-password"
            className="px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{t.auth.resetPassword}</span>
          </a>
        </div>
      </main>

      {/* Delete Account Dialog */}
      {showDeleteDialog && (
        <ConfirmDialog
          title={t.settings.deleteAccount}
          message={t.settings.deleteDialogMessage}
          confirmLabel={deleting ? t.settings.deleting : t.settings.deleteMyAccount}
          cancelLabel={t.cards.cancel}
          variant="danger"
          onConfirm={handleDeleteAccount}
          onCancel={() => { setShowDeleteDialog(false); setDeletePassword(""); setDeleteConfirmText(""); }}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t.settings.yourPassword}</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder={t.settings.currentPasswordPlaceholder}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-rose-500 focus:outline-none"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.settings.typeToConfirm.split("{phrase}")[0]}
                <span className="text-rose-400 font-mono">DELETE MY ACCOUNT</span>
                {t.settings.typeToConfirm.split("{phrase}")[1]}
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-mono focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>
        </ConfirmDialog>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
