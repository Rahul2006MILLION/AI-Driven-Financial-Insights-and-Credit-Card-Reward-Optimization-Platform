"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage } from "@/lib/i18n";
import { api, RecommendResponse } from "@/lib/api";
import {
  Zap,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
  TrendingDown,
  Tag,
  Copy,
  Check,
  Globe,
  Store,
  ExternalLink,
  Gift,
  ChevronRight,
} from "lucide-react";

export default function RewardOptimizationPage() {
  const { t } = useLanguage();

  const [amount, setAmount] = useState<number>(2000);
  const [category, setCategory] = useState<string>("food_delivery");
  const [merchant, setMerchant] = useState<string>("Swiggy");
  const [paymentChannel, setPaymentChannel] = useState<string>("ONLINE");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<RecommendResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.recommendCard({
        amount,
        category_id: category,
        merchant_name: merchant,
        payment_channel: paymentChannel,
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Optimization calculation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-[#040707]">
      <Sidebar />

      <main className="flex-1 p-5 sm:p-7 lg:p-9 max-w-7xl mx-auto w-full space-y-7">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white glow-emerald">
            Purchase Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time reward maximization and instant coupon detection
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Input Form Glass Panel */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.6)]">
          <form onSubmit={handleOptimize} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Spend Amount (₹)
              </label>
              <input
                type="number"
                required
                min={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#06100C] border border-white/10 rounded-2xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="food_delivery">Food Delivery (Swiggy, Zomato)</option>
                <option value="dining">Dining & Restaurants</option>
                <option value="shopping">Shopping (Amazon, Flipkart)</option>
                <option value="grocery">Groceries (Blinkit, DMart)</option>
                <option value="travel">Travel & Flights</option>
                <option value="entertainment">Movies & Entertainment</option>
                <option value="utility">Utility & Bills</option>
                <option value="fuel">Fuel & Petrol Pumps</option>
                <option value="international">International Spends</option>
                <option value="other">General Spends</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Merchant / Store
              </label>
              <input
                type="text"
                placeholder="e.g. Swiggy, Amazon, Croma"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Channel
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-white/[0.03] p-1 rounded-2xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setPaymentChannel("ONLINE")}
                  className={`py-1.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-all ${
                    paymentChannel === "ONLINE"
                      ? "bg-emerald-500 text-[#040707] font-bold shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Online</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentChannel("OFFLINE")}
                  className={`py-1.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-all ${
                    paymentChannel === "OFFLINE"
                      ? "bg-emerald-500 text-[#040707] font-bold shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>In-Store</span>
                </button>
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#040707] font-bold text-sm shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Calculate Optimal Benefits</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Optimization Output */}
        {result && result.recommended_card && (
          <div className="space-y-6">
            {/* Top Recommended Hero Card */}
            <div className="p-7 sm:p-8 rounded-3xl bg-white/[0.04] border border-emerald-500/40 backdrop-blur-2xl shadow-[0_20px_50px_0_rgba(0,0,0,0.7)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold border border-emerald-500/30 mb-2.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Top Recommendation</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {result.recommended_card.card_name}
                  </h2>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {result.recommended_card.bank_name} • {result.recommended_card.network}
                    {result.recommended_card.card_variant && ` • ${result.recommended_card.card_variant}`}
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-xs text-slate-400 block font-medium">Total Net Benefit</span>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-400 glow-emerald tracking-tight">
                    ₹{Number(result.recommended_card.net_financial_benefit).toFixed(2)}
                  </div>
                  <span className="text-xs font-semibold text-emerald-300">
                    {result.recommended_card.effective_rate_percentage}% Effective Yield
                  </span>
                </div>
              </div>

              {/* Benefit Split: Instant Discount vs Post Rewards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      Upfront Instant Discount
                    </span>
                    <span className="text-lg font-black text-emerald-400">
                      ₹{Number(result.recommended_card.instant_discount_monetary).toFixed(2)}
                    </span>
                  </div>
                  <Tag className="w-5 h-5 text-emerald-400 opacity-80" />
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      Card Rewards & Cashback
                    </span>
                    <span className="text-lg font-black text-white">
                      ₹{Number(result.recommended_card.post_reward_monetary).toFixed(2)}
                    </span>
                  </div>
                  <Gift className="w-5 h-5 text-emerald-400 opacity-80" />
                </div>
              </div>

              {/* Applicable Coupon Offer Highlight */}
              {result.recommended_card.applicable_offers && result.recommended_card.applicable_offers.length > 0 && (
                <div className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 uppercase">
                        Matched Coupon
                      </span>
                      <span className="text-xs font-bold text-white">
                        {result.recommended_card.applicable_offers[0].offer_title}
                      </span>
                    </div>
                    {result.recommended_card.applicable_offers[0].terms_and_conditions && (
                      <p className="text-[11px] text-slate-400 mt-1">
                        {result.recommended_card.applicable_offers[0].terms_and_conditions}
                      </p>
                    )}
                  </div>

                  {result.recommended_card.applicable_offers[0].promo_code && (
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="font-mono text-xs font-bold text-emerald-400 bg-white/[0.05] px-3 py-1.5 rounded-xl border border-white/10">
                        {result.recommended_card.applicable_offers[0].promo_code}
                      </div>
                      <button
                        onClick={() => handleCopyCode(result.recommended_card!.applicable_offers[0].promo_code!)}
                        className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-white text-xs flex items-center gap-1"
                      >
                        {copiedCode === result.recommended_card.applicable_offers[0].promo_code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Explanation */}
              <div className="mt-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-300 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div className="leading-relaxed font-medium">
                  {result.explanation}
                </div>
              </div>

              {/* Calculation Steps */}
              <div className="mt-6 pt-6 border-t border-white/[0.07]">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  Calculation Breakdown
                </h4>

                <div className="space-y-2">
                  {result.recommended_card.breakdown_steps?.map((step: any) => (
                    <div
                      key={step.step_number}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                          {step.step_number}
                        </span>
                        <div>
                          <span className="font-semibold text-white">{step.rule_name}</span>
                          <p className="text-[11px] text-slate-400">{step.reason}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-emerald-400">
                          ₹{Number(step.final_monetary_value).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Source Verification Link */}
              {result.recommended_card.source_references && result.recommended_card.source_references.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-500">
                  <span>Source Verification:</span>
                  <a
                    href={result.recommended_card.source_references[0]}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                  >
                    <span>Official Schedule of Charges</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Alternative Cards Comparison */}
            {result.alternatives && result.alternatives.length > 0 && (
              <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.6)] space-y-4">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Alternative Cards in Portfolio
                </h3>

                <div className="divide-y divide-white/[0.06]">
                  {result.alternatives.map((alt: any) => {
                    const delta =
                      Number(result.recommended_card!.net_financial_benefit) -
                      Number(alt.net_financial_benefit);
                    return (
                      <div
                        key={alt.card_id}
                        className="py-3.5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{alt.card_name}</div>
                          <div className="text-[11px] text-slate-400">
                            {alt.bank_name} • {alt.effective_rate_percentage}% Yield
                            {Number(alt.instant_discount_monetary) > 0 && (
                              <span className="text-emerald-400 ml-1 font-medium">
                                (includes ₹{Number(alt.instant_discount_monetary)} instant discount)
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-white">
                            ₹{Number(alt.net_financial_benefit).toFixed(2)}
                          </div>
                          {delta > 0 && (
                            <div className="text-[11px] text-rose-400 flex items-center gap-0.5 justify-end">
                              <TrendingDown className="w-3 h-3" />
                              <span>-₹{delta.toFixed(2)} Delta</span>
                            </div>
                          )}
                        </div>
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
