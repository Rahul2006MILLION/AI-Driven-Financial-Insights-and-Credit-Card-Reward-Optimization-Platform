"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage, Language } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { apiFetch, storeSession } from "@/lib/api";
import {
  Globe,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Compass,
  Wallet,
  Loader2,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { session, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [financialPathway, setFinancialPathway] = useState<"CREDIT_CARD" | "NO_CREDIT_CARD">("NO_CREDIT_CARD");
  const [financialPath, setFinancialPath] = useState<string>("NEW_TO_FINANCE");
  const [savingPath, setSavingPath] = useState<boolean>(false);

  const savePathAndNext = async (path: string, pathway: "CREDIT_CARD" | "NO_CREDIT_CARD") => {
    setFinancialPath(path);
    setFinancialPathway(pathway);
    setSavingPath(true);

    try {
      // 1. Persist financial_pathway to backend profile
      await apiFetch("/profile", {
        method: "PUT",
        body: JSON.stringify({ financial_pathway: pathway }),
      }).catch((err) => console.warn("Profile pathway update error:", err));

      // 2. Persist financial_path and pathway to backend education preference
      await apiFetch("/education/path", {
        method: "PUT",
        body: JSON.stringify({ financial_path: path, financial_pathway: pathway }),
      }).catch((err) => console.warn("Education path update error:", err));

      // 3. Immediately activate and persist pathway in frontend session & localStorage
      updateUser({ financialPathway: pathway });
      if (session) {
        storeSession({ ...session, financialPathway: pathway });
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("cliq_financial_pathway", pathway);
      }
    } catch (e) {
      console.error("Error saving financial pathway:", e);
    } finally {
      setSavingPath(false);
      setStep(3);
    }
  };

  const finishOnboarding = () => {
    // Guarantee active pathway persistence
    updateUser({ financialPathway });
    if (session) {
      storeSession({ ...session, financialPathway });
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("cliq_financial_pathway", financialPathway);
    }

    // Redirect to the appropriate dashboard
    router.push("/dashboard");
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 py-12 flex flex-col justify-center bg-[#0E1013]">
      {/* Progress Steps (3 Steps: Language, Learning Path, Complete) */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-10 overflow-x-auto pb-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 shrink-0">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s
                  ? "bg-lime-400 text-[#0E1013] shadow-neonLime"
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
                : t.onboarding.stepCompleteTitle}
            </span>
            {s < 3 && <div className="w-8 sm:w-16 h-px bg-white/10" />}
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
              <h2 className="text-2xl font-black text-white">
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
                      ? "bg-emerald-500/15 border-emerald-500 text-white shadow-[0_0_15px_rgba(76,192,63,0.25)]"
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
                className="px-6 py-2.5 rounded-full bg-lime-400 hover:bg-lime-300 text-[#0E1013] font-bold text-xs shadow-neonLime flex items-center gap-2"
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
              <h2 className="text-2xl font-black text-white">
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
                    ? "bg-emerald-500/15 border-emerald-500 shadow-[0_0_20px_rgba(76,192,63,0.25)] text-white"
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
                    ? "bg-emerald-500/15 border-emerald-500 shadow-[0_0_20px_rgba(76,192,63,0.25)] text-white"
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

            {/* Primary Goal Options */}
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
                disabled={savingPath}
                onClick={() => savePathAndNext(financialPath, financialPathway)}
                className="px-6 py-2.5 rounded-full bg-lime-400 hover:bg-lime-300 text-[#0E1013] font-bold text-xs shadow-neonLime flex items-center gap-2 disabled:opacity-50 transition-all"
              >
                {savingPath ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Activating Pathway...</span>
                  </>
                ) : (
                  <>
                    <span>{t.onboarding.continueButton}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Complete & Launch */}
        {step === 3 && (
          <div className="text-center space-y-6 py-4">
            <div className="inline-flex w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 items-center justify-center text-emerald-400 mb-2 shadow-[0_0_25px_rgba(76,192,63,0.25)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-white">
              {t.onboarding.readyHeading}
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {financialPathway === "NO_CREDIT_CARD"
                ? "Your Cash & Savings workspace is active. Track your cash flow, analyze non-card spending, and follow your 50/30/20 budget framework seamlessly."
                : "Your Credit Card Command Center is ready. Connect your cards anytime, optimize rewards, and explore personalized merchant discounts."}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={finishOnboarding}
                className="w-full sm:w-auto px-8 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#0E1013] font-bold text-sm shadow-[0_0_25px_rgba(76,192,63,0.4)] transition-all flex items-center justify-center gap-2"
              >
                <span>
                  {financialPathway === "NO_CREDIT_CARD"
                    ? "Go to Personal Finance Command Center"
                    : "Go to Command Center"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
