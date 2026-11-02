"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Zap, BarChart3, Activity, Wallet, FileText, GraduationCap, Shield,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

function FadeUp({
  children, delay = 0, className = "",
}: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease }}>
      {children}
    </motion.div>
  );
}

/* ── Feature data ────────────────────────────────────────────── */
const features = [
  {
    icon: Zap,
    title: "Reward Optimization",
    description: "Exact Decimal-precision reward calculations for 50+ Indian credit cards. Best card for every merchant, every time.",
    accent: "emerald" as const,
    badge: "Credit card users",
  },
  {
    icon: BarChart3,
    title: "Spending Intelligence",
    description: "Categorized transaction analytics with CSV statement import from HDFC, SBI, ICICI and Axis. SHA-256 deduplication.",
    accent: "turquoise" as const,
    badge: "All users",
  },
  {
    icon: Activity,
    title: "Financial Health Score",
    description: "Two-algorithm health engine — reward efficiency for cardholders, income-surplus path for everyone else. Real numbers.",
    accent: "lime" as const,
    badge: "All users",
  },
  {
    icon: Wallet,
    title: "Income & Budget",
    description: "Rolling 90-day median for irregular income. Configurable category budgets. One-time windfall expiry protection.",
    accent: "emerald" as const,
    badge: "No-card path",
  },
  {
    icon: FileText,
    title: "Document Intelligence",
    description: "Upload bank PDF circulars and card offer statements. CLIQ extracts merchants, discounts and promo codes automatically.",
    accent: "turquoise" as const,
    badge: "Credit card users",
  },
  {
    icon: GraduationCap,
    title: "CLIQ Learn",
    description: "6 financial literacy modules, 5 calculators — EMI, credit utilisation, compound interest. Progress tracked per user.",
    accent: "lime" as const,
    badge: "All users",
  },
];

/* ── Accent tokens ───────────────────────────────────────────── */
const accentMap = {
  emerald: {
    iconWrap:    "bg-emerald-50 border-emerald-100",
    iconColor:   "text-emerald-600",
    badge:       "bg-emerald-50 border-emerald-200/80 text-emerald-700",
    dot:         "bg-emerald-400",
    strip:       "from-emerald-400 to-emerald-600",
    hoverBorder: "hover:border-emerald-200",
    hoverShadow: "hover:shadow-[0_20px_56px_-12px_rgba(16,185,129,0.22),0_4px_16px_-4px_rgba(16,185,129,0.1)]",
    hoverGlow:   "group-hover:opacity-100",
    glowColor:   "bg-emerald-400/[0.04]",
  },
  turquoise: {
    iconWrap:    "bg-[#E4F9F5] border-[#A8EDE4]",
    iconColor:   "text-[#006F64]",
    badge:       "bg-[#E4F9F5] border-[#A8EDE4] text-[#006055]",
    dot:         "bg-[#00C8AE]",
    strip:       "from-[#00F8D8] to-[#009E8E]",
    hoverBorder: "hover:border-[#00C8AE]/40",
    hoverShadow: "hover:shadow-[0_20px_56px_-12px_rgba(0,200,174,0.22),0_4px_16px_-4px_rgba(0,200,174,0.1)]",
    hoverGlow:   "group-hover:opacity-100",
    glowColor:   "bg-[#00F8D8]/[0.04]",
  },
  lime: {
    iconWrap:    "bg-lime-50 border-lime-100",
    iconColor:   "text-lime-700",
    badge:       "bg-lime-50 border-lime-200/80 text-lime-700",
    dot:         "bg-lime-500",
    strip:       "from-lime-400 to-lime-600",
    hoverBorder: "hover:border-lime-200",
    hoverShadow: "hover:shadow-[0_20px_56px_-12px_rgba(132,204,22,0.2),0_4px_16px_-4px_rgba(132,204,22,0.1)]",
    hoverGlow:   "group-hover:opacity-100",
    glowColor:   "bg-lime-400/[0.04]",
  },
};

