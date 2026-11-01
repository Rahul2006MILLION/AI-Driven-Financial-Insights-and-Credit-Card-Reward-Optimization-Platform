"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage, Language } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import {
  CreditCard,
  Globe,
  Sparkles,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  Settings,
  LayoutDashboard,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const { session, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-[#050D0A]/70 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-3 group">
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

          {isAuthenticated && session ? (
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

              {/* Authenticated User Profile Menu Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 text-xs text-slate-200 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] px-3 py-1.5 rounded-full transition-all group shadow-[0_2px_12px_rgba(0,0,0,0.3)]"
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                    <User className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="font-semibold max-w-[120px] truncate">
                    {session.fullName || session.email.split("@")[0]}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-transform ${
                      profileDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-[#06100C]/95 border border-white/[0.12] backdrop-blur-2xl p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Header Info */}
                    <div className="px-3 py-2.5 border-b border-white/[0.08] mb-1">
                      <p className="text-xs font-bold text-white truncate">
                        {session.fullName || "CLIQ User"}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{session.email}</p>
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>{session.isAdmin ? (t.nav?.administrator || "Administrator") : (t.nav?.proMember || "PRO Member")}</span>
                      </div>
                    </div>

                    {/* Menu Links */}
                    <div className="space-y-0.5 text-xs">
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t.nav.dashboard}</span>
                      </Link>
                      <Link
                        href="/cards"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t.nav.cards}</span>
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t.nav?.profileSettings || "Profile & Settings"}</span>
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="pt-1 mt-1 border-t border-white/[0.08]">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-xs font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-400" />
                        <span>{t.nav.logout}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
          {isAuthenticated && session ? (
            <>
              {/* Mobile User Identity Card */}
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {session.fullName || session.email.split("@")[0]}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{session.email}</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                  {session.isAdmin ? "Admin" : "PRO"}
                </span>
              </div>

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
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-slate-300 hover:text-emerald-400 font-medium transition-colors"
              >
                {t.nav?.profileSettings || "Profile & Settings"}
              </Link>
              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end">
                <button
                  onClick={handleLogout}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-rose-500/10 transition-colors"
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
