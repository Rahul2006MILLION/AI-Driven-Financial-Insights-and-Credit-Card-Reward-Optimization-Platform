"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage, Language } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { DemoBootstrap } from "@/components/DemoBootstrap";
import {
  Globe,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  PieChart,
  GraduationCap,
  Sparkles,
  Compass,
  Wallet,
  Coins,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { session } = useAuth();
  const token = session?.accessToken;
  const [step, setStep] = useState(1);
  const [financialPathway, setFinancialPathway] = useState<"CREDIT_CARD" | "NO_CREDIT_CARD">("NO_CREDIT_CARD");
  const [financialPath, setFinancialPath] = useState<string>("NEW_TO_FINANCE");
  const [incomeAmount, setIncomeAmount] = useState<number>(50000);
  const [incomeFrequency, setIncomeFrequency] = useState<string>("MONTHLY");
  const [budgetLimit, setBudgetLimit] = useState<number>(35000);
  const [savingIncome, setSavingIncome] = useState<boolean>(false);

  const savePathAndNext = async (path: string, pathway: "CREDIT_CARD" | "NO_CREDIT_CARD") => {
    setFinancialPath(path);
    setFinancialPathway(pathway);
    if (token) {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        await fetch(`${apiBase}/api/v1/auth/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ financial_pathway: pathway }),
        });
        await fetch(`${apiBase}/api/v1/education/path`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ financial_path: path }),
        });
      } catch (e) {
        console.error("Error saving path:", e);
      }
    }
    setStep(3);
  };

  const handleSaveIncomeAndBudget = async () => {
    if (!token || !incomeAmount || incomeAmount <= 0) {
      setStep(4);
      return;
    }
    setSavingIncome(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await fetch(`${apiBase}/api/v1/incomes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          source_name: incomeFrequency === "IRREGULAR" ? "Freelance / Gig Work" : "Primary Salary",
          amount: incomeAmount,
          frequency: incomeFrequency === "IRREGULAR" ? "IRREGULAR" : "MONTHLY",
          is_irregular: incomeFrequency === "IRREGULAR",
        }),
      });

      await fetch(`${apiBase}/api/v1/education/budget`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          monthly_income: incomeAmount,
          total_budget: budgetLimit > 0 ? budgetLimit : Math.round(incomeAmount * 0.7),
          category_budgets: {
            grocery: Math.round(incomeAmount * 0.25),
            dining: Math.round(incomeAmount * 0.15),
            utility: Math.round(incomeAmount * 0.1),
          },
        }),
      });
    } catch (e) {
      console.error("Failed to save initial income/budget:", e);
    } finally {
      setSavingIncome(false);
      setStep(4);
    }
  };

  const finishOnboarding = () => {
    if (financialPathway === "NO_CREDIT_CARD") {
      router.push("/dashboard");
    } else if (financialPath === "NEW_TO_FINANCE" || financialPath === "UNDERSTAND_CREDIT") {
      router.push("/learn");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 py-12 flex flex-col justify-center bg-[#040707]">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-10 overflow-x-auto pb-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2 shrink-0">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s
                  ? "bg-emerald-500 text-[#040707] shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                  : step > s
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-white/[0.04] text-slate-500 border border-white/10"
              }`}
            >
              {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
            </div>
            <span
              className={`text-xs font-semibold hidden md:inline ${
                step === s ? "text-white" : "text-slate-400"
              }`}
            >
              {s === 1
                ? t.onboarding.stepLangTitle
                : s === 2
                ? "Learning Path"
                : s === 3
                ? t.onboarding.stepPortfolioTitle
                : t.onboarding.stepCompleteTitle}
            </span>
            {s < 4 && <div className="w-8 sm:w-12 h-px bg-white/10" />}
          </div>
        ))}
      </div>

      <div className="p-8 sm:p-10 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_20px_50px_0_rgba(0,0,0,0.7)]">
        {/* Step 1: Language Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center max-w-lg mx-auto">
              <div className="inline-flex w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center text-emerald-400 mb-3">
                <Globe className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white glow-emerald">
                {t.onboarding.selectLanguageHeading}
              </h2>
              <p className="text-xs text-slate-400 mt-1.5">
                {t.onboarding.selectLanguageSub}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {[
                { code: "en", label: "English", sub: "Standard Financial Terms" },
                { code: "hi", label: "हिन्दी", sub: "सरल और स्पष्ट वित्तीय विश्लेषण" },
                { code: "kn", label: "ಕನ್ನಡ", sub: "ನಿಮ್ಮದೇ ಮಾತೃಭಾಷೆಯಲ್ಲಿ ಆರ್ಥಿಕತೆ" },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLanguage(item.code as Language)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    language === item.code
                      ? "bg-emerald-500/15 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                      : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="text-sm font-bold text-white">{item.label}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{item.sub}</div>
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-white/[0.06] flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#040707] font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center gap-2"
              >
                <span>{t.onboarding.continueButton}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Financial Pathway & Learning Path */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center max-w-lg mx-auto">
              <div className="inline-flex w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 items-center justify-center text-teal-400 mb-3">
                <Compass className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white glow-emerald">
                Choose Your Financial Pathway
              </h2>
              <p className="text-xs text-slate-400 mt-1.5">
                CLIQ adapts its features, calculators, and dashboard to match your actual payment habits.
              </p>
            </div>

            {/* Pathway Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div
                onClick={() => {
                  setFinancialPathway("NO_CREDIT_CARD");
                  setFinancialPath("NEW_TO_FINANCE");
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  financialPathway === "NO_CREDIT_CARD"
                    ? "bg-emerald-500/15 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)] text-white"
                    : "bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/[0.05]"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-emerald-400" />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                      PATH B
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white">No-Credit-Card User</h4>
                  <p className="text-xs text-slate-300">
                    I use UPI, Cash, Debit, or Bank Transfers. Help me track cash flow, manage irregular income, and build savings discipline.
                  </p>
                </div>
              </div>

              <div
                onClick={() => {
                  setFinancialPathway("CREDIT_CARD");
                  setFinancialPath("OPTIMIZE_EXISTING");
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  financialPathway === "CREDIT_CARD"
                    ? "bg-emerald-500/15 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)] text-white"
                    : "bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/[0.05]"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-teal-400" />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300">
                      PATH A
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white">Credit Card User</h4>
                  <p className="text-xs text-slate-300">
                    I own one or more credit cards. Help me maximize cashback and reward miles, audit annual fees, and explore merchant offers.
                  </p>
                </div>
              </div>
            </div>

            {/* Path Option Details */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Primary Goal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div
                  onClick={() => setFinancialPath("NEW_TO_FINANCE")}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    financialPath === "NEW_TO_FINANCE"
                      ? "bg-white/[0.08] border-emerald-500 text-white"
                      : "bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="font-bold text-xs text-white">Understand Basics</div>
                  <p className="text-[11px] text-slate-400 mt-1">Budgeting, cash flow, debt risks</p>
                </div>

                <div
                  onClick={() => setFinancialPath("UNDERSTAND_CREDIT")}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    financialPath === "UNDERSTAND_CREDIT"
                      ? "bg-white/[0.08] border-emerald-500 text-white"
                      : "bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="font-bold text-xs text-white">Learn Credit & Score</div>
                  <p className="text-[11px] text-slate-400 mt-1">How credit scores & interest work</p>
                </div>

                <div
                  onClick={() => setFinancialPath("OPTIMIZE_EXISTING")}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    financialPath === "OPTIMIZE_EXISTING"
                      ? "bg-white/[0.08] border-emerald-500 text-white"
                      : "bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="font-bold text-xs text-white">Optimize Spending</div>
                  <p className="text-[11px] text-slate-400 mt-1">Smart rewards & expense tracking</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-400 hover:text-white"
              >
                &larr; Back
              </button>
              <button
                type="button"
                onClick={() => savePathAndNext(financialPath, financialPathway)}
                className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#040707] font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center gap-2"
              >
                <span>{t.onboarding.continueButton}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Portfolio Setup OR Cash Flow & Income Setup */}
        {step === 3 && (
          <div className="space-y-6">
            {financialPathway === "NO_CREDIT_CARD" ? (
              <div className="space-y-6">
                <div className="text-center max-w-lg mx-auto">
                  <div className="inline-flex w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center text-emerald-400 mb-3">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black text-white glow-emerald">
                    Set Up Your Income & Budget
                  </h2>
                  <p className="text-xs text-slate-400 mt-1.5">
                    No credit card required. Tell us your approximate monthly earnings so CLIQ can calculate your cash flow resilience.
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Estimated Monthly Inflow (₹)
                    </label>
                    <input
                      type="number"
                      value={incomeAmount}
                      onChange={(e) => setIncomeAmount(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
                      placeholder="e.g. 50000"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Income Cadence
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setIncomeFrequency("MONTHLY")}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                          incomeFrequency === "MONTHLY"
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                            : "bg-white/[0.02] border-white/10 text-slate-400"
                        }`}
                      >
                        Regular Salary
                      </button>
                      <button
                        type="button"
                        onClick={() => setIncomeFrequency("IRREGULAR")}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                          incomeFrequency === "IRREGULAR"
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                            : "bg-white/[0.02] border-white/10 text-slate-400"
                        }`}
                      >
                        Irregular / Freelance
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Target Monthly Spending Limit (₹)
                    </label>
                    <input
                      type="number"
                      value={budgetLimit}
                      onChange={(e) => setBudgetLimit(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
                      placeholder="e.g. 35000"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Recommended: 50-70% of monthly income for needs & wants.
                    </p>
                  </div>

                  <div className="pt-2 flex justify-center">
                    <button
                      type="button"
                      onClick={handleSaveIncomeAndBudget}
                      disabled={savingIncome}
                      className="w-full py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2"
                    >
                      <span>{savingIncome ? "Saving..." : "Save & Continue"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center max-w-lg mx-auto">
                  <div className="inline-flex w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center text-emerald-400 mb-3">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black text-white glow-emerald">
                    {t.onboarding.portfolioHeading}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1.5">
                    {t.onboarding.portfolioSub}
                  </p>
                </div>

                <div className="pt-4 flex flex-col items-center gap-4">
                  <DemoBootstrap onSeeded={() => setStep(4)} />
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-slate-400 hover:text-white"
              >
                &larr; Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.08] text-white font-semibold text-xs border border-white/10"
              >
                Skip / Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Ready */}
        {step === 4 && (
          <div className="text-center space-y-6 py-4">
            <div className="inline-flex w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 items-center justify-center text-emerald-400 mb-2 shadow-[0_0_25px_rgba(16,185,129,0.25)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-white glow-emerald">
              {t.onboarding.readyHeading}
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {financialPathway === "NO_CREDIT_CARD"
                ? "Your financial intelligence workspace is active. Track your cash flow, analyze non-card spending, and follow your budget seamlessly."
                : financialPath === "NEW_TO_FINANCE" || financialPath === "UNDERSTAND_CREDIT"
                ? "Your financial learning workspace is ready. Let's begin building financial literacy with CLIQ Learn!"
                : t.onboarding.readySub}
            </p>

            <div className="pt-4">
              <button
                type="button"
                onClick={finishOnboarding}
                className="px-8 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#040707] font-bold text-sm shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all"
              >
                {financialPathway === "NO_CREDIT_CARD"
                  ? "Go to Financial Command Center"
                  : financialPath === "NEW_TO_FINANCE" || financialPath === "UNDERSTAND_CREDIT"
                  ? "Explore CLIQ Learn"
                  : t.onboarding.finishButton}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
