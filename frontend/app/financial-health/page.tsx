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
  Loader2,
} from "lucide-react";

export default function FinancialHealthPage() {
  const { t } = useLanguage();
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data: any = await apiFetch("/analytics/financial-health");
        setHealth(data);
      } catch (err) {
        console.error("Failed to load health report:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
  }, []);

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-[#040707]">
      <Sidebar />

      <main className="flex-1 p-5 sm:p-7 lg:p-9 max-w-7xl mx-auto w-full space-y-7">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white glow-emerald">
            Financial Health
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Credit efficiency auditing, subscription tracking, and fee justification
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
            <p className="text-xs text-slate-400 mt-2">Auditing financial metrics...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Score & Forecast Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Health Score Gauge */}
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.6)] flex flex-col justify-between items-center text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Health Index
                </span>

                <div className="relative my-4 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full border-4 border-emerald-500/20 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.25)]">
                    <span className="text-4xl font-black text-white glow-emerald">
                      {health?.health_score || 90}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{health?.optimization_efficiency_rate}% Efficiency Rate</span>
                </div>
              </div>

              {/* 30-Day Projections */}
              <div className="md:col-span-2 p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.6)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      30-Day Spending Forecast
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                        Estimated Outflow
                      </span>
                      <span className="text-2xl font-black text-white tracking-tight">
                        ₹{Number(health?.forecast_30d_spending || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                        Potential Rewards
                      </span>
                      <span className="text-2xl font-black text-emerald-400 glow-emerald tracking-tight">
                        ₹{Number(health?.forecast_30d_potential_rewards || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-4 border-t border-white/[0.06]">
                  Modeled on historical spending patterns and optimal category allocation.
                </div>
              </div>
            </div>

            {/* Actionable Recommendations */}
            {health?.actionable_recommendations?.length > 0 && (
              <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.6)] space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Optimization Recommendations
                  </h3>
                </div>

                <div className="space-y-2">
                  {health.actionable_recommendations.map((rec: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3 text-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span className="text-slate-300 leading-relaxed font-medium">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recurring Subscriptions Audit */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.6)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Subscriptions Tracked
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  {health?.recurring_subscriptions?.length || 0} Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {health?.recurring_subscriptions?.map((sub: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{sub.merchant_name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-emerald-400 font-semibold border border-white/10">
                        {sub.frequency}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500">Monthly:</span>
                      <span className="font-bold text-white">₹{Number(sub.average_amount).toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs border-t border-white/[0.06] pt-1">
                      <span className="text-slate-500">Annual Outflow:</span>
                      <span className="font-black text-emerald-400">
                        ₹{Number(sub.annual_cost).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Annual Fee Justification Audit */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.6)] space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Annual Fee Justification
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-white/[0.02] text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/[0.06]">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Card Name</th>
                      <th className="py-3 px-4 font-semibold text-right">Annual Fee</th>
                      <th className="py-3 px-4 font-semibold text-right">Rewards Earned</th>
                      <th className="py-3 px-4 font-semibold text-right">Net Value</th>
                      <th className="py-3 px-4 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {health?.annual_fee_audit?.map((item: any) => (
                      <tr key={item.card_id} className="hover:bg-white/[0.02]">
                        <td className="py-3.5 px-4 font-bold text-white">{item.card_name}</td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-400">
                          ₹{Number(item.annual_fee).toFixed(0)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                          ₹{Number(item.rewards_earned).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-white">
                          ₹{Number(item.net_profit).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {item.is_justified ? (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                              Justified
                            </span>
                          ) : (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                              Suboptimal
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
