"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
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
  FileUp,
  User,
  Settings,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/cards", label: t.nav.cards, icon: CreditCard },
    { href: "/cards/new", label: t.nav.addCard, icon: PlusCircle },
    { href: "/cards/compare", label: t.nav.compare, icon: GitCompare },
    { href: "/optimization", label: t.nav.optimizer, icon: Zap, highlight: true },
    { href: "/transactions", label: t.nav.transactions, icon: Receipt },
    { href: "/analytics", label: t.nav.analytics, icon: BarChart3 },
    { href: "/financial-health", label: t.nav.health, icon: Activity },
    { href: "/assistant", label: t.nav.assistant, icon: Bot, highlight: true },
    { href: "/documents", label: t.nav.documents, icon: FileUp },
    { href: "/profile", label: t.nav.profile, icon: User },
    { href: "/settings", label: t.nav.settings, icon: Settings },
  ];

  return (
    <aside className="w-64 hidden lg:flex flex-col border-r border-cliq-border bg-cliq-bgSecondary/60 backdrop-blur-md min-h-[calc(100vh-4rem)] p-4 space-y-1">
      <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-cliq-textMuted">
        Core Intelligence
      </div>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-cliq-cyan/20 to-cliq-emerald/10 text-cliq-cyan border border-cliq-cyan/40 shadow-sm"
                : "text-cliq-textSecondary hover:text-white hover:bg-cliq-surface"
            } ${item.highlight && !isActive ? "text-cliq-turquoise" : ""}`}
          >
            <Icon className={`w-4 h-4 ${isActive ? "text-cliq-cyan" : ""}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </aside>
  );
};
