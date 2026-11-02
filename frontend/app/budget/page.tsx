"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import NumericInput from "@/components/NumericInput";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  Wallet,
  Coins,
  TrendingUp,
  Receipt,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  PieChart,
  ShieldCheck,
  ArrowRight,
  Loader2,
  DollarSign,
  Sparkles,
} from "lucide-react";

interface IncomeItem {
  id: string;
  source_name: string;
  amount: number;
  currency: string;
  frequency: string;
  is_irregular: boolean;
  received_date: string;
  expected_date?: string;
  notes?: string;
}

interface IncomeSummary {
  total_monthly_income: number;
  regular_income: number;
  irregular_income: number;
  rolling_90d_median_monthly_income?: number;
  income_sources_count: number;
  has_income_data: boolean;
  data_sufficiency_explanation: string;
}

interface UserBudgetData {
  monthly_income?: number;
  total_budget: number;
  category_budgets: Record<string, number>;
}

export default function BudgetPage() {
  const { t } = useLanguage();
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [summary, setSummary] = useState<IncomeSummary | null>(null);
  const [budget, setBudget] = useState<UserBudgetData | null>(null);
  const [spending, setSpending] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New Income form state
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [sourceName, setSourceName] = useState("");
  const [incomeAmount, setIncomeAmount] = useState<number | string>("50000");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [isIrregular, setIsIrregular] = useState(false);
  const [incomeNotes, setIncomeNotes] = useState("");
  const [submittingIncome, setSubmittingIncome] = useState(false);

  // Quick Expense form state
  const [expenseMerchant, setExpenseMerchant] = useState("");
  const [expenseAmount, setExpenseAmount] = useState<number | string>("");
  const [expenseCategory, setExpenseCategory] = useState("grocery");
  const [expenseMethod, setExpenseMethod] = useState("UPI");
  const [recordingExpense, setRecordingExpense] = useState(false);
  const [expenseSuccess, setExpenseSuccess] = useState(false);

  // Budget edit state
  const [editBudgetLimit, setEditBudgetLimit] = useState<number | string>("35000");
  const [savingBudget, setSavingBudget] = useState(false);
  const [budgetSavedToast, setBudgetSavedToast] = useState(false);

  // Category budget state — user-configurable
  const CATEGORIES = [
    { id: "grocery", label: "Groceries" },
    { id: "dining", label: "Dining & Food" },
    { id: "utility", label: "Bills & Utilities" },
    { id: "shopping", label: "Shopping" },
    { id: "travel", label: "Transport & Travel" },
    { id: "health", label: "Healthcare" },
    { id: "other", label: "General Expense" },
  ];
  const [categoryAllocations, setCategoryAllocations] = useState<Record<string, number>>({
    grocery: 35,
    dining: 15,
    utility: 20,
    shopping: 15,
    travel: 0,
    health: 0,
    other: 15,
  });
  const [showCategoryEdit, setShowCategoryEdit] = useState(false);

  const loadData = async () => {
    try {
      const [incList, incSum, bgtData, spdData]: any = await Promise.all([
        apiFetch("/incomes").catch(() => []),
        apiFetch("/incomes/summary").catch(() => null),
        apiFetch("/education/budget").catch(() => null),
        apiFetch("/analytics/spending").catch(() => null),
      ]);

      setIncomes(incList || []);
      setSummary(incSum);
      if (bgtData) {
        setBudget(bgtData);
        setEditBudgetLimit(bgtData.total_budget || 35000);
        // Load saved category allocations as percentages
        if (bgtData.category_budgets && bgtData.total_budget > 0) {
          const total = bgtData.total_budget;
          const loaded: Record<string, number> = {};
          for (const [cat, amt] of Object.entries(bgtData.category_budgets)) {
            loaded[cat] = Math.round((Number(amt) / Number(total)) * 100);
          }
          if (Object.keys(loaded).length > 0) {
            setCategoryAllocations((prev) => ({ ...prev, ...loaded }));
          }
        }
      }
      setSpending(spdData);
    } catch (err) {
      console.error("Budget page load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = typeof incomeAmount === "number" ? incomeAmount : parseFloat(incomeAmount);
    if (!sourceName.trim() || isNaN(numAmt) || numAmt <= 0) return;

    setSubmittingIncome(true);
    try {
      await apiFetch("/incomes", {
        method: "POST",
        body: JSON.stringify({
          source_name: sourceName.trim(),
          amount: numAmt,
          frequency,
          is_irregular: isIrregular,
          notes: incomeNotes.trim() || undefined,
        }),
      });

      setSourceName("");
      setIncomeNotes("");
      setShowAddIncome(false);
      await loadData();
    } catch (err) {
      console.error("Failed to add income:", err);
    } finally {
      setSubmittingIncome(false);
    }
  };

  const [deleteIncomeId, setDeleteIncomeId] = useState<string | null>(null);

  const handleDeleteIncome = (id: string) => {
    setDeleteIncomeId(id);
  };

  const confirmDeleteIncome = async () => {
    if (!deleteIncomeId) return;
    try {
      await apiFetch(`/incomes/${deleteIncomeId}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      console.error("Failed to delete income:", err);
    } finally {
      setDeleteIncomeId(null);
    }
  };

  const handleSaveBudget = async () => {
    const numBudget = typeof editBudgetLimit === "number" ? editBudgetLimit : parseFloat(editBudgetLimit);
    if (isNaN(numBudget) || numBudget <= 0) return;

    setSavingBudget(true);
    try {
      const totalInc = summary?.total_monthly_income || numBudget / 0.7;
      // Convert percentage allocations to absolute amounts
      const computedCategories: Record<string, number> = {};
      for (const [cat, pct] of Object.entries(categoryAllocations)) {
        if (pct > 0) {
          computedCategories[cat] = Math.round(numBudget * (pct / 100));
        }
      }
      await apiFetch("/education/budget", {
        method: "PUT",
        body: JSON.stringify({
          monthly_income: totalInc,
          total_budget: numBudget,
          category_budgets: computedCategories,
        }),
      });
      setBudgetSavedToast(true);
      setTimeout(() => setBudgetSavedToast(false), 3000);
      await loadData();
    } catch (err) {
      console.error("Failed to save budget:", err);
    } finally {
      setSavingBudget(false);
    }
  };

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = typeof expenseAmount === "number" ? expenseAmount : parseFloat(expenseAmount);
    if (!expenseMerchant.trim() || isNaN(numAmt) || numAmt <= 0) return;

    setRecordingExpense(true);
    try {
      await apiFetch("/transactions", {
        method: "POST",
        body: JSON.stringify({
          merchant_name: expenseMerchant.trim(),
          amount: numAmt,
          category_id: expenseCategory,
          payment_method: expenseMethod,
          card_id: null,
        }),
      });
      setExpenseMerchant("");
      setExpenseAmount("");
      setExpenseSuccess(true);
      setTimeout(() => setExpenseSuccess(false), 3000);
      await loadData();
    } catch (err) {
      console.error("Failed to record expense:", err);
    } finally {
      setRecordingExpense(false);
    }
  };

  const monthlyInflow = summary?.total_monthly_income || 0;
  const monthlyOutflow = spending?.total_spending || 0;
  const netCashFlow = monthlyInflow - monthlyOutflow;
  const savingsRate = monthlyInflow > 0 ? Math.round((netCashFlow / monthlyInflow) * 100) : 0;
  const budgetLimit = budget?.total_budget || 35000;
  const budgetUtilization = budgetLimit > 0 ? Math.min(100, Math.round((monthlyOutflow / budgetLimit) * 100)) : 0;

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-[#0E1013]">
      <Sidebar />

      <main className="flex-1 p-5 sm:p-7 lg:p-9 max-w-7xl mx-auto w-full space-y-7">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white ">
              {t.incomes.title}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.incomes.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddIncome(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-lime-400 hover:bg-lime-300 text-[#0E1013] font-semibold text-xs shadow-neonLime transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.incomes.addIncome}</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
            <p className="text-xs text-slate-400 mt-2">{t.incomes.loadingData}</p>
          </div>
        ) : (
          <>
            {/* 4 Metric Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Monthly Inflow */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_12px_36px_0_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">{t.incomes.totalMonthlyInflow}</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Wallet className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white mt-3 tracking-tight">
                  ₹{monthlyInflow.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                  <span className="text-emerald-400">
                    {incomes.length} {t.incomes.activeStreams}
                  </span>
                  {summary?.rolling_90d_median_monthly_income ? (
                    <span className="text-slate-500 text-[10px]">{t.incomes.rollingMedian}</span>
                  ) : null}
                </div>
              </div>

              {/* Monthly Outflow */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_12px_36px_0_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">{t.incomes.recordedOutflow}</span>
                  <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Receipt className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white mt-3 tracking-tight">
                  ₹{monthlyOutflow.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                  <span className="text-teal-400">
                    {spending?.total_transactions || 0} {t.incomes.transactionsCount}
                  </span>
                  <span className="text-slate-500">{t.incomes.nonCardAndCard}</span>
                </div>
              </div>

              {/* Net Cash Flow */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_12px_36px_0_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">{t.incomes.netCashFlow}</span>
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className={`text-3xl font-black mt-3 tracking-tight ${netCashFlow >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {netCashFlow >= 0 ? "+" : ""}₹{netCashFlow.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                  <span>{netCashFlow >= 0 ? t.incomes.surplusRetained : t.incomes.deficitAlert}</span>
                  <span className="text-slate-500 text-[10px]">{t.incomes.monthlyNet}</span>
                </div>
              </div>

              {/* Savings Rate */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_12px_36px_0_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">{t.incomes.savingsRate}</span>
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Coins className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white mt-3 tracking-tight">
                  {savingsRate}%
                </div>
                <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                  <span className={savingsRate >= 20 ? "text-emerald-400" : "text-amber-400"}>
                    {savingsRate >= 20 ? t.incomes.healthyRate : t.incomes.targetRate}
                  </span>
                  <span className="text-slate-500">{t.incomes.rule503020}</span>
                </div>
              </div>
            </div>

            {/* Budget Adherence Progress Bar */}
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_12px_36px_0_rgba(0,0,0,0.5)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-emerald-400" />
                    {t.incomes.spendingDiscipline}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t.incomes.targetMonthlyLimit}: ₹{budgetLimit.toLocaleString("en-IN")} | {t.incomes.spent}: ₹{monthlyOutflow.toLocaleString("en-IN")} ({budgetUtilization}%)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editBudgetLimit}
                    onChange={(e) => setEditBudgetLimit(e.target.value)}
                    className="w-32 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="New limit"
                  />
                  <button
                    onClick={handleSaveBudget}
                    disabled={savingBudget}
                    className="px-3 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-[#0E1013] font-bold text-xs transition-all"
                  >
                    {savingBudget ? t.incomes.savingLimit : t.incomes.updateLimit}
                  </button>
                </div>
              </div>

              {budgetSavedToast && (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {t.incomes.budgetUpdatedSuccess}
                </div>
              )}

              {/* Progress bar */}
              <div className="w-full bg-white/[0.06] rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    budgetUtilization > 90
                      ? "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                      : budgetUtilization > 75
                      ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                      : "bg-emerald-500 shadow-[0_0_12px_rgba(76,192,63,0.4)]"
                  }`}
                  style={{ width: `${Math.min(100, budgetUtilization)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>₹0</span>
                <span>50% (Needs)</span>
                <span>80% (Threshold Warning)</span>
                <span>₹{budgetLimit.toLocaleString("en-IN")}</span>
              </div>

              {/* Category Allocation Editor */}
              <div className="pt-3 border-t border-white/[0.06]">
                <button
                  onClick={() => setShowCategoryEdit(!showCategoryEdit)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                >
                  {showCategoryEdit ? "▲ Hide category allocations" : "▼ Edit category allocations"}
                </button>
                {showCategoryEdit && (
                  <div className="mt-3 space-y-2">
                    <p className="text-[11px] text-slate-400">
                      Set the % of your budget for each category. Total shown below.
                    </p>
                    {CATEGORIES.map((cat) => (
                      <div key={cat.id} className="flex items-center gap-3">
                        <span className="text-xs text-slate-300 w-32 shrink-0">{cat.label}</span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={categoryAllocations[cat.id] ?? 0}
                          onChange={(e) =>
                            setCategoryAllocations((prev) => ({
                              ...prev,
                              [cat.id]: Number(e.target.value),
                            }))
                          }
                          className="flex-1 accent-emerald-500"
                        />
                        <span className="text-xs text-white w-10 text-right font-semibold">
                          {categoryAllocations[cat.id] ?? 0}%
                        </span>
                        <span className="text-[11px] text-slate-500 w-20 text-right">
                          ₹{Math.round(Number(editBudgetLimit || 0) * ((categoryAllocations[cat.id] ?? 0) / 100)).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                    <div className={`text-xs font-semibold mt-1 ${Object.values(categoryAllocations).reduce((s, v) => s + v, 0) > 100 ? "text-rose-400" : "text-slate-400"}`}>
                      Total: {Object.values(categoryAllocations).reduce((s, v) => s + v, 0)}%
                      {Object.values(categoryAllocations).reduce((s, v) => s + v, 0) > 100 && " — exceeds 100%"}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Two Column Layout: Income Streams (Left) + Quick Expense & Payment Breakdown (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Income Streams List (2 cols) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    {t.incomes.activeIncomeStreams}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {incomes.length} {t.incomes.sourcesRegistered}
                  </span>
                </div>

                {/* Income Stream Items */}
                {incomes.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] text-center space-y-3">
                    <Coins className="w-10 h-10 text-slate-600 mx-auto" />
                    <h4 className="text-sm font-bold text-white">{t.incomes.noIncomeAdded}</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      {t.incomes.noIncomeDesc}
                    </p>
                    <button
                      onClick={() => setShowAddIncome(true)}
                      className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-[#0E1013] font-bold text-xs"
                    >
                      {t.incomes.addFirstIncome}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {incomes.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md flex items-center justify-between gap-4 hover:border-emerald-500/30 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <Wallet className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white">{item.source_name}</h4>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  item.is_irregular
                                    ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                                    : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                }`}
                              >
                                {item.is_irregular
                                  ? t.incomes.irregularVariable
                                  : item.frequency === "ONE_TIME"
                                  ? t.incomes.oneTime
                                  : item.frequency}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {item.received_date ? new Date(item.received_date).toLocaleDateString() : "Recurring"}
                              {item.notes ? ` • ${item.notes}` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <div className="text-base font-black text-white">
                              ₹{Number(item.amount).toLocaleString("en-IN")}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {item.frequency === "ONE_TIME" ? t.incomes.oneTimeEntry : t.incomes.perCycle}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteIncome(item.id)}
                            className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete income"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Modal: Add Income */}
                {showAddIncome && (
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-[#17191E] to-[#081512] border border-emerald-500/30 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Plus className="w-4 h-4 text-emerald-400" />
                        {t.incomes.recordNewIncome}
                      </h4>
                      <button
                        onClick={() => setShowAddIncome(false)}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        {t.incomes.cancel}
                      </button>
                    </div>

                    <form onSubmit={handleCreateIncome} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            {t.incomes.sourceName}
                          </label>
                          <input
                            type="text"
                            value={sourceName}
                            onChange={(e) => setSourceName(e.target.value)}
                            placeholder={t.incomes.sourcePlaceholder}
                            className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-emerald-500 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            {t.incomes.amount}
                          </label>
                          <input
                            type="number"
                            value={incomeAmount}
                            onChange={(e) => setIncomeAmount(e.target.value)}
                            placeholder="50000"
                            className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-emerald-500 focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            {t.incomes.cadenceFrequency}
                          </label>
                          <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-[#17191E] border border-white/10 text-white text-xs focus:border-emerald-500 focus:outline-none"
                          >
                            <option value="MONTHLY">{t.incomes.monthly}</option>
                            <option value="BI_WEEKLY">{t.incomes.biWeekly}</option>
                            <option value="WEEKLY">{t.incomes.weekly}</option>
                            <option value="IRREGULAR">{t.incomes.irregular}</option>
                            <option value="ONE_TIME">{t.incomes.oneTime}</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2 pt-6">
                          <input
                            type="checkbox"
                            id="irregularCheckbox"
                            checked={isIrregular}
                            onChange={(e) => setIsIrregular(e.target.checked)}
                            className="rounded border-white/10 text-emerald-500 focus:ring-0"
                          />
                          <label htmlFor="irregularCheckbox" className="text-xs text-slate-300 cursor-pointer">
                            {t.incomes.variableStream}
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          {t.incomes.notesOptional}
                        </label>
                        <input
                          type="text"
                          value={incomeNotes}
                          onChange={(e) => setIncomeNotes(e.target.value)}
                          placeholder={t.incomes.notesPlaceholder}
                          className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddIncome(false)}
                          className="px-4 py-2 rounded-xl bg-white/[0.04] text-slate-400 hover:text-white text-xs"
                        >
                          {t.incomes.cancel}
                        </button>
                        <button
                          type="submit"
                          disabled={submittingIncome}
                          className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-[#0E1013] font-bold text-xs shadow-neonLime transition-all flex items-center gap-1.5"
                        >
                          {submittingIncome ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                          <span>{submittingIncome ? t.incomes.saving : t.incomes.saveIncome}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Right Column: Quick Non-Card Expense & Payment Method Breakdown */}
              <div className="space-y-6">
                {/* Quick Non-Card Expense Recording */}
                <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_12px_36px_0_rgba(0,0,0,0.5)] space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-400" />
                    {t.incomes.recordQuickExpense}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {t.incomes.quickExpenseDesc}
                  </p>

                  {expenseSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      {t.incomes.expenseLoggedSuccess}
                    </div>
                  )}

                  <form onSubmit={handleRecordExpense} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        {t.incomes.merchantDesc}
                      </label>
                      <input
                        type="text"
                        value={expenseMerchant}
                        onChange={(e) => setExpenseMerchant(e.target.value)}
                        placeholder={t.incomes.merchantPlaceholder}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-emerald-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          {t.incomes.amount}
                        </label>
                        <input
                          type="number"
                          value={expenseAmount}
                          onChange={(e) => setExpenseAmount(e.target.value)}
                          placeholder="150"
                          className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-emerald-500 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          {t.incomes.method}
                        </label>
                        <select
                          value={expenseMethod}
                          onChange={(e) => setExpenseMethod(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#17191E] border border-white/10 text-white text-xs focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="UPI">UPI</option>
                          <option value="CASH">Cash</option>
                          <option value="BANK_TRANSFER">Bank Transfer</option>
                          <option value="DEBIT_CARD">Debit Card</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        {t.incomes.category}
                      </label>
                      <select
                        value={expenseCategory}
                        onChange={(e) => setExpenseCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#17191E] border border-white/10 text-white text-xs focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="grocery">Groceries</option>
                        <option value="dining">Dining & Food</option>
                        <option value="utility">Bills & Utilities</option>
                        <option value="travel">Transport & Travel</option>
                        <option value="shopping">Shopping</option>
                        <option value="health">Healthcare</option>
                        <option value="other">General Expense</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={recordingExpense}
                      className="w-full py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-[#0E1013] font-bold text-xs shadow-[0_0_15px_rgba(76,192,63,0.25)] transition-all flex items-center justify-center gap-1.5"
                    >
                      {recordingExpense ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{t.incomes.recordExpense}</span>
                    </button>
                  </form>
                </div>

                {/* Payment Method Breakdown Widget */}
                {spending?.payment_method_breakdown && spending.payment_method_breakdown.length > 0 && (
                  <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_12px_36px_0_rgba(0,0,0,0.5)] space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {t.incomes.paymentMethodBreakdown}
                    </h3>
                    <div className="space-y-2">
                      {spending.payment_method_breakdown.map((pm: any) => (
                        <div key={pm.payment_method} className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium">{pm.payment_method}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">₹{Number(pm.total_amount).toLocaleString("en-IN")}</span>
                            <span className="text-[10px] text-slate-500">({pm.percentage_of_total}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {deleteIncomeId && (
        <ConfirmDialog
          title="Delete Income Source"
          message={t.incomes.deleteConfirm}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={confirmDeleteIncome}
          onCancel={() => setDeleteIncomeId(null)}
        />
      )}
    </div>
  );
}

