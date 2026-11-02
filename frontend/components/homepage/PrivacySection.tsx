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
  lime:    { num: "text-lime-400",    icon: "text-lime-400",    bg: "bg-lime-400/10 border-lime-400/20",   bar: "bg-lime-400" },
  emerald: { num: "text-emerald-400", icon: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", bar: "bg-emerald-400" },
  teal:    { num: "text-teal-400",    icon: "text-teal-400",    bg: "bg-teal-500/10 border-teal-500/20",   bar: "bg-teal-400" },
};

/* ── Privacy section ──────────────────────────────────────────── */
export function PrivacySection() {
  return (
    <section className="relative py-28 overflow-hidden">
      {/* Background — deliberately lighter feel for contrast */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#040707] via-[#050C08]/90 to-[#040707]" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[400px] bg-teal-500/5 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-emerald-500/7 rounded-full blur-[110px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeUp className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold tracking-widest uppercase mb-5">
            <Shield className="w-3 h-3" />
            Privacy by design
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
            Your data. Your control.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-lime-400">
              Always.
            </span>
          </h2>
          <p className="mt-5 text-slate-400 text-lg max-w-2xl mx-auto">
            CLIQ was built with privacy as a constraint, not an afterthought. Here is exactly what happens between you and the AI.
          </p>
        </FadeUp>

        {/* Steps — horizontal pipeline on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {STEPS.map((step, i) => {
            const s = accentMap[step.accent as keyof typeof accentMap];
            return (
              <FadeUp key={step.num} delay={0.06 * i}>
                <div className="relative h-full rounded-2xl bg-[#060E0B]/80 border border-white/[0.07] hover:border-white/[0.15] p-6 transition-colors duration-300 group">
                  {/* Top: number + icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span className={`text-4xl font-black ${s.num} opacity-20 select-none leading-none`}>{step.num}</span>
                    <div className={`w-10 h-10 rounded-xl ${s.bg} border flex items-center justify-center`}>
                      <step.icon className={`w-5 h-5 ${s.icon}`} />
                    </div>
                  </div>

                  {/* Accent bar */}
                  <motion.div
                    className={`h-0.5 ${s.bar} rounded-full mb-4 origin-left`}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease }}
                  />

                  <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.body}</p>

                  {/* Arrow connector (not on last) */}
                  {i < STEPS.length - 1 && (
                    <div className="hidden xl:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-[#060E0B] border border-white/[0.1] items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                    </div>
                  )}
                </div>
              </FadeUp>
            );
          })}
        </div>

        {/* Bottom trust bar */}
        <FadeUp delay={0.3} className="mt-12">
          <div className="flex flex-wrap items-center justify-center gap-8 py-5 px-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            {[
              { label: "Zero raw PAN or CVV stored", color: "text-lime-400" },
              { label: "Row-Level Security on all tables", color: "text-emerald-400" },
              { label: "User-owned data — export or delete anytime", color: "text-teal-400" },
              { label: "Deterministic math, AI for explanations only", color: "text-lime-400" },
            ].map((item) => (
              <span key={item.label} className="flex items-center gap-2 text-xs text-slate-400">
                <span className={`text-lg leading-none ${item.color}`}>✓</span>
                {item.label}
              </span>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
