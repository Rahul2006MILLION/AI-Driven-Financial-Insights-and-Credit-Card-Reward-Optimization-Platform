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
  ShieldAlert,
  HelpCircle,
  TrendingDown,
  Tag,
  Copy,
  Check,
  Globe,
  Store,
  ExternalLink,
  Info,
  Gift,
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
    <div className="flex-1 flex flex-col lg:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <Zap className="w-8 h-8 text-cliq-cyan" />
            <span>Smart Card Utilization & Reward Optimizer</span>
          </h1>
          <p className="text-xs text-cliq-textSecondary mt-1">
            Evaluates your credit cards, promotional bank offers, instant coupon codes, and reward caps using exact Decimal logic.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-cliq-danger/10 border border-cliq-danger/30 text-cliq-danger text-xs">
            {error}
          </div>
        )}

        {/* Input Form */}
        <div className="glass-panel p-6 rounded-2xl border-glow-cyan shadow-cardGlass">
          <form onSubmit={handleOptimize} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-cliq-textSecondary mb-1.5">
                Spend Amount (₹)
              </label>
              <input
                type="number"
                required
                min={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-cliq-cyan"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-cliq-textSecondary mb-1.5">
                Spending Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-cliq-cyan"
              >
                <option value="food_delivery">Food Delivery (Swiggy, Zomato)</option>
                <option value="dining">Dining & Restaurants</option>
                <option value="shopping">Online Shopping (Amazon, Flipkart)</option>
                <option value="grocery">Grocery & Quick Commerce (Blinkit, DMart)</option>
                <option value="travel">Travel, Flights & Hotels (MakeMyTrip, IRCTC)</option>
                <option value="entertainment">Movies & Entertainment (BookMyShow)</option>
                <option value="utility">Utility & Bill Payments</option>
                <option value="fuel">Fuel & Petrol Pumps</option>
                <option value="international">International Spends</option>
                <option value="other">General / Other Spends</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-cliq-textSecondary mb-1.5">
                Merchant / Store Name
              </label>
              <input
                type="text"
                placeholder="e.g. Swiggy, Amazon, Croma"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-cliq-cyan"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-cliq-textSecondary mb-1.5">
                Transaction Channel
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-cliq-bgSecondary p-1 rounded-xl border border-cliq-border">
                <button
                  type="button"
                  onClick={() => setPaymentChannel("ONLINE")}
                  className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors ${
                    paymentChannel === "ONLINE"
                      ? "bg-cliq-surface text-cliq-cyan border border-cliq-cyan/40"
                      : "text-cliq-textMuted hover:text-white"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Online</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentChannel("OFFLINE")}
                  className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors ${
                    paymentChannel === "OFFLINE"
                      ? "bg-cliq-surface text-cliq-turquoise border border-cliq-turquoise/40"
                      : "text-cliq-textMuted hover:text-white"
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
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cliq-cyan via-cliq-turquoise to-cliq-emerald text-cliq-bg font-extrabold text-sm shadow-neonCyan hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Calculate Optimal Card & Benefits</span>
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
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border-glow-emerald shadow-neonEmerald relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-cliq-emerald/10 rounded-full blur-[100px] pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cliq-border/60 pb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cliq-emerald/20 text-cliq-emerald text-xs font-bold border border-cliq-emerald/40 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Top Recommendation</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {result.recommended_card.card_name}
                  </h2>
                  <div className="text-xs text-cliq-textSecondary mt-0.5">
                    {result.recommended_card.bank_name} • {result.recommended_card.network}
                    {result.recommended_card.card_variant && ` • ${result.recommended_card.card_variant}`}
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-xs text-cliq-textSecondary block">Total Net Benefit</span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-cliq-emerald glow-emerald">
                    ₹{Number(result.recommended_card.net_financial_benefit).toFixed(2)}
                  </div>
                  <span className="text-xs font-bold text-cliq-cyan">
                    {result.recommended_card.effective_rate_percentage}% Effective Combined Yield
                  </span>
                </div>
              </div>

              {/* Benefit Split: Instant Discount vs Post Rewards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-cliq-surface border border-cliq-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-cliq-textMuted uppercase font-bold block">
                      Upfront Instant Discount
                    </span>
                    <span className="text-lg font-extrabold text-cliq-turquoise">
                      ₹{Number(result.recommended_card.instant_discount_monetary).toFixed(2)}
                    </span>
                  </div>
                  <Tag className="w-6 h-6 text-cliq-turquoise opacity-80" />
                </div>

                <div className="p-4 rounded-xl bg-cliq-surface border border-cliq-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-cliq-textMuted uppercase font-bold block">
                      Card Rewards & Cashback
                    </span>
                    <span className="text-lg font-extrabold text-cliq-cyan">
                      ₹{Number(result.recommended_card.post_reward_monetary).toFixed(2)}
                    </span>
                  </div>
                  <Gift className="w-6 h-6 text-cliq-cyan opacity-80" />
                </div>
              </div>

              {/* Applicable Coupon Offer Highlight */}
              {result.recommended_card.applicable_offers && result.recommended_card.applicable_offers.length > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-cliq-bg border border-cliq-turquoise/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cliq-turquoise/20 text-cliq-turquoise uppercase">
                        Active Promo Offer
                      </span>
                      <span className="text-xs font-extrabold text-white">
                        {result.recommended_card.applicable_offers[0].offer_title}
                      </span>
                    </div>
                    {result.recommended_card.applicable_offers[0].terms_and_conditions && (
                      <p className="text-[11px] text-cliq-textSecondary mt-1">
                        {result.recommended_card.applicable_offers[0].terms_and_conditions}
                      </p>
                    )}
                  </div>

                  {result.recommended_card.applicable_offers[0].promo_code && (
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="font-mono text-xs font-extrabold text-cliq-cyan bg-cliq-surface px-3 py-1.5 rounded-lg border border-cliq-border">
                        {result.recommended_card.applicable_offers[0].promo_code}
                      </div>
                      <button
                        onClick={() => handleCopyCode(result.recommended_card!.applicable_offers[0].promo_code!)}
                        className="p-1.5 rounded-lg bg-cliq-surface hover:bg-cliq-surfaceHover border border-cliq-border text-white text-xs flex items-center gap-1"
                        title="Copy coupon"
                      >
                        {copiedCode === result.recommended_card.applicable_offers[0].promo_code ? (
                          <Check className="w-3.5 h-3.5 text-cliq-emerald" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-cliq-textSecondary" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Localized Explanation */}
              <div className="mt-4 p-4 rounded-xl bg-cliq-surface/90 border border-cliq-cyan/30 text-xs text-cliq-textSecondary flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-cliq-cyan mt-0.5 shrink-0" />
                <div className="leading-relaxed text-white font-medium">
                  {result.explanation}
                </div>
              </div>

              {/* Step-by-Step Breakdown */}
              <div className="mt-6 pt-6 border-t border-cliq-border/60">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  Deterministic Step-by-Step Calculation Breakdown
                </h4>

                <div className="space-y-2">
                  {result.recommended_card.breakdown_steps?.map((step: any) => (
                    <div
                      key={step.step_number}
                      className="p-3 rounded-xl bg-cliq-surface/70 border border-cliq-border flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-cliq-cyan/15 text-cliq-cyan flex items-center justify-center font-bold text-[10px]">
                          {step.step_number}
                        </span>
                        <div>
                          <span className="font-bold text-white">{step.rule_name}</span>
                          <p className="text-[11px] text-cliq-textSecondary">{step.reason}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-cliq-emerald">
                          ₹{Number(step.final_monetary_value).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Information & Official Terms Links */}
              {result.recommended_card.source_references && result.recommended_card.source_references.length > 0 && (
                <div className="mt-4 pt-3 border-t border-cliq-border flex items-center justify-between text-xs text-cliq-textMuted">
                  <span>Source Verification:</span>
                  <a
                    href={result.recommended_card.source_references[0]}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cliq-cyan hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>View Official Bank Terms</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Alternative Cards Comparison Table */}
            {result.alternatives && result.alternatives.length > 0 && (
              <div className="glass-panel p-6 rounded-2xl border-cliq-border space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Alternative Cards in Your Wallet
                </h3>

                <div className="divide-y divide-cliq-border/60">
                  {result.alternatives.map((alt: any) => {
                    const delta =
                      Number(result.recommended_card!.net_financial_benefit) -
                      Number(alt.net_financial_benefit);
                    return (
                      <div
                        key={alt.card_id}
                        className="py-3 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{alt.card_name}</div>
                          <div className="text-[11px] text-cliq-textMuted">
                            {alt.bank_name} • {alt.effective_rate_percentage}% Yield
                            {Number(alt.instant_discount_monetary) > 0 && (
                              <span className="text-cliq-turquoise ml-1 font-medium">
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
                            <div className="text-[11px] text-cliq-danger flex items-center gap-0.5 justify-end">
                              <TrendingDown className="w-3 h-3" />
                              <span>-₹{delta.toFixed(2)} Difference</span>
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
