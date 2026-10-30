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
    <header className="sticky top-0 z-50 glass-panel border-b border-cliq-border backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href={session ? "/dashboard" : "/"} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cliq-cyan via-cliq-turquoise to-cliq-emerald flex items-center justify-center p-0.5 shadow-neonCyan group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-cliq-bg rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cliq-cyan animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-white glow-cyan">
                CLIQ
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cliq-surface border border-cliq-cyan/40 text-cliq-cyan">
                AI
              </span>
            </div>
            <p className="text-[10px] text-cliq-textSecondary hidden sm:block">
              {t.tagline}
            </p>
          </div>
        </Link>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-cliq-surface px-2.5 py-1.5 rounded-lg border border-cliq-border">
            <Globe className="w-4 h-4 text-cliq-cyan" />
            {(["en", "hi", "kn"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2 py-0.5 text-xs font-semibold rounded transition-colors ${
                  language === lang
                    ? "bg-cliq-cyan text-cliq-bg font-bold shadow-sm"
                    : "text-cliq-textSecondary hover:text-white"
                }`}
              >
                {lang === "en" ? "EN" : lang === "hi" ? "हिन्दी" : "ಕನ್ನಡ"}
              </button>
            ))}
          </div>

          {session ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="text-xs font-medium text-cliq-textSecondary hover:text-cliq-cyan transition-colors"
              >
                {t.nav.dashboard}
              </Link>
              <Link
                href="/optimization"
                className="text-xs font-medium text-cliq-textSecondary hover:text-cliq-cyan transition-colors"
              >
                {t.nav.optimizer}
              </Link>
              <Link
                href="/assistant"
                className="text-xs font-medium text-cliq-textSecondary hover:text-cliq-cyan transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-cliq-turquoise" />
                {t.nav.assistant}
              </Link>

              <div className="h-4 w-px bg-cliq-border" />

              <Link
                href="/profile"
                className="flex items-center gap-1.5 text-xs text-cliq-textSecondary hover:text-white"
              >
                <div className="w-7 h-7 rounded-full bg-cliq-surface border border-cliq-cyan/30 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-cliq-cyan" />
                </div>
                <span className="max-w-[100px] truncate">{session.fullName || session.email}</span>
              </Link>

              <button
                onClick={handleLogout}
                title={t.nav.logout}
                className="p-1.5 rounded-lg text-cliq-textSecondary hover:text-cliq-danger hover:bg-cliq-surface transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-medium px-3.5 py-1.5 rounded-lg text-cliq-textSecondary hover:text-white border border-transparent hover:border-cliq-border transition-colors"
              >
                {t.nav.login}
              </Link>
              <Link
                href="/register"
                className="text-xs font-semibold px-4 py-1.5 rounded-lg bg-gradient-to-r from-cliq-cyan to-cliq-emerald text-cliq-bg shadow-neonCyan hover:opacity-95 transition-opacity"
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
            className="text-xs px-2 py-1 bg-cliq-surface rounded border border-cliq-border text-cliq-cyan"
          >
            {language.toUpperCase()}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-cliq-textSecondary hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cliq-bgSecondary border-b border-cliq-border p-4 space-y-3">
          {session ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-cliq-textSecondary hover:text-cliq-cyan"
              >
                {t.nav.dashboard}
              </Link>
              <Link
                href="/cards"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-cliq-textSecondary hover:text-cliq-cyan"
              >
                {t.nav.cards}
              </Link>
              <Link
                href="/optimization"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-cliq-textSecondary hover:text-cliq-cyan"
              >
                {t.nav.optimizer}
              </Link>
              <Link
                href="/analytics"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-cliq-textSecondary hover:text-cliq-cyan"
              >
                {t.nav.analytics}
              </Link>
              <Link
                href="/financial-health"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-cliq-textSecondary hover:text-cliq-cyan"
              >
                {t.nav.health}
              </Link>
              <Link
                href="/assistant"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-cliq-textSecondary hover:text-cliq-cyan"
              >
                {t.nav.assistant}
              </Link>
              <Link
                href="/documents"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-cliq-textSecondary hover:text-cliq-cyan"
              >
                {t.nav.documents}
              </Link>
              <div className="pt-2 border-t border-cliq-border flex items-center justify-between">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs text-cliq-cyan"
                >
                  {session.email}
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-cliq-danger flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {t.nav.logout}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center text-sm py-2 bg-cliq-surface rounded border border-cliq-border text-white"
              >
                {t.nav.login}
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center text-sm py-2 bg-gradient-to-r from-cliq-cyan to-cliq-emerald rounded font-semibold text-cliq-bg"
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
