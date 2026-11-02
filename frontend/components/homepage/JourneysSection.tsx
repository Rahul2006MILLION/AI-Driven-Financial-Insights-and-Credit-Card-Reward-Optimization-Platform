"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { DigitalCreditCard } from "@/components/DigitalCreditCard";
import { BANK_ISSUERS } from "@/lib/cardCatalogue";
import { useLanguage } from "@/lib/i18n";
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
  const { t } = useLanguage();
  const j = t.home.journeys;
  const items = [
    { label: j.income, value: "₹42,000", pct: 100, color: "bg-[#12301A]" },
    { label: j.expenses, value: "₹28,340", pct: 67, color: "bg-[#12301A]/60" },
    { label: j.savings, value: "₹13,660", pct: 33, color: "bg-lime-500" },
  ];

  const goals = [
    { label: j.emergencyFund, target: "₹1,00,000", done: 62 },
    { label: j.education, target: "₹50,000", done: 44 },
  ];

  return (
    <div className="rounded-3xl bg-[#F4F6EE] text-[#12301A] p-5 space-y-4 shadow-[0_20px_40px_-20px_rgba(18,48,26,0.5)]">
      <div className="text-[10px] text-[#12301A]/50 font-bold tracking-widest uppercase">{j.overview}</div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#12301A]/60">{item.label}</span>
              <span className="text-xs font-bold tabular">{item.value}</span>
            </div>
            <div className="h-2 bg-[#12301A]/[0.07] rounded-full overflow-hidden">
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
      <div className="pt-3 border-t border-[#12301A]/10 space-y-2">
        <div className="text-[10px] text-[#12301A]/50 font-bold tracking-widest uppercase">{j.goals}</div>
        {goals.map((g) => (
          <div key={g.label} className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold">{g.label}</div>
              <div className="text-[10px] text-[#12301A]/50 tabular">{g.target}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-[#12301A]/[0.07] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-[#12301A]"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${g.done}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease }}
                />
              </div>
              <span className="text-[10px] font-bold w-8 text-right tabular">{g.done}%</span>
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
  accent: "charcoal" | "lime";
  label: string;
  headline: string;
  description: string;
  features: { icon: React.ElementType; text: string }[];
  visual: React.ReactNode;
  delay: number;
}) {
  const isLime = accent === "lime";
  const shell   = isLime ? "bg-lime-400 text-[#12301A]" : "bg-[#1C1F25] text-white border border-white/[0.06]";
  const badge   = isLime ? "bg-[#12301A] text-lime-300" : "bg-lime-400 text-[#12301A]";
  const body    = isLime ? "text-[#12301A]/70" : "text-slate-400";
  const iconDot = isLime ? "bg-[#12301A] text-lime-300" : "bg-white/[0.06] text-lime-400";
  const feat    = isLime ? "text-[#12301A]/85" : "text-slate-300";

  return (
    <FadeUp delay={delay} className="h-full">
      <div data-spotlight className={`group relative h-full rounded-[2rem] ${shell} ${isLime ? "spot-light" : ""} overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-1`}>
        <div className="relative p-7 sm:p-9 flex flex-col h-full">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase w-fit mb-6 ${badge}`}>
            {label}
          </span>

          <h3 className="font-display text-[1.9rem] font-extrabold uppercase leading-[1] tracking-[-0.025em] mb-3">{headline}</h3>
          <p className={`text-sm leading-relaxed mb-7 max-w-md ${body}`}>{description}</p>

          <div className="mb-7">{visual}</div>

          <div className="mt-auto space-y-3">
            {features.map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-safe:group-hover:scale-110 ${iconDot}`}>
                  <f.icon className="w-3.5 h-3.5" />
                </div>
                <span className={`text-sm font-medium ${feat}`}>{f.text}</span>
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
  const { t } = useLanguage();
  const j = t.home.journeys;

  const ccFeatures = [Zap, Gift, BarChart3, CreditCard].map((icon, i) => ({ icon, text: j.ccFeatures[i] }));
  const noCardFeatures = [Wallet, TrendingUp, PiggyBank, GraduationCap].map((icon, i) => ({ icon, text: j.noCardFeatures[i] }));

  return (
    <section className="relative py-24 sm:py-28 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeUp className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-slate-300 text-[11px] font-bold tracking-wide mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
            {j.eyebrow}
          </div>
          <h2 className="font-display text-[clamp(2rem,4.6vw,3.6rem)] font-extrabold uppercase text-white leading-[1] tracking-[-0.03em]">
            {j.titleLine1}<br />
            <span className="text-lime-400">{j.titleAccent}</span>
          </h2>
          <p className="mt-5 text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            {j.subtitle}
          </p>
        </FadeUp>

        {/* Two cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <JourneyCard
            accent="charcoal"
            label={j.ccLabel}
            headline={j.ccHeadline}
            description={j.ccDescription}
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
                      glowShadow={false}
                    />
                  </div>
                </div>
              ) : null
            }
            delay={0}
          />
          <JourneyCard
            accent="lime"
            label={j.noCardLabel}
            headline={j.noCardHeadline}
            description={j.noCardDescription}
            features={noCardFeatures}
            visual={<BudgetVisual />}
            delay={0.1}
          />
        </div>
      </div>
    </section>
  );
}
