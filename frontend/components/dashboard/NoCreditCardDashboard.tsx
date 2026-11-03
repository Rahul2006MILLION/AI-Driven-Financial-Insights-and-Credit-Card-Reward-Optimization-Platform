"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useLanguage, fmt as fill, categoryLabel } from "@/lib/i18n";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import NumericInput from "@/components/NumericInput";
import {
  Wallet,
  TrendingUp,
  Receipt,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  ArrowRight,
  TrendingDown,
  Trash2,
} from "lucide-react";

/* ── Currency Formatter ────────────────────────────────────────── */
const fmt = (n: any) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

/* Category → 50/30/20 classification */
const NEEDS_CATS = new Set(["grocery", "utility", "transport", "fuel", "rent", "medical", "insurance", "emi"]);
const WANTS_CATS = new Set(["dining", "entertainment", "shopping", "travel", "subscriptions", "personal_care"]);
const SAVINGS_CATS = new Set(["savings", "investment", "fd", "sip"]);

function classifyCat(cat: string): "needs" | "wants" | "savings" | "other" {
  const c = (cat || "").toLowerCase();
  if (NEEDS_CATS.has(c)) return "needs";
  if (WANTS_CATS.has(c)) return "wants";
  if (SAVINGS_CATS.has(c)) return "savings";
  return "other";
}

/* ── Sample Data Generator ─────────────────────────────────────── */
async function seedNoCreditCardPortfolio(): Promise<void> {
  const tag = "[SAMPLE]";

  await apiFetch("/incomes", {
    method: "POST",
    body: JSON.stringify({
      source_name: "Primary Salary",
      amount: 40000,
      frequency: "MONTHLY",
      is_irregular: false,
      notes: `${tag} Monthly take-home salary`,
    }),
  });

  const expenses = [
    { merchant_name: "Rent & Society Maintenance", amount: 12000, category_id: "rent", payment_method: "BANK_TRANSFER" },
    { merchant_name: "D-Mart Grocery Store", amount: 5000, category_id: "grocery", payment_method: "UPI" },
    { merchant_name: "BESCOM Power & Utilities", amount: 2000, category_id: "utility", payment_method: "UPI" },
    { merchant_name: "Dining & Swiggy", amount: 3500, category_id: "dining", payment_method: "UPI" },
    { merchant_name: "Amazon Essentials", amount: 2500, category_id: "shopping", payment_method: "DEBIT_CARD" },
    { merchant_name: "Emergency Fund Deposit", amount: 5000, category_id: "savings", payment_method: "BANK_TRANSFER" },
  ];

  for (const exp of expenses) {
    await apiFetch("/transactions", {
      method: "POST",
      body: JSON.stringify({
        ...exp,
        card_id: null,
        notes: `${tag} Cash & Savings sample`,
      }),
    });
  }

  await apiFetch("/education/budget", {
    method: "PUT",
    body: JSON.stringify({
      monthly_income: 40000,
      category_budgets: {
        rent: 14000,
        grocery: 6000,
        utility: 3000,
        dining: 4500,
        shopping: 4000,
        savings: 8000,
      },
    }),
  });
}

async function clearSampleData(incomes: any[], transactions: any[]): Promise<void> {
  await Promise.all([
    ...incomes
      .filter((i) => i.notes?.includes("[SAMPLE]"))
      .map((i) => apiFetch(`/incomes/${i.id}`, { method: "DELETE" })),
    ...transactions
      .filter((t) => t.notes?.includes("[SAMPLE]"))
      .map((t) => apiFetch(`/transactions/${t.id}`, { method: "DELETE" })),
  ]);
}

