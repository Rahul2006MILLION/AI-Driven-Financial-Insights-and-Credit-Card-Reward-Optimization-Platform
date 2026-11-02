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
  emerald:   { tile: "bg-[#12301A] text-lime-300",  badge: "bg-[#12301A]/[0.06] text-[#12301A]" },
  turquoise: { tile: "bg-[#F6E58D] text-[#3A3005]", badge: "bg-[#F6E58D]/50 text-[#3A3005]" },
  lime:      { tile: "bg-lime-400 text-[#12301A]",  badge: "bg-lime-300/50 text-[#2F4210]" },
};

/* ── Individual feature card ─────────────────────────────────── */
function FeatureCard({
  feature, delay,
}: {
  feature: typeof features[0]; delay: number;
}) {
  const s = accentMap[feature.accent];
  return (
    <FadeUp delay={delay} className="h-full">
      <div className="group relative h-full bg-white rounded-[1.75rem] overflow-hidden shadow-[0_1px_2px_rgba(18,48,26,0.05),0_14px_32px_-16px_rgba(18,48,26,0.22)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_1px_2px_rgba(18,48,26,0.05),0_24px_48px_-18px_rgba(18,48,26,0.35)]">
        <div className="relative p-6 flex flex-col h-full">
          {/* Icon + badge */}
          <div className="flex items-start justify-between mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:rotate-[-6deg] ${s.tile}`}>
              <feature.icon className="w-5 h-5" strokeWidth={2} />
            </div>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase ${s.badge}`}>
              {feature.badge}
            </span>
          </div>

          <h3 className="font-display text-lg font-bold text-[#12301A] leading-snug mb-2 tracking-[-0.015em]">
            {feature.title}
          </h3>
          <p className="text-sm text-[#12301A]/65 leading-[1.65]">
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
    <section className="relative px-3 sm:px-4 py-4">
      <div className="relative rounded-[2rem] sm:rounded-[2.5rem] bg-[#F4F6EE] overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">

          {/* ── Header ───────────────────────────────────────────── */}
          <FadeUp className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12301A] text-lime-300 text-[11px] font-bold tracking-wide mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
              What&rsquo;s inside CLIQ
            </div>

            <h2 className="font-display text-[clamp(2rem,4.6vw,3.6rem)] font-extrabold uppercase text-[#12301A] leading-[1] tracking-[-0.03em]">
              Everything you need.
              <br />
              <span className="text-[#5E8C12]">Nothing you don&rsquo;t.</span>
            </h2>

            <p className="mt-5 text-base text-[#12301A]/65 max-w-md mx-auto leading-relaxed">
              Built capabilities, not marketing promises.{" "}
              <span className="text-[#12301A] font-semibold">Every feature ships in the current release.</span>
            </p>
          </FadeUp>

          {/* ── 6-card grid ──────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 mb-4 lg:mb-5">
            {features.map((f, i) => (
              <FeatureCard key={f.title} feature={f} delay={0.04 * i} />
            ))}
          </div>

          {/* ── Privacy Gateway — featured wide card ─────────────── */}
          <FadeUp delay={0.27}>
            <div className="group relative w-full bg-[#12301A] text-white rounded-[1.75rem] overflow-hidden transition-transform duration-300 ease-out hover:-translate-y-1">
              <div className="relative p-7 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:gap-10">

                {/* Icon */}
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-lime-400 flex items-center justify-center transition-transform duration-300 group-hover:rotate-[-6deg]">
                  <Shield className="w-7 h-7 text-[#12301A]" strokeWidth={1.9} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-1.5">
                    <h3 className="font-display text-xl font-bold tracking-[-0.015em]">Privacy Gateway</h3>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/10 text-[9px] font-bold tracking-widest uppercase text-lime-200">
                      All users
                    </span>
                  </div>
                  <p className="text-sm text-white/65 leading-relaxed max-w-xl">
                    9 PII redaction rules run before any AI call. User-consent-gated. Every AI request audit-logged. Zero raw data egress.
                  </p>
                </div>

                {/* Trust stats */}
                <div className="flex items-center gap-8 shrink-0 pl-0 sm:pl-6 sm:border-l sm:border-white/10">
                  {[
                    { value: "9",    label: "PII rules"    },
                    { value: "0",    label: "Data egress"  },
                    { value: "100%", label: "Audit logged" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="font-display text-3xl font-extrabold tabular-nums text-lime-300">
                        {stat.value}
                      </div>
                      <div className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-0.5">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>

        </div>
      </div>
    </section>
  );
}
