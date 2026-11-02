"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Loader2,
  TrendingDown,
  Zap,
  Medal,
} from "lucide-react";

const PALETTE = [
  "#C4F23F", // lime
  "#4CC03F", // emerald
  "#14B8A6", // teal
  "#8AE577", // mint
  "#C4F23F", // turquoise
  "#389E2F", // dark emerald
  "#6EE7B7", // light mint
  "#0D9488", // dark teal
];

/* Custom tooltip for Recharts */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#07100D] border border-white/10 rounded-2xl px-4 py-3 shadow-2xl text-xs">
      {label && <div className="text-slate-400 mb-1.5 font-medium">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-white font-bold">₹{Number(p.value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          {p.name && <span className="text-slate-400">{p.name}</span>}
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const [spending, setSpending] = useState<any>(null);
  const [rewards, setRewards] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [spData, rewData]: any = await Promise.all([
          apiFetch("/analytics/spending"),
          apiFetch("/analytics/rewards"),
        ]);
        setSpending(spData);
        setRewards(rewData);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const totalSpend = spending ? Number(spending.total_spending) : 0;
  const totalRewards = rewards ? Number(rewards.total_rewards_earned) : 0;
  const leakage = rewards ? Number(rewards.reward_leakage_amount) : 0;
  const efficiencyRate = rewards ? Number(rewards.optimization_efficiency_rate) : 0;

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-[#0E1013]">
      <Sidebar />

      <main className="flex-1 p-5 sm:p-7 lg:p-9 max-w-7xl mx-auto w-full space-y-7">

        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center shadow-neonLime">
                <BarChart3 className="w-4 h-4 text-[#0E1013]" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                {t.analytics.title}
              </h1>
            </div>
            <p className="text-xs text-slate-400 ml-10.5">
              {t.analytics.subtitle}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-lime-400 mx-auto" />
            <p className="text-xs text-slate-400 mt-2">{t.analytics.computingAnalytics}</p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Spending */}
              <div className="kpi-card relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-slate-400/30 to-transparent" />
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">
                  {t.analytics.totalSpendingTracked}
                </span>
                <div className="text-3xl font-black text-white mt-2 tracking-tight font-mono">
                  ₹{totalSpend.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <TrendingDown className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[11px] text-slate-500">
                    {spending?.total_transactions || 0} {t.analytics.acrossPurchases}
                  </span>
                </div>
              </div>

              {/* Rewards Earned */}
              <div className="kpi-card kpi-card-lime relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-lime-400/5 to-transparent pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-lime-400/50 to-transparent" />
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">
                  {t.analytics.rewardsRealized}
                </span>
                <div className="text-3xl font-black text-lime-400 mt-2 tracking-tight font-mono">
                  ₹{totalRewards.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Zap className="w-3.5 h-3.5 text-lime-400" />
                  <span className="text-[11px] text-lime-400 font-bold">
                    {efficiencyRate.toFixed(1)}% {t.analytics.efficiencyRate}
                  </span>
                </div>
              </div>

              {/* Avoidable Leakage */}
              <div className="kpi-card relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-400/5 to-transparent pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-rose-400/50 to-transparent" />
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">
                  {t.analytics.avoidableLeakage}
                </span>
                <div className="text-3xl font-black text-rose-400 mt-2 tracking-tight font-mono">
                  ₹{leakage.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-[11px] text-rose-400 font-semibold">
                    {t.analytics.leakage}
                  </span>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Category Breakdown with Legend */}
              <div className="glass-panel p-6 sm:p-7 space-y-4">
                <div className="flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-lime-400" />
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    {t.analytics.spendByCategory}
                  </h3>
                </div>

                {spending?.category_breakdown?.length > 0 ? (
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-48 h-48 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={spending.category_breakdown}
                            dataKey="total_amount"
                            nameKey="category_name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            innerRadius={48}
                            paddingAngle={3}
                          >
                            {spending.category_breakdown.map((_: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="flex-1 space-y-2 w-full">
                      {spending.category_breakdown.slice(0, 7).map((cat: any, idx: number) => {
                        const pct = totalSpend > 0
                          ? ((Number(cat.total_amount) / totalSpend) * 100).toFixed(1)
                          : "0";
                        return (
                          <div key={idx} className="flex items-center gap-2.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
                            />
                            <span className="text-[11px] text-slate-300 flex-1 truncate">
                              {cat.category_name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono w-10 text-right">
                              {pct}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center text-center gap-2">
                    <PieIcon className="w-8 h-8 text-slate-700" />
                    <span className="text-xs text-slate-500">{t.transactions.noTransactionsFound}</span>
                  </div>
                )}
              </div>

              {/* Monthly Trend */}
              <div className="glass-panel p-6 sm:p-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-lime-400" />
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      {t.analytics.monthlyVelocity}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-sm bg-lime-400/80 inline-block" />
                      <span className="text-slate-400">Spend</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" />
                      <span className="text-slate-400">Rewards</span>
                    </span>
                  </div>
                </div>

                {spending?.monthly_trend?.length > 0 ? (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={spending.monthly_trend} barGap={2}>
                        <defs>
                          <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#C4F23F" stopOpacity={0.85} />
                            <stop offset="100%" stopColor="#C4F23F" stopOpacity={0.35} />
                          </linearGradient>
                          <linearGradient id="rewardGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4CC03F" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#4CC03F" stopOpacity={0.4} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis
                          dataKey="month"
                          stroke="#475569"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#475569"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="total_amount" name="Spend" fill="url(#spendGrad)" radius={[5, 5, 0, 0]} maxBarSize={28} />
                        <Bar dataKey="rewards_earned" name="Rewards" fill="url(#rewardGrad)" radius={[5, 5, 0, 0]} maxBarSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-56 flex flex-col items-center justify-center text-center gap-2">
                    <BarChart3 className="w-8 h-8 text-slate-700" />
                    <span className="text-xs text-slate-500">{t.transactions.noTransactionsFound}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Top Merchants — ranked list */}
            {spending?.top_merchants?.length > 0 && (
              <div className="glass-panel p-6 sm:p-7">
                <div className="flex items-center gap-2 mb-5">
                  <Medal className="w-4 h-4 text-lime-400" />
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    {t.analytics.categoryAllocation}
                  </h3>
                </div>

                <div className="space-y-2">
                  {spending.top_merchants.map((m: any, idx: number) => {
                    const pct = totalSpend > 0
                      ? ((Number(m.amount) / totalSpend) * 100)
                      : 0;
                    const rankColors = ["text-lime-400", "text-emerald-400", "text-teal-400"];
                    const barColors = ["bg-lime-400", "bg-emerald-500", "bg-teal-500", "bg-mint-400", "bg-slate-500"];

                    return (
                      <div key={idx} className="flex items-center gap-4 group py-2.5 px-3 rounded-2xl hover:bg-white/[0.03] transition-colors">
                        <span className={`text-xs font-black w-5 text-center shrink-0 ${rankColors[idx] || "text-slate-500"}`}>
                          #{idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-white truncate">{m.merchant_name}</span>
                            <span className="text-xs font-black text-white font-mono ml-3 shrink-0">
                              ₹{Number(m.amount).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${barColors[idx] || "bg-slate-500"}`}
                              style={{ width: `${Math.max(4, pct)}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 w-9 text-right shrink-0 font-mono">
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}
