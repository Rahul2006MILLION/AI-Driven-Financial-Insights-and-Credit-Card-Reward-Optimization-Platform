"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n";
import { Lock, Mail, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("registered") === "true") {
        setSuccessMessage(t.auth.registeredSuccessBanner);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data: any = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // Update global authentication state immediately
      login({
        accessToken: data.access_token,
        userId: data.user_id,
        email: data.email,
        fullName: data.full_name,
        preferredLanguage: data.preferred_language,
        role: data.role,
        isAdmin: data.is_admin,
        financialPathway: data.financial_pathway || "CREDIT_CARD",
      });

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || t.auth.signInFailed);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail("aarav.demo@cliq.finance");
    setPassword("SecurePassword123!");
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-[calc(100vh-4rem)] bg-[#0E1013] relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-lime-400/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-emerald-500/6 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full p-8 sm:p-9 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_20px_50px_0_rgba(0,0,0,0.7)]">
        <div className="text-center mb-8">
          <Image
            src="/cliq-logo.png"
            alt="CLIQ"
            width={1024}
            height={381}
            priority
            className="h-10 w-auto mx-auto mb-4 object-contain"
          />
          <h2 className="text-2xl font-black text-white">{t.auth.signInTitle}</h2>
          <p className="text-xs text-slate-400 mt-1">{t.auth.signInSubtitle}</p>
        </div>

        {successMessage && (
          <div className="mb-6 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{t.auth.registeredSuccessBanner}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1.5">
              {t.auth.emailLabel}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1.5">
              {t.auth.passwordLabel}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full btn-fx bg-lime-400 hover:bg-lime-300 text-[#0E1013] font-bold text-sm shadow-neonLime transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-40"
          >
            {loading ? (
              <div className="flex items-center gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.auth.signingIn}</span>
              </div>
            ) : (
              <>
                <span>{t.auth.signInButton}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/[0.06] text-center space-y-3">
          <button
            type="button"
            onClick={fillDemoAccount}
            className="text-xs text-lime-400 hover:text-lime-300 font-semibold transition-colors"
          >
            {t.auth.quickDemoCredentials}
          </button>

          <p className="text-xs text-slate-400">
            {t.auth.noAccountPrompt}{" "}
            <Link href="/register" className="text-lime-400 font-bold hover:underline">
              {t.auth.createAccountButton}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
