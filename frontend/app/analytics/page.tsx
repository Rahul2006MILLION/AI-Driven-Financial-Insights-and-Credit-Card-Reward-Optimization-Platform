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
} from "lucide-react";

const COLORS = ["#10B981", "#34D399", "#14B8A6", "#059669", "#6EE7B7", "#0D9488", "#2DD4BF"];

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
    <div className="flex-1 flex flex-col lg:flex-row bg-[#040707]">
      <Sidebar />

      <main className="flex-1 p-5 sm:p-7 lg:p-9 max-w-7xl mx-auto w-full space-y-7">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white glow-emerald">
            Spending Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Category distributions, reward yields, and spend velocity
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
            <p className="text-xs text-slate-400 mt-2">Computing analytics...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_12px_36px_0_rgba(0,0,0,0.5)]">
                <span className="text-xs text-slate-400 font-medium">
                  Total Spending Tracked
                </span>
                <div className="text-3xl font-black text-white mt-2 tracking-tight">
                  ₹{spending ? Number(spending.total_spending).toFixed(2) : "0.00"}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Across {spending?.total_transactions || 0} purchases
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_12px_36px_0_rgba(0,0,0,0.5)]">
                <span className="text-xs text-slate-400 font-medium">
                  Realized Rewards
                </span>
                <div className="text-3xl font-black text-emerald-400 glow-emerald mt-2 tracking-tight">
                  ₹{rewards ? Number(rewards.total_rewards_earned).toFixed(2) : "0.00"}
                </div>
                <div className="text-[11px] text-emerald-400 mt-1 font-semibold">
                  {rewards ? `${Number(rewards.optimization_efficiency_rate).toFixed(1)}% Efficiency` : ""}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_12px_36px_0_rgba(0,0,0,0.5)]">
                <span className="text-xs text-slate-400 font-medium">
                  Avoidable Reward Leakage
                </span>
                <div className="text-3xl font-black text-rose-400 mt-2 tracking-tight">
                  ₹{rewards ? Number(rewards.reward_leakage_amount).toFixed(2) : "0.00"}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Suboptimal card selection
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-2 mb-4">
                  <PieIcon className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Spend by Category
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
                            backgroundColor: "#06100C",
                            borderColor: "rgba(255, 255, 255, 0.1)",
                            borderRadius: "16px",
                            fontSize: "12px",
                            color: "#FFFFFF",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
                          }}
                          formatter={(val: any) => [`₹${Number(val).toFixed(2)}`, "Spent"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-xs text-slate-500">
                    No category data available.
                  </div>
                )}
              </div>

              {/* Monthly Trend */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Monthly Velocity
                  </h3>
                </div>

                {spending?.monthly_trend?.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={spending.monthly_trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                        <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                        <YAxis stroke="#64748B" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#06100C",
                            borderColor: "rgba(255, 255, 255, 0.1)",
                            borderRadius: "16px",
                            fontSize: "12px",
                            color: "#FFFFFF",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
                          }}
                          formatter={(val: any) => [`₹${Number(val).toFixed(2)}`, "Amount"]}
                        />
                        <Bar dataKey="total_amount" name="Spend" fill="#34D399" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="rewards_earned" name="Rewards" fill="#10B981" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-xs text-slate-500">
                    No monthly trend data recorded.
                  </div>
                )}
              </div>
            </div>

            {/* Top Merchants List */}
            {spending?.top_merchants?.length > 0 && (
              <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.6)]">
                <h3 className="text-sm font-bold text-white tracking-wide mb-4">
                  Top Merchants by Volume
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {spending.top_merchants.map((m: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
                    >
                      <div className="text-[10px] text-emerald-400 font-bold">#{idx + 1}</div>
                      <div className="text-xs font-bold text-white truncate mt-0.5">{m.merchant_name}</div>
                      <div className="text-sm font-black text-emerald-400 mt-1">
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
