"use client";

import React, { useRef } from "react";
import { useLanguage } from "@/lib/i18n";
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
// Copy comes from t.home.privacy.steps (by index)
const STEPS = [
  { icon: Eye,       num: "01", accent: "lime" },
  { icon: Shield,    num: "02", accent: "emerald" },
  { icon: Lock,      num: "03", accent: "teal" },
  { icon: FileCheck, num: "04", accent: "lime" },
];

const accentMap = {
  lime:    { tile: "bg-lime-400 text-[#12301A]",  bar: "bg-lime-400" },
  emerald: { tile: "bg-[#F4F6EE] text-[#12301A]", bar: "bg-[#F4F6EE]" },
  teal:    { tile: "bg-[#F6E58D] text-[#3A3005]", bar: "bg-[#F6E58D]" },
};

/* ── Privacy section ──────────────────────────────────────────── */
export function PrivacySection() {
  const { t } = useLanguage();
  const pv = t.home.privacy;
  return (
    <section className="relative py-24 sm:py-28 overflow-hidden">

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeUp className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-slate-300 text-[11px] font-bold tracking-wide mb-6">
            <Shield className="w-3 h-3 text-lime-400" />
            {pv.eyebrow}
          </div>
          <h2 className="font-display text-[clamp(2rem,4.6vw,3.6rem)] font-extrabold uppercase text-white leading-[1] tracking-[-0.03em]">
            {pv.titleLine1}<br />
            <span className="text-lime-400">{pv.titleAccent}</span>
          </h2>
          <p className="mt-5 text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            {pv.subtitle}
          </p>
        </FadeUp>

        {/* Steps — horizontal pipeline on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {STEPS.map((step, i) => {
            const s = accentMap[step.accent as keyof typeof accentMap];
            return (
              <FadeUp key={step.num} delay={0.06 * i}>
                <div data-spotlight className="card-interactive relative h-full rounded-[1.75rem] bg-[#1C1F25] border border-white/[0.06] p-6 group">
                  {/* Top: number + icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-display text-xs font-bold px-2.5 py-1 rounded-full bg-white/[0.06] text-slate-300 tabular">{step.num}</span>
                    <div className={`w-11 h-11 rounded-2xl ${s.tile} flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-safe:group-hover:scale-110 motion-safe:group-hover:-rotate-6`}>
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

                  <h3 className="font-display text-lg font-bold text-white mb-2 tracking-[-0.015em]">{pv.steps[i].title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{pv.steps[i].body}</p>

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
            {pv.trust.map((label) => (
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
