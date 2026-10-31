"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import { DemoBootstrap } from "@/components/DemoBootstrap";
import {
  CreditCard,
  Zap,
  TrendingUp,
  Receipt,
  Sparkles,
  ArrowRight,
  Loader2,
  Plus,
  ShieldCheck,
  ChevronRight,
  Activity,
} from "lucide-react";

export default function DashboardPage() {
  const { t } = useLanguage();
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
    <div className="flex-1 flex flex-col lg:flex-row bg-[#040707]">
      <Sidebar />

      <main className="flex-1 p-5 sm:p-7 lg:p-9 max-w-7xl mx-auto w-full space-y-7">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white glow-emerald">
              Command Center
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Financial intelligence and real-time portfolio metrics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <DemoBootstrap onSeeded={loadDashboardData} />
            <Link
              href="/cards/new"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#040707] font-semibold text-xs shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Card</span>
            </Link>
          </div>
        </div>

        {/* Liquid Glass Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Registered Cards */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_12px_36px_0_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                Registered Cards
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white mt-3 tracking-tight">
              {cards.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
              <span className="text-emerald-400 font-medium">
                {cards.filter((c) => c.is_active).length} Active in Wallet
              </span>
              <Link href="/cards" className="text-slate-400 hover:text-white flex items-center gap-0.5">
                <span>Fan</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Rewards Earned */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_12px_36px_0_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                Rewards Realized
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-400 glow-emerald mt-3 tracking-tight">
              ₹{rewardStats ? Number(rewardStats.total_rewards_earned).toFixed(2) : "0.00"}
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Potential: ₹{rewardStats ? Number(rewardStats.total_optimal_possible).toFixed(2) : "0.00"}
            </div>
          </div>

          {/* Efficiency Rate */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_12px_36px_0_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                Reward Efficiency
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white mt-3 tracking-tight">
              {rewardStats ? `${Number(rewardStats.optimization_efficiency_rate).toFixed(1)}%` : "100%"}
            </div>
            <div className="text-[11px] mt-2">
              {rewardStats && Number(rewardStats.reward_leakage_amount) > 0 ? (
                <span className="text-amber-400 font-medium">
                  ₹{Number(rewardStats.reward_leakage_amount).toFixed(2)} Leakage
                </span>
              ) : (
                <span className="text-emerald-400 font-medium">Optimal Spend Rate</span>
              )}
            </div>
          </div>

          {/* Health Score */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_12px_36px_0_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                Financial Health
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Activity className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white mt-3 tracking-tight">
              {healthData ? `${healthData.health_score}/100` : "92/100"}
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
              <span>{healthData?.recurring_subscriptions?.length || 0} Subscriptions</span>
              <Link href="/financial-health" className="text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5">
                <span>Details</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Optimizer + AI Assistant Teaser */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Optimizer Widget */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.07]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Purchase Optimizer
                </h2>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-medium">
                Decimal Precision
              </span>
            </div>

            <form onSubmit={handleQuickOptimize} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Spend Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={optAmount}
                  onChange={(e) => setOptAmount(Number(e.target.value))}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-white font-bold text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={optCategory}
                  onChange={(e) => setOptCategory(e.target.value)}
                  className="w-full bg-[#06100C] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="dining">Dining & Delivery</option>
                  <option value="shopping">Shopping</option>
                  <option value="grocery">Groceries</option>
                  <option value="utility">Utility & Bills</option>
                  <option value="travel">Travel & Hotels</option>
                  <option value="fuel">Fuel</option>
                  <option value="other">General Spend</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Merchant
                </label>
                <input
                  type="text"
                  placeholder="e.g. Swiggy, Amazon"
                  value={optMerchant}
                  onChange={(e) => setOptMerchant(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="sm:col-span-3 pt-2">
                <button
                  type="submit"
                  disabled={optLoading || cards.length === 0}
                  className="w-full py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#040707] font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {optLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Recommend Best Card</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Result Preview */}
            {optResult && optResult.recommended_card && (
              <div className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Optimal Recommendation
                    </span>
                    <div className="text-base font-extrabold text-white flex items-center gap-2">
                      <span>{optResult.recommended_card.card_name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                        {optResult.recommended_card.effective_rate_percentage}% Yield
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400">Expected Value</span>
                    <div className="text-xl font-extrabold text-emerald-400 glow-emerald">
                      ₹{Number(optResult.recommended_card.expected_reward_monetary).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <Link
                    href="/optimization"
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                  >
                    <span>Inspect Alternatives</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* AI Financial Assistant Card */}
          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.6)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-white text-sm">Financial Intelligence</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Local-first assistant grounded in your verified card portfolio.
              </p>

              <div className="mt-4 space-y-2">
                <Link
                  href="/assistant"
                  className="block p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] text-xs text-slate-300 border border-white/[0.07] hover:border-emerald-500/30 transition-all"
                >
                  "Which card gives 5% cashback on Swiggy?"
                </Link>
                <Link
                  href="/assistant"
                  className="block p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] text-xs text-slate-300 border border-white/[0.07] hover:border-emerald-500/30 transition-all"
                >
                  "Show lounge access quotas across my cards"
                </Link>
              </div>
            </div>

            <Link
              href="/assistant"
              className="mt-5 w-full py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-emerald-400 font-semibold text-xs text-center block transition-all"
            >
              Open Assistant Chat
            </Link>
          </div>
        </div>

        {/* Portfolio & Recent Transactions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Overview */}
          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Active Portfolio
              </h3>
              <Link href="/cards" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5">
                <span>View Fan</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {cards.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <CreditCard className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">
                  No cards registered yet.
                </p>
                <Link
                  href="/cards/new"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500 text-[#040707] font-bold text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Card</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {cards.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between hover:border-emerald-500/25 transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{c.card_name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.06] text-slate-300 font-mono">
                          {c.network}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {c.bank_name} • Fee: ₹{Number(c.annual_fee).toFixed(0)}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                        {c.reward_rules?.length || 1} Multipliers
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Recent Transactions
              </h3>
              <Link href="/transactions" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5">
                <span>All History</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <Receipt className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">
                  No transaction records found.
                </p>
                <Link
                  href="/transactions"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 font-semibold text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Purchase</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {transactions.slice(0, 4).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between hover:border-emerald-500/25 transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{tx.merchant_name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {tx.category_id} • {new Date(tx.transaction_date).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-white">
                        ₹{Number(tx.amount).toFixed(2)}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-semibold">
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
