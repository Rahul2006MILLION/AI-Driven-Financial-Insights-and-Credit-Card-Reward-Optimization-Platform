"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import {
  GitCompare,
  Loader2,
  Sparkles,
  Check,
  ShieldCheck,
  ExternalLink,
  Award,
  Info,
  Calendar,
  Layers,
  TrendingUp,
  Tag,
  Zap,
  Percent,
} from "lucide-react";
import { ToastContainer, useToast } from "@/components/Toast";

export default function CompareCardsPage() {
  const { t } = useLanguage();
  const { toasts, addToast, removeToast } = useToast();
  const [cards, setCards] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [demoMode, setDemoMode] = useState<boolean>(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data: any = await apiFetch("/cards");
        setCards(data || []);
        if (data && data.length >= 2) {
          setSelectedIds(data.slice(0, 3).map((c: any) => c.id));
        }
      } catch (err) {
        console.error("Failed to load cards:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  const toggleSelectCard = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 2) {
        setSelectedIds(selectedIds.filter((x) => x !== id));
      }
    } else {
      if (selectedIds.length < 5) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const handleRunComparison = async (overrideDemoMode?: boolean) => {
    if (selectedIds.length < 2) return;
    setComparing(true);
    const activeDemo = overrideDemoMode !== undefined ? overrideDemoMode : demoMode;
    try {
      const res: any = await apiFetch("/optimization/compare", {
        method: "POST",
        body: JSON.stringify({
          card_ids: selectedIds,
          demo_mode: activeDemo
        }),
      });
      setComparisonResult(res);
    } catch (err: any) {
      addToast(t.compare.comparisonFailed + (err.message || err), "error");
    } finally {
      setComparing(false);
    }
  };

  useEffect(() => {
    if (selectedIds.length >= 2) {
      handleRunComparison();
    }
  }, [selectedIds.length]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-[#0E1013] min-h-screen">
      <Sidebar />

      <main className="flex-1 p-5 sm:p-7 lg:p-9 max-w-7xl mx-auto w-full space-y-7">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            {t.compare.title}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.compare.subtitle}
          </p>
        </div>

        {/* Card Selector Pills in Liquid Glass */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.6)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {t.compare.selectionPrompt} ({selectedIds.length} Selected)
            </span>
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {/* Interactive Demo Mode Toggle */}
              <button
                type="button"
                onClick={() => {
                  const nextMode = !demoMode;
                  setDemoMode(nextMode);
                  handleRunComparison(nextMode);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                  demoMode
                    ? "bg-amber-400/15 border-amber-400/40 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.2)]"
                    : "bg-white/[0.04] border-white/10 text-slate-400 hover:text-white"
                }`}
                title={demoMode ? "Demo Mode: Showing varied illustrative promotional savings" : "Live Mode: Showing strict bank-verified terms only"}
              >
                <Sparkles className={`w-3.5 h-3.5 ${demoMode ? "text-amber-400" : "text-slate-500"}`} />
                <span>Demo Mode: {demoMode ? "Illustrative ON" : "Verified Only"}</span>
              </button>

              <button
                onClick={() => handleRunComparison()}
                disabled={comparing || selectedIds.length < 2}
                className="px-4 py-1.5 rounded-full btn-fx bg-lime-400 hover:bg-lime-300 text-[#0E1013] font-semibold text-xs shadow-[0_0_15px_rgba(76,192,63,0.35)] transition-all flex items-center gap-1.5 disabled:opacity-40"
              >
                {comparing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GitCompare className="w-3.5 h-3.5" />}
                <span>{comparing ? t.compare.comparing : t.compare.runComparison}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {cards.map((c) => {
              const isSelected = selectedIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleSelectCard(c.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-2 transition-all ${
                    isSelected
                      ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-400 shadow-[0_0_15px_rgba(76,192,63,0.25)]"
                      : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                      isSelected ? "bg-emerald-500 text-[#0E1013]" : "border border-white/20"
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span>{c.card_name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Comparison Matrix Output */}
        {comparisonResult && (
          <div className="space-y-6">
            {/* Mode Indicator Banner */}
            {comparisonResult.is_demo_mode ? (
              <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-[0_8px_30px_rgba(245,158,11,0.08)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-amber-300 text-xs sm:text-sm block">
                      Illustrative Demo Savings — Not a Verified Live Offer
                    </span>
                    <p className="text-[11px] text-amber-400/80 mt-0.5 leading-relaxed">
                      Displaying varied simulated promotional discounts (₹100–₹400) to demonstrate category stacking. Base card rewards reflect verified bank terms.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDemoMode(false);
                    handleRunComparison(false);
                  }}
                  className="px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-200 hover:text-white text-xs font-semibold transition-all shrink-0 self-start md:self-auto"
                >
                  Switch to Strict Live T&C
                </button>
              </div>
            ) : (
              <div className="p-3.5 sm:p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-[0_8px_30px_rgba(76,192,63,0.08)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-400/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-emerald-300 text-xs sm:text-sm block">
                      Live Verified Mode — Strict Issuer T&C Applied
                    </span>
                    <p className="text-[11px] text-emerald-400/80 mt-0.5 leading-relaxed">
                      Displaying strictly verified permanent reward rates and confirmed bank promotional offers. Zero synthetic values.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDemoMode(true);
                    handleRunComparison(true);
                  }}
                  className="px-3 py-1.5 rounded-full bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 text-xs font-semibold transition-all shrink-0 self-start md:self-auto flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Switch to Illustrative Demo Savings</span>
                </button>
              </div>
            )}

            {/* Header Cards Comparison Grid with Verified Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comparisonResult.cards.map((card: any) => {
                const cardMeta = cards.find((c) => c.id === card.card_id);
                const metadata = comparisonResult.cards_metadata?.find((m: any) => m.card_id === card.card_id);

                const annualFee = metadata ? Number(metadata.annual_fee) : Number(cardMeta?.annual_fee || 0);
                const joiningFee = metadata ? Number(metadata.joining_fee) : 0;
                const waiverSpend = metadata?.renewal_waiver_spend ?? cardMeta?.renewal_waiver_spend;
                const termsUrl = metadata?.terms_source_url || cardMeta?.terms_source_url;
                const isLtf = metadata?.breakeven_status === "LIFETIME_FREE" || annualFee === 0;
                const breakeven = comparisonResult.annual_break_even_spends[card.card_id];

                return (
                  <div
                    key={card.card_id}
                    className="p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_12px_36px_0_rgba(0,0,0,0.5)] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          {card.network}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>Verified Issuer T&C</span>
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-white mt-2.5">
                        {card.card_name}
                      </h3>
                      <div className="text-xs text-slate-400 flex items-center justify-between mt-0.5">
                        <span>{card.bank_name}</span>
                        {card.card_variant && <span className="text-[11px] text-slate-500">{card.card_variant}</span>}
                      </div>

                      {/* Fee Structure */}
                      <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Annual Fee</span>
                          <span className="font-bold text-white">
                            {isLtf ? (
                              <span className="text-emerald-400 font-extrabold">{t.compare.lifetimeFree}</span>
                            ) : (
                              `₹${annualFee.toLocaleString("en-IN")}/yr`
                            )}
                          </span>
                        </div>

                        {joiningFee > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Joining Fee</span>
                            <span className="text-slate-300 font-medium">₹{joiningFee.toLocaleString("en-IN")}</span>
                          </div>
                        )}

                        {waiverSpend && Number(waiverSpend) > 0 && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Fee Waiver Spend</span>
                            <span className="text-slate-300 font-medium">
                              ₹{Number(waiverSpend).toLocaleString("en-IN")}/yr
                            </span>
                          </div>
                        )}

                        {/* Breakeven Spend */}
                        <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                          <span className="text-slate-500">Annual Breakeven</span>
                          <span className="font-bold text-emerald-400">
                            {isLtf
                              ? "₹0 (Zero Fee)"
                              : breakeven
                              ? `₹${Number(breakeven).toLocaleString("en-IN")}/yr`
                              : "N/A"}
                          </span>
                        </div>

                        {/* Net Annual Benefit Projection (on ₹2.5L Spend) */}
                        {metadata?.net_annual_benefit !== undefined && (
                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="text-slate-500">Est. Net Benefit (₹2.5L spend)</span>
                            <span className="font-bold text-lime-400">
                              +₹{Number(metadata.net_annual_benefit).toLocaleString("en-IN")}/yr
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Official Bank Terms Link */}
                    {termsUrl && (
                      <div className="mt-4 pt-2.5 border-t border-white/[0.06]">
                        <a
                          href={termsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-emerald-300 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 text-emerald-400" />
                          <span>Official Issuer Terms & Conditions</span>
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Category Yield Matrix Table */}
            <div className="rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.6)] overflow-hidden">
              <div className="p-4 sm:p-5 bg-white/[0.02] border-b border-white/[0.06] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {t.compare.yieldMatrix}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                        Benchmark: ₹1,000 spend
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Rates reflect true INR savings after points valuation, category multipliers, verified promo offers, and caps.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold self-start sm:self-auto bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    <Award className="w-3.5 h-3.5" />
                    <span>Leading Yield Crowned</span>
                  </div>
                </div>

                {/* 3 Metrics Legend Box */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-slate-500/20 text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <span className="font-semibold text-slate-200 text-[11px] block">Guaranteed Base Reward</span>
                      <span className="text-[10px] text-slate-400 leading-tight block">Permanent baseline return on general spending.</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-lime-400/20 text-lime-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <span className="font-semibold text-lime-400 text-[11px] block">Additional Eligible Savings</span>
                      <span className="text-[10px] text-slate-400 leading-tight block">Category accelerators + verified bank/merchant promos.</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <span className="font-semibold text-emerald-400 text-[11px] block">Total Effective Benefit</span>
                      <span className="text-[10px] text-slate-400 leading-tight block">Base + Extra savings combined per ₹1,000 spend.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-white/[0.01] text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/[0.06]">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold w-1/5 min-w-[140px]">Spend Category</th>
                      {comparisonResult.cards.map((c: any) => (
                        <th key={c.card_id} className="py-3.5 px-4 font-semibold text-center min-w-[200px]">
                          <div className="text-white text-xs">{c.card_name}</div>
                          <div className="text-[9px] text-slate-400 font-normal normal-case">{c.bank_name}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {comparisonResult.category_matrix.map((row: any) => {
                      const maxBenefitInRow = Math.max(
                        ...comparisonResult.cards.map((c: any) => {
                          const d = row.card_details ? row.card_details[c.card_id] : null;
                          return d && !d.is_excluded ? Number(d.total_effective_benefit || 0) : 0;
                        }),
                        1
                      );

                      return (
                        <tr key={row.category_id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-4 font-bold text-white align-top">
                            <div className="space-y-1">
                              <span className="text-xs text-white block">{row.display_name}</span>
                              <span className="text-[10px] text-slate-500 font-normal block">Standard ₹1k spend</span>
                            </div>
                          </td>
                          {comparisonResult.cards.map((c: any) => {
                            const detail = row.card_details ? row.card_details[c.card_id] : null;
                            const isExcluded = detail?.is_excluded || false;

                            // Metric 1: Base Card Rewards
                            const baseRate = Number(detail?.base_reward_percentage ?? detail?.base_rate_percentage ?? 0);
                            const baseValue = Number(detail?.base_reward_value ?? detail?.base_reward_amount ?? 0);

                            // Metric 2: Additional Eligible Savings
                            const addlSavingsValue = Number(detail?.additional_savings_value ?? 0);
                            const addlSavingsRate = Number(detail?.additional_savings_percentage ?? 0);
                            const accelValue = Number(detail?.accelerated_reward_value ?? 0);
                            const offerValue = Number(detail?.additional_offer_value ?? 0);
                            const hasOffer = detail?.has_promotional_offer || false;
                            const isDemoVal = detail?.is_demo_value || false;

                            // Metric 3: Total Effective Benefit
                            const totalBenefit = Number(detail?.total_effective_benefit ?? detail?.effective_reward_amount ?? (row.card_yields[c.card_id] || 0) * 10);
                            const totalEffectiveRate = Number(detail?.total_effective_percentage ?? detail?.effective_rate_percentage ?? row.card_yields[c.card_id] ?? 0);

                            const isWinner = row.best_card_id === c.card_id && totalBenefit > 0 && !isExcluded;

                            return (
                              <td key={c.card_id} className="py-4 px-4 align-top">
                                <div className="flex flex-col items-stretch gap-2">
                                  {/* Metric 3 Card Banner: Total Effective Benefit */}
                                  <div
                                    className={`p-3 rounded-2xl text-center transition-all ${
                                      isWinner
                                        ? "bg-gradient-to-b from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/50 shadow-[0_0_20px_rgba(76,192,63,0.22)] ring-1 ring-emerald-500/30"
                                        : isExcluded
                                        ? "bg-rose-500/5 border border-rose-500/20"
                                        : "bg-white/[0.03] border border-white/[0.06]"
                                    }`}
                                  >
                                    {isWinner && (
                                      <div className="flex items-center justify-center gap-1.5 text-[10px] text-lime-400 font-extrabold uppercase tracking-wider mb-1">
                                        <Award className="w-3.5 h-3.5 text-lime-400" />
                                        <span>Leading Yield</span>
                                      </div>
                                    )}

                                    {isExcluded ? (
                                      <div className="py-1">
                                        <span className="text-xs font-bold text-rose-400">0.0% (Excluded)</span>
                                      </div>
                                    ) : (
                                      <div>
                                        <div className="flex items-baseline justify-center gap-1">
                                          <span className="text-[10px] text-slate-400">Total:</span>
                                          <span className={`text-lg font-black ${isWinner ? "text-lime-400" : "text-white"}`}>
                                            ₹{totalBenefit.toFixed(2)}
                                          </span>
                                        </div>
                                        <div className={`text-[10px] font-semibold ${isWinner ? "text-emerald-400" : "text-slate-400"}`}>
                                          {totalEffectiveRate.toFixed(1)}% total effective
                                        </div>

                                        {/* Relative Visual Comparison Bar */}
                                        <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden mt-2">
                                          <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                              isWinner
                                                ? "bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.6)]"
                                                : "bg-slate-500/40"
                                            }`}
                                            style={{
                                              width: `${Math.min(100, Math.max(10, (totalBenefit / maxBenefitInRow) * 100))}%`
                                            }}
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Metric Breakdown Table */}
                                  {!isExcluded && (
                                    <div className="p-2.5 rounded-xl bg-white/[0.015] border border-white/[0.04] space-y-1.5 text-[10px]">
                                      {/* Metric 1: Base */}
                                      <div className="flex items-center justify-between">
                                        <span className="text-slate-500">1. Base Reward:</span>
                                        <span className="font-semibold text-slate-300">
                                          ₹{baseValue.toFixed(2)} ({baseRate.toFixed(1)}%)
                                        </span>
                                      </div>

                                      {/* Metric 2: Additional Eligible Savings */}
                                      <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                                        <span className="text-slate-500">2. Extra Savings:</span>
                                        <span className={`font-semibold ${addlSavingsValue > 0 ? "text-lime-400" : "text-slate-500"}`}>
                                          {addlSavingsValue > 0
                                            ? `+₹${addlSavingsValue.toFixed(2)} (+${addlSavingsRate.toFixed(1)}%)`
                                            : "₹0.00"}
                                        </span>
                                      </div>

                                      {/* Savings Breakdown Sub-items */}
                                      {accelValue > 0 && (
                                        <div className="flex items-center justify-between text-[9px] text-slate-400 pl-2">
                                          <span>• Multiplier:</span>
                                          <span className="text-emerald-300">+₹{accelValue.toFixed(2)}</span>
                                        </div>
                                      )}

                                      {offerValue > 0 && (
                                        <div className="flex items-center justify-between text-[9px] text-slate-400 pl-2">
                                          <span>• {isDemoVal ? "Demo Promo" : "Bank Promo"}:</span>
                                          <span className={isDemoVal ? "text-amber-300 font-bold" : "text-lime-300 font-bold"}>
                                            +₹{offerValue.toFixed(2)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Demo Label Notice Badge on Synthetic Cell */}
                                  {isDemoVal && (
                                    <div className="px-2 py-1 rounded-lg bg-amber-400/10 border border-amber-400/25 text-[9px] text-amber-300 font-medium text-center leading-tight">
                                      Illustrative Demo Savings — Not a Verified Live Offer
                                    </div>
                                  )}

                                  {/* Promotional Offer Pill */}
                                  {hasOffer && (
                                    <div className={`p-2 rounded-xl border space-y-1 text-left ${
                                      isDemoVal ? "bg-amber-400/10 border-amber-400/20" : "bg-lime-400/10 border-lime-400/25"
                                    }`}>
                                      <div className={`flex items-center gap-1.5 text-[10px] font-bold ${
                                        isDemoVal ? "text-amber-300" : "text-lime-300"
                                      }`}>
                                        <Tag className={`w-3 h-3 shrink-0 ${isDemoVal ? "text-amber-400" : "text-lime-400"}`} />
                                        <span className="truncate" title={detail.offer_title}>{detail.offer_title || "Promotional Offer"}</span>
                                      </div>
                                      {detail.promo_code && (
                                        <div className="flex items-center gap-1 text-[9px] text-slate-300 font-mono">
                                          <span>Code:</span>
                                          <span className="px-1.5 py-0.2 rounded bg-black/40 border border-white/10 text-white font-bold">
                                            {detail.promo_code}
                                          </span>
                                        </div>
                                      )}
                                      {detail.offer_explanation && (
                                        <div className="text-[8.5px] text-slate-400 leading-tight">
                                          {detail.offer_explanation}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Unverified / Threshold Offer Disclosure */}
                                  {detail?.unverified_offer_count > 0 && !isDemoVal && (
                                    <div className="text-[9px] text-amber-400/80 leading-tight">
                                      *{detail.unverified_offer_count} additional offer requires higher spend than ₹1,000 benchmark
                                    </div>
                                  )}

                                  {/* Reward Type Pill & Conversion */}
                                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/[0.03] text-slate-400 font-mono border border-white/[0.05]">
                                      {detail?.reward_type || "CASHBACK"}
                                    </span>
                                    {detail?.point_value_inr && Number(detail.point_value_inr) !== 1.0 && (
                                      <span className="text-[9px] text-slate-500 font-mono">
                                        1 pt = ₹{Number(detail.point_value_inr).toFixed(2)}
                                      </span>
                                    )}
                                  </div>

                                  {/* Conditions & Caps */}
                                  {detail?.conditions && !isExcluded && !isDemoVal && (
                                    <span
                                      className="text-[9px] text-slate-500 text-center truncate block px-1"
                                      title={detail.conditions}
                                    >
                                      {detail.conditions}
                                    </span>
                                  )}

                                  {isExcluded && (
                                    <span
                                      className="text-[9px] text-rose-400/80 text-center block px-1"
                                      title="Category excluded from rewards"
                                    >
                                      Fuel surcharge waiver only (1% waiver, no reward pts)
                                    </span>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Verdict */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-300 flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{comparisonResult.summary_verdict}</span>
            </div>

            {/* Verified Methodology & Issuer T&C Disclosure */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.015] border border-white/[0.05] text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-xs">
                <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Verified Data & Calculation Methodology</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                All reward rates, monthly caps, point conversion values, and fee structures are sourced directly from official card issuer published documentation (last verified October 2024). Net returns account for points monetary conversion, category spending caps, fee waiver thresholds, and benchmark Indian consumer spend patterns.
              </p>
            </div>
          </div>
        )}
      </main>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}