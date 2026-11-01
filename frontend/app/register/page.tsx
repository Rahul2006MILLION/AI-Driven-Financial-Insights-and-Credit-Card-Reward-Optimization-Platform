"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useLanguage, Language } from "@/lib/i18n";
import { Sparkles, Lock, Mail, User, Loader2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { login } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preferredLanguage, setPrefLanguage] = useState<Language>(language);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data: any = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
          preferred_language: preferredLanguage,
          currency: "INR",
        }),
      });

      setLanguage(preferredLanguage);

      // If backend supports automatic login (returns token), establish session immediately.
      // Otherwise, redirect user to login with success parameter.
      if (data && data.access_token) {
        login({
          accessToken: data.access_token,
          userId: data.user_id,
          email: data.email,
          fullName: data.full_name,
          preferredLanguage: data.preferred_language,
          role: data.role,
          isAdmin: data.is_admin,
        });

        router.push("/onboarding");
      } else {
        router.push("/login?registered=true");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-[calc(100vh-4rem)] bg-[#040707] relative overflow-hidden">
      {/* Ambient Emerald Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full p-8 sm:p-9 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_20px_50px_0_rgba(0,0,0,0.7)]">
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-0.5 mb-3 shadow-[0_0_20px_rgba(16,185,129,0.35)]">
            <div className="w-full h-full bg-[#050D0A] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white glow-emerald">{t.auth.createAccountTitle}</h2>
          <p className="text-xs text-slate-400 mt-1">{t.auth.createAccountSubtitle}</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1.5">
              {t.auth.fullNameLabel}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1.5">
              {t.auth.preferredLanguageLabel}
            </label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPrefLanguage(e.target.value as Language)}
              className="w-full bg-[#06100C] border border-white/10 rounded-2xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="en">English (Default)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#040707] font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-40"
          >
            {loading ? (
              <div className="flex items-center gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.auth.creatingAccount}</span>
              </div>
            ) : (
              <>
                <span>{t.auth.createAccountButton}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
          <p className="text-xs text-slate-400">
            {t.auth.haveAccountPrompt}{" "}
            <Link href="/login" className="text-emerald-400 font-bold hover:underline">
              {t.auth.signInButton}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
