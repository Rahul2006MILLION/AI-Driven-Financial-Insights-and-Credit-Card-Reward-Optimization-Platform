"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage } from "@/lib/i18n";
import { apiFetch, getStoredSession } from "@/lib/api";
import { DemoBootstrap } from "@/components/DemoBootstrap";
import {
  CreditCard,
  Zap,
  TrendingUp,
  Receipt,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Loader2,
  PlusCircle,
  ExternalLink,
} from "lucide-react";

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const [cards, setCards] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [rewardStats, setRewardStats] = useState<any>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Quick Optimizer state
  const [optAmount, setOptAmount] = useState<number>(3500);
  const [optCategory, setOptCategory] = useState<string>("dining");
  const [optMerchant, setOptMerchant] = useState<string>("Swiggy");
  const [optLoading, setOptLoading] = useState<boolean>(false);
  const [optResult, setOptResult] = useState<any>(null);

  const loadDashboardData = async () => {
    try {
      const [cardsData, txData, rewData, healthResp]: any = await Promise.all([
        apiFetch("/cards").catch(() => []),
        apiFetch("/transactions?limit=6").catch(() => []),
        apiFetch("/analytics/rewards").catch(() => null),
        apiFetch("/analytics/financial-health").catch(() => null),
      ]);

      setCards(cardsData || []);
      setTransactions(txData || []);
      setRewardStats(rewData);
      setHealthData(healthResp);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleQuickOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    setOptLoading(true);
    try {
      const res: any = await apiFetch("/optimization/recommend", {
        method: "POST",
        body: JSON.stringify({
          amount: optAmount,
          category_id: optCategory,
          merchant_name: optMerchant,
        }),
      });
      setOptResult(res);
    } catch (err) {
      console.error("Quick optimization failed:", err);
    } finally {
      setOptLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t.dashboard.title}
            </h1>
            <p className="text-xs text-cliq-textSecondary mt-1">
              CLIQ Financial Intelligence Core • {t.tagline}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <DemoBootstrap onSeeded={loadDashboardData} />
            <Link
              href="/cards/new"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cliq-cyan to-cliq-emerald text-cliq-bg font-bold text-xs shadow-neonCyan hover:opacity-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t.cards.addNew}</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Registered Cards */}
          <div className="glass-panel p-5 rounded-2xl border-glow-cyan/40 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cliq-textSecondary">
                {t.dashboard.registeredCards}
              </span>
              <div className="p-2 rounded-lg bg-cliq-cyan/10 text-cliq-cyan">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mt-3">
              {cards.length}
            </div>
            <div className="text-[11px] text-cliq-textMuted mt-1 flex items-center justify-between">
              <span>{cards.filter((c) => c.is_active).length} Active Portfolio Cards</span>
              <Link href="/cards" className="text-cliq-cyan hover:underline">
                View &rarr;
              </Link>
            </div>
          </div>

          {/* Rewards Earned */}
          <div className="glass-panel p-5 rounded-2xl border-cliq-border relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cliq-textSecondary">
                {t.dashboard.rewardsEarned}
              </span>
              <div className="p-2 rounded-lg bg-cliq-emerald/10 text-cliq-emerald">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-cliq-emerald glow-emerald mt-3">
              ₹{rewardStats ? Number(rewardStats.total_rewards_earned).toFixed(2) : "0.00"}
            </div>
            <div className="text-[11px] text-cliq-textMuted mt-1">
              Out of ₹{rewardStats ? Number(rewardStats.total_optimal_possible).toFixed(2) : "0.00"} Potential
            </div>
          </div>

          {/* Efficiency Rate */}
          <div className="glass-panel p-5 rounded-2xl border-cliq-border relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cliq-textSecondary">
                {t.dashboard.efficiencyRate}
              </span>
              <div className="p-2 rounded-lg bg-cliq-turquoise/10 text-cliq-turquoise">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mt-3">
              {rewardStats ? `${Number(rewardStats.optimization_efficiency_rate).toFixed(1)}%` : "100%"}
            </div>
            <div className="text-[11px] text-cliq-textSecondary mt-1">
              {rewardStats && Number(rewardStats.reward_leakage_amount) > 0 ? (
                <span className="text-cliq-warning">
                  ₹{Number(rewardStats.reward_leakage_amount).toFixed(2)} Leakage
                </span>
              ) : (
                <span className="text-cliq-emerald">Optimal Spend Allocation</span>
              )}
            </div>
          </div>

          {/* Health Score */}
          <div className="glass-panel p-5 rounded-2xl border-cliq-border relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cliq-textSecondary">
                {t.health.score}
              </span>
              <div className="p-2 rounded-lg bg-cliq-cyan/10 text-cliq-cyan">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-cliq-cyan glow-cyan mt-3">
              {healthData ? `${healthData.health_score}/100` : "92/100"}
            </div>
            <div className="text-[11px] text-cliq-textMuted mt-1 flex items-center justify-between">
              <span>{healthData?.recurring_subscriptions?.length || 0} Subscriptions Audited</span>
              <Link href="/financial-health" className="text-cliq-cyan hover:underline">
                Audit &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Optimizer + Action Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Optimizer Widget */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border-glow-cyan shadow-cardGlass">
            <div className="flex items-center justify-between border-b border-cliq-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cliq-cyan" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  {t.dashboard.quickOptimizer}
                </h2>
              </div>
              <span className="text-[11px] text-cliq-cyan bg-cliq-cyan/10 px-2 py-0.5 rounded font-mono">
                Exact Math
              </span>
            </div>

            <form onSubmit={handleQuickOptimize} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-cliq-textSecondary mb-1">
                  {t.dashboard.amount}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={optAmount}
                  onChange={(e) => setOptAmount(Number(e.target.value))}
                  className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-cliq-cyan"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-cliq-textSecondary mb-1">
                  {t.dashboard.category}
                </label>
                <select
                  value={optCategory}
                  onChange={(e) => setOptCategory(e.target.value)}
                  className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cliq-cyan"
                >
                  <option value="dining">Dining & Food Delivery</option>
                  <option value="shopping">Online & Retail Shopping</option>
                  <option value="grocery">Groceries & Supermarkets</option>
                  <option value="utility">Utility & Bill Payments</option>
                  <option value="travel">Travel, Flights & Hotels</option>
                  <option value="fuel">Fuel & Petrol Pumps</option>
                  <option value="other">General / All Spends</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-cliq-textSecondary mb-1">
                  {t.dashboard.merchant}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Swiggy, Amazon"
                  value={optMerchant}
                  onChange={(e) => setOptMerchant(e.target.value)}
                  className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cliq-cyan"
                />
              </div>

              <div className="sm:col-span-3 pt-2">
                <button
                  type="submit"
                  disabled={optLoading || cards.length === 0}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cliq-cyan to-cliq-emerald text-cliq-bg font-bold text-xs shadow-neonCyan hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  {optLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{t.dashboard.findBestCard}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Result Preview */}
            {optResult && optResult.recommended_card && (
              <div className="mt-4 p-4 rounded-xl bg-cliq-surface/90 border border-cliq-cyan/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-cliq-textSecondary uppercase tracking-wider font-semibold">
                      Recommended Card
                    </span>
                    <div className="text-base font-extrabold text-white flex items-center gap-2">
                      <span>{optResult.recommended_card.card_name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cliq-cyan/20 text-cliq-cyan font-bold">
                        {optResult.recommended_card.effective_rate_percentage}% Yield
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-cliq-textSecondary">Reward Return</span>
                    <div className="text-xl font-extrabold text-cliq-emerald glow-emerald">
                      ₹{Number(optResult.recommended_card.expected_reward_monetary).toFixed(2)}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-cliq-textSecondary pt-1 border-t border-cliq-border/60">
                  {optResult.explanation}
                </p>
                <div className="pt-1 flex justify-end">
                  <Link
                    href="/optimization"
                    className="text-xs text-cliq-cyan hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Full Breakdown & Alternatives</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* AI Financial Assistant Teaser */}
          <div className="glass-panel p-6 rounded-2xl border-cliq-border flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-cliq-turquoise/15 text-cliq-turquoise">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm">{t.assistant.title}</h3>
              </div>
              <p className="text-xs text-cliq-textSecondary leading-relaxed">
                Ask questions in English, Hindi, or Kannada. Responses are grounded strictly in your verified card portfolio without hallucinations.
              </p>

              <div className="mt-4 space-y-2">
                <Link
                  href="/assistant"
                  className="block p-2.5 rounded-xl bg-cliq-surface text-xs text-cliq-cyan border border-cliq-border hover:border-cliq-cyan/40 transition-colors"
                >
                  "Which card is best for Swiggy food delivery?"
                </Link>
                <Link
                  href="/assistant"
                  className="block p-2.5 rounded-xl bg-cliq-surface text-xs text-cliq-turquoise border border-cliq-border hover:border-cliq-turquoise/40 transition-colors"
                >
                  "क्या पेट्रोल पर कैशबैक मिलता है?"
                </Link>
              </div>
            </div>

            <Link
              href="/assistant"
              className="mt-4 w-full py-2 rounded-xl bg-cliq-surface hover:bg-cliq-surfaceHover border border-cliq-cyan/40 text-cliq-cyan font-bold text-xs text-center block transition-all"
            >
              Open Assistant Chat
            </Link>
          </div>
        </div>

        {/* Portfolio & Recent Transactions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Overview */}
          <div className="glass-panel p-6 rounded-2xl border-cliq-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {t.dashboard.portfolioOverview}
              </h3>
              <Link href="/cards" className="text-xs text-cliq-cyan hover:underline font-semibold">
                {t.dashboard.viewAllCards} &rarr;
              </Link>
            </div>

            {cards.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <CreditCard className="w-10 h-10 text-cliq-textMuted mx-auto" />
                <p className="text-xs text-cliq-textSecondary">
                  No cards registered yet. Add your first card or load sample cards above.
                </p>
                <Link
                  href="/cards/new"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cliq-cyan text-cliq-bg font-bold text-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add First Card</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {cards.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-cliq-surface/80 border border-cliq-border flex items-center justify-between hover:border-cliq-cyan/30 transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{c.card_name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cliq-border text-cliq-cyan">
                          {c.network}
                        </span>
                      </div>
                      <div className="text-[11px] text-cliq-textMuted">
                        {c.bank_name} • Annual Fee: ₹{Number(c.annual_fee).toFixed(0)}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-cliq-emerald/10 text-cliq-emerald border border-cliq-emerald/20 font-semibold">
                        {c.reward_rules?.length || 1} Rules
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="glass-panel p-6 rounded-2xl border-cliq-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {t.dashboard.recentTransactions}
              </h3>
              <Link href="/transactions" className="text-xs text-cliq-cyan hover:underline font-semibold">
                All Transactions &rarr;
              </Link>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <Receipt className="w-10 h-10 text-cliq-textMuted mx-auto" />
                <p className="text-xs text-cliq-textSecondary">
                  No transaction records found. Load sample data or enter a purchase.
                </p>
                <Link
                  href="/transactions"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cliq-surface border border-cliq-border text-white font-semibold text-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Enter Transaction</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 4).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-xl bg-cliq-surface/80 border border-cliq-border flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{tx.merchant_name}</div>
                      <div className="text-[11px] text-cliq-textMuted">
                        {tx.category_id} • {new Date(tx.transaction_date).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-white">
                        ₹{Number(tx.amount).toFixed(2)}
                      </div>
                      <div className="text-[11px] text-cliq-emerald font-semibold">
                        +₹{Number(tx.reward_earned_monetary).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
