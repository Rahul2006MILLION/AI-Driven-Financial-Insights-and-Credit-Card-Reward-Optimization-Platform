"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { animate, motion, useMotionValue } from "framer-motion";
import { SPRING } from "@/lib/motion";
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

/**
 * Each page mounts its own <Sidebar />, so a shared layoutId has nothing to
 * animate from. Remember the active pill's offset across mounts instead and
 * spring from the previous position to the new one.
 */
let lastActivePillTop: number | null = null;
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

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

  const activeLinkRef = useRef<HTMLAnchorElement>(null);
  const pillY = useMotionValue(0);

  useIsoLayoutEffect(() => {
    const el = activeLinkRef.current;
    if (!el) return;
    const top = el.offsetTop;
    const from = lastActivePillTop;
    lastActivePillTop = top;
    if (from == null || from === top) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    pillY.set(from - top);
    const controls = animate(pillY, 0, SPRING);
    return () => {
      controls.stop();
      pillY.set(0); // never leave the pill stranded mid-flight
    };
  }, [pathname, pillY]);

  return (
    <aside className="w-64 hidden lg:flex flex-col shrink-0 m-3 mr-0 rounded-[1.75rem] bg-[#17191E] border border-white/[0.05] self-start sticky top-[84px] max-h-[calc(100vh-96px)] overflow-y-auto p-3 space-y-0.5">
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
            ref={effectiveActive ? activeLinkRef : undefined}
            aria-current={effectiveActive ? "page" : undefined}
            className={`group relative flex items-center gap-3 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors duration-200 ${
              effectiveActive
                ? "text-[#12301A] font-bold"
                : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            {effectiveActive && (
              <motion.span
                style={{ y: pillY }}
                className="absolute inset-0 -z-10 rounded-full bg-lime-400"
              />
            )}
            <span
              className={`relative w-7 h-7 -ml-1.5 rounded-full flex items-center justify-center shrink-0 transition-[transform,background-color] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-rotate-6 ${
                effectiveActive ? "bg-[#12301A]/10" : "bg-white/[0.04] group-hover:bg-white/[0.08]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </span>
            <span className="relative">{item.label}</span>
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
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              pathname === "/admin/offers"
                ? "bg-amber-400 text-[#2B1A02]"
                : "text-amber-400/80 hover:text-amber-300 hover:bg-white/[0.04]"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t.sidebar?.offerReviewDesk || t.nav?.adminDesk || "Offer Review Desk"}</span>
          </Link>
        </>
      )}
    </aside>
  );
};
