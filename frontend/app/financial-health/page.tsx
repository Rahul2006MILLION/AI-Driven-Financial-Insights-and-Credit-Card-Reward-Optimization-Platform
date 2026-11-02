"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import {
  Activity,
  Sparkles,
  CheckCircle2,
  Calendar,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Loader2,
  BellRing,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

/* ── Animated radial health gauge ────────────────────────────── */
function HealthGauge({ score }: { score: number | null }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const r = 52;
  const circ = 2 * Math.PI * r;

  useEffect(() => {
    if (score == null) return;
    const target = Math.min(100, Math.max(0, Math.round(score)));
    let current = 0;
    const step = () => {
      current = Math.min(target, current + 2);
      setAnimatedScore(current);
      if (current < target) requestAnimationFrame(step);
    };
    const t = setTimeout(() => requestAnimationFrame(step), 400);
    return () => clearTimeout(t);
  }, [score]);

  const gap = circ - (animatedScore / 100) * circ;

  const getColor = (s: number) => {
    if (s >= 75) return { stroke: "url(#scoreGrad)", text: "text-lime-400", label: "Excellent" };
    if (s >= 50) return { stroke: "url(#scoreGradAmber)", text: "text-amber-400", label: "Good" };
    return { stroke: "url(#scoreGradRose)", text: "text-rose-400", label: "Needs work" };
  };

  const colors = score != null ? getColor(animatedScore) : { stroke: "rgba(255,255,255,0.1)", text: "text-slate-400", label: "No data" };

  return (
    <div className="relative flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 128 128" width="144" height="144">
          <defs>
            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#4CC03F" />
              <stop offset="100%" stopColor="#C4F23F" />
            </linearGradient>
            <linearGradient id="scoreGradAmber" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>
            <linearGradient id="scoreGradRose" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#EF4444" />
              <stop offset="100%" stopColor="#FB7185" />
            </linearGradient>
            <filter id="gaugeGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {/* Track */}
          <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          {/* Fill */}
          <circle
            cx="64" cy="64" r={r}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={gap}
            style={{ transition: "stroke-dashoffset 0.025s linear" }}
            filter="url(#gaugeGlow)"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-3xl font-black tabular-nums leading-none ${colors.text}`}>
            {score == null ? "—" : animatedScore}
          </div>
          <div className="text-[9px] text-slate-500 font-bold tracking-widest uppercase mt-1">Score</div>
        </div>
      </div>

      <div className={`text-xs font-bold ${colors.text}`}>{colors.label}</div>
    </div>
  );
}

/* ── Score band pills ─────────────────────────────────────────── */
const BANDS = [
  { label: "Excellent",  range: "75-100", color: "bg-lime-400/10 border-lime-400/25 text-lime-400"   },
  { label: "Good",       range: "50-74",  color: "bg-amber-400/10 border-amber-400/25 text-amber-400" },
  { label: "Needs work", range: "0-49",   color: "bg-rose-500/10 border-rose-500/25 text-rose-400"   },
];

export default function FinancialHealthPage() {
  const { t } = useLanguage();
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<any>("/analytics/financial-health")
      .then(setHealth)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const score = health?.health_score ?? health?.overall_score ?? null;
  const noData = health?.data_sufficiency === "INSUFFICIENT_DATA";

  const fmt = (n: any) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-[#0E1013]">
      <Sidebar />

      <main className="flex-1 p-5 sm:p-7 lg:p-9 space-y-7 max-w-7xl mx-auto w-full">

        {/* ── Page header ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/12 border border-emerald-500/20 flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Financial Health</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              {t.health.title}
              <span className="ml-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-lime-400">·</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-lg">{t.health.subtitle}</p>
          </div>

          {/* Score bands legend */}
          <div className="flex items-center gap-2">
            {BANDS.map((b) => (
              <div key={b.label} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold ${b.color}`}>
                <span className="font-mono">{b.range}</span>
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400">{t.health.auditingMetrics}</p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* ── Top row: Score + Projections ─────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* Health score gauge */}
              <div className="rounded-3xl bg-[#17191E]/90 border border-white/[0.08] p-7 flex flex-col items-center justify-between gap-4 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.health.healthIndex}</span>

                <HealthGauge score={noData ? null : score} />

                {/* Efficiency */}
                {health?.optimization_efficiency_rate != null && (
                  <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/8 border border-emerald-500/15">
                    <span className="text-[10px] text-slate-400">Efficiency rate</span>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {Math.round(Number(health.optimization_efficiency_rate))}%
                    </span>
                  </div>
                )}

                {noData && (
                  <div className="flex items-start gap-2 text-[10px] text-amber-300/80 bg-amber-500/8 border border-amber-500/15 rounded-xl p-3">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    Add cards + transactions to generate your health score.
                  </div>
                )}
              </div>

              {/* 30-day projections */}
              <div className="md:col-span-2 rounded-3xl bg-[#17191E]/90 border border-white/[0.08] p-6 sm:p-7 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="w-4 h-4 text-lime-400" />
                  <h3 className="text-sm font-bold text-white">{t.health.projectionsTitle}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  {/* Projected spend */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center gap-1.5 mb-2">
                      <TrendingDown className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">{t.health.projectedSpend}</span>
                    </div>
                    <div className="text-2xl font-black text-white tracking-tight tabular-nums">
                      {fmt(health?.forecast_30d_spending ?? 0)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">Next 30 days estimated</div>
                  </div>

                  {/* Projected rewards */}
                  <div className="p-4 rounded-2xl bg-lime-400/6 border border-lime-400/15">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                      <span className="text-[10px] text-lime-400/80 uppercase font-semibold tracking-wider">{t.health.projectedRewards}</span>
                    </div>
                    <div className="text-2xl font-black text-lime-400 tracking-tight tabular-nums glow-lime">
                      {fmt(health?.forecast_30d_potential_rewards ?? 0)}
                    </div>
                    <div className="text-[10px] text-lime-400/50 mt-1">Potential rewards to earn</div>
                  </div>
                </div>

                {/* Spending trend */}
                {health?.spending_trend_pct !== undefined && (
                  <div className="flex items-center gap-3 text-xs pt-4 border-t border-white/[0.06]">
                    <span className="text-slate-400">30-day spending trend:</span>
                    <span className={`font-bold px-2.5 py-0.5 rounded-full border ${
                      Number(health.spending_trend_pct) > 0
                        ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                    }`}>
                      {Number(health.spending_trend_pct) > 0 ? "+" : ""}{health.spending_trend_pct}% vs prior 30 days
                    </span>
                  </div>
                )}

                <p className="text-[10px] text-slate-600 mt-3">
                  Modeled on historical spending patterns and optimal category allocation.
                </p>
              </div>
            </div>

            {/* ── Actionable Recommendations ──────────────────── */}
            {(health?.actionable_recommendations?.length ?? 0) > 0 && (
              <div className="rounded-3xl bg-[#17191E]/90 border border-white/[0.08] p-6 sm:p-7 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-lime-400/10 border border-lime-400/20 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{t.health.actionableAdvice}</h3>
                  <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-lime-400/10 border border-lime-400/20 text-lime-400">
                    {health.actionable_recommendations.length} actions
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {health.actionable_recommendations.map((rec: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-lime-400/15 hover:bg-lime-400/3 transition-all flex items-start gap-3"
                    >
                      <div className="w-5 h-5 rounded-lg bg-lime-400/15 border border-lime-400/25 flex items-center justify-center shrink-0 mt-0.5">
                        <ArrowRight className="w-2.5 h-2.5 text-lime-400" />
                      </div>
                      <span className="text-xs text-slate-300 leading-relaxed">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Educational Observations ─────────────────────── */}
            {(health?.educational_alerts?.length ?? 0) > 0 && (
              <div className="rounded-3xl bg-[#17191E]/90 border border-[#ADDC25]/20 p-6 sm:p-7 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-[#ADDC25]/10 border border-[#ADDC25]/20 flex items-center justify-center">
                    <BellRing className="w-3.5 h-3.5 text-[#ADDC25]" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Financial Health Observations</h3>
                </div>

                <div className="space-y-2.5">
                  {health.educational_alerts.map((alert: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-start gap-3"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#ADDC25] mt-0.5 shrink-0" />
                      <span className="text-xs text-slate-200 leading-relaxed">{alert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Recurring Subscriptions ──────────────────────── */}
            {(health?.recurring_subscriptions?.length ?? 0) > 0 && (
              <div className="rounded-3xl bg-[#17191E]/90 border border-white/[0.08] p-6 sm:p-7 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white">{t.health.subscriptions}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-400">
                    {health.recurring_subscriptions.length} active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {health.recurring_subscriptions.map((sub: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs font-bold text-white">{sub.merchant_name}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.05] text-emerald-400 font-semibold border border-emerald-500/20">
                          {sub.frequency}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Monthly</span>
                          <span className="font-bold text-white tabular-nums">₹{Number(sub.average_amount).toFixed(0)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/[0.05]">
                          <span className="text-slate-500">Annual outflow</span>
                          <span className="font-black text-rose-400 tabular-nums">₹{Number(sub.annual_cost).toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Annual Fee Audit table ────────────────────────── */}
            {(health?.annual_fee_audit?.length ?? 0) > 0 && (
              <div className="rounded-3xl bg-[#17191E]/90 border border-white/[0.08] p-6 sm:p-7 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{t.health.feeAudit}</h3>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>{t.compare.title}</th>
                        <th className="text-right">{t.health.annualFee}</th>
                        <th className="text-right">{t.health.earnedRewards}</th>
                        <th className="text-right">{t.health.netRoi}</th>
                        <th className="text-center">{t.optimizer.breakdown}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {health.annual_fee_audit.map((item: any) => (
                        <tr key={item.card_id}>
                          <td className="font-bold text-white">{item.card_name}</td>
                          <td className="text-right font-medium text-slate-400 tabular-nums">₹{Number(item.annual_fee).toFixed(0)}</td>
                          <td className="text-right font-bold text-lime-400 tabular-nums">₹{Number(item.rewards_earned).toFixed(0)}</td>
                          <td className="text-right font-bold text-white tabular-nums">₹{Number(item.net_profit).toFixed(0)}</td>
                          <td className="text-center">
                            {item.is_justified ? (
                              <span className="badge badge-emerald">{t.health.justifiedCards}</span>
                            ) : (
                              <span className="badge badge-rose">{t.health.atRiskCards}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}
