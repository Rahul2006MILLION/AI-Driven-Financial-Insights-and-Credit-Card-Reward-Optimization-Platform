"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage, Language } from "@/lib/i18n";
import { getStoredSession, clearSession, UserSession } from "@/lib/api";
import {
  CreditCard,
  Globe,
  Sparkles,
  User,
  LogOut,
  LogIn,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setSession(getStoredSession());
  }, []);

  const handleLogout = () => {
    clearSession();
    setSession(null);
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-[#050D0A]/70 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href={session ? "/dashboard" : "/"} className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-500 flex items-center justify-center p-0.5 shadow-[0_0_20px_rgba(16,185,129,0.35)] group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#050D0A] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight text-white glow-emerald">
              CLIQ
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
              PRO
            </span>
          </div>
        </Link>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-5">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-white/[0.04] px-2 py-1 rounded-full border border-white/[0.08] backdrop-blur-md">
            <Globe className="w-3.5 h-3.5 text-emerald-400 ml-1" />
            {(["en", "hi", "kn"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-full transition-all ${
                  language === lang
                    ? "bg-emerald-500 text-[#040707] font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {lang === "en" ? "EN" : lang === "hi" ? "हिन्दी" : "ಕನ್ನಡ"}
              </button>
            ))}
          </div>

          {session ? (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-xs font-medium text-slate-300 hover:text-emerald-400 transition-colors"
              >
                {t.nav.dashboard}
              </Link>
              <Link
                href="/cards"
                className="text-xs font-medium text-slate-300 hover:text-emerald-400 transition-colors"
              >
                {t.nav.cards}
              </Link>
              <Link
                href="/offers"
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                {t.nav.offers}
              </Link>
              <Link
                href="/optimization"
                className="text-xs font-medium text-slate-300 hover:text-emerald-400 transition-colors"
              >
                {t.nav.optimizer}
              </Link>
              <Link
                href="/assistant"
                className="text-xs font-medium text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                {t.nav.assistant}
              </Link>

              <div className="h-4 w-px bg-white/10" />

              <Link
                href="/profile"
                className="flex items-center gap-2 text-xs text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] px-2.5 py-1 rounded-full transition-all"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <User className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="max-w-[100px] truncate">{session.fullName || session.email}</span>
              </Link>

              <button
                onClick={handleLogout}
                title={t.nav.logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/[0.04] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="text-xs font-medium px-3.5 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                {t.nav.login}
              </Link>
              <Link
                href="/register"
                className="text-xs font-semibold px-4 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#040707] shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all"
              >
                {t.nav.register}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center gap-2">
          {/* Quick Lang Switch */}
          <button
            onClick={() => setLanguage(language === "en" ? "hi" : language === "hi" ? "kn" : "en")}
            className="text-xs px-2.5 py-1 bg-white/[0.05] rounded-full border border-white/10 text-emerald-400"
          >
            {language.toUpperCase()}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#06100C]/95 backdrop-blur-2xl border-b border-white/[0.08] p-5 space-y-3.5 shadow-2xl">
          {session ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-slate-300 hover:text-emerald-400 font-medium transition-colors"
              >
                {t.nav.dashboard}
              </Link>
              <Link
                href="/cards"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-slate-300 hover:text-emerald-400 font-medium transition-colors"
              >
                {t.nav.cards}
              </Link>
              <Link
                href="/offers"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                {t.nav.offers}
              </Link>
              <Link
                href="/optimization"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-slate-300 hover:text-emerald-400 font-medium transition-colors"
              >
                {t.nav.optimizer}
              </Link>
              <Link
                href="/analytics"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-slate-300 hover:text-emerald-400 font-medium transition-colors"
              >
                {t.nav.analytics}
              </Link>
              <Link
                href="/financial-health"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-slate-300 hover:text-emerald-400 font-medium transition-colors"
              >
                {t.nav.health}
              </Link>
              <Link
                href="/assistant"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-slate-300 hover:text-emerald-400 font-medium transition-colors"
              >
                {t.nav.assistant}
              </Link>
              <Link
                href="/documents"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-slate-300 hover:text-emerald-400 font-medium transition-colors"
              >
                {t.nav.documents}
              </Link>
              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs text-slate-300 hover:text-white"
                >
                  {session.email}
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {t.nav.logout}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2.5 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center text-xs py-2.5 bg-white/[0.04] rounded-full border border-white/10 text-slate-300 font-medium hover:bg-white/[0.08]"
              >
                {t.nav.login}
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center text-xs py-2.5 bg-emerald-500 hover:bg-emerald-400 rounded-full font-semibold text-[#040707] shadow-[0_0_20px_rgba(16,185,129,0.35)]"
              >
                {t.nav.register}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
