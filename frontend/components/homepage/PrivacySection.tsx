"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Shield, Eye, Lock, FileCheck, ArrowRight } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-70px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.72, delay, ease }}>
      {children}
    </motion.div>
  );
}

/* ── Privacy pipeline step ───────────────────────────────────── */
const STEPS = [
  {
    icon: Eye,
    num: "01",
    title: "You input",
    body: "Your income, expenses and transactions. Only what you choose to enter — no account scraping, no bank integration, no automatic collection.",
    accent: "lime",
  },
  {
    icon: Shield,
    num: "02",
    title: "9-layer PII redaction",
    body: "Before any AI call, CLIQ runs 9 compiled regex rules that strip card numbers, CVVs, OTPs, Aadhaar, PAN, bank accounts, email addresses and phone numbers.",
    accent: "emerald",
  },
  {
    icon: Lock,
    num: "03",
    title: "Consent-gated AI",
    body: "Your explicit consent is checked before every AI request. You can withdraw consent at any time. AI is used only for plain-language explanation — never for calculations.",
    accent: "teal",
  },
  {
    icon: FileCheck,
    num: "04",
    title: "Immutable audit log",
    body: "Every AI request is logged in an append-only audit table. You can review every query made on your behalf. Logs are anonymized on account deletion.",
    accent: "lime",
  },
];

const accentMap = {
  lime:    { tile: "bg-lime-400 text-[#12301A]",  bar: "bg-lime-400" },
  emerald: { tile: "bg-[#F4F6EE] text-[#12301A]", bar: "bg-[#F4F6EE]" },
  teal:    { tile: "bg-[#F6E58D] text-[#3A3005]", bar: "bg-[#F6E58D]" },
};

/* ── Privacy section ──────────────────────────────────────────── */
export function PrivacySection() {
  return (
    <section className="relative py-24 sm:py-28 overflow-hidden">

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeUp className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-slate-300 text-[11px] font-bold tracking-wide mb-6">
            <Shield className="w-3 h-3 text-lime-400" />
            Privacy by design
          </div>
          <h2 className="font-display text-[clamp(2rem,4.6vw,3.6rem)] font-extrabold uppercase text-white leading-[1] tracking-[-0.03em]">
            Your data. Your control.<br />
            <span className="text-lime-400">Always.</span>
          </h2>
          <p className="mt-5 text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            CLIQ was built with privacy as a constraint, not an afterthought. Here is exactly what happens between you and the AI.
          </p>
        </FadeUp>

        {/* Steps — horizontal pipeline on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {STEPS.map((step, i) => {
            const s = accentMap[step.accent as keyof typeof accentMap];
            return (
              <FadeUp key={step.num} delay={0.06 * i}>
                <div className="relative h-full rounded-[1.75rem] bg-[#1C1F25] border border-white/[0.06] hover:bg-[#22252C] p-6 transition-colors duration-300 group">
                  {/* Top: number + icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-display text-xs font-bold px-2.5 py-1 rounded-full bg-white/[0.06] text-slate-300 tabular">{step.num}</span>
                    <div className={`w-11 h-11 rounded-2xl ${s.tile} flex items-center justify-center`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Accent bar */}
                  <motion.div
                    className={`h-1 w-10 ${s.bar} rounded-full mb-4 origin-left`}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease }}
                  />

                  <h3 className="font-display text-lg font-bold text-white mb-2 tracking-[-0.015em]">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.body}</p>

                  {/* Arrow connector (not on last) */}
                  {i < STEPS.length - 1 && (
                    <div className="hidden xl:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-lime-400 border-4 border-[#0E1013] items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-[#12301A]" />
                    </div>
                  )}
                </div>
              </FadeUp>
            );
          })}
        </div>

        {/* Bottom trust bar */}
        <FadeUp delay={0.3} className="mt-12">
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {[
              "Zero raw PAN or CVV stored",
              "Row-Level Security on all tables",
              "User-owned data — export or delete anytime",
              "Deterministic math, AI for explanations only",
            ].map((label) => (
              <span key={label} className="flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full bg-[#1C1F25] border border-white/[0.06] text-xs text-slate-300">
                <span className="w-5 h-5 rounded-full bg-lime-400 text-[#12301A] text-[11px] font-bold flex items-center justify-center">✓</span>
                {label}
              </span>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
