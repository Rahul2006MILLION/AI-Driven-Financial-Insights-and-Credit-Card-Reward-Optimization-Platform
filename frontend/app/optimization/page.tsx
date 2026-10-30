"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import {
  Zap,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  HelpCircle,
  TrendingDown,
} from "lucide-react";

export default function RewardOptimizationPage() {
  const { t, language } = useLanguage();

  const [amount, setAmount] = useState<number>(5000);
  const [category, setCategory] = useState<string>("dining");
  const [merchant, setMerchant] = useState<string>("Swiggy");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res: any = await apiFetch("/optimization/recommend", {
        method: "POST",
        body: JSON.stringify({
          amount,
          category_id: category,
          merchant_name: merchant,
        }),
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Optimization failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.optimizer.title}
          </h1>
          <p className="text-xs text-cliq-textSecondary mt-1">
            {t.optimizer.subtitle}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-cliq-danger/10 border border-cliq-danger/30 text-cliq-danger text-xs">
            {error}
          </div>
        )}

        {/* Input Form */}
        <div className="glass-panel p-6 rounded-2xl border-glow-cyan shadow-cardGlass">
          <form onSubmit={handleOptimize} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-cliq-textSecondary mb-1.5">
                {t.optimizer.amountLabel}
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
                {t.optimizer.categoryLabel}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-cliq-cyan"
              >
                <option value="dining">Dining & Food Delivery (Swiggy, Zomato)</option>
                <option value="shopping">Online & Retail Shopping (Amazon, Flipkart)</option>
                <option value="grocery">Groceries & Supermarkets (Blinkit, DMart)</option>
                <option value="utility">Utility & Bill Payments (Electricity, Water, DTH)</option>
                <option value="travel">Travel & Flights (Airlines, Hotels, IRCTC)</option>
                <option value="fuel">Fuel & Petrol Pumps (HPCL, BPCL, IOCL)</option>
                <option value="entertainment">Entertainment & Streaming (Netflix, BookMyShow)</option>
                <option value="other">General / Miscellaneous Spends</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-cliq-textSecondary mb-1.5">
                {t.optimizer.merchantLabel}
              </label>
              <input
                type="text"
                placeholder="e.g. Swiggy, Amazon, Uber"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-cliq-cyan"
              />
            </div>

            <div className="sm:col-span-3 pt-2">
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
                    <span>{t.optimizer.calculate}</span>
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
                    <span>{t.optimizer.recommended}</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {result.recommended_card.card_name}
                  </h2>
                  <div className="text-xs text-cliq-textSecondary mt-0.5">
                    {result.recommended_card.bank_name} • {result.recommended_card.network}
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-xs text-cliq-textSecondary block">
                    {t.optimizer.expectedReward}
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-cliq-emerald glow-emerald">
                    ₹{Number(result.recommended_card.expected_reward_monetary).toFixed(2)}
                  </div>
                  <span className="text-xs font-bold text-cliq-cyan">
                    {result.recommended_card.effective_rate_percentage}% Effective Yield
                  </span>
                </div>
              </div>

              {/* Localized Explanation */}
              <div className="mt-6 p-4 rounded-xl bg-cliq-surface/90 border border-cliq-cyan/30 text-xs text-cliq-textSecondary flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-cliq-cyan mt-0.5 shrink-0" />
                <div className="leading-relaxed text-white font-medium">
                  {result.explanation}
                </div>
              </div>

              {/* Step-by-Step Breakdown */}
              <div className="mt-6 pt-6 border-t border-cliq-border/60">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  {t.optimizer.breakdown}
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
            </div>

            {/* Alternative Cards Comparison Table */}
            {result.alternatives && result.alternatives.length > 0 && (
              <div className="glass-panel p-6 rounded-2xl border-cliq-border space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {t.optimizer.alternatives}
                </h3>

                <div className="divide-y divide-cliq-border/60">
                  {result.alternatives.map((alt: any) => {
                    const delta =
                      Number(result.recommended_card.expected_reward_monetary) -
                      Number(alt.expected_reward_monetary);
                    return (
                      <div
                        key={alt.card_id}
                        className="py-3 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{alt.card_name}</div>
                          <div className="text-[11px] text-cliq-textMuted">
                            {alt.bank_name} • {alt.effective_rate_percentage}% Yield
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-white">
                            ₹{Number(alt.expected_reward_monetary).toFixed(2)}
                          </div>
                          {delta > 0 && (
                            <div className="text-[11px] text-cliq-danger flex items-center gap-0.5 justify-end">
                              <TrendingDown className="w-3 h-3" />
                              <span>-₹{delta.toFixed(2)} Less</span>
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
