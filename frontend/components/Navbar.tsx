"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useLanguage, Language } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { apiFetch, storeSession } from "@/lib/api";
import {
  CreditCard,
  Globe,
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
  const pathname = usePathname();
  const { session, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isHomepage = pathname === "/";
  const isNoCard = session?.financialPathway === "NO_CREDIT_CARD";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const [switchingPathway, setSwitchingPathway] = useState(false);

  const handleTogglePathway = async () => {
    const nextPathway = isNoCard ? "CREDIT_CARD" : "NO_CREDIT_CARD";
    setSwitchingPathway(true);
    try {
      await apiFetch("/profile", {
        method: "PUT",
        body: JSON.stringify({ financial_pathway: nextPathway }),
      });
      if (session) {
        const updated = { ...session, financialPathway: nextPathway };
        storeSession(updated);
      }
      setProfileDropdownOpen(false);
      setMobileMenuOpen(false);
      window.location.reload();
    } catch (e) {
      console.error("Failed to switch pathway:", e);
    } finally {
      setSwitchingPathway(false);
    }
  };

  const navBg = isHomepage && !scrolled
    ? "bg-transparent border-transparent shadow-none"
    : "bg-[#0E1013]/85 backdrop-blur-2xl border-white/[0.06]";

  return (
    <header className={`sticky top-0 z-50 border-b transition-all duration-500 ${navBg}`}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
          <Image
            src="/cliq-logo.png"
            alt="CLIQ"
            width={1024}
            height={381}
            priority
            className="h-8 sm:h-9 w-auto object-contain [filter:hue-rotate(-95deg)_saturate(1.15)] transition-transform duration-200 group-hover:scale-[1.02]"
          />
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-lime-400 text-[#12301A] shrink-0">
            PRO
          </span>
        </Link>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-0.5 bg-white/[0.03] p-1 rounded-full border border-white/[0.08]">
            <Globe className="w-3.5 h-3.5 text-slate-400 mx-1.5" />
            {(["en", "hi", "kn"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all ${
                  language === lang
                    ? "bg-white text-[#0E1013] font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {lang === "en" ? "EN" : lang === "hi" ? "हिन्दी" : "ಕನ್ನಡ"}
              </button>
            ))}
          </div>

          {isAuthenticated && session ? (
            <div className="flex items-center gap-3">
              {/* Authenticated User Profile Menu Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 text-xs text-slate-200 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] pl-1 pr-3 py-1 rounded-full transition-all group"
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="w-7 h-7 rounded-full bg-lime-400 flex items-center justify-center text-[11px] font-extrabold text-[#12301A]">
                    {(session.fullName || session.email).charAt(0).toUpperCase()}
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
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-3xl bg-[#1C1F25] border border-white/[0.12] backdrop-blur-2xl p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
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
                        href="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t.nav?.profileSettings || "Profile & Settings"}</span>
                      </Link>
                    </div>

                    {/* Mode / Pathway Switcher */}
                    <div className="my-2 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 font-semibold">
                        <span>Pathway</span>
                        <span className="text-emerald-400 font-bold">{isNoCard ? "Cash & Savings" : "Credit Cards"}</span>
                      </div>
                      <button
                        onClick={handleTogglePathway}
                        disabled={switchingPathway}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold transition-all disabled:opacity-50"
                      >
                        {switchingPathway ? (
                          <span>Switching...</span>
                        ) : (
                          <span>Switch to {isNoCard ? "Credit Card Mode" : "Cash & Savings Mode"}</span>
                        )}
                      </button>
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
                className="text-xs font-semibold px-4 py-2 rounded-full bg-white text-[#0E1013] hover:bg-slate-100 transition-colors"
              >
                {t.nav.login}
              </Link>
              <Link
                href="/register"
                className="text-xs font-bold px-4 py-2 rounded-full bg-lime-400 hover:bg-lime-300 text-[#12301A] transition-all"
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
        <div className="md:hidden bg-[#17191E]/95 backdrop-blur-2xl border-b border-white/[0.08] p-5 space-y-3.5 shadow-2xl">
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
              {isNoCard ? (
                <>
                  <Link
                    href="/income"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm text-slate-300 hover:text-emerald-400 font-medium transition-colors"
                  >
                    My Income
                  </Link>
                  <Link
                    href="/transactions"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm text-slate-300 hover:text-emerald-400 font-medium transition-colors"
                  >
                    Expense Log
                  </Link>
                  <Link
                    href="/budget"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                  >
                    Budget Planner
                  </Link>
                  <Link
                    href="/savings-goals"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm text-slate-300 hover:text-emerald-400 font-medium transition-colors"
                  >
                    Savings Goals
                  </Link>
                  <Link
                    href="/emergency-fund"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm text-slate-300 hover:text-emerald-400 font-medium transition-colors"
                  >
                    Emergency Fund
                  </Link>
                  <Link
                    href="/subscriptions"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm text-slate-300 hover:text-emerald-400 font-medium transition-colors"
                  >
                    Subscriptions & Bills
                  </Link>
                  <Link
                    href="/financial-health"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm text-slate-300 hover:text-emerald-400 font-medium transition-colors"
                  >
                    Financial Health
                  </Link>
                </>
              ) : (
                <>
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
                    href="/budget"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                  >
                    {t.nav.budget}
                  </Link>
                </>
              )}
              <Link
                href="/assistant"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-slate-300 hover:text-emerald-400 font-medium transition-colors"
              >
                {t.nav.assistant}
              </Link>
              <Link
                href="/learn"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-teal-400 hover:text-teal-300 font-medium transition-colors"
              >
                {t.nav.learn}
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-slate-300 hover:text-emerald-400 font-medium transition-colors"
              >
                {t.nav?.profileSettings || "Profile & Settings"}
              </Link>

              {/* Mobile Pathway Toggle */}
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Mode</p>
                  <p className="text-xs font-bold text-white">{isNoCard ? "Cash & Savings" : "Credit Cards"}</p>
                </div>
                <button
                  onClick={handleTogglePathway}
                  disabled={switchingPathway}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all disabled:opacity-50"
                >
                  {switchingPathway ? "Switching..." : `Switch to ${isNoCard ? "Cards" : "Cash & Savings"}`}
                </button>
              </div>

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
                className="block text-center text-xs py-2.5 bg-lime-400 hover:bg-lime-300 rounded-full font-bold text-[#12301A]"
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
