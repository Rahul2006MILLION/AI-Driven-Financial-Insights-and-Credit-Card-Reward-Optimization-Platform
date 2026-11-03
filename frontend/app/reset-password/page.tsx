"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useLanguage } from "@/lib/i18n";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ToastContainer, useToast } from "@/components/Toast";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    if (!token) {
      addToast(t.auth.noResetToken, "error");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (newPassword.length < 6) {
      addToast(t.auth.passwordTooShort, "warning");
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast(t.auth.passwordsMismatch, "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch<{ detail: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      setDone(true);
      addToast(res.detail || t.auth.passwordResetSuccess, "success");
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: any) {
      addToast(err.message || t.auth.passwordResetFailed, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1013] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="text-2xl font-black text-white tracking-tight">CLIQ</div>
          <p className="text-xs text-slate-500 mt-1">{t.tagline}</p>
        </div>

        <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,0,0,0.7)] space-y-6">
          {done ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-white">{t.auth.passwordUpdated}</h2>
              <p className="text-sm text-slate-400">{t.auth.redirectingLogin}</p>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-xl font-bold text-white">{t.auth.setNewPassword}</h2>
                <p className="text-sm text-slate-400 mt-1">
                  {t.auth.setNewPasswordSub}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t.auth.newPassword}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t.auth.atLeast6}
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none placeholder:text-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t.auth.confirmPassword}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t.auth.repeatPassword}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(76,192,63,0.4)] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t.auth.resetPassword}
                </button>
              </form>

              <div className="text-center">
                <Link href="/login" className="text-xs text-slate-400 hover:text-white transition-colors">
                  {t.auth.backToLogin}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0E1013] flex items-center justify-center"><div className="text-slate-400 text-sm">{t.auth.loading}</div></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
