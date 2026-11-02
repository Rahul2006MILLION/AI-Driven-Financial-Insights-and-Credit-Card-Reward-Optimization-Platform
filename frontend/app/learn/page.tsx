"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import {
  GraduationCap,
  BookOpen,
  Calculator,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
  TrendingDown,
  PieChart,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  Search,
  HelpCircle,
  Percent,
  Check,
  X,
  Target,
  Compass,
} from "lucide-react";

interface CategorySummary {
  id: string;
  title: string;
  description: string;
  icon: string;
  total_lessons: number;
  completed_lessons: number;
}

interface LessonSummary {
  id: string;
  category_id: string;
  order: number;
  reading_time_minutes: number;
  title: string;
  summary: string;
  is_completed: boolean;
  quiz_score?: number | null;
}

interface QuizOption {
  id: number;
  text: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
  correct_option_id: number;
  explanation: string;
}

interface LessonDetail extends LessonSummary {
  content_markdown: string;
  key_takeaways: string[];
  quiz: QuizQuestion[];
}

export default function LearnPage() {
  const { language, t } = useLanguage();
  const { session, isAuthenticated } = useAuth();
  const token = session?.accessToken;

  const [activeTab, setActiveTab] = useState<"curriculum" | "calculators" | "progress">("curriculum");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Curriculum Data
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [loadingLessons, setLoadingLessons] = useState<boolean>(true);

  // Lesson Reader Modal
  const [activeLesson, setActiveLesson] = useState<LessonDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState<boolean>(false);

  // Calculators Subtab
  const [calcSubTab, setCalcSubTab] = useState<"interest" | "min_due" | "budget" | "utilization" | "breakeven">("interest");

  // Calculator 1: Interest
  const [interestBal, setInterestBal] = useState<string>("20000");
  const [interestApr, setInterestApr] = useState<string>("42");
  const [interestPmt, setInterestPmt] = useState<string>("2000");
  const [interestResult, setInterestResult] = useState<any>(null);
  const [calculatingInterest, setCalculatingInterest] = useState<boolean>(false);

  // Calculator 2: Min Due
  const [minDueBal, setMinDueBal] = useState<string>("20000");
  const [minDueApr, setMinDueApr] = useState<string>("42");
  const [minDuePct, setMinDuePct] = useState<string>("5");
  const [minDueFixed, setMinDueFixed] = useState<string>("2000");
  const [minDueResult, setMinDueResult] = useState<any>(null);
  const [calculatingMinDue, setCalculatingMinDue] = useState<boolean>(false);

  // Calculator 3: Budget
  const [budgetIncome, setBudgetIncome] = useState<string>("50000");
  const [budgetGrocery, setBudgetGrocery] = useState<string>("12000");
  const [budgetUtility, setBudgetUtility] = useState<string>("6000");
  const [budgetDining, setBudgetDining] = useState<string>("5000");
  const [budgetShopping, setBudgetShopping] = useState<string>("5000");
  const [budgetFuel, setBudgetFuel] = useState<string>("4000");
  const [budgetSavings, setBudgetSavings] = useState<string>("10000");
  const [budgetResult, setBudgetResult] = useState<any>(null);
  const [calculatingBudget, setCalculatingBudget] = useState<boolean>(false);

  // Calculator 4: Utilization
  const [utilLimit, setUtilLimit] = useState<string>("100000");
  const [utilBalance, setUtilBalance] = useState<string>("45000");
  const [utilResult, setUtilResult] = useState<any>(null);
  const [calculatingUtil, setCalculatingUtil] = useState<boolean>(false);

  // Calculator 5: Break-Even
  const [beFee, setBeFee] = useState<string>("1500");
  const [beMonthlySpend, setBeMonthlySpend] = useState<string>("15000");
  const [beRewardRate, setBeRewardRate] = useState<string>("2.0");
  const [beMilestone, setBeMilestone] = useState<string>("500");
  const [beWaiver, setBeWaiver] = useState<string>("150000");
  const [beResult, setBeResult] = useState<any>(null);
  const [calculatingBe, setCalculatingBe] = useState<boolean>(false);

  // Progress & Learning Path
  const [overallProgress, setOverallProgress] = useState<any>(null);
  const [userPath, setUserPath] = useState<string>("NEW_TO_FINANCE");
  const [savingPath, setSavingPath] = useState<boolean>(false);
  const [pathMessage, setPathMessage] = useState<string>("");

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Fetch Categories & Lessons
  const fetchCurriculum = async () => {
    setLoadingLessons(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const [catRes, modRes] = await Promise.all([
        fetch(`${apiBase}/api/v1/education/categories?lang=${language}`, { headers }),
        fetch(`${apiBase}/api/v1/education/modules?lang=${language}`, { headers }),
      ]);

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
      if (modRes.ok) {
        const modData = await modRes.json();
        setLessons(modData);
      }
    } catch (e) {
      console.error("Error loading curriculum:", e);
    } finally {
      setLoadingLessons(false);
    }
  };

  // Fetch Overall Progress & Path
  const fetchProgressAndPath = async () => {
    if (!token) return;
    try {
      const [progRes, pathRes] = await Promise.all([
        fetch(`${apiBase}/api/v1/education/progress?lang=${language}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${apiBase}/api/v1/education/path`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (progRes.ok) {
        const pData = await progRes.json();
        setOverallProgress(pData);
      }
      if (pathRes.ok) {
        const pathData = await pathRes.json();
        setUserPath(pathData.financial_path || "NEW_TO_FINANCE");
      }
    } catch (e) {
      console.error("Error loading progress:", e);
    }
  };

  useEffect(() => {
    fetchCurriculum();
    if (isAuthenticated) {
      fetchProgressAndPath();
    }
  }, [language, isAuthenticated, token]);

  // Open Lesson Detail Modal
  const openLesson = async (topicId: string) => {
    setLoadingDetail(true);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${apiBase}/api/v1/education/modules/${topicId}?lang=${language}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setActiveLesson(data);
      }
    } catch (e) {
      console.error("Error loading lesson detail:", e);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Submit Knowledge Check Quiz
  const handleSubmitQuiz = async () => {
    if (!activeLesson) return;
    setSubmittingQuiz(true);

    let correctCount = 0;
    activeLesson.quiz.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct_option_id) {
        correctCount += 1;
      }
    });

    const scorePct = Math.round((correctCount / activeLesson.quiz.length) * 100);
    setQuizScore(scorePct);
    setQuizSubmitted(true);

    if (token) {
      try {
        await fetch(`${apiBase}/api/v1/education/progress/${activeLesson.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            is_completed: true,
            quiz_score: scorePct,
          }),
        });
        // Refresh curriculum and progress
        fetchCurriculum();
        fetchProgressAndPath();
      } catch (e) {
        console.error("Error saving progress:", e);
      }
    }
    setSubmittingQuiz(false);
  };

  // Switch Financial Learning Path
  const handleUpdatePath = async (newPath: string) => {
    setUserPath(newPath);
    if (!token) return;
    setSavingPath(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/education/path`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ financial_path: newPath }),
      });
      if (res.ok) {
        setPathMessage(t.learn.pathUpdatedSuccess);
        setTimeout(() => setPathMessage(""), 4000);
      }
    } catch (e) {
      console.error("Error updating path:", e);
    } finally {
      setSavingPath(false);
    }
  };

  // Execute Calculators
  const runInterestCalc = async () => {
    setCalculatingInterest(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/education/calculators/interest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          balance: parseFloat(interestBal) || 20000,
          apr_percentage: parseFloat(interestApr) || 42,
          monthly_payment: parseFloat(interestPmt) || 2000,
          new_monthly_charges: 0,
        }),
      });
      if (res.ok) setInterestResult(await res.json());
    } catch (e) {
      console.error("Interest calc error:", e);
    } finally {
      setCalculatingInterest(false);
    }
  };

  const runMinDueCalc = async () => {
    setCalculatingMinDue(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/education/calculators/minimum-due`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          balance: parseFloat(minDueBal) || 20000,
          apr_percentage: parseFloat(minDueApr) || 42,
          min_payment_pct: parseFloat(minDuePct) || 5,
          fixed_payment_option: parseFloat(minDueFixed) || 2000,
        }),
      });
      if (res.ok) setMinDueResult(await res.json());
    } catch (e) {
      console.error("Min due calc error:", e);
    } finally {
      setCalculatingMinDue(false);
    }
  };

  const runBudgetCalc = async () => {
    setCalculatingBudget(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/education/calculators/budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthly_income: parseFloat(budgetIncome) || 50000,
          category_budgets: {
            grocery: parseFloat(budgetGrocery) || 12000,
            utility: parseFloat(budgetUtility) || 6000,
            dining: parseFloat(budgetDining) || 5000,
            shopping: parseFloat(budgetShopping) || 5000,
            fuel: parseFloat(budgetFuel) || 4000,
            savings: parseFloat(budgetSavings) || 10000,
          },
        }),
      });
      if (res.ok) setBudgetResult(await res.json());
    } catch (e) {
      console.error("Budget calc error:", e);
    } finally {
      setCalculatingBudget(false);
    }
  };

  const runUtilCalc = async () => {
    setCalculatingUtil(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/education/calculators/utilization`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total_limit: parseFloat(utilLimit) || 100000,
          total_balance: parseFloat(utilBalance) || 45000,
        }),
      });
      if (res.ok) setUtilResult(await res.json());
    } catch (e) {
      console.error("Utilization calc error:", e);
    } finally {
      setCalculatingUtil(false);
    }
  };

  const runBeCalc = async () => {
    setCalculatingBe(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/education/calculators/break-even`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          annual_fee: parseFloat(beFee) || 1500,
          monthly_spend: parseFloat(beMonthlySpend) || 15000,
          reward_rate_pct: parseFloat(beRewardRate) || 2.0,
          annual_milestone_benefits: parseFloat(beMilestone) || 0,
          waiver_spend_threshold: parseFloat(beWaiver) || 150000,
        }),
      });
      if (res.ok) setBeResult(await res.json());
    } catch (e) {
      console.error("Break-even calc error:", e);
    } finally {
      setCalculatingBe(false);
    }
  };

  // Run initial calculator computations
  useEffect(() => {
    runInterestCalc();
    runMinDueCalc();
    runBudgetCalc();
    runUtilCalc();
    runBeCalc();
  }, []);

  // Filter lessons
  const filteredLessons = lessons.filter((l) => {
    const matchesCat = selectedCategory === "all" || l.category_id === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#040707] text-slate-100 p-4 md:p-8 relative selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[450px] h-[450px] bg-teal-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold tracking-wide">
              <GraduationCap className="w-3.5 h-3.5" />
              {t.learn.badge}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {t.learn.title}
            </h1>
            <p className="text-sm md:text-base text-slate-400 max-w-2xl">
              {t.learn.subtitle}
            </p>
          </div>

          {/* Quick Learning Path Indicator */}
          <div className="flex items-center gap-3 bg-[#06100C]/70 border border-white/[0.08] rounded-2xl p-3 backdrop-blur-xl">
            <Compass className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="text-slate-400 block font-medium">{t.learn.pathTitle}:</span>
              <span className="text-emerald-300 font-bold">
                {userPath === "NEW_TO_FINANCE"
                  ? t.learn.pathNewToFinance
                  : userPath === "UNDERSTAND_CREDIT"
                  ? t.learn.pathUnderstandCredit
                  : t.learn.pathOptimizeExisting}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/[0.08] gap-2 md:gap-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("curriculum")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === "curriculum"
                ? "border-emerald-400 text-emerald-400 bg-white/[0.02]"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {t.learn.tabCurriculum}
          </button>
          <button
            onClick={() => setActiveTab("calculators")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === "calculators"
                ? "border-emerald-400 text-emerald-400 bg-white/[0.02]"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calculator className="w-4 h-4" />
            {t.learn.tabCalculators}
          </button>
          <button
            onClick={() => setActiveTab("progress")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === "progress"
                ? "border-emerald-400 text-emerald-400 bg-white/[0.02]"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Award className="w-4 h-4" />
            {t.learn.tabProgress}
          </button>
        </div>

        {/* TAB 1: CURRICULUM */}
        {activeTab === "curriculum" && (
          <div className="space-y-6">
            {/* Category Filter Pills & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 border ${
                    selectedCategory === "all"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                      : "bg-white/[0.03] text-slate-400 border-white/[0.08] hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  {t.learn.allCategories}
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 border ${
                      selectedCategory === c.id
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                        : "bg-white/[0.03] text-slate-400 border-white/[0.08] hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    {c.title}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search lessons & topics..."
                  className="w-full bg-[#06100C]/80 border border-white/[0.1] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* Lesson Grid */}
            {loadingLessons ? (
              <div className="text-center py-16 text-slate-400 space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400" />
                <p className="text-sm">Loading lessons...</p>
              </div>
            ) : filteredLessons.length === 0 ? (
              <div className="text-center py-16 bg-[#06100C]/40 border border-white/[0.06] rounded-2xl text-slate-400 space-y-2">
                <HelpCircle className="w-8 h-8 mx-auto text-slate-500" />
                <p className="text-base font-semibold text-slate-300">No lessons match your search</p>
                <p className="text-xs text-slate-500">Try adjusting your filters or search keywords.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredLessons.map((lesson) => {
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => openLesson(lesson.id)}
                      className="group relative bg-[#06100C]/70 hover:bg-[#071610]/90 border border-white/[0.08] hover:border-emerald-500/40 rounded-2xl p-5 backdrop-blur-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.15)] hover:-translate-y-1"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/[0.06] uppercase tracking-wider">
                            Lesson {lesson.order}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {lesson.reading_time_minutes} {t.learn.readingTime}
                            </span>
                            {lesson.is_completed && (
                              <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" />
                                {t.learn.completedBadge}
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                          {lesson.title}
                        </h3>

                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                          {lesson.summary}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
                        <span>{lesson.is_completed ? t.learn.readLesson : t.learn.startLesson}</span>
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CALCULATORS */}
        {activeTab === "calculators" && (
          <div className="space-y-6">
            {/* Calculator Subtabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              <button
                onClick={() => setCalcSubTab("interest")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
                  calcSubTab === "interest"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-white/[0.03] text-slate-400 border-white/[0.08] hover:text-white"
                }`}
              >
                {t.learn.calcInterestTitle}
              </button>
              <button
                onClick={() => setCalcSubTab("min_due")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
                  calcSubTab === "min_due"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-white/[0.03] text-slate-400 border-white/[0.08] hover:text-white"
                }`}
              >
                {t.learn.calcMinDueTitle}
              </button>
              <button
                onClick={() => setCalcSubTab("budget")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
                  calcSubTab === "budget"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-white/[0.03] text-slate-400 border-white/[0.08] hover:text-white"
                }`}
              >
                {t.learn.calcBudgetTitle}
              </button>
              <button
                onClick={() => setCalcSubTab("utilization")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
                  calcSubTab === "utilization"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-white/[0.03] text-slate-400 border-white/[0.08] hover:text-white"
                }`}
              >
                {t.learn.calcUtilizationTitle}
              </button>
              <button
                onClick={() => setCalcSubTab("breakeven")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
                  calcSubTab === "breakeven"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-white/[0.03] text-slate-400 border-white/[0.08] hover:text-white"
                }`}
              >
                {t.learn.calcBreakEvenTitle}
              </button>
            </div>

            {/* Subtab 1: Interest Calculator */}
            {calcSubTab === "interest" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 bg-[#06100C]/70 border border-white/[0.08] rounded-2xl p-6 backdrop-blur-2xl space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{t.learn.calcInterestTitle}</h3>
                    <p className="text-xs text-slate-400 mt-1">{t.learn.calcInterestDesc}</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-300 block mb-1 font-medium">{t.learn.balanceLabel}</label>
                      <input
                        type="number"
                        value={interestBal}
                        onChange={(e) => setInterestBal(e.target.value)}
                        className="w-full bg-[#030606] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1 font-medium">{t.learn.aprLabel}</label>
                      <input
                        type="number"
                        value={interestApr}
                        onChange={(e) => setInterestApr(e.target.value)}
                        className="w-full bg-[#030606] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1 font-medium">{t.learn.monthlyPaymentLabel}</label>
                      <input
                        type="number"
                        value={interestPmt}
                        onChange={(e) => setInterestPmt(e.target.value)}
                        className="w-full bg-[#030606] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <button
                      onClick={runInterestCalc}
                      disabled={calculatingInterest}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    >
                      {calculatingInterest ? t.learn.calculating : t.learn.calculateButton}
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#06100C]/70 border border-white/[0.08] rounded-2xl p-6 backdrop-blur-2xl space-y-4">
                  {interestResult ? (
                    <div className="space-y-5">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/[0.03] border border-white/[0.06] p-3 rounded-xl">
                          <span className="text-[11px] text-slate-400 block">{t.learn.monthsToPayoff}</span>
                          <span className="text-xl font-bold text-white">
                            {interestResult.is_perpetual_debt ? "∞ (Never)" : `${interestResult.months_to_payoff} mo`}
                          </span>
                        </div>
                        <div className="bg-white/[0.03] border border-white/[0.06] p-3 rounded-xl">
                          <span className="text-[11px] text-slate-400 block">{t.learn.totalInterestPaid}</span>
                          <span className="text-xl font-bold text-rose-400">
                            ₹{interestResult.total_interest_paid?.toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-white/[0.03] border border-white/[0.06] p-3 rounded-xl">
                          <span className="text-[11px] text-slate-400 block">{t.learn.totalAmountPaid}</span>
                          <span className="text-xl font-bold text-emerald-400">
                            ₹{interestResult.total_amount_paid?.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {interestResult.is_perpetual_debt && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-xs text-rose-200">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <span>{t.learn.perpetualDebtWarning}</span>
                        </div>
                      )}

                      {/* Amortization Sample Table */}
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-slate-300 block">{t.learn.amortizationSample}</span>
                        <div className="max-h-56 overflow-y-auto rounded-xl border border-white/[0.06] text-xs">
                          <table className="w-full text-left">
                            <thead className="bg-white/[0.04] text-slate-400 text-[10px] uppercase">
                              <tr>
                                <th className="p-2">Mo</th>
                                <th className="p-2">Start Bal</th>
                                <th className="p-2">Interest</th>
                                <th className="p-2">Principal</th>
                                <th className="p-2">End Bal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04] text-slate-200">
                              {interestResult.schedule_sample?.map((s: any) => (
                                <tr key={s.month}>
                                  <td className="p-2 text-slate-400">#{s.month}</td>
                                  <td className="p-2">₹{s.starting_balance}</td>
                                  <td className="p-2 text-rose-300">₹{s.interest_charged}</td>
                                  <td className="p-2 text-emerald-300">₹{s.principal_paid}</td>
                                  <td className="p-2 font-medium">₹{s.ending_balance}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 italic">{interestResult.disclaimer}</p>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">Calculating...</div>
                  )}
                </div>
              </div>
            )}

            {/* Subtab 2: Minimum Due Trap Calculator */}
            {calcSubTab === "min_due" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 bg-[#06100C]/70 border border-white/[0.08] rounded-2xl p-6 backdrop-blur-2xl space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{t.learn.calcMinDueTitle}</h3>
                    <p className="text-xs text-slate-400 mt-1">{t.learn.calcMinDueDesc}</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-300 block mb-1 font-medium">{t.learn.balanceLabel}</label>
                      <input
                        type="number"
                        value={minDueBal}
                        onChange={(e) => setMinDueBal(e.target.value)}
                        className="w-full bg-[#030606] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1 font-medium">{t.learn.aprLabel}</label>
                      <input
                        type="number"
                        value={minDueApr}
                        onChange={(e) => setMinDueApr(e.target.value)}
                        className="w-full bg-[#030606] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1 font-medium">Alternative Fixed Payment (₹)</label>
                      <input
                        type="number"
                        value={minDueFixed}
                        onChange={(e) => setMinDueFixed(e.target.value)}
                        className="w-full bg-[#030606] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={runMinDueCalc}
                      disabled={calculatingMinDue}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    >
                      {calculatingMinDue ? t.learn.calculating : t.learn.calculateButton}
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#06100C]/70 border border-white/[0.08] rounded-2xl p-6 backdrop-blur-2xl space-y-4">
                  {minDueResult ? (
                    <div className="space-y-4">
                      <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200">
                        <p className="font-semibold">{minDueResult.educational_warning}</p>
                      </div>

                      <div className="space-y-3">
                        {minDueResult.scenarios?.map((sc: any, idx: number) => (
                          <div
                            key={idx}
                            className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                              idx === 0
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-100"
                                : idx === 1
                                ? "bg-teal-500/10 border-teal-500/30 text-teal-100"
                                : "bg-rose-500/10 border-rose-500/30 text-rose-100"
                            }`}
                          >
                            <div>
                              <span className="font-bold text-sm block">{sc.name}</span>
                              <span className="text-xs opacity-80">{sc.monthly_payment_desc}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-semibold">
                              <div>
                                <span className="opacity-70 block text-[10px]">Time</span>
                                <span>{sc.months_to_payoff} months</span>
                              </div>
                              <div>
                                <span className="opacity-70 block text-[10px]">Interest</span>
                                <span className={idx === 2 ? "text-rose-400 font-bold" : ""}>
                                  ₹{sc.total_interest_paid?.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <p className="text-[11px] text-slate-500 italic">{minDueResult.disclaimer}</p>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">Calculating...</div>
                  )}
                </div>
              </div>
            )}

            {/* Subtab 3: 50-30-20 Budget Planner */}
            {calcSubTab === "budget" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 bg-[#06100C]/70 border border-white/[0.08] rounded-2xl p-6 backdrop-blur-2xl space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{t.learn.calcBudgetTitle}</h3>
                    <p className="text-xs text-slate-400 mt-1">{t.learn.calcBudgetDesc}</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-300 block mb-1 font-medium">{t.learn.monthlyIncomeLabel}</label>
                      <input
                        type="number"
                        value={budgetIncome}
                        onChange={(e) => setBudgetIncome(e.target.value)}
                        className="w-full bg-[#030606] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-slate-400 block mb-1">Groceries (₹)</label>
                        <input
                          type="number"
                          value={budgetGrocery}
                          onChange={(e) => setBudgetGrocery(e.target.value)}
                          className="w-full bg-[#030606] border border-white/[0.1] rounded-xl px-2.5 py-1.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Utilities (₹)</label>
                        <input
                          type="number"
                          value={budgetUtility}
                          onChange={(e) => setBudgetUtility(e.target.value)}
                          className="w-full bg-[#030606] border border-white/[0.1] rounded-xl px-2.5 py-1.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Dining Out (₹)</label>
                        <input
                          type="number"
                          value={budgetDining}
                          onChange={(e) => setBudgetDining(e.target.value)}
                          className="w-full bg-[#030606] border border-white/[0.1] rounded-xl px-2.5 py-1.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Shopping (₹)</label>
                        <input
                          type="number"
                          value={budgetShopping}
                          onChange={(e) => setBudgetShopping(e.target.value)}
                          className="w-full bg-[#030606] border border-white/[0.1] rounded-xl px-2.5 py-1.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Fuel & Commute (₹)</label>
                        <input
                          type="number"
                          value={budgetFuel}
                          onChange={(e) => setBudgetFuel(e.target.value)}
                          className="w-full bg-[#030606] border border-white/[0.1] rounded-xl px-2.5 py-1.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Monthly Savings (₹)</label>
                        <input
                          type="number"
                          value={budgetSavings}
                          onChange={(e) => setBudgetSavings(e.target.value)}
                          className="w-full bg-[#030606] border border-white/[0.1] rounded-xl px-2.5 py-1.5 text-white"
                        />
                      </div>
                    </div>
                    <button
                      onClick={runBudgetCalc}
                      disabled={calculatingBudget}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    >
                      {calculatingBudget ? t.learn.calculating : t.learn.calculateButton}
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#06100C]/70 border border-white/[0.08] rounded-2xl p-6 backdrop-blur-2xl space-y-4">
                  {budgetResult ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                          <span className="text-[11px] text-emerald-400 font-semibold block">{t.learn.needsLabel}</span>
                          <span className="text-lg font-bold text-white">₹{budgetResult.needs_amount?.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 block">{budgetResult.needs_percentage}% of income</span>
                        </div>
                        <div className="bg-teal-500/10 border border-teal-500/20 p-3 rounded-xl">
                          <span className="text-[11px] text-teal-400 font-semibold block">{t.learn.wantsLabel}</span>
                          <span className="text-lg font-bold text-white">₹{budgetResult.wants_amount?.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 block">{budgetResult.wants_percentage}% of income</span>
                        </div>
                        <div className="bg-sky-500/10 border border-sky-500/20 p-3 rounded-xl">
                          <span className="text-[11px] text-sky-400 font-semibold block">{t.learn.savingsLabel}</span>
                          <span className="text-lg font-bold text-white">₹{budgetResult.savings_amount?.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 block">{budgetResult.savings_percentage}% of income</span>
                        </div>
                      </div>

                      {/* Educational Advice List */}
                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-semibold text-slate-300 block">Guidance & Observations</span>
                        <div className="space-y-1.5">
                          {budgetResult.advice?.map((adv: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-white/[0.02] p-2 rounded-lg border border-white/[0.04]">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{adv}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">Calculating...</div>
                  )}
                </div>
              </div>
            )}

            {/* Subtab 4: Credit Utilization Health */}
            {calcSubTab === "utilization" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 bg-[#06100C]/70 border border-white/[0.08] rounded-2xl p-6 backdrop-blur-2xl space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{t.learn.calcUtilizationTitle}</h3>
                    <p className="text-xs text-slate-400 mt-1">{t.learn.calcUtilizationDesc}</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-300 block mb-1 font-medium">{t.learn.totalLimitLabel}</label>
                      <input
                        type="number"
                        value={utilLimit}
                        onChange={(e) => setUtilLimit(e.target.value)}
                        className="w-full bg-[#030606] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1 font-medium">{t.learn.currentBalanceLabel}</label>
                      <input
                        type="number"
                        value={utilBalance}
                        onChange={(e) => setUtilBalance(e.target.value)}
                        className="w-full bg-[#030606] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={runUtilCalc}
                      disabled={calculatingUtil}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    >
                      {calculatingUtil ? t.learn.calculating : t.learn.calculateButton}
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#06100C]/70 border border-white/[0.08] rounded-2xl p-6 backdrop-blur-2xl space-y-4">
                  {utilResult ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl">
                        <div>
                          <span className="text-xs text-slate-400 block">{t.learn.utilizationRateLabel}</span>
                          <span className="text-3xl font-extrabold text-white">
                            {utilResult.overall_utilization_pct}%
                          </span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            utilResult.status === "IDEAL"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : utilResult.status === "MODERATE"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {utilResult.status}
                        </span>
                      </div>

                      <div className="p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-2">
                        <span className="text-xs font-semibold text-emerald-400 block">CIBIL Score Impact</span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {utilResult.cibil_impact_assessment}
                        </p>
                      </div>

                      {utilResult.amount_to_pay_for_ideal > 0 && (
                        <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-xs text-teal-200">
                          To reach the ideal 30% ratio (₹{utilResult.target_balance_for_30_pct?.toLocaleString()}), consider paying down{" "}
                          <strong className="text-white">₹{utilResult.amount_to_pay_for_ideal?.toLocaleString()}</strong> before statement generation.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">Calculating...</div>
                  )}
                </div>
              </div>
            )}

            {/* Subtab 5: Break-Even Calculator */}
            {calcSubTab === "breakeven" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 bg-[#06100C]/70 border border-white/[0.08] rounded-2xl p-6 backdrop-blur-2xl space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{t.learn.calcBreakEvenTitle}</h3>
                    <p className="text-xs text-slate-400 mt-1">{t.learn.calcBreakEvenDesc}</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-300 block mb-1 font-medium">{t.learn.annualFeeLabel}</label>
                      <input
                        type="number"
                        value={beFee}
                        onChange={(e) => setBeFee(e.target.value)}
                        className="w-full bg-[#030606] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1 font-medium">{t.learn.monthlySpendLabel}</label>
                      <input
                        type="number"
                        value={beMonthlySpend}
                        onChange={(e) => setBeMonthlySpend(e.target.value)}
                        className="w-full bg-[#030606] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1 font-medium">{t.learn.rewardRateLabel}</label>
                      <input
                        type="number"
                        value={beRewardRate}
                        onChange={(e) => setBeRewardRate(e.target.value)}
                        className="w-full bg-[#030606] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1 font-medium">Renewal Waiver Threshold (₹)</label>
                      <input
                        type="number"
                        value={beWaiver}
                        onChange={(e) => setBeWaiver(e.target.value)}
                        className="w-full bg-[#030606] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={runBeCalc}
                      disabled={calculatingBe}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    >
                      {calculatingBe ? t.learn.calculating : t.learn.calculateButton}
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#06100C]/70 border border-white/[0.08] rounded-2xl p-6 backdrop-blur-2xl space-y-4">
                  {beResult ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/[0.03] border border-white/[0.06] p-3 rounded-xl">
                          <span className="text-[11px] text-slate-400 block">{t.learn.breakEvenMonthlySpend}</span>
                          <span className="text-xl font-bold text-white">
                            ₹{beResult.break_even_monthly_spend?.toLocaleString()}/mo
                          </span>
                        </div>
                        <div className="bg-white/[0.03] border border-white/[0.06] p-3 rounded-xl">
                          <span className="text-[11px] text-slate-400 block">{t.learn.netBenefitLabel}</span>
                          <span className={`text-xl font-bold ${beResult.is_card_worth_it ? "text-emerald-400" : "text-rose-400"}`}>
                            {beResult.net_value >= 0 ? `+₹${beResult.net_value?.toLocaleString()}` : `-₹${Math.abs(beResult.net_value)?.toLocaleString()}`}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <span className="text-xs font-semibold text-emerald-400 block">Assessment Verdict</span>
                        <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                          {beResult.verdict}
                        </p>
                      </div>

                      <p className="text-[11px] text-slate-500 italic">{beResult.disclaimer}</p>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">Calculating...</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LEARNING PROGRESS & PATH */}
        {activeTab === "progress" && (
          <div className="space-y-8">
            {/* Overall Progress Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-[#06100C]/70 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-2xl">
                <span className="text-xs font-medium text-slate-400 block">{t.learn.overallProgressTitle}</span>
                <span className="text-3xl font-extrabold text-white mt-1 block">
                  {overallProgress ? `${overallProgress.completion_percentage}%` : "0%"}
                </span>
                <div className="w-full bg-white/[0.08] h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${overallProgress?.completion_percentage || 0}%` }}
                  />
                </div>
              </div>

              <div className="bg-[#06100C]/70 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-2xl">
                <span className="text-xs font-medium text-slate-400 block">{t.learn.masteredTopics}</span>
                <span className="text-3xl font-extrabold text-white mt-1 block">
                  {overallProgress ? `${overallProgress.completed_topics} / ${overallProgress.total_topics}` : "0 / 12"}
                </span>
                <p className="text-xs text-slate-500 mt-2">Interactive topics mastered across 5 disciplines</p>
              </div>

              <div className="bg-[#06100C]/70 border border-white/[0.08] rounded-2xl p-5 backdrop-blur-2xl">
                <span className="text-xs font-medium text-slate-400 block">{t.learn.averageScore}</span>
                <span className="text-3xl font-extrabold text-emerald-400 mt-1 block">
                  {overallProgress?.average_quiz_score ? `${overallProgress.average_quiz_score}%` : "100%"}
                </span>
                <p className="text-xs text-slate-500 mt-2">Knowledge check quiz performance</p>
              </div>
            </div>

            {/* Path Selection Interface */}
            <div className="bg-[#06100C]/70 border border-white/[0.08] rounded-2xl p-6 backdrop-blur-2xl space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">{t.learn.pathTitle}</h3>
                <p className="text-xs text-slate-400 mt-1">{t.learn.pathDesc}</p>
              </div>

              {pathMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
                  {pathMessage}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Path 1 */}
                <div
                  onClick={() => handleUpdatePath("NEW_TO_FINANCE")}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    userPath === "NEW_TO_FINANCE"
                      ? "bg-emerald-500/15 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                      : "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <PieChart className="w-5 h-5 text-emerald-400" />
                      {userPath === "NEW_TO_FINANCE" && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-white">{t.learn.pathNewToFinance}</h4>
                    <p className="text-xs text-slate-400">{t.learn.pathNewToFinanceDesc}</p>
                  </div>
                </div>

                {/* Path 2 */}
                <div
                  onClick={() => handleUpdatePath("UNDERSTAND_CREDIT")}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    userPath === "UNDERSTAND_CREDIT"
                      ? "bg-emerald-500/15 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                      : "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <CreditCard className="w-5 h-5 text-teal-400" />
                      {userPath === "UNDERSTAND_CREDIT" && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-white">{t.learn.pathUnderstandCredit}</h4>
                    <p className="text-xs text-slate-400">{t.learn.pathUnderstandCreditDesc}</p>
                  </div>
                </div>

                {/* Path 3 */}
                <div
                  onClick={() => handleUpdatePath("OPTIMIZE_EXISTING")}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    userPath === "OPTIMIZE_EXISTING"
                      ? "bg-emerald-500/15 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                      : "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Sparkles className="w-5 h-5 text-sky-400" />
                      {userPath === "OPTIMIZE_EXISTING" && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-white">{t.learn.pathOptimizeExisting}</h4>
                    <p className="text-xs text-slate-400">{t.learn.pathOptimizeExistingDesc}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LESSON READER MODAL */}
      {activeLesson && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#050D0A] border border-white/[0.12] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setActiveLesson(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-2 pr-8 border-b border-white/[0.08] pb-5">
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                Lesson {activeLesson.order} • {activeLesson.reading_time_minutes} {t.learn.readingTime}
              </span>
              <h2 className="text-2xl font-extrabold text-white">{activeLesson.title}</h2>
              <p className="text-sm text-slate-400">{activeLesson.summary}</p>
            </div>

            {/* Markdown Content Body */}
            <div className="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed space-y-4">
              <div
                className="whitespace-pre-line leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: activeLesson.content_markdown
                    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-white mt-4 mb-2">$1</h3>')
                    .replace(/^#### (.*$)/gim, '<h4 class="text-base font-bold text-emerald-300 mt-3 mb-1">$1</h4>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                    .replace(/^> (.*$)/gim, '<blockquote class="border-l-2 border-emerald-500 pl-4 italic text-emerald-200 my-3 bg-emerald-500/5 py-2 rounded-r-lg">$1</blockquote>'),
                }}
              />
            </div>

            {/* Key Takeaways */}
            {activeLesson.key_takeaways && activeLesson.key_takeaways.length > 0 && (
              <div className="bg-[#081510] border border-emerald-500/20 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {t.learn.keyTakeawaysTitle}
                </h4>
                <ul className="space-y-2">
                  {activeLesson.key_takeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-normal">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Interactive Knowledge Check Quiz */}
            {activeLesson.quiz && activeLesson.quiz.length > 0 && (
              <div className="border-t border-white/[0.08] pt-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    {t.learn.knowledgeCheckTitle}
                  </h4>
                  {quizSubmitted && (
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        quizScore && quizScore >= 50
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      Score: {quizScore}%
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {activeLesson.quiz.map((q, qIndex) => {
                    const isAnswered = selectedAnswers[q.id] !== undefined;
                    const isCorrect = selectedAnswers[q.id] === q.correct_option_id;

                    return (
                      <div key={q.id} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-3">
                        <p className="text-xs font-semibold text-slate-200">
                          {qIndex + 1}. {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.options.map((opt) => {
                            const isSelected = selectedAnswers[q.id] === opt.id;
                            let optClass = "bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-white/[0.06]";

                            if (quizSubmitted) {
                              if (opt.id === q.correct_option_id) {
                                optClass = "bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-medium";
                              } else if (isSelected) {
                                optClass = "bg-rose-500/20 border-rose-500/50 text-rose-200";
                              }
                            } else if (isSelected) {
                              optClass = "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-medium";
                            }

                            return (
                              <button
                                key={opt.id}
                                disabled={quizSubmitted}
                                onClick={() => setSelectedAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                                className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${optClass}`}
                              >
                                <span>{opt.text}</span>
                                {quizSubmitted && opt.id === q.correct_option_id && (
                                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && (
                          <p className="text-[11px] text-slate-400 bg-white/[0.02] p-2 rounded-lg italic">
                            💡 {q.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!quizSubmitted ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={
                      submittingQuiz || Object.keys(selectedAnswers).length < activeLesson.quiz.length
                    }
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    {submittingQuiz ? "Submitting..." : t.learn.submitQuiz}
                  </button>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-400 font-semibold">{t.learn.quizPassed}</span>
                    <button
                      onClick={() => setActiveLesson(null)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                    >
                      {t.learn.backToLessons}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
