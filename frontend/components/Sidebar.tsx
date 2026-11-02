"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  CreditCard,
  PlusCircle,
  GitCompare,
  Zap,
  Receipt,
  BarChart3,
  Activity,
  Bot,
  Tag,
  User,
  Settings,
  ShieldCheck,
  GraduationCap,
  Wallet,
  PiggyBank,
  TrendingUp,
  FileText,
  Target,
  Repeat,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { session } = useAuth();

  const isNoCard = session?.financialPathway === "NO_CREDIT_CARD";

  /* ── Credit-card pathway nav ─────────────────────────────── */
  const ccNavItems = [
    { href: "/dashboard",        label: t.nav.dashboard,     icon: LayoutDashboard },
    { href: "/cards",            label: t.nav.cards,         icon: CreditCard },
    { href: "/offers",           label: t.nav.offers,        icon: Tag,         highlight: true },
    { href: "/cards/new",        label: t.nav.addCard,       icon: PlusCircle },
    { href: "/cards/compare",    label: t.nav.compare,       icon: GitCompare },
    { href: "/optimization",     label: t.nav.optimizer,     icon: Zap,         highlight: true },
    { href: "/transactions",     label: t.nav.transactions,  icon: Receipt },
    { href: "/budget",           label: t.nav.budget,        icon: Wallet,      highlight: true },
    { href: "/analytics",        label: t.nav.analytics,     icon: BarChart3 },
    { href: "/financial-health", label: t.nav.health,        icon: Activity },
    { href: "/assistant",        label: t.nav.assistant,     icon: Bot,         highlight: true },
    { href: "/learn",            label: t.nav.learn,         icon: GraduationCap, highlight: true },
    { href: "/profile",          label: t.nav.profile,       icon: User },
    { href: "/settings",         label: t.nav.settings,      icon: Settings },
  ];

  /* ── No-credit-card pathway nav ─────────────────────────── */
  const nccNavItems = [
    { href: "/dashboard",        label: "Dashboard",                 icon: LayoutDashboard },
    { href: "/income",           label: "My Income",                 icon: Wallet,        highlight: true },
    { href: "/transactions",     label: "Expense Log",               icon: Receipt },
    { href: "/budget",           label: "Budget Planner",            icon: PiggyBank,     highlight: true },
    { href: "/savings-goals",    label: "Savings Goals",             icon: Target },
    { href: "/emergency-fund",   label: "Emergency Fund",            icon: ShieldCheck },
    { href: "/subscriptions",    label: "Subscriptions & Bills",     icon: Repeat },
    { href: "/financial-health", label: "Financial Health",          icon: TrendingUp },
    { href: "/assistant",        label: "AI Assistant",              icon: Bot,           highlight: true },
    { href: "/learn",            label: "CLIQ Learn",                icon: GraduationCap, highlight: true },
    { href: "/profile",          label: "User Profile",              icon: User },
    { href: "/settings",         label: "Settings & Security",       icon: Settings },
  ];

  const navItems = isNoCard ? nccNavItems : ccNavItems;

  return (
    <aside className="w-64 hidden lg:flex flex-col border-r border-white/[0.08] bg-[#050D0A]/60 backdrop-blur-2xl min-h-[calc(100vh-4rem)] p-4 space-y-1">
      <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
        <span>{t.sidebar?.workspace || "WORKSPACE"}</span>
        {isNoCard && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold text-[9px] tracking-normal">
            CASH & SAVINGS
          </span>
        )}
      </div>

      {navItems.map((item, idx) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        // For NCC path, avoid duplicate "active" on repeated hrefs — only mark the first occurrence active
        const firstWithHref = navItems.findIndex((n) => n.href === item.href);
        const effectiveActive = isActive && firstWithHref === idx;
        return (
          <Link
            key={`${item.href}-${idx}`}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              effectiveActive
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            } ${item.highlight && !effectiveActive ? "text-emerald-300/90" : ""}`}
          >
            <Icon className={`w-4 h-4 ${effectiveActive ? "text-emerald-400" : ""}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}

      {session?.isAdmin && (
        <>
          <div className="pt-4 mt-3 border-t border-white/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>{t.sidebar?.administration || "Administration"}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-[9px]">
              {t.sidebar?.staffBadge || "STAFF"}
            </span>
          </div>
          <Link
            href="/admin/offers"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              pathname === "/admin/offers"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                : "text-amber-400/80 hover:text-amber-300 hover:bg-white/[0.04]"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>{t.sidebar?.offerReviewDesk || t.nav?.adminDesk || "Offer Review Desk"}</span>
          </Link>
        </>
      )}
    </aside>
  );
};
