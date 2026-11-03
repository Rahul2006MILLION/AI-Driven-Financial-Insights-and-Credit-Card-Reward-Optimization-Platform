"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useLanguage, fmt as fill } from "@/lib/i18n";
import { Sidebar } from "@/components/Sidebar";
import { ShieldCheck, Info, AlertCircle, Loader2, TrendingUp, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

const fmt = (n: any) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

const NEEDS_CATS = new Set(["grocery", "utility", "transport", "fuel", "rent", "medical", "insurance", "emi"]);

function classifyNeeds(cat: string) {
  return NEEDS_CATS.has(cat.toLowerCase());
}

export default function EmergencyFundPage() {
  const { t } = useLanguage();
  const [incomeSummary, setIncomeSummary] = useState<any>(null);
  const [budgetData,    setBudgetData]    = useState<any>(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [inc, bud] = await Promise.all([
        apiFetch<any>("/incomes/summary"),
        apiFetch<any>("/education/budget"),
      ]);
      setIncomeSummary(inc);
      setBudgetData(bud);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Derived */
  const budgetNotConfigured = !budgetData || budgetData.id === "not_configured";
  const monthlyInflow   = Number(incomeSummary?.total_monthly_income ?? 0);
  const monthlyExpenses = Number(budgetData?.actual_spending_this_month ?? 0);

  const spendingByCat: Record<string, number> = {};
  Object.entries(budgetData?.spending_by_category ?? {}).forEach(([k, v]) => {
    spendingByCat[k] = Number(v);
  });

  const needsSpend = Object.entries(spendingByCat)
    .filter(([k]) => classifyNeeds(k))
    .reduce((s, [, v]) => s + v, 0);

  const monthlyEssentials = needsSpend > 0
    ? needsSpend
    : (monthlyExpenses > 0 ? monthlyExpenses * 0.5 : 0);

  const efTarget = monthlyEssentials * 3;

  const savingsSpend = Object.entries(spendingByCat)
    .filter(([k]) => ["savings", "investment", "fd", "sip"].includes(k.toLowerCase()))
    .reduce((s, [, v]) => s + v, 0);

  const hasInsufficientData = monthlyInflow === 0 || monthlyExpenses === 0;

  const recommendations = [
    { months: 3,  label: t.emergencyFund.tierBasic, desc: t.emergencyFund.tierBasicDesc },
    { months: 6,  label: t.emergencyFund.tierStandard, desc: t.emergencyFund.tierStandardDesc },
    { months: 12, label: t.emergencyFund.tierConservative, desc: t.emergencyFund.tierConservativeDesc },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] bg-[#0E1013] items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#0E1013]">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-3xl">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            {t.nav.emergencyFund}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {t.emergencyFund.subtitle}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        {/* ── Status card ──────────────────────────────────────────── */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6">

          {hasInsufficientData ? (
            /* Not enough data — clear explanation, no fabricated numbers */
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white mb-1">{t.emergencyFund.insufficientData}</h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {t.emergencyFund.insufficientDesc}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-300 mb-2">{t.emergencyFund.whatsNeeded}</p>
                <div className="space-y-2">
                  {monthlyInflow === 0 && (
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 text-[10px] font-bold shrink-0">1</span>
                      <span className="text-xs text-slate-400">{t.emergencyFund.needIncome}</span>
                    </div>
                  )}
                  {monthlyExpenses === 0 && (
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 text-[10px] font-bold shrink-0">{monthlyInflow === 0 ? "2" : "1"}</span>
                      <span className="text-xs text-slate-400">{t.emergencyFund.needExpense}</span>
                    </div>
                  )}
                  {budgetNotConfigured && (
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-slate-500/15 border border-slate-500/25 flex items-center justify-center text-slate-400 text-[10px] font-bold shrink-0">+</span>
                      <span className="text-xs text-slate-500">{t.emergencyFund.budgetImproves}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href="/income"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> {t.emergencyFund.addIncome}
                </Link>
                <Link href="/transactions"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-semibold transition-all"
                >
                  {t.emergencyFund.logExpenses} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            /* Has enough data */
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">{t.emergencyFund.threeMonthTarget}</h2>
                  <div className="text-3xl font-black text-emerald-400 tabular-nums mt-1">{fmt(efTarget)}</div>
                  <p className="text-xs text-slate-500 mt-1">
                    {fill(t.emergencyFund.basedOnEssentials, { amount: fmt(monthlyEssentials) })}
                    {needsSpend > 0 ? t.emergencyFund.needsBasis : t.emergencyFund.estimateBasis}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">{t.emergencyFund.monthContribution}</span>
                  <span className="text-emerald-400 font-semibold">{fmt(savingsSpend)}</span>
                </div>
                <div className="h-3 bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 progress-anim"
                    style={{ width: `${efTarget > 0 ? Math.min(100, Math.round((savingsSpend / efTarget) * 100)) : 0}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-600">
                  {t.emergencyFund.singleMonthNote}
                </p>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: t.emergencyFund.monthlyEssentials,  value: fmt(monthlyEssentials), color: "text-slate-200" },
                  { label: t.emergencyFund.threeMonthTargetShort,       value: fmt(efTarget),          color: "text-emerald-400" },
                  { label: t.emergencyFund.currentMonthSavings, value: fmt(savingsSpend),    color: "text-lime-400" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 text-center">
                    <div className={`text-base font-black ${s.color}`}>{s.value}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Runway recommendations ───────────────────────────────── */}
        {!hasInsufficientData && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-white">{t.emergencyFund.howMuch}</h2>
            {recommendations.map((rec) => (
              <div key={rec.months} className="flex items-start gap-4 rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/8 border border-emerald-500/15 flex items-center justify-center shrink-0">
                  <span className="text-emerald-400 text-sm font-black">{rec.months}×</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{rec.label}</span>
                    <span className="text-sm font-bold text-emerald-400">{fmt(monthlyEssentials * rec.months)}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{rec.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tips ─────────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5">
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-lime-400" />
            {t.emergencyFund.buildingTitle}
          </h2>
          <ul className="space-y-2.5 text-xs text-slate-400 leading-relaxed">
            <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-lime-500 mt-1.5 shrink-0" />{t.emergencyFund.tip1}</li>
            <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-lime-500 mt-1.5 shrink-0" />{t.emergencyFund.tip2}</li>
            <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-lime-500 mt-1.5 shrink-0" />{t.emergencyFund.tip3}</li>
            <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-lime-500 mt-1.5 shrink-0" />{t.emergencyFund.tip4}</li>
            <li className="flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-lime-500 mt-1.5 shrink-0" />{t.emergencyFund.tip5}</li>
          </ul>
        </div>

        <p className="text-[10px] text-slate-600 border-t border-white/[0.05] pt-4 leading-relaxed">
          {t.emergencyFund.dataNote}
        </p>
      </main>
    </div>
  );
}
