"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { DigitalCreditCard } from "@/components/DigitalCreditCard";
import { BANK_ISSUERS } from "@/lib/cardCatalogue";
import {
  CreditCard, Zap, Gift, BarChart3,
  Wallet, PiggyBank, GraduationCap, TrendingUp,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease }}>
      {children}
    </motion.div>
  );
}

/* ── Budget bars visual for no-card journey ─────────────────── */
function BudgetVisual() {
  const items = [
    { label: "Income", value: "₹42,000", pct: 100, color: "bg-[#00F8D8]" },
    { label: "Expenses", value: "₹28,340", pct: 67, color: "bg-emerald-400" },
    { label: "Savings", value: "₹13,660", pct: 33, color: "bg-[#00C8AE]" },
  ];

  const goals = [
    { label: "Emergency Fund", target: "₹1,00,000", done: 62 },
    { label: "Education", target: "₹50,000", done: 44 },
  ];

  return (
    <div className="rounded-2xl bg-[#070F0C]/80 border border-lime-400/15 p-5 space-y-4">
      <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Monthly Overview</div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">{item.label}</span>
              <span className="text-xs font-semibold text-white">{item.value}</span>
            </div>
            <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${item.color}`}
                initial={{ width: 0 }}
                whileInView={{ width: `${item.pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="pt-2 border-t border-white/[0.06] space-y-2">
        <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Savings Goals</div>
        {goals.map((g) => (
          <div key={g.label} className="flex items-center justify-between">
            <div>
              <div className="text-xs text-white font-medium">{g.label}</div>
              <div className="text-[10px] text-slate-500">{g.target}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-[#00F8D8]"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${g.done}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease }}
                />
              </div>
              <span className="text-[10px] font-bold w-8 text-right" style={{ color: "#00C8AE" }}>{g.done}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Journey card ────────────────────────────────────────────── */
function JourneyCard({
  accent, label, headline, description, features, visual, delay,
}: {
  accent: "emerald" | "turquoise";
  label: string;
  headline: string;
  description: string;
  features: { icon: React.ElementType; text: string }[];
  visual: React.ReactNode;
  delay: number;
}) {
  const borderColor = accent === "emerald"
    ? "border-emerald-500/25 hover:border-emerald-500/50"
    : "border-[#00F8D8]/22 hover:border-[#00F8D8]/45";
  const glowColor = accent === "emerald" ? "bg-emerald-500/8" : "bg-[#00F8D8]/5";
  const badgeCls  = accent === "emerald"
    ? "bg-emerald-400/10 border-emerald-400/25 text-emerald-400"
    : "bg-[#00F8D8]/10 border-[#00F8D8]/28 text-[#00C8AE]";
  const checkCls  = accent === "emerald" ? "text-emerald-400" : "text-[#00C8AE]";

  return (
    <FadeUp delay={delay}>
      <div className={`relative h-full rounded-3xl bg-[#070F0C]/70 border ${borderColor} backdrop-blur-xl overflow-hidden transition-all duration-500 group`}>
        {/* Glow on hover */}
        <div className={`absolute inset-0 ${glowColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative p-7 flex flex-col h-full">
          {/* Badge */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold tracking-widest uppercase w-fit mb-5 ${badgeCls}`}>
            {label}
          </span>

          {/* Headline */}
          <h3 className="text-2xl font-black text-white leading-tight mb-3">{headline}</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">{description}</p>

          {/* Visual */}
          <div className="mb-6">{visual}</div>

          {/* Features */}
          <div className="mt-auto space-y-2.5">
            {features.map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0`}>
                  <f.icon className={`w-3 h-3 ${checkCls}`} />
                </div>
                <span className="text-sm text-slate-300">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FadeUp>
  );
}

/* ── Two journeys section ────────────────────────────────────── */
export function JourneysSection() {
  const heroCard = BANK_ISSUERS[0]?.cards[0];

  const ccFeatures = [
    { icon: Zap, text: "Instant reward calculation for 50+ Indian cards" },
    { icon: Gift, text: "Live offer discovery from 8 bank sources" },
    { icon: BarChart3, text: "Card-vs-card comparison and fee waiver tracking" },
    { icon: CreditCard, text: "Purchase intelligence — best card for every merchant" },
  ];

  const noCardFeatures = [
    { icon: Wallet, text: "Income tracking — regular, irregular, freelance" },
    { icon: TrendingUp, text: "Budget planning with configurable category splits" },
    { icon: PiggyBank, text: "Emergency savings goals with progress tracking" },
    { icon: GraduationCap, text: "CLIQ Learn — 6 financial literacy modules" },
  ];

  return (
    <section className="relative py-28 overflow-hidden">
      {/* Section background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050D09]/60 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeUp className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.1] text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-5">
            Two paths. One platform.
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
            Financial intelligence <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-emerald-400 to-teal-400">
              built for everyone.
            </span>
          </h2>
          <p className="mt-5 text-slate-400 text-lg max-w-2xl mx-auto">
            CLIQ adapts to your financial reality — whether you hold premium cards or are just starting your journey.
          </p>
        </FadeUp>

        {/* Two cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <JourneyCard
            accent="emerald"
            label="Credit card path"
            headline="Maximize every rupee of rewards."
            description="Track your full card wallet, discover real-time offers, and let CLIQ's AI optimize which card to use for every purchase."
            features={ccFeatures}
            visual={
              heroCard ? (
                <div className="flex justify-center">
                  <div className="w-full max-w-[320px] transform hover:-translate-y-1 transition-transform duration-500">
                    <DigitalCreditCard
                      bankName={heroCard.bankName}
                      cardName={heroCard.cardName}
                      cardVariant={heroCard.cardVariant}
                      cardholderName="VIKRAM MALHOTRA"
                      lastFourDigits="8824"
                      network={heroCard.defaultNetwork || "VISA"}
                      glowShadow={true}
                    />
                  </div>
                </div>
              ) : null
            }
            delay={0}
          />
          <JourneyCard
            accent="turquoise"
            label="No card required"
            headline="Build wealth from your first paycheck."
            description="Track income, plan budgets, grow your emergency fund, and learn financial skills — all without needing a credit card."
            features={noCardFeatures}
            visual={<BudgetVisual />}
            delay={0.1}
          />
        </div>
      </div>
    </section>
  );
}
