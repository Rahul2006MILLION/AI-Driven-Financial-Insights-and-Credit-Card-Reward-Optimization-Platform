"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage, Language } from "@/lib/i18n";
import { DemoBootstrap } from "@/components/DemoBootstrap";
import { Sparkles, Globe, CreditCard, FileUp, PlusCircle, CheckCircle2, ArrowRight } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [step, setStep] = useState(1);
  const [currency, setCurrency] = useState("INR");

  const finishOnboarding = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 py-12 flex flex-col justify-center">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s
                  ? "bg-gradient-to-r from-cliq-cyan to-cliq-emerald text-cliq-bg shadow-neonCyan"
                  : step > s
                  ? "bg-cliq-emerald/20 text-cliq-emerald border border-cliq-emerald/40"
                  : "bg-cliq-surface text-cliq-textMuted border border-cliq-border"
              }`}
            >
              {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
            </div>
            <span
              className={`text-xs font-semibold hidden sm:inline ${
                step === s ? "text-white" : "text-cliq-textSecondary"
              }`}
            >
              {s === 1 ? "Language & Region" : s === 2 ? "Credit Card Portfolio" : "Ready"}
            </span>
            {s < 3 && <div className="w-12 h-px bg-cliq-border" />}
          </div>
        ))}
      </div>

      <div className="glass-panel p-8 sm:p-10 rounded-2xl border-glow-cyan shadow-cardGlass">
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center max-w-lg mx-auto">
              <div className="inline-flex w-12 h-12 rounded-xl bg-cliq-cyan/10 border border-cliq-cyan/30 items-center justify-center text-cliq-cyan mb-3">
                <Globe className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Select Your Language & Currency</h2>
              <p className="text-xs text-cliq-textSecondary mt-2">
                CLIQ adapts all explanations, recommendations, and analytics to your preferred language.
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
                  className={`p-5 rounded-2xl border text-left transition-all ${
                    language === item.code
                      ? "bg-gradient-to-b from-cliq-cyan/20 to-cliq-surface border-cliq-cyan shadow-neonCyan"
                      : "bg-cliq-surface border-cliq-border hover:border-cliq-cyan/40"
                  }`}
                >
                  <div className="text-base font-bold text-white">{item.label}</div>
                  <div className="text-[11px] text-cliq-textSecondary mt-1">{item.sub}</div>
                </button>
              ))}
            </div>

            <div className="pt-6 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cliq-cyan to-cliq-emerald text-cliq-bg font-bold text-xs shadow-neonCyan hover:scale-105 transition-all flex items-center gap-2"
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
              <div className="inline-flex w-12 h-12 rounded-xl bg-cliq-turquoise/10 border border-cliq-turquoise/30 items-center justify-center text-cliq-turquoise mb-3">
                <CreditCard className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Setup Your Card Portfolio</h2>
              <p className="text-xs text-cliq-textSecondary mt-2">
                How would you like to initialize your credit cards in CLIQ?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              {/* Option 1: Sample Provisioning */}
              <div className="p-5 rounded-2xl border border-cliq-cyan/50 bg-cliq-surface/90 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-cliq-cyan/10 border border-cliq-cyan/30 flex items-center justify-center text-cliq-cyan mb-3">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-sm">Instant Verified Portfolio</h3>
                  <p className="text-xs text-cliq-textSecondary mt-1">
                    Preload 3 real Indian credit cards (HDFC Millennia, Axis Ace, ICICI Amazon Pay) and sample spends.
                  </p>
                </div>
                <div className="pt-4">
                  <DemoBootstrap onSeeded={() => setStep(3)} />
                </div>
              </div>

              {/* Option 2: Upload PDF */}
              <div
                onClick={() => router.push("/documents")}
                className="p-5 rounded-2xl border border-cliq-border bg-cliq-surface hover:border-cliq-turquoise/40 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-cliq-turquoise/10 border border-cliq-turquoise/30 flex items-center justify-center text-cliq-turquoise mb-3">
                    <FileUp className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-sm">Upload Statement PDF</h3>
                  <p className="text-xs text-cliq-textSecondary mt-1">
                    Upload your credit card PDF. CLIQ will extract the rules for your verification.
                  </p>
                </div>
                <div className="pt-4 text-xs font-semibold text-cliq-turquoise flex items-center gap-1">
                  <span>Upload PDF</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Option 3: Manual Entry */}
              <div
                onClick={() => router.push("/cards/new")}
                className="p-5 rounded-2xl border border-cliq-border bg-cliq-surface hover:border-cliq-emerald/40 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-cliq-emerald/10 border border-cliq-emerald/30 flex items-center justify-center text-cliq-emerald mb-3">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-sm">Add Card Manually</h3>
                  <p className="text-xs text-cliq-textSecondary mt-1">
                    Enter your card issuer, network, annual fee, and category cashback rates by hand.
                  </p>
                </div>
                <div className="pt-4 text-xs font-semibold text-cliq-emerald flex items-center gap-1">
                  <span>Add Manually</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs text-cliq-textSecondary hover:text-white"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-cliq-surface border border-cliq-border text-white font-semibold text-xs hover:border-cliq-cyan"
              >
                Skip to Dashboard
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-6 space-y-6">
            <div className="inline-flex w-16 h-16 rounded-full bg-cliq-emerald/15 border border-cliq-emerald/40 items-center justify-center text-cliq-emerald shadow-neonEmerald">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white">You're All Set with CLIQ!</h2>
              <p className="text-xs text-cliq-textSecondary mt-2 max-w-md mx-auto">
                Your financial intelligence dashboard is active. You can now optimize any transaction, audit recurring subscriptions, or ask the AI assistant.
              </p>
            </div>

            <div>
              <button
                onClick={finishOnboarding}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-cliq-cyan via-cliq-turquoise to-cliq-emerald text-cliq-bg font-extrabold text-sm shadow-neonCyan hover:scale-105 transition-all inline-flex items-center gap-2"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
