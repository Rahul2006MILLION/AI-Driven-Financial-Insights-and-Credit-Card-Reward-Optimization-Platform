"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Repeat, Loader2, AlertCircle, TrendingDown, Info, ArrowRight } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

const fmt = (n: any) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

/* Categories that typically contain recurring bills/subscriptions */
const RECURRING_CATS = new Set(["subscriptions", "utility", "insurance", "emi", "rent"]);

export default function SubscriptionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch more transactions to surface recurring ones
      const txns = await apiFetch<any[]>("/transactions?limit=200");
      setTransactions(Array.isArray(txns) ? txns : []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Identify recurring transactions ───────────────────────── */
  // Primary: transactions marked is_recurring by backend
  // Secondary: transactions in recurring-adjacent categories
  const markedRecurring = transactions.filter((t) => t.is_recurring === true);
  const categoryRecurring = transactions.filter(
    (t) => !t.is_recurring && RECURRING_CATS.has((t.category_id ?? "").toLowerCase())
  );

  // Deduplicate by (merchant_name, category_id) — keep latest per merchant for category group
  const seenMerchants = new Set<string>();
  const uniqueCategoryRecurring: typeof transactions = [];
  for (const t of categoryRecurring) {
    const key = `${t.merchant_name}__${t.category_id}`;
    if (!seenMerchants.has(key)) {
      seenMerchants.add(key);
      uniqueCategoryRecurring.push(t);
    }
  }

  const allRecurring = [...markedRecurring, ...uniqueCategoryRecurring];
  const totalMonthly = allRecurring.reduce((s, t) => s + Number(t.amount ?? 0), 0);

  /* Group by category */
  const byCategory: Record<string, typeof transactions> = {};
  for (const t of allRecurring) {
    const cat = t.category_id ?? "other";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(t);
  }

  const categoryOrder = ["subscriptions", "utility", "insurance", "emi", "rent", "other"];
  const sortedCategories = [
    ...categoryOrder.filter((c) => byCategory[c]),
    ...Object.keys(byCategory).filter((c) => !categoryOrder.includes(c)),
  ];

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] bg-[#040707] items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#040707]">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-3xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-3">
              <Repeat className="w-6 h-6 text-[#00C8AE]" />
              Subscriptions &amp; Bills
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Recurring expenses — subscriptions, utilities, insurance, EMIs, and rent.
            </p>
          </div>
          <Link href="/transactions"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-semibold transition-all"
          >
            All Transactions <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        {/* Monthly total */}
        {allRecurring.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Recurring Entries", value: String(allRecurring.length), color: "text-white" },
              { label: "Monthly Commitment",  value: fmt(totalMonthly),           color: "text-rose-300" },
              { label: "Categories",           value: String(sortedCategories.length), color: "text-[#00C8AE]" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-4">
                <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* How detection works */}
        <div className="flex items-start gap-2 rounded-xl bg-white/[0.02] border border-white/[0.06] px-4 py-3">
          <Info className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Showing transactions marked as recurring by the system, plus the latest entry from subscriptions, utilities, insurance, EMI, and rent categories.{" "}
            <Link href="/transactions" className="text-emerald-400 hover:underline">Log transactions →</Link>
          </p>
        </div>

        {/* Grouped list */}
        {allRecurring.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <Repeat className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400 mb-1">No recurring transactions found.</p>
            <p className="text-xs text-slate-600 mb-4">
              Log expenses in subscriptions, utility, insurance, EMI, or rent categories to see them here.
            </p>
            <Link href="/transactions"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all"
            >
              Log a Transaction
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedCategories.map((cat) => {
              const group = byCategory[cat];
              const groupTotal = group.reduce((s, t) => s + Number(t.amount ?? 0), 0);
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {cat.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{fmt(groupTotal)}/mo</span>
                  </div>
                  <div className="space-y-2">
                    {group.map((t) => (
                      <div key={t.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 px-4 py-3 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#00C8AE]/10 border border-[#00C8AE]/20 flex items-center justify-center">
                            <Repeat className="w-3.5 h-3.5 text-[#00C8AE]" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">{t.merchant_name}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {t.is_recurring ? "Marked recurring" : `${cat} category`}
                              {t.notes?.includes("[SAMPLE]") && (
                                <span className="ml-1 px-1 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[9px] font-bold">SAMPLE</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-rose-400 tabular-nums">{fmt(t.amount)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {allRecurring.length > 0 && (
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">Total monthly commitment</span>
              <span className="text-lg font-black text-rose-400 tabular-nums">{fmt(totalMonthly)}</span>
            </div>
          </div>
        )}

        <p className="text-[10px] text-slate-600 border-t border-white/[0.05] pt-4 leading-relaxed">
          Recurring detection is based on transaction categories and backend flags. For accurate tracking, categorize expenses correctly when logging them.
        </p>
      </main>
    </div>
  );
}