/* ── Main Component ────────────────────────────────────────────── */
export default function NoCreditCardDashboard({ userName }: { userName?: string }) {
  const { t } = useLanguage();
  const router = useRouter();

  const [incomeSummary, setIncomeSummary] = useState<any>(null);
  const [budgetData, setBudgetData] = useState<any>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* Modal State for + Log Expense */
  const [showLogModal, setShowLogModal] = useState(false);
  const [expMerchant, setExpMerchant] = useState("");
  const [expAmount, setExpAmount] = useState<string | number>("");
  const [expCategory, setExpCategory] = useState("grocery");
  const [expMethod, setExpMethod] = useState("UPI");
  const [expSaving, setExpSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  /* Sample Portfolio */
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);

  const hasSampleData = [...incomes, ...transactions].some((r) => r.notes?.includes("[SAMPLE]"));

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [inc, bud, health, txns, incs] = await Promise.all([
        apiFetch<any>("/incomes/summary").catch(() => null),
        apiFetch<any>("/education/budget").catch(() => null),
        apiFetch<any>("/analytics/financial-health").catch(() => null),
        apiFetch<any[]>("/transactions?limit=50").catch(() => []),
        apiFetch<any[]>("/incomes").catch(() => []),
      ]);

      setIncomeSummary(inc);
      setBudgetData(bud);
      setHealthData(health);
      setTransactions(Array.isArray(txns) ? txns : []);
      setIncomes(Array.isArray(incs) ? incs : []);
    } catch (e: any) {
      setError(e.message || t.cashDashboard.loadFailed);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ── Calculations & Metrics ──────────────────────────────────── */
  const monthlyInflow = Number(incomeSummary?.total_monthly_income ?? 0);
  const totalIncomesRegistered = Number(incomeSummary?.income_sources_count ?? incomes.length);

  // Actual expenses this month
  const monthlyExpenses = Number(budgetData?.actual_spending_this_month ?? 
    transactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0)
  );
  const totalTransactionsCount = transactions.length;

  // Remaining Balance (Liquid Cash Surplus)
  const remainingBalance = Math.max(0, monthlyInflow - monthlyExpenses);

  // Savings rate
  const savingsRate = monthlyInflow > 0
    ? Math.min(100, Math.round((Math.max(0, monthlyInflow - monthlyExpenses) / monthlyInflow) * 100))
    : 0;

  // 50/30/20 Targets (Based on inflow, or default benchmark of ₹40,000 as seen in reference mock)
  const baselineInflow = monthlyInflow > 0 ? monthlyInflow : 40000;
  const targetBudget = monthlyInflow > 0 ? monthlyInflow : 40000;
  const needsTarget = Math.round(baselineInflow * 0.5); // 50%
  const wantsTarget = Math.round(baselineInflow * 0.3); // 30%
  const savingsTarget = Math.round(baselineInflow * 0.2); // 20%

  const budgetUtilPercent = targetBudget > 0 ? Math.min(100, Math.round((monthlyExpenses / targetBudget) * 100)) : 0;

  // Emergency Runway months
  // If user has monthly expenses, calculate months covered by liquid remaining; default/target is 3 Months
  const calculatedRunwayMonths = monthlyExpenses > 0
    ? Math.max(1, Math.min(12, Math.round((remainingBalance * 3) / monthlyExpenses)))
    : 3;

  /* ── Handlers ────────────────────────────────────────────────── */
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = typeof expAmount === "number" ? expAmount : parseFloat(expAmount);
    if (!expMerchant.trim() || isNaN(numAmt) || numAmt <= 0) return;

    setExpSaving(true);
    try {
      await apiFetch("/transactions", {
        method: "POST",
        body: JSON.stringify({
          merchant_name: expMerchant.trim(),
          amount: numAmt,
          category_id: expCategory,
          payment_method: expMethod,
          card_id: null, // Guaranteed null for Cash/UPI/Debit
        }),
      });

      setExpMerchant("");
      setExpAmount("");
      setShowLogModal(false);
      setStatusMsg({ text: t.cashDashboard.expenseLogged, type: "success" });
      setTimeout(() => setStatusMsg(null), 3000);
      await loadData();
    } catch (err: any) {
      setStatusMsg({ text: err.message || t.cashDashboard.expenseLogFailed, type: "error" });
    } finally {
      setExpSaving(false);
    }
  };

  const handleToggleSamplePortfolio = async () => {
    if (hasSampleData) {
      setClearing(true);
      try {
        await clearSampleData(incomes, transactions);
        setStatusMsg({ text: t.cashDashboard.sampleCleared, type: "success" });
        setTimeout(() => setStatusMsg(null), 3000);
        await loadData();
      } catch (err: any) {
        setStatusMsg({ text: err.message || t.cashDashboard.sampleClearFailed, type: "error" });
      } finally {
        setClearing(false);
      }
    } else {
      setSeeding(true);
      try {
        await seedNoCreditCardPortfolio();
        setStatusMsg({ text: t.cashDashboard.sampleLoaded, type: "success" });
        setTimeout(() => setStatusMsg(null), 3000);
        await loadData();
      } catch (err: any) {
        setStatusMsg({ text: err.message || t.cashDashboard.sampleLoadFailed, type: "error" });
      } finally {
        setSeeding(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-7 max-w-7xl mx-auto w-full">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold mb-2">
            {t.cashDashboard.pathwayBadge}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            {t.cashDashboard.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t.cashDashboard.subtitle}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleSamplePortfolio}
            disabled={seeding || clearing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-slate-300 font-semibold transition-all disabled:opacity-50"
          >
            {seeding || clearing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            ) : hasSampleData ? (
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{hasSampleData ? t.cashDashboard.clearSample : t.common.samplePortfolio}</span>
          </button>

          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full btn-fx bg-lime-400 hover:bg-lime-300 text-[#0E1013] font-bold text-xs shadow-[0_0_20px_rgba(76,192,63,0.35)] transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t.dashboard.logExpense}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMsg && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold border transition-all ${
            statusMsg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/25 text-rose-400"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* ── 4 Top Metric KPI Cards ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Monthly Inflow */}
        <div data-spotlight className="card-interactive rounded-2xl bg-[#17191E]/80 border border-white/[0.08] p-5 backdrop-blur-sm flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">{t.cashDashboard.monthlyInflow}</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tabular-nums tracking-tight mb-3">
            {fmt(monthlyInflow)}
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.04]">
            <span className="text-emerald-400 font-medium">{fill(t.cashDashboard.incomesRegistered, { count: totalIncomesRegistered })}</span>
            <Link href="/income" className="text-slate-400 hover:text-white transition-colors flex items-center gap-0.5">
              <span>{t.dashboard.manage}</span>
              <span>&gt;</span>
            </Link>
          </div>
        </div>

        {/* Card 2: Monthly Expenses */}
        <div data-spotlight className="card-interactive rounded-2xl bg-[#17191E]/80 border border-white/[0.08] p-5 backdrop-blur-sm flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">{t.cashDashboard.monthlyExpenses}</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Receipt className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tabular-nums tracking-tight mb-3">
            {fmt(monthlyExpenses)}
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.04]">
            <span className="text-emerald-400 font-medium">{fill(t.dashboard.transactionsCount, { count: totalTransactionsCount })}</span>
            <Link href="/transactions" className="text-slate-400 hover:text-white transition-colors flex items-center gap-0.5">
              <span>{t.cashDashboard.viewLog}</span>
              <span>&gt;</span>
            </Link>
          </div>
        </div>

        {/* Card 3: Remaining Balance */}
        <div data-spotlight className="card-interactive rounded-2xl bg-[#17191E]/80 border border-white/[0.08] p-5 backdrop-blur-sm flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">{t.cashDashboard.remainingBalance}</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tabular-nums tracking-tight mb-3">
            {fmt(remainingBalance)}
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.04]">
            <span className="text-emerald-400 font-medium">{t.cashDashboard.liquidSurplus}</span>
            <Link href="/budget" className="text-slate-400 hover:text-white transition-colors flex items-center gap-0.5">
              <span>{t.cashDashboard.plan}</span>
              <span>&gt;</span>
            </Link>
          </div>
        </div>

        {/* Card 4: Savings Rate */}
        <div data-spotlight className="card-interactive rounded-2xl bg-[#17191E]/80 border border-white/[0.08] p-5 backdrop-blur-sm flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-medium">{t.incomes.savingsRate}</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <PiggyBank className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 tabular-nums tracking-tight mb-3">
            {savingsRate}%
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.04]">
            <span className="text-slate-400 font-medium">{t.cashDashboard.target20Rule}</span>
            <Link href="/savings-goals" className="text-slate-400 hover:text-white transition-colors flex items-center gap-0.5">
              <span>{t.cashDashboard.goals}</span>
              <span>&gt;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Section: 2/3 and 1/3 Split ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3 Col: Budget Utilization & 50/30/20 Breakdown */}
        <div className="lg:col-span-2 rounded-2xl bg-[#17191E]/80 border border-white/[0.08] p-6 backdrop-blur-sm flex flex-col justify-between space-y-6">
          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white">
                  {t.cashDashboard.budgetBreakdown}
                </h2>
              </div>
              <Link
                href="/budget"
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors flex items-center gap-0.5"
              >
                <span>{t.cashDashboard.adjustLimits}</span>
                <span>&gt;</span>
              </Link>
            </div>

            {/* Spend Progress Bar */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300">
                  {fill(t.cashDashboard.monthlySpendOf, { spent: fmt(monthlyExpenses), budget: fmt(targetBudget) })}
                </span>
                <span className="text-emerald-400 font-bold">{fill(t.cashDashboard.percentUsed, { percent: budgetUtilPercent })}</span>
              </div>
              <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(76,192,63,0.5)] progress-anim"
                  style={{ width: `${Math.min(100, Math.max(budgetUtilPercent, monthlyExpenses > 0 ? 5 : 0))}%` }}
                />
              </div>
            </div>

            {/* 3 Subcards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Needs Subcard */}
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium">{t.cashDashboard.needsTarget}</span>
                  <div className="text-lg font-black text-white tabular-nums mt-1">
                    {fmt(needsTarget)}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-3">{t.cashDashboard.needsExamples}</p>
              </div>

              {/* Wants Subcard */}
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium">{t.cashDashboard.wantsTarget}</span>
                  <div className="text-lg font-black text-white tabular-nums mt-1">
                    {fmt(wantsTarget)}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-3">{t.cashDashboard.wantsExamples}</p>
              </div>

              {/* Savings Subcard */}
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium">{t.cashDashboard.savingsTarget}</span>
                  <div className="text-lg font-black text-emerald-400 tabular-nums mt-1">
                    {fmt(savingsTarget)}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-3">{t.cashDashboard.savingsExamples}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1/3 Col: Emergency Fund Buffer */}
        <div className="rounded-2xl bg-[#17191E]/80 border border-emerald-500/20 p-6 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">{t.cashDashboard.emergencyBuffer}</h2>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              {t.cashDashboard.runwayIntro}
            </p>

            {/* Runway Display Box */}
            <div className="rounded-xl bg-[#0B0D10] border border-white/[0.06] p-6 text-center mb-6">
              <div className="text-3xl font-black text-emerald-400 tabular-nums tracking-tight">
                {fill(t.cashDashboard.monthsCount, { count: calculatedRunwayMonths })}
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
                {t.cashDashboard.recommendedTarget}
              </p>
            </div>
          </div>

          {/* Action CTA Button */}
          <Link
            href="/emergency-fund"
            className="w-full py-2.5 rounded-full btn-fx bg-lime-400 hover:bg-lime-300 text-[#0E1013] font-bold text-xs text-center shadow-[0_0_20px_rgba(76,192,63,0.25)] hover:shadow-[0_0_25px_rgba(76,192,63,0.4)] transition-all block"
          >
            {t.cashDashboard.viewEmergencyShield}
          </Link>
        </div>
      </div>

      {/* ── Recent Expenses List (Non-card cash flow) ──────────────── */}
      {transactions.length > 0 && (
        <div className="rounded-2xl bg-[#17191E]/80 border border-white/[0.08] p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">{t.cashDashboard.recentExpenses}</h3>
            </div>
            <Link
              href="/transactions"
              className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <span>{t.cashDashboard.viewAll}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{tx.merchant_name}</p>
                    <p className="text-[11px] text-slate-500 capitalize">
                      {tx.category_id} · <span className="text-slate-400 font-mono text-[10px]">{tx.payment_method || "UPI"}</span>
                      {tx.notes?.includes("[SAMPLE]") && (
                        <span className="ml-1.5 px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-bold">
                          SAMPLE
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-sm font-bold text-white tabular-nums">
                  -{fmt(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Log Expense Modal ─────────────────────────────────────── */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#17191E] border border-white/[0.12] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative">
            <button
              onClick={() => setShowLogModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <Plus className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{t.cashDashboard.logModalTitle}</h3>
                <p className="text-[11px] text-slate-400">{t.cashDashboard.logModalSub}</p>
              </div>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t.cashDashboard.merchantRecipient}</label>
                <input
                  type="text"
                  required
                  value={expMerchant}
                  onChange={(e) => setExpMerchant(e.target.value)}
                  placeholder={t.cashDashboard.merchantPlaceholder}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t.incomes.amount}</label>
                <NumericInput
                  value={expAmount}
                  onChange={setExpAmount}
                  placeholder="0.00"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t.dashboard.category}</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full bg-[#17191E] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    {[
                      "grocery",
                      "dining",
                      "utility",
                      "transport",
                      "entertainment",
                      "shopping",
                      "medical",
                      "rent",
                      "savings",
                      "fuel",
                      "other",
                    ].map((c) => (
                      <option key={c} value={c}>
                        {categoryLabel(t, c)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t.dashboard.paymentMethod}</label>
                  <select
                    value={expMethod}
                    onChange={(e) => setExpMethod(e.target.value)}
                    className="w-full bg-[#17191E] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="UPI">{t.cashDashboard.methodUpiApps}</option>
                    <option value="DEBIT_CARD">{t.dashboard.methodDebitCard}</option>
                    <option value="BANK_TRANSFER">{t.cashDashboard.methodNetBanking}</option>
                    <option value="CASH">{t.dashboard.methodCash}</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-full border border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                >
                  {t.cards.cancel}
                </button>
                <button
                  type="submit"
                  disabled={expSaving}
                  className="px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(76,192,63,0.3)] disabled:opacity-50 transition-all"
                >
                  {expSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{t.cashDashboard.saveExpense}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
