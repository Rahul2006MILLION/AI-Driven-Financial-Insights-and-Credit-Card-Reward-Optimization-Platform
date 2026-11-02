"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Target, Plus, Trash2, Loader2, AlertCircle, CheckCircle2, TrendingUp, Info } from "lucide-react";
import NumericInput from "@/components/NumericInput";
import { apiFetch } from "@/lib/api";

/* ── Types ─────────────────────────────────────────────────────── */
interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  createdAt: string;
}

/* ── localStorage persistence ───────────────────────────────────── */
const STORAGE_KEY = "cliq_savings_goals";

function loadGoals(): SavingsGoal[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveGoals(goals: SavingsGoal[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

const fmt = (n: any) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

export default function SavingsGoalsPage() {
  const [goals,       setGoals]       = useState<SavingsGoal[]>([]);
  const [incomeSummary, setIncomeSummary] = useState<any>(null);
  const [showAdd,     setShowAdd]     = useState(false);
  const [name,        setName]        = useState("");
  const [target,      setTarget]      = useState<string | number>("");
  const [current,     setCurrent]     = useState<string | number>("");
  const [deadline,    setDeadline]    = useState("");

  /* Contribution form */
  const [contributeId,  setContributeId]  = useState<string | null>(null);
  const [contribAmt,    setContribAmt]    = useState<string | number>("");
  const [loadingIncome, setLoadingIncome] = useState(true);

  useEffect(() => {
    setGoals(loadGoals());
    apiFetch<any>("/incomes/summary")
      .then(setIncomeSummary)
      .catch(() => null)
      .finally(() => setLoadingIncome(false));
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !target) return;
    const newGoal: SavingsGoal = {
      id: `goal_${Date.now()}`,
      name,
      targetAmount: Number(target),
      currentAmount: Number(current) || 0,
      deadline: deadline || undefined,
      createdAt: new Date().toISOString(),
    };
    const updated = [...goals, newGoal];
    setGoals(updated);
    saveGoals(updated);
    setName(""); setTarget(""); setCurrent(""); setDeadline("");
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    saveGoals(updated);
  };

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeId || !contribAmt) return;
    const updated = goals.map((g) =>
      g.id === contributeId
        ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + Number(contribAmt)) }
        : g
    );
    setGoals(updated);
    saveGoals(updated);
    setContributeId(null);
    setContribAmt("");
  };

  const totalTarget  = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved   = goals.reduce((s, g) => s + g.currentAmount, 0);
  const monthlyInflow = Number(incomeSummary?.total_monthly_income ?? 0);
  const savingsCapacity = monthlyInflow * 0.20; // 20% rule suggestion

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#0E1013]">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-4xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-3">
              <Target className="w-6 h-6 text-lime-400" />
              Savings Goals
            </h1>
            <p className="text-sm text-slate-400 mt-1">Set milestones and track progress toward your financial targets.</p>
          </div>
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-lime-500 hover:bg-lime-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_20px_rgba(132,204,22,0.25)]"
          >
            <Plus className="w-4 h-4" /> New Goal
          </button>
        </div>

        {/* Summary strip */}
        {goals.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Goals",         value: String(goals.length),   color: "text-white"       },
              { label: "Total Target",  value: fmt(totalTarget),        color: "text-lime-300"    },
              { label: "Total Saved",   value: fmt(totalSaved),         color: "text-emerald-400" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-4">
                <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Income-based suggestion */}
        {!loadingIncome && monthlyInflow > 0 && (
          <div className="flex items-start gap-3 rounded-xl bg-lime-500/8 border border-lime-500/20 px-4 py-3">
            <Info className="w-3.5 h-3.5 text-lime-400 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-300 leading-relaxed">
              Based on your monthly income of <span className="text-lime-400 font-semibold">{fmt(monthlyInflow)}</span>, the 20% savings rule suggests saving{" "}
              <span className="text-lime-400 font-semibold">{fmt(savingsCapacity)}/month</span> toward your goals.
            </p>
          </div>
        )}

        {/* Add goal form */}
        {showAdd && (
          <form onSubmit={handleAdd} className="rounded-2xl bg-white/[0.03] border border-lime-500/25 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">New Savings Goal</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Goal Name</label>
                <input
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Emergency Fund, Trip to Goa"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-lime-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Target Amount (₹)</label>
                <NumericInput value={target} onChange={setTarget} placeholder="e.g. 100000"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-lime-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Current Savings (₹) — optional</label>
                <NumericInput value={current} onChange={setCurrent} placeholder="0"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-lime-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Target Date — optional</label>
                <input
                  type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-lime-500 focus:outline-none"
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-lime-500 hover:bg-lime-400 text-slate-950 text-xs font-bold transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Create Goal
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="text-xs text-slate-400 hover:text-white transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Contribute form */}
        {contributeId && (
          <form onSubmit={handleContribute} className="rounded-2xl bg-white/[0.03] border border-emerald-500/25 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Add Contribution</h3>
              <button type="button" onClick={() => { setContributeId(null); setContribAmt(""); }} className="text-xs text-slate-400 hover:text-white">Cancel</button>
            </div>
            <p className="text-xs text-slate-400">
              Goal: <span className="text-white font-semibold">{goals.find((g) => g.id === contributeId)?.name}</span>
            </p>
            <div className="flex gap-3">
              <NumericInput value={contribAmt} onChange={setContribAmt} placeholder="Amount (₹)"
                className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
              <button type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all"
              >
                <TrendingUp className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </form>
        )}

        {/* Goal cards */}
        {goals.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <Target className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400 mb-1">No savings goals yet.</p>
            <p className="text-xs text-slate-600">Create your first goal to start tracking your progress.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
              const remaining = goal.targetAmount - goal.currentAmount;
              const isComplete = goal.currentAmount >= goal.targetAmount;

              let monthsLeft: number | null = null;
              if (goal.deadline) {
                const diff = new Date(goal.deadline).getTime() - Date.now();
                monthsLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24 * 30)));
              }
              const monthlyNeeded = monthsLeft && monthsLeft > 0 && remaining > 0
                ? remaining / monthsLeft
                : null;

              return (
                <div key={goal.id} data-spotlight className="card-interactive rounded-2xl bg-white/[0.03] border border-white/[0.07] p-5 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${isComplete ? "bg-emerald-500/15 border-emerald-500/25" : "bg-lime-500/10 border-lime-500/20"}`}>
                        {isComplete ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Target className="w-4 h-4 text-lime-400" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{goal.name}</div>
                        {goal.deadline && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Target date: {new Date(goal.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            {monthsLeft !== null && monthsLeft > 0 && ` · ${monthsLeft}mo left`}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{fmt(goal.currentAmount)} saved</span>
                      <span className={`font-bold ${isComplete ? "text-emerald-400" : "text-lime-400"}`}>{pct}%</span>
                    </div>
                    <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full progress-anim ${isComplete ? "bg-emerald-500" : "bg-lime-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>{fmt(goal.currentAmount)} / {fmt(goal.targetAmount)}</span>
                      {!isComplete && <span>{fmt(remaining)} remaining</span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {monthlyNeeded && !isComplete ? (
                      <span className="text-[10px] text-slate-500">
                        {fmt(monthlyNeeded)}/month needed to hit deadline
                      </span>
                    ) : isComplete ? (
                      <span className="text-[10px] text-emerald-400 font-semibold">Goal achieved!</span>
                    ) : (
                      <span />
                    )}
                    {!isComplete && (
                      <button
                        onClick={() => { setContributeId(goal.id); setContribAmt(""); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lime-500/10 hover:bg-lime-500/20 border border-lime-500/20 text-lime-400 text-[10px] font-semibold transition-all"
                      >
                        <Plus className="w-3 h-3" /> Add savings
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-[10px] text-slate-600 border-t border-white/[0.05] pt-4 leading-relaxed">
          Savings goals are stored locally in your browser. They reflect amounts you manually track here, not your account balances. Connect your income and transactions for richer insights.
        </p>
      </main>
    </div>
  );
}
