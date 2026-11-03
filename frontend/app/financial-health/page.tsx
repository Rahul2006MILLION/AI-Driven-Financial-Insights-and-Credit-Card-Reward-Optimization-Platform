"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage, fmt as fill } from "@/lib/i18n";
import { localizeHealthMessage } from "@/lib/healthMessages";
import { apiFetch, getStoredSession } from "@/lib/api";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BellRing,
  Info,
  PlusCircle,
  HelpCircle,
  ChevronRight,
  X,
  Clock,
  Award,
  BarChart3,
  Edit2,
  Trash2,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  RefreshCw,
  Loader2,
  Percent,
  Sliders,
  Scale
} from "lucide-react";
import { useCountUp } from "@/lib/motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

/* ── Color Palette for Category Donut ────────────────────────── */
const DONUT_COLORS = [
  "#10B981", // Emerald
  "#C4F23F", // Lime
  "#38BDF8", // Sky
  "#818CF8", // Indigo
  "#F43F5E", // Rose
  "#F59E0B", // Amber
  "#A855F7", // Purple
  "#2DD4BF", // Teal
  "#FB923C", // Orange
  "#64748B", // Slate
];

/* ── Animated radial health gauge ────────────────────────────── */
function HealthGauge({ score }: { score: number | null }) {
  const { t } = useLanguage();
  const animatedScore = useCountUp(score == null ? null : Math.min(100, Math.max(0, Math.round(score))), 1100, 400);
  const r = 52;
  const circ = 2 * Math.PI * r;
  const gap = circ - (animatedScore / 100) * circ;

  const getColor = (s: number) => {
    if (s >= 75) return { stroke: "url(#scoreGrad)", text: "text-lime-400", label: t.health.bandExcellent };
    if (s >= 50) return { stroke: "url(#scoreGradAmber)", text: "text-amber-400", label: t.health.bandGood };
    return { stroke: "url(#scoreGradRose)", text: "text-rose-400", label: t.health.bandNeedsWork };
  };

  const colors = score != null ? getColor(animatedScore) : { stroke: "rgba(255,255,255,0.1)", text: "text-slate-400", label: t.health.noData };

  return (
    <div className="relative flex flex-col items-center gap-3">
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <defs>
            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#C4F23F" />
            </linearGradient>
            <linearGradient id="scoreGradAmber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>
            <linearGradient id="scoreGradRose" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#FB7185" />
            </linearGradient>
          </defs>
          <circle
            cx="64"
            cy="64"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="10"
          />
          {score != null && (
            <circle
              cx="64"
              cy="64"
              r={r}
              fill="none"
              stroke={colors.stroke}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={gap}
              className="transition-[stroke-dashoffset] duration-1000 ease-out"
            />
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className={`text-3xl font-black tabular-nums leading-none ${colors.text}`}>
            {score == null ? "—" : animatedScore}
          </div>
          <div className="text-[9px] text-slate-500 font-bold tracking-widest uppercase mt-1">{t.health.scoreShort}</div>
        </div>
      </div>

      <span className={`text-xs font-bold px-3 py-1 rounded-full border bg-white/[0.03] ${colors.text} border-white/10`}>
        {colors.label}
      </span>
    </div>
  );
}

/* ── CIBIL Semicircular Gauge Component ──────────────────────── */
function CibilGauge({ score }: { score: number | null }) {
  const norm = score != null ? Math.min(900, Math.max(300, score)) : null;
  const pct = norm != null ? (norm - 300) / 600 : 0;
  // Semicircle arc angles from 180 (left) to 0 (right)
  const angle = 180 - pct * 180;

  const getBadge = (s: number) => {
    if (s >= 750) return { label: "Excellent", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25", desc: "Top-tier approval odds for premium credit lines." };
    if (s >= 700) return { label: "Good", color: "text-lime-400 bg-lime-500/10 border-lime-500/25", desc: "Solid credit standing with favorable interest rates." };
    if (s >= 650) return { label: "Fair", color: "text-amber-400 bg-amber-500/10 border-amber-500/25", desc: "Eligible for standard cards; room for optimization." };
    return { label: "Needs Attention", color: "text-rose-400 bg-rose-500/10 border-rose-500/25", desc: "Focus on reducing balances and on-time payments." };
  };

  const badge = norm != null ? getBadge(norm) : null;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-56 h-32 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          <defs>
            <linearGradient id="cibilArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="35%" stopColor="#F59E0B" />
              <stop offset="70%" stopColor="#A3E635" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
          {/* Background track arc (semicircle, radius 78) */}
          <path
            d="M 22 100 A 78 78 0 0 1 178 100"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Active gradient arc */}
          {norm != null && (
            <path
              d="M 22 100 A 78 78 0 0 1 178 100"
              fill="none"
              stroke="url(#cibilArcGrad)"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray="245"
              strokeDashoffset={245 - pct * 245}
              className="transition-all duration-1000 ease-out"
            />
          )}
        </svg>

        {/* Center score readout */}
        <div className="absolute bottom-2 inset-x-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-black text-white tracking-tight tabular-nums drop-shadow-md">
            {norm != null ? norm : "—"}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
            CIBIL SCORE
          </div>
        </div>
      </div>

      {/* Range labels */}
      <div className="w-48 flex justify-between text-[10px] font-mono font-medium text-slate-500 mt-1">
        <span>300</span>
        <span className="text-slate-400">Range: 300 - 900</span>
        <span>900</span>
      </div>

      {badge && (
        <div className="mt-3 text-center">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${badge.color}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {badge.label}
          </span>
          <p className="text-[11px] text-slate-400 mt-2 max-w-xs">{badge.desc}</p>
        </div>
      )}
    </div>
  );
}

/* ── Custom Chart Tooltip ────────────────────────────────────── */
function CustomChartTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-2xl bg-[#17191E]/95 border border-white/10 shadow-2xl backdrop-blur-xl text-xs space-y-1.5">
        <div className="font-bold text-white border-b border-white/10 pb-1 mb-1">{label}</div>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-[11px]">
            <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-bold font-mono text-white">
              ₹{Number(entry.value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function FinancialHealthPage() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [health, setHealth] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Time filter for dual-line graph: 7d | 30d | 3m | 6m | 1y
  const [timeFilter, setTimeFilter] = useState<"7d" | "30d" | "3m" | "6m" | "1y">("30d");

  // Category transactions drilldown modal
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // Manual CIBIL score entry modal
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [inputScore, setInputScore] = useState<string>("");
  const [inputDate, setInputDate] = useState<string>("");
  const [inputNotes, setInputNotes] = useState<string>("");
  const [scoreSubmitting, setScoreSubmitting] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // User session
  const [userPathway, setUserPathway] = useState<string>("CREDIT_CARD");

  useEffect(() => {
    setMounted(true);
    const session = getStoredSession();
    if (session?.financialPathway) {
      setUserPathway(session.financialPathway);
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [hData, aData] = await Promise.all([
        apiFetch<any>("/analytics/financial-health").catch((e) => {
          console.warn("Health basic fallback:", e);
          return null;
        }),
        apiFetch<any>("/analytics/advanced-statistical-health").catch((e) => {
          console.warn("Advanced analytics fetch error:", e);
          return null;
        })
      ]);
      setHealth(hData);
      setAnalytics(aData);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateScore = () => {
    setEditingRecordId(null);
    setInputScore("");
    setInputDate(new Date().toISOString().split("T")[0]);
    setInputNotes("");
    setScoreError(null);
    setIsScoreModalOpen(true);
  };

  const handleOpenEditScore = (record: any) => {
    setEditingRecordId(record.id);
    setInputScore(String(record.score));
    const dt = record.recorded_at ? new Date(record.recorded_at).toISOString().split("T")[0] : "";
    setInputDate(dt);
    setInputNotes(record.notes || "");
    setScoreError(null);
    setIsScoreModalOpen(true);
  };

  const handleDeleteScore = async (id: string) => {
    if (!confirm("Are you sure you want to delete this score record?")) return;
    setDeletingId(id);
    try {
      await apiFetch(`/analytics/credit-score/${id}`, {
        method: "DELETE",
      });
      await loadData();
    } catch (err: any) {
      console.error("Delete score error:", err);
      alert(err.message || "Failed to delete score record.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setScoreError(null);
    const parsed = parseInt(inputScore, 10);
    if (isNaN(parsed) || parsed < 300 || parsed > 900) {
      setScoreError("Score must be a valid number between 300 and 900.");
      return;
    }

    setScoreSubmitting(true);
    try {
      const recordedAtIso = inputDate ? new Date(inputDate).toISOString() : new Date().toISOString();
      if (editingRecordId) {
        await apiFetch(`/analytics/credit-score/${editingRecordId}`, {
          method: "PUT",
          body: JSON.stringify({
            score: parsed,
            notes: inputNotes.trim() || undefined,
            recorded_at: recordedAtIso,
          }),
        });
      } else {
        await apiFetch("/analytics/credit-score", {
          method: "POST",
          body: JSON.stringify({
            score: parsed,
            notes: inputNotes.trim() || undefined,
            recorded_at: recordedAtIso,
            source: "User-Provided (Manual Entry)",
          }),
        });
      }
      setIsScoreModalOpen(false);
      setInputScore("");
      setInputDate("");
      setInputNotes("");
      setEditingRecordId(null);
      // Reload analytics to reflect newly saved score & history
      await loadData();
    } catch (err: any) {
      setScoreError(err.message || "Failed to update CIBIL score.");
    } finally {
      setScoreSubmitting(false);
    }
  };

  const fmt = (n: any) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

  const kpis = analytics?.overview_kpis || {};
  const monthlyInsights = analytics?.monthly_insights || {};
  const creditHealth = analytics?.credit_health || {};
  const timeSeriesData = analytics?.time_series?.[timeFilter] || [];
  const categoryDistribution = analytics?.category_distribution || [];

  // Savings trend calculation
  const savingsRateVal = Number(kpis.savings_rate ?? 0);
  const netSavingsVal = Number(kpis.net_savings ?? 0);
  const totalIncomeVal = Number(kpis.total_income ?? 0);
  const totalExpenseVal = Number(kpis.total_expenses ?? 0);

  // Score history for line chart
  const scoreHistory = creditHealth.score_history || [];
  const hasScoreHistoryChart = scoreHistory.length >= 2;
  const latestScore = creditHealth.current_score;

  // Score point difference if >= 2 entries
  const scoreDiff = useMemo(() => {
    if (scoreHistory.length >= 2) {
      const cur = scoreHistory[scoreHistory.length - 1].score;
      const prev = scoreHistory[scoreHistory.length - 2].score;
      return cur - prev;
    }
    return null;
  }, [scoreHistory]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-[#0E1013] text-slate-100 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">

        {/* ── Page Header ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/12 border border-emerald-500/20 flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                CLIQ Financial Intelligence
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-400">
                {userPathway === "CREDIT_CARD" ? "Credit Card Active" : "Cash & Savings Active"}
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Financial Health & Advanced Analytics
              <span className="text-emerald-400">·</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Authentic statistical insights calculated strictly from your income, transactions, and verified financial records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-xs font-semibold text-slate-300 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => {
                setInputScore(creditHealth?.current_score ? String(creditHealth.current_score) : "");
                setIsScoreModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-bold text-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)]"
            >
              <Award className="w-3.5 h-3.5" />
              {creditHealth?.current_score ? "Update CIBIL Score" : "Log CIBIL Score"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400">Calculating financial statistics and credit telemetry...</p>
          </div>
        ) : (
          <div className="space-y-8">

            {/* ── SECTION 1: FINANCIAL HEALTH OVERVIEW (6 COMPACT KPIS) ── */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Financial Health Overview
                  </h2>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Calculated from verified user records</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {/* 1. Total Income */}
                <div className="p-4 rounded-2xl bg-[#17191E]/90 border border-white/[0.08] backdrop-blur-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Total Income</span>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight tabular-nums">
                    {fmt(totalIncomeVal)}
                  </div>
                  <div className="text-[10px] text-emerald-400/80 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Inflow baseline
                  </div>
                </div>

                {/* 2. Total Expenses */}
                <div className="p-4 rounded-2xl bg-[#17191E]/90 border border-white/[0.08] backdrop-blur-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Total Expenses</span>
                    <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight tabular-nums">
                    {fmt(totalExpenseVal)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Cumulative spending
                  </div>
                </div>

                {/* 3. Net Savings */}
                <div className="p-4 rounded-2xl bg-[#17191E]/90 border border-white/[0.08] backdrop-blur-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Net Savings</span>
                    <Wallet className={`w-3.5 h-3.5 ${netSavingsVal >= 0 ? "text-emerald-400" : "text-rose-400"}`} />
                  </div>
                  <div className={`text-xl sm:text-2xl font-black tracking-tight tabular-nums ${netSavingsVal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {fmt(netSavingsVal)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {netSavingsVal >= 0 ? "Positive cash surplus" : "Deficit position"}
                  </div>
                </div>

                {/* 4. Savings Rate */}
                <div className="p-4 rounded-2xl bg-[#17191E]/90 border border-white/[0.08] backdrop-blur-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Savings Rate</span>
                    <Percent className="w-3.5 h-3.5 text-lime-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-lime-400 tracking-tight tabular-nums">
                    {savingsRateVal}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {savingsRateVal >= 20 ? "Exceeds 20% target" : "Target: 20% rule"}
                  </div>
                </div>

                {/* 5. Average Monthly Spending */}
                <div className="p-4 rounded-2xl bg-[#17191E]/90 border border-white/[0.08] backdrop-blur-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Avg Monthly Spend</span>
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight tabular-nums">
                    {fmt(kpis.avg_monthly_spending ?? 0)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Normalized outflow
                  </div>
                </div>

                {/* 6. Income-to-Expense Ratio */}
                <div className="p-4 rounded-2xl bg-[#17191E]/90 border border-white/[0.08] backdrop-blur-xl">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Income:Expense</span>
                    <Scale className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight tabular-nums">
                    {Number(kpis.income_to_expense_ratio ?? 0).toFixed(2)}x
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {Number(kpis.income_to_expense_ratio ?? 0) >= 1.2 ? "Healthy runway" : "Tight margin"}
                  </div>
                </div>
              </div>
            </section>

            {/* ── SECTION 2: MAIN GRAPH — INCOME VS EXPENSES (PRIMARY PROMINENT CHART) ── */}
            <section className="rounded-3xl bg-[#17191E]/90 border border-white/[0.08] p-5 sm:p-7 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Income vs Expenses Trend
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Dual-line trajectory comparing actual inflow against verified transaction expenditure.
                  </p>
                </div>

                {/* Time filter selector */}
                <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.06] self-start sm:self-auto">
                  {(
                    [
                      { id: "7d", label: "7 Days" },
                      { id: "30d", label: "30 Days" },
                      { id: "3m", label: "3 Months" },
                      { id: "6m", label: "6 Months" },
                      { id: "1y", label: "1 Year" },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setTimeFilter(f.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        timeFilter === f.id
                          ? "bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart container */}
              <div className="h-[320px] sm:h-[360px] w-full pt-4">
                {mounted && timeSeriesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeriesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis
                        dataKey="date"
                        stroke="#64748B"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                      />
                      <YAxis
                        stroke="#64748B"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                        tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                      />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="income"
                        name="Income"
                        stroke="#10B981"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: "#10B981" }}
                        activeDot={{ r: 6, fill: "#10B981" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="expenses"
                        name="Expenses"
                        stroke="#F87171"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: "#F87171" }}
                        activeDot={{ r: 6, fill: "#F87171" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
                    <LineChartIcon className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-xs">No records available for the selected {timeFilter} window.</p>
                  </div>
                )}
              </div>
            </section>

            {/* ── SECTION 3: SUPPORTING ANALYTICS (SAVINGS TREND + EXPENSE DONUT) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* C. Savings Trend Area Chart */}
              <div className="rounded-3xl bg-[#17191E]/90 border border-white/[0.08] p-5 sm:p-7 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-lime-400" />
                      <h3 className="text-sm sm:text-base font-bold text-white">Savings Velocity & Trend</h3>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      monthlyInsights.savings_trend_direction === "increasing"
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                        : monthlyInsights.savings_trend_direction === "decreasing"
                        ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
                        : "bg-slate-500/10 text-slate-300 border-slate-500/20"
                    }`}>
                      {monthlyInsights.savings_trend_direction === "increasing" ? "▲ Savings Expanding" : monthlyInsights.savings_trend_direction === "decreasing" ? "▼ Outflow Pressure" : "• Neutral Baseline"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    Net monthly surplus (Inflow - Outflow) and savings rate momentum.
                  </p>
                </div>

                <div className="h-[240px] w-full pt-2">
                  {mounted && timeSeriesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="savingsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                          dataKey="date"
                          stroke="#64748B"
                          fontSize={11}
                          tickLine={false}
                          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                        />
                        <YAxis
                          stroke="#64748B"
                          fontSize={11}
                          tickLine={false}
                          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                          tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                        />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="savings"
                          name="Net Savings"
                          stroke="#10B981"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#savingsAreaGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500">
                      No savings data points available yet.
                    </div>
                  )}
                </div>
              </div>

              {/* D. Expense Distribution Donut Chart */}
              <div className="rounded-3xl bg-[#17191E]/90 border border-white/[0.08] p-5 sm:p-7 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <PieChartIcon className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm sm:text-base font-bold text-white">Expense Distribution</h3>
                    </div>
                    <span className="text-[10px] text-slate-400">Click slice to inspect</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    Category breakdown with interactive transaction drilldown.
                  </p>
                </div>

                {categoryDistribution.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
                    {/* Donut Chart */}
                    <div className="h-[220px] w-full flex items-center justify-center">
                      {mounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryDistribution}
                              dataKey="amount"
                              nameKey="category_name"
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={80}
                              paddingAngle={3}
                              onClick={(entry) => setSelectedCategory(entry)}
                              className="cursor-pointer outline-none"
                            >
                              {categoryDistribution.map((entry: any, index: number) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                                  stroke="rgba(0,0,0,0.4)"
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, "Spend"]}
                              contentStyle={{ backgroundColor: "#17191E", borderColor: "rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    {/* Category List */}
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {categoryDistribution.slice(0, 6).map((cat: any, idx: number) => (
                        <div
                          key={cat.category_id}
                          onClick={() => setSelectedCategory(cat)}
                          className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}
                            />
                            <span className="text-xs font-semibold text-white truncate max-w-[110px]">
                              {cat.category_name}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-slate-200 tabular-nums">
                              ₹{Math.round(cat.amount).toLocaleString("en-IN")}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {cat.percentage}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-slate-500">
                    No expense category records logged yet.
                  </div>
                )}
              </div>
            </div>

            {/* ── SECTION 4: MONTHLY FINANCIAL INSIGHTS (5 COMPACT CARDS) ── */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-lime-400" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Monthly Financial Insights
                  </h2>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Calculated strictly from actual records</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                {/* 1. Highest Spending Month */}
                <div className="p-4 rounded-2xl bg-[#17191E]/90 border border-white/[0.08] backdrop-blur-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Highest Spend Month
                  </span>
                  <div className="text-sm font-bold text-white truncate">
                    {monthlyInsights.highest_spending_month?.month || "Insufficient Data"}
                  </div>
                  <div className="text-lg font-black text-rose-400 tabular-nums mt-1">
                    {monthlyInsights.highest_spending_month ? fmt(monthlyInsights.highest_spending_month.amount) : "—"}
                  </div>
                </div>

                {/* 2. Lowest Spending Month */}
                <div className="p-4 rounded-2xl bg-[#17191E]/90 border border-white/[0.08] backdrop-blur-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Lowest Spend Month
                  </span>
                  <div className="text-sm font-bold text-white truncate">
                    {monthlyInsights.lowest_spending_month?.month || "Insufficient Data"}
                  </div>
                  <div className="text-lg font-black text-emerald-400 tabular-nums mt-1">
                    {monthlyInsights.lowest_spending_month ? fmt(monthlyInsights.lowest_spending_month.amount) : "—"}
                  </div>
                </div>

                {/* 3. Highest Savings Month */}
                <div className="p-4 rounded-2xl bg-[#17191E]/90 border border-white/[0.08] backdrop-blur-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Highest Savings Month
                  </span>
                  <div className="text-sm font-bold text-white truncate">
                    {monthlyInsights.highest_savings_month?.month || "Insufficient Data"}
                  </div>
                  <div className="text-lg font-black text-lime-400 tabular-nums mt-1">
                    {monthlyInsights.highest_savings_month ? fmt(monthlyInsights.highest_savings_month.amount) : "—"}
                  </div>
                </div>

                {/* 4. Average Monthly Expenditure */}
                <div className="p-4 rounded-2xl bg-[#17191E]/90 border border-white/[0.08] backdrop-blur-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Monthly Mean Outflow
                  </span>
                  <div className="text-sm font-bold text-white">Mean Monthly Spend</div>
                  <div className="text-lg font-black text-white tabular-nums mt-1">
                    {fmt(monthlyInsights.avg_monthly_expenditure ?? 0)}
                  </div>
                </div>

                {/* 5. Month-over-Month Spending Change */}
                <div className="p-4 rounded-2xl bg-[#17191E]/90 border border-white/[0.08] backdrop-blur-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    MoM Spending Velocity
                  </span>
                  <div className="text-sm font-bold text-white">Month-over-Month</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    {monthlyInsights.mom_spending_change_pct != null ? (
                      <span className={`inline-flex items-center gap-1 text-sm font-black px-2.5 py-0.5 rounded-full border ${
                        monthlyInsights.mom_spending_change_pct > 0
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                      }`}>
                        {monthlyInsights.mom_spending_change_pct > 0 ? "+" : ""}
                        {monthlyInsights.mom_spending_change_pct}%
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 font-medium">Record ≥ 2 months</span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ── SECTION 5: CIBIL CREDIT SCORE (SEPARATE SECONDARY FEATURE) ── */}
            <section className="rounded-3xl bg-gradient-to-b from-[#181C24] to-[#12151B] border border-white/[0.09] p-6 sm:p-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] space-y-7">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                    <Award className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      CIBIL Credit Score & Bureau Telemetry
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Credit Health
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Monitor credit standing, repayment discipline, and creditworthiness parameters.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleOpenCreateScore}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-bold text-white transition-all self-start sm:self-auto"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Log CIBIL Score
                </button>
              </div>

              {/* Credit score display or Empty State */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                {latestScore != null ? (
                  /* Premium score card */
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center text-center justify-center">
                    <CibilGauge score={latestScore} />
                    <div className="w-full mt-4 pt-4 border-t border-white/[0.06] space-y-1 text-xs text-slate-400">
                      <div className="flex justify-between">
                        <span>Data Source:</span>
                        <span className="font-semibold text-slate-200">{creditHealth.source || "User-Provided"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span className="font-mono text-slate-200">{creditHealth.last_updated || "Recent"}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Polished Empty State */
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center text-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Your credit score isn't available yet.</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">
                        If you have an existing CIBIL or bureau score, record it to monitor historical trajectory and creditworthiness.
                      </p>
                    </div>
                    <button
                      onClick={handleOpenCreateScore}
                      className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-bold text-emerald-400 transition-all"
                    >
                      Enter Existing Score
                    </button>
                  </div>
                )}

                {/* Score History Line Chart (or onboarding encouragement) */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <LineChartIcon className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Credit Score Trajectory
                      </h4>
                    </div>
                    {scoreDiff !== null && (
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        scoreDiff >= 0
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                      }`}>
                        {scoreDiff >= 0 ? `+${scoreDiff} pts` : `${scoreDiff} pts`} vs previous
                      </span>
                    )}
                  </div>

                  {hasScoreHistoryChart ? (
                    <div className="h-[180px] w-full pt-2">
                      {mounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={scoreHistory.map((s: any) => ({
                              date: new Date(s.recorded_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
                              score: s.score,
                              band: s.score_band
                            }))}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                            <YAxis domain={[300, 900]} stroke="#64748B" fontSize={11} tickLine={false} />
                            <Tooltip
                              formatter={(val: any) => [`${val} / 900`, "CIBIL Score"]}
                              contentStyle={{ backgroundColor: "#17191E", borderColor: "rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="score"
                              stroke="#10B981"
                              strokeWidth={2.5}
                              dot={{ r: 4, fill: "#10B981" }}
                              activeDot={{ r: 6, fill: "#C4F23F" }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  ) : (
                    <div className="h-[180px] flex flex-col items-center justify-center text-center p-4">
                      <Clock className="w-8 h-8 text-slate-500 mb-2 opacity-40" />
                      <p className="text-xs font-semibold text-slate-300">
                        {latestScore ? "Score history building in progress" : "No credit history recorded"}
                      </p>
                      <p className="text-[11px] text-slate-500 max-w-sm mt-1">
                        {latestScore
                          ? "Log future quarterly updates to view your visual CIBIL score trajectory and delta improvements."
                          : "Logging your bureau score allows CLIQ to monitor your credit health trajectory over time."}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-white/[0.05]">
                    <span>Bureau Range: 300 - 900</span>
                    <span>TransUnion CIBIL Educational Framework</span>
                  </div>
                </div>

                {/* Score History Log Table (Full CRUD Visibility) */}
                {scoreHistory.length > 0 && (
                  <div className="lg:col-span-3 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          Recorded Score History ({scoreHistory.length})
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">Educational Self-Tracking Log</span>
                    </div>

                    <div className="divide-y divide-white/[0.05] overflow-x-auto">
                      {scoreHistory.map((rec: any) => (
                        <div key={rec.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-bold text-white tabular-nums">
                              {rec.score}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              rec.score >= 750 ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" :
                              rec.score >= 700 ? "bg-lime-500/10 text-lime-300 border-lime-500/20" :
                              rec.score >= 650 ? "bg-amber-500/10 text-amber-300 border-amber-500/20" :
                              "bg-rose-500/10 text-rose-300 border-rose-500/20"
                            }`}>
                              {rec.score_band}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(rec.recorded_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                            {rec.notes && (
                              <span className="text-[11px] text-slate-400 italic truncate max-w-xs sm:max-w-md">
                                “{rec.notes}”
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleOpenEditScore(rec)}
                              title="Edit score entry"
                              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteScore(rec.id)}
                              disabled={deletingId === rec.id}
                              title="Delete score entry"
                              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 transition-all disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── SECTION 6: CREDIT HEALTH INSIGHTS & FACTOR WEIGHTS ── */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Credit Health Dimensions & Factors
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Credit Utilization Card */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">Credit Card Utilization</span>
                      {creditHealth.credit_utilization_pct != null ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          creditHealth.credit_utilization_pct <= 30
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}>
                          {creditHealth.credit_utilization_pct}%
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Not Applicable</span>
                      )}
                    </div>

                    {userPathway === "CREDIT_CARD" && creditHealth.credit_utilization_pct != null ? (
                      <div>
                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden my-2">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              creditHealth.credit_utilization_pct <= 30 ? "bg-emerald-400" : "bg-amber-400"
                            }`}
                            style={{ width: `${Math.min(100, creditHealth.credit_utilization_pct)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Bal: {fmt(creditHealth.total_outstanding_balance)}</span>
                          <span>Limit: {fmt(creditHealth.total_credit_limit)}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2">
                          Maintaining card balance below 30% of total limit optimizes credit scores.
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 mt-1">
                        In Cash & Savings pathway, financial resilience and positive cash buffers establish discipline before taking on credit.
                      </p>
                    )}
                  </div>

                  {/* Factor Impact Breakdown */}
                  <div className="md:col-span-1 lg:col-span-2 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-xs font-bold text-white block mb-2.5">
                      CIBIL Score Determining Factors
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-[10px] text-emerald-400 font-bold block">35% Impact</span>
                        <div className="text-xs font-bold text-white mt-1">Payment History</div>
                        <span className="text-[9px] text-slate-500">On-time dues</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-[10px] text-emerald-400 font-bold block">30% Impact</span>
                        <div className="text-xs font-bold text-white mt-1">Credit Utilization</div>
                        <span className="text-[9px] text-slate-500">&lt; 30% optimal</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-[10px] text-lime-400 font-bold block">15% Impact</span>
                        <div className="text-xs font-bold text-white mt-1">Credit Age</div>
                        <span className="text-[9px] text-slate-500">Account longevity</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-[10px] text-slate-400 font-bold block">10% Impact</span>
                        <div className="text-xs font-bold text-white mt-1">Credit Mix</div>
                        <span className="text-[9px] text-slate-500">Secured vs Unsecured</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-[10px] text-slate-400 font-bold block">10% Impact</span>
                        <div className="text-xs font-bold text-white mt-1">Inquiries</div>
                        <span className="text-[9px] text-slate-500">Hard searches</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── SECTION 7: ACTIONABLE ADVICE & OBSERVATIONS (PRESERVED) ── */}
            {health?.actionable_recommendations?.length > 0 && (
              <div className="rounded-3xl bg-[#17191E]/90 border border-white/[0.08] p-5 sm:p-7 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-lime-400/10 border border-lime-400/20 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Actionable Financial Health Recommendations</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {health.actionable_recommendations.map((rec: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-lime-400/20 hover:bg-lime-400/3 transition-all flex items-start gap-3"
                    >
                      <div className="w-5 h-5 rounded-lg bg-lime-400/15 border border-lime-400/25 flex items-center justify-center shrink-0 mt-0.5">
                        <ArrowRight className="w-2.5 h-2.5 text-lime-400" />
                      </div>
                      <span className="text-xs text-slate-300 leading-relaxed">{localizeHealthMessage(t, rec)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SECTION 8: DETECTED RECURRING SUBSCRIPTIONS ── */}
            {health?.recurring_subscriptions?.length > 0 && (
              <div className="rounded-3xl bg-[#17191E]/90 border border-white/[0.08] p-5 sm:p-7 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Detected Recurring Subscriptions</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-400">
                    {health.recurring_subscriptions.length} active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {health.recurring_subscriptions.map((sub: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white">{sub.merchant_name}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.05] text-emerald-400 font-semibold border border-emerald-500/20">
                          {sub.frequency}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Monthly</span>
                          <span className="font-bold text-white tabular-nums">₹{Number(sub.average_amount).toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between text-slate-400 pt-1 border-t border-white/[0.05]">
                          <span>Annual Cost</span>
                          <span className="font-bold text-rose-400 tabular-nums">₹{Number(sub.annual_cost).toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SECTION 9: ANNUAL FEE AUDIT TABLE (CREDIT CARDS) ── */}
            {health?.annual_fee_audit?.length > 0 && (
              <div className="rounded-3xl bg-[#17191E]/90 border border-white/[0.08] p-5 sm:p-7 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Annual Fee Justification Audit</h3>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-slate-400 bg-white/[0.02]">
                        <th className="p-3">Card Name</th>
                        <th className="p-3 text-right">Annual Fee</th>
                        <th className="p-3 text-right">Earned Rewards</th>
                        <th className="p-3 text-right">Net Value</th>
                        <th className="p-3 text-center">Audit Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {health.annual_fee_audit.map((item: any) => (
                        <tr key={item.card_id} className="hover:bg-white/[0.01]">
                          <td className="p-3 font-bold text-white">{item.card_name}</td>
                          <td className="p-3 text-right text-slate-400 tabular-nums">₹{Number(item.annual_fee).toFixed(0)}</td>
                          <td className="p-3 text-right font-bold text-lime-400 tabular-nums">₹{Number(item.rewards_earned).toFixed(0)}</td>
                          <td className="p-3 text-right font-bold text-white tabular-nums">₹{Number(item.net_profit).toFixed(0)}</td>
                          <td className="p-3 text-center">
                            {item.is_justified ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                                Justified
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                                At Risk
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* ── MODAL 1: CIBIL MANUAL SCORE ENTRY / EDIT ────────────── */}
      {isScoreModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#17191E] border border-white/10 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  {editingRecordId ? "Edit CIBIL Credit Score Record" : "Record CIBIL Credit Score"}
                </h3>
              </div>
              <button
                onClick={() => setIsScoreModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScoreSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    CIBIL Score (300 – 900)
                  </label>
                  <input
                    type="number"
                    min={300}
                    max={900}
                    required
                    value={inputScore}
                    onChange={(e) => setInputScore(e.target.value)}
                    placeholder="e.g. 785"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-base font-bold placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Recorded Date
                  </label>
                  <input
                    type="date"
                    required
                    value={inputDate}
                    onChange={(e) => setInputDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Report Source / Optional Notes
                </label>
                <input
                  type="text"
                  value={inputNotes}
                  onChange={(e) => setInputNotes(e.target.value)}
                  placeholder="e.g. Verified via HDFC NetBanking / CIBIL portal"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Self-reported bureau record for personal tracking. Not an automated credit agency pull.
                </span>
              </div>

              {scoreError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {scoreError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScoreModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scoreSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
                >
                  {scoreSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  {editingRecordId ? "Update Score Entry" : "Save Verified Score"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: CATEGORY TRANSACTIONS DRILLDOWN ─────────────── */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-[#17191E] border border-white/10 p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <PieChartIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedCategory.category_name} Transactions
                  </h3>
                  <p className="text-xs text-slate-400">
                    Total: ₹{Math.round(selectedCategory.amount).toLocaleString("en-IN")} · {selectedCategory.percentage}% of total expenses
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {selectedCategory.transactions && selectedCategory.transactions.length > 0 ? (
                selectedCategory.transactions.map((tx: any) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between hover:bg-white/[0.04] transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{tx.merchant_name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{tx.transaction_date}</span>
                        <span>•</span>
                        <span className="uppercase text-slate-500 font-mono">{tx.payment_method}</span>
                      </div>
                    </div>
                    <div className="text-sm font-black text-white tabular-nums">
                      ₹{Math.round(tx.amount).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-slate-500">
                  No individual transaction records available for this category.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex justify-end">
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
