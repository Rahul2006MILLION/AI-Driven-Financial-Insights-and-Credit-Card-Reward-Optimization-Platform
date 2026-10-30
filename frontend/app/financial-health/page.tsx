"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import {
  Activity,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  CreditCard,
  TrendingUp,
  ShieldAlert,
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
    <div className="flex-1 flex flex-col lg:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.health.title}
          </h1>
          <p className="text-xs text-cliq-textSecondary mt-1">
            {t.health.subtitle}
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-cliq-cyan mx-auto" />
            <p className="text-xs text-cliq-textSecondary mt-2">Auditing financial health...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Score & Forecast Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Health Score Gauge */}
              <div className="glass-panel p-6 rounded-2xl border-glow-cyan flex flex-col justify-between items-center text-center">
                <span className="text-xs font-bold text-cliq-textSecondary uppercase tracking-wider">
                  {t.health.score}
                </span>

                <div className="relative my-4 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full border-4 border-cliq-cyan/20 flex items-center justify-center shadow-neonCyan">
                    <span className="text-4xl font-extrabold text-white glow-cyan">
                      {health?.health_score || 90}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-cliq-emerald font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{health?.optimization_efficiency_rate}% Reward Efficiency</span>
                </div>
              </div>

              {/* 30-Day Projections */}
              <div className="md:col-span-2 glass-panel p-6 rounded-2xl border-cliq-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-cliq-emerald" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      {t.health.forecast}
                    </h3>
                  </div>
                  <p className="text-xs text-cliq-textSecondary">
                    Mathematical projections modeled via historical spending velocity and category allocations.
                  </p>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-4 rounded-xl bg-cliq-surface/80 border border-cliq-border">
                      <span className="text-[10px] text-cliq-textMuted uppercase block">
                        Estimated 30-Day Outflow
                      </span>
                      <span className="text-2xl font-extrabold text-white">
                        ₹{Number(health?.forecast_30d_spending || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-cliq-surface/80 border border-cliq-border">
                      <span className="text-[10px] text-cliq-textMuted uppercase block">
                        Achievable Optimal Rewards
                      </span>
                      <span className="text-2xl font-extrabold text-cliq-emerald glow-emerald">
                        ₹{Number(health?.forecast_30d_potential_rewards || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-cliq-textMuted pt-4 border-t border-cliq-border/60">
                  Estimates assume optimal card allocation across dining, utility, and retail categories.
                </div>
              </div>
            </div>

            {/* Actionable Recommendations */}
            <div className="glass-panel p-6 rounded-2xl border-cliq-border space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cliq-cyan" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {t.health.recommendations}
                </h3>
              </div>

              <div className="space-y-2">
                {health?.actionable_recommendations?.map((rec: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-cliq-surface border border-cliq-border flex items-start gap-3 text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-cliq-cyan mt-0.5 shrink-0" />
                    <span className="text-cliq-textSecondary leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recurring Subscriptions Audit */}
            <div className="glass-panel p-6 rounded-2xl border-cliq-border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cliq-turquoise" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {t.health.subscriptions}
                  </h3>
                </div>
                <span className="text-[11px] text-cliq-textSecondary">
                  {health?.recurring_subscriptions?.length || 0} Subscriptions Tracked
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {health?.recurring_subscriptions?.map((sub: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-cliq-surface/80 border border-cliq-border space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{sub.merchant_name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cliq-cyan/10 text-cliq-cyan font-semibold">
                        {sub.frequency}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-cliq-textMuted">Monthly:</span>
                      <span className="font-bold text-white">₹{Number(sub.average_amount).toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs border-t border-cliq-border/60 pt-1">
                      <span className="text-cliq-textMuted">Annual Cost:</span>
                      <span className="font-extrabold text-cliq-turquoise">
                        ₹{Number(sub.annual_cost).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Annual Fee Justification Audit */}
            <div className="glass-panel p-6 rounded-2xl border-cliq-border space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cliq-emerald" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {t.health.feeAudit}
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-cliq-bgSecondary/80 text-cliq-textMuted uppercase border-b border-cliq-border">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Card Name</th>
                      <th className="py-3 px-4 font-semibold text-right">Annual Fee</th>
                      <th className="py-3 px-4 font-semibold text-right">Rewards Earned</th>
                      <th className="py-3 px-4 font-semibold text-right">Net Value</th>
                      <th className="py-3 px-4 font-semibold text-center">Fee Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cliq-border/60">
                    {health?.annual_fee_audit?.map((item: any) => (
                      <tr key={item.card_id} className="hover:bg-cliq-surface/40">
                        <td className="py-3.5 px-4 font-bold text-white">{item.card_name}</td>
                        <td className="py-3.5 px-4 text-right font-medium text-cliq-textSecondary">
                          ₹{Number(item.annual_fee).toFixed(0)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-cliq-emerald">
                          ₹{Number(item.rewards_earned).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-white">
                          ₹{Number(item.net_profit).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {item.is_justified ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cliq-emerald/15 text-cliq-emerald font-bold">
                              Justified
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cliq-danger/15 text-cliq-danger font-bold">
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
