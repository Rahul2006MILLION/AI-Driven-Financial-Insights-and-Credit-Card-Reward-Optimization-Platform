"use client";

import React, { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { ToastContainer, useToast } from "@/components/Toast";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setSent(true);
    } catch (err: any) {
      addToast(err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1013] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="text-2xl font-black text-white tracking-tight">CLIQ</div>
          <p className="text-xs text-slate-500 mt-1">Money Made Simple. In Your Language.</p>
        </div>

        <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,0,0,0.7)] space-y-6">
          {sent ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Check your inbox</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                If <span className="text-white font-medium">{email}</span> is registered with CLIQ,
                you will receive a password reset link shortly. The link expires in 60 minutes.
              </p>
              <p className="text-xs text-slate-500">
                Don't see it? Check your spam folder.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors mt-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-xl font-bold text-white">Forgot password?</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(76,192,63,0.4)] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Send reset link
                </button>
              </form>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to login
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
