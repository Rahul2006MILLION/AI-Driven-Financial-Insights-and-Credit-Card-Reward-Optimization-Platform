"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { apiFetch } from "@/lib/api";
import {
  Wallet, Plus, Trash2, Loader2, TrendingUp, AlertCircle, CheckCircle2,
} from "lucide-react";
import NumericInput from "@/components/NumericInput";

const FREQUENCY_LABELS: Record<string, string> = {
  MONTHLY: "Monthly",
  BI_WEEKLY: "Bi-Weekly",
  WEEKLY: "Weekly",
  IRREGULAR: "Irregular / Freelance",
  ONE_TIME: "One-Time",
};

export default function IncomePage() {
  const [incomes, setIncomes] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [sourceName, setSourceName] = useState("");
  const [amount, setAmount] = useState<string | number>("");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [notes, setNotes] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, sum] = await Promise.all([
        apiFetch<any[]>("/incomes"),
        apiFetch<any>("/incomes/summary"),
      ]);
      setIncomes(list);
      setSummary(sum);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceName || !amount) return;
    setSaving(true);
    try {
      await apiFetch("/incomes", {
        method: "POST",
        body: JSON.stringify({
          source_name: sourceName,
          amount: Number(amount),
          frequency,
          is_irregular: frequency === "IRREGULAR",
          notes: notes || undefined,
        }),
      });
      setSourceName(""); setAmount(""); setFrequency("MONTHLY"); setNotes("");
      setShowAdd(false);
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await apiFetch(`/incomes/${id}`, { method: "DELETE" });
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(null);
    }
  };

  const fmt = (n: any) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#0E1013]">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-5xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-3">
              <Wallet className="w-6 h-6 text-emerald-400" />
              My Income
            </h1>
            <p className="text-sm text-slate-400 mt-1">Track your salary, freelance, and other income streams.</p>
          </div>
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_20px_rgba(76,192,63,0.3)]"
          >
            <Plus className="w-4 h-4" />
            Add Income
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Summary strip */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Monthly Inflow",    value: fmt(summary.total_monthly_income), color: "text-emerald-400" },
              { label: "Regular Income",    value: fmt(summary.regular_income),        color: "text-lime-400" },
              { label: "Irregular Income",  value: fmt(summary.irregular_income),      color: "text-[#ADDC25]" },
              { label: "Income Sources",    value: summary.income_sources_count,       color: "text-white" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-4">
                <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Add income form */}
        {showAdd && (
          <form onSubmit={handleAdd} className="rounded-2xl bg-white/[0.03] border border-emerald-500/25 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Add Income Stream</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Source Name</label>
                <input
                  type="text"
                  required
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="e.g. Primary Salary"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Amount (₹)</label>
                <NumericInput
                  value={amount}
                  onChange={setAmount}
                  placeholder="e.g. 50000"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full bg-[#17191E] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-emerald-500 focus:outline-none"
                >
                  {Object.entries(FREQUENCY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Notes (optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Q1 bonus"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold disabled:opacity-50 transition-all"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Save Income
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Income list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          </div>
        ) : incomes.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <TrendingUp className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No income streams yet. Add your first one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {incomes.map((inc) => (
              <div
                key={inc.id}
                className="flex items-center justify-between rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 px-5 py-4 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{inc.source_name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {FREQUENCY_LABELS[inc.frequency] || inc.frequency}
                      {inc.notes && ` · ${inc.notes}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-400">{fmt(inc.amount)}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(inc.received_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(inc.id)}
                    disabled={deleting === inc.id}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    {deleting === inc.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {summary?.data_sufficiency_explanation && (
          <p className="text-xs text-slate-500 leading-relaxed border-t border-white/[0.05] pt-4">
            {summary.data_sufficiency_explanation}
          </p>
        )}
      </main>
    </div>
  );
}