/* ── Individual feature card ─────────────────────────────────── */
function FeatureCard({
  feature, delay,
}: {
  feature: typeof features[0]; delay: number;
}) {
  const s = accentMap[feature.accent];
  return (
    <FadeUp delay={delay}>
      <div
        className={`
          group relative h-full bg-white rounded-2xl border border-slate-100/80 overflow-hidden
          shadow-[0_1px_4px_rgba(0,0,0,0.04),0_6px_20px_-4px_rgba(0,0,0,0.06)]
          transition-all duration-300 ease-out
          ${s.hoverBorder} ${s.hoverShadow} hover:-translate-y-2
        `}
      >
        {/* Left accent strip */}
        <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${s.strip}`} />

        {/* Hover glow wash */}
        <div className={`absolute inset-0 ${s.glowColor} opacity-0 transition-opacity duration-500 pointer-events-none ${s.hoverGlow}`} />

        <div className="relative pl-7 pr-6 pt-6 pb-6 flex flex-col h-full">

          {/* Icon + badge */}
          <div className="flex items-start justify-between mb-5">
            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${s.iconWrap}`}>
              <feature.icon className={`w-5 h-5 ${s.iconColor}`} strokeWidth={2} />
            </div>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[9px] font-bold tracking-widest uppercase ${s.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
              {feature.badge}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-[15px] font-bold text-slate-900 leading-snug mb-2 tracking-[-0.01em]">
            {feature.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-600 leading-[1.65]">
            {feature.description}
          </p>
        </div>
      </div>
    </FadeUp>
  );
}

/* ── Section ─────────────────────────────────────────────────── */
export function FeaturesSection() {
  return (
    <section className="relative py-32 overflow-hidden" style={{ backgroundColor: "#F6F4EF" }}>

      {/* ── Dark-to-light transition at top */}
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-[#040707] to-transparent pointer-events-none z-10" />

      {/* ── Light-to-dark transition at bottom */}
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#040707] to-transparent pointer-events-none z-10" />

      {/* ── Ambient lighting — very soft, no muddy cast */}
      <div className="absolute -top-24 left-[-10%] w-[640px] h-[640px] rounded-full bg-emerald-300/[0.12] blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-[-5%] w-[560px] h-[560px] rounded-full bg-lime-300/[0.09] blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#00F8D8]/[0.06] blur-[120px] pointer-events-none" />

      <div className="relative z-[5] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">

        {/* ── Header ───────────────────────────────────────────── */}
        <FadeUp className="text-center mb-16">

          {/* Eye label */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-[0_1px_6px_rgba(0,0,0,0.06)] text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            What&rsquo;s inside CLIQ
          </div>

          {/* Main headline */}
          <h2 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-black text-[#080D0B] leading-[1.07] tracking-[-0.02em]">
            Everything you need.
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(125deg, #10B981 0%, #00C8AE 40%, #84cc16 100%)",
              }}
            >
              Nothing you don&rsquo;t.
            </span>
          </h2>

          {/* Rule + sub-text */}
          <div className="mt-7 flex items-center justify-center gap-5">
            <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-slate-300/70" />
            <p className="text-base text-slate-500 max-w-md leading-relaxed text-center">
              Built capabilities — not marketing promises.{" "}
              <span className="text-slate-700 font-medium">Every feature ships in the current release.</span>
            </p>
            <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-slate-300/70" />
          </div>
        </FadeUp>

        {/* ── 6-card grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 mb-4 lg:mb-5">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} delay={0.04 * i} />
          ))}
        </div>

        {/* ── Privacy Gateway — featured wide card ─────────────── */}
        <FadeUp delay={0.27}>
          <div
            className={`
              group relative w-full bg-white rounded-2xl border border-slate-100/80 overflow-hidden
              shadow-[0_1px_4px_rgba(0,0,0,0.04),0_6px_20px_-4px_rgba(0,0,0,0.06)]
              transition-all duration-300 ease-out
              hover:border-emerald-200 hover:-translate-y-1
              hover:shadow-[0_20px_56px_-12px_rgba(16,185,129,0.22),0_4px_16px_-4px_rgba(16,185,129,0.1)]
            `}
          >
            {/* Top rainbow accent bar */}
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-emerald-400 via-[#00C8AE] to-lime-400" />

            {/* Hover glow */}
            <div className="absolute inset-0 bg-emerald-400/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative p-7 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:gap-10">

              {/* Icon */}
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <Shield className="w-7 h-7 text-emerald-600" strokeWidth={1.75} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-1.5">
                  <h3 className="text-lg font-bold text-slate-900 tracking-[-0.01em]">Privacy Gateway</h3>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[9px] font-bold tracking-widest uppercase text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    All users
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                  9 PII redaction rules run before any AI call. User-consent-gated. Every AI request audit-logged. Zero raw data egress.
                </p>
              </div>

              {/* Trust stats */}
              <div className="flex items-center gap-8 shrink-0 pl-0 sm:pl-4 sm:border-l sm:border-slate-100">
                {[
                  { value: "9",    label: "PII rules"    },
                  { value: "0",    label: "Data egress"  },
                  { value: "100%", label: "Audit logged" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div
                      className="text-2xl font-black tabular-nums"
                      style={{ backgroundImage: "linear-gradient(135deg, #10B981, #00C8AE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeUp>

      </div>
    </section>
  );
}
