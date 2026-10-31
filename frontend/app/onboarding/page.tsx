"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage, Language } from "@/lib/i18n";
import { DemoBootstrap } from "@/components/DemoBootstrap";
import { Globe, CreditCard, ArrowRight, CheckCircle2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [step, setStep] = useState(1);
  const [currency, setCurrency] = useState("INR");

  const finishOnboarding = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 py-12 flex flex-col justify-center bg-[#040707]">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
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
              className={`text-xs font-semibold hidden sm:inline ${
                step === s ? "text-white" : "text-slate-400"
              }`}
            >
              {s === 1 ? "Language & Region" : s === 2 ? "Portfolio" : "Complete"}
            </span>
            {s < 3 && <div className="w-12 h-px bg-white/10" />}
          </div>
        ))}
      </div>

      <div className="p-8 sm:p-10 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_20px_50px_0_rgba(0,0,0,0.7)]">
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center max-w-lg mx-auto">
              <div className="inline-flex w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center text-emerald-400 mb-3">
                <Globe className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white glow-emerald">Select Your Language</h2>
              <p className="text-xs text-slate-400 mt-1.5">
                All recommendations, assistant dialogues, and analytics adapt to your language.
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
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center max-w-lg mx-auto">
              <div className="inline-flex w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center text-emerald-400 mb-3">
                <CreditCard className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white glow-emerald">Initialize Your Portfolio</h2>
              <p className="text-xs text-slate-400 mt-1.5">
                Load verified Indian credit cards into your wallet, or start with a pre-configured sample set.
              </p>
            </div>

            <div className="pt-4 flex justify-center">
              <DemoBootstrap onSeeded={() => setStep(3)} />
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
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.08] text-white font-semibold text-xs border border-white/10"
              >
                Skip For Now
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-6 py-4">
            <div className="inline-flex w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 items-center justify-center text-emerald-400 mb-2 shadow-[0_0_25px_rgba(16,185,129,0.25)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-white glow-emerald">You're All Set!</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your financial command center is configured with liquid glass precision.
            </p>

            <div className="pt-4">
              <button
                type="button"
                onClick={finishOnboarding}
                className="px-8 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#040707] font-bold text-sm shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all"
              >
                Enter Command Center
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
