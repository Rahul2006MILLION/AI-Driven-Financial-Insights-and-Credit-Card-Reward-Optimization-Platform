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
  Zap,
  Loader2,
  Coins,
} from "lucide-react";

const COLORS = ["#00E5E5", "#00F5C8", "#00D69B", "#38BDF8", "#818CF8", "#F472B6", "#FBBF24"];

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

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.analytics.title}
          </h1>
          <p className="text-xs text-cliq-textSecondary mt-1">
            {t.analytics.subtitle}
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-cliq-cyan mx-auto" />
            <p className="text-xs text-cliq-textSecondary mt-2">Computing analytics metrics...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-panel p-5 rounded-2xl border-cliq-border">
                <span className="text-xs text-cliq-textSecondary font-semibold">
                  Total Spending Tracked
                </span>
                <div className="text-3xl font-extrabold text-white mt-2">
                  ₹{spending ? Number(spending.total_spending).toFixed(2) : "0.00"}
                </div>
                <div className="text-[11px] text-cliq-textMuted mt-1">
                  Across {spending?.total_transactions || 0} purchases
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border-cliq-border">
                <span className="text-xs text-cliq-textSecondary font-semibold">
                  Realized Rewards
                </span>
                <div className="text-3xl font-extrabold text-cliq-emerald glow-emerald mt-2">
                  ₹{rewards ? Number(rewards.total_rewards_earned).toFixed(2) : "0.00"}
                </div>
                <div className="text-[11px] text-cliq-emerald mt-1 font-semibold">
                  {rewards ? `${Number(rewards.optimization_efficiency_rate).toFixed(1)}% Efficiency` : ""}
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border-cliq-border">
                <span className="text-xs text-cliq-textSecondary font-semibold">
                  Avoidable Reward Leakage
                </span>
                <div className="text-3xl font-extrabold text-cliq-danger mt-2">
                  ₹{rewards ? Number(rewards.reward_leakage_amount).toFixed(2) : "0.00"}
                </div>
                <div className="text-[11px] text-cliq-textMuted mt-1">
                  Lost to suboptimal card swiping
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <div className="glass-panel p-6 rounded-2xl border-cliq-border">
                <div className="flex items-center gap-2 mb-4">
                  <PieIcon className="w-4 h-4 text-cliq-cyan" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {t.analytics.spendByCategory}
                  </h3>
                </div>

                {spending?.category_breakdown?.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={spending.category_breakdown}
                          dataKey="total_amount"
                          nameKey="category_name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={45}
                          paddingAngle={3}
                        >
                          {spending.category_breakdown.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0B202A",
                            borderColor: "#133240",
                            borderRadius: "12px",
                            fontSize: "12px",
                            color: "#FFFFFF",
                          }}
                          formatter={(val: any) => [`₹${Number(val).toFixed(2)}`, "Spent"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-xs text-cliq-textMuted">
                    No category data available yet.
                  </div>
                )}
              </div>

              {/* Monthly Trend */}
              <div className="glass-panel p-6 rounded-2xl border-cliq-border">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-cliq-emerald" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {t.analytics.monthlyVelocity}
                  </h3>
                </div>

                {spending?.monthly_trend?.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={spending.monthly_trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#133240" />
                        <XAxis dataKey="month" stroke="#A9BBC5" fontSize={11} />
                        <YAxis stroke="#A9BBC5" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0B202A",
                            borderColor: "#133240",
                            borderRadius: "12px",
                            fontSize: "12px",
                            color: "#FFFFFF",
                          }}
                          formatter={(val: any) => [`₹${Number(val).toFixed(2)}`, "Amount"]}
                        />
                        <Bar dataKey="total_amount" name="Spend" fill="#00E5E5" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="rewards_earned" name="Rewards" fill="#00D69B" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-xs text-cliq-textMuted">
                    No monthly trend data recorded yet.
                  </div>
                )}
              </div>
            </div>

            {/* Top Merchants List */}
            {spending?.top_merchants?.length > 0 && (
              <div className="glass-panel p-6 rounded-2xl border-cliq-border">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                  Top Merchants by Volume
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {spending.top_merchants.map((m: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-cliq-surface/80 border border-cliq-border"
                    >
                      <div className="text-[10px] text-cliq-cyan font-bold">#{idx + 1}</div>
                      <div className="text-xs font-bold text-white truncate">{m.merchant_name}</div>
                      <div className="text-sm font-extrabold text-cliq-emerald mt-1">
                        ₹{Number(m.amount).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
