"use client";

import React, { useRef } from "react";
import { useLanguage } from "@/lib/i18n";
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
// Copy comes from t.home.features.items (by index); audience picks the badge label
const features = [
  { icon: Zap,           accent: "emerald" as const,   audience: "card" as const },
  { icon: BarChart3,     accent: "turquoise" as const, audience: "all" as const },
  { icon: Activity,      accent: "lime" as const,      audience: "all" as const },
  { icon: Wallet,        accent: "emerald" as const,   audience: "noCard" as const },
  { icon: FileText,      accent: "turquoise" as const, audience: "card" as const },
  { icon: GraduationCap, accent: "lime" as const,      audience: "all" as const },
];

/* ── Accent tokens ───────────────────────────────────────────── */
const accentMap = {
  emerald:   { tile: "bg-[#12301A] text-lime-300",  badge: "bg-[#12301A]/[0.06] text-[#12301A]" },
  turquoise: { tile: "bg-[#F6E58D] text-[#3A3005]", badge: "bg-[#F6E58D]/50 text-[#3A3005]" },
  lime:      { tile: "bg-lime-400 text-[#12301A]",  badge: "bg-lime-300/50 text-[#2F4210]" },
};

/* ── Individual feature card ─────────────────────────────────── */
function FeatureCard({
  feature, index, delay,
}: {
  feature: typeof features[0]; index: number; delay: number;
}) {
  const s = accentMap[feature.accent];
  const { t } = useLanguage();
  const f = t.home.features;
  const copy = f.items[index];
  const badge = feature.audience === "card" ? f.badgeCard : feature.audience === "noCard" ? f.badgeNoCard : f.badgeAll;
  return (
    <FadeUp delay={delay} className="h-full">
      <div
        data-spotlight
        style={{ ["--spot-color" as string]: "rgba(196,242,63,0.28)" }}
        className="group relative h-full bg-white rounded-[1.75rem] overflow-hidden shadow-[0_1px_2px_rgba(18,48,26,0.05),0_14px_32px_-16px_rgba(18,48,26,0.22)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-1.5 hover:shadow-[0_1px_2px_rgba(18,48,26,0.05),0_24px_48px_-18px_rgba(18,48,26,0.35)]"
      >
        {/* Gradient wash fades in on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-lime-100/70 via-white/0 to-[#F6E58D]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="relative p-6 flex flex-col h-full">
          {/* Icon + badge */}
          <div className="flex items-start justify-between mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-safe:group-hover:scale-110 motion-safe:group-hover:-rotate-6 ${s.tile}`}>
              <feature.icon className="w-5 h-5" strokeWidth={2} />
            </div>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase ${s.badge}`}>
              {badge}
            </span>
          </div>

          <h3 className="font-display text-lg font-bold text-[#12301A] leading-snug mb-2 tracking-[-0.015em]">
            {copy.title}
          </h3>
          <p className="text-sm text-[#12301A]/65 leading-[1.65]">
            {copy.description}
          </p>
        </div>
      </div>
    </FadeUp>
  );
}

/* ── Section ─────────────────────────────────────────────────── */
export function FeaturesSection() {
  const { t } = useLanguage();
  const f = t.home.features;
  return (
    <section className="relative px-3 sm:px-4 py-4">
      <div className="relative rounded-[2rem] sm:rounded-[2.5rem] bg-[#F4F6EE] overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">

          {/* ── Header ───────────────────────────────────────────── */}
          <FadeUp className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12301A] text-lime-300 text-[11px] font-bold tracking-wide mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
              {f.eyebrow}
            </div>

            <h2 className="font-display text-[clamp(2rem,4.6vw,3.6rem)] font-extrabold uppercase text-[#12301A] leading-[1] tracking-[-0.03em]">
              {f.titleLine1}
              <br />
              <span className="text-[#5E8C12]">{f.titleAccent}</span>
            </h2>

            <p className="mt-5 text-base text-[#12301A]/65 max-w-md mx-auto leading-relaxed">
              {f.subtitle}{" "}
              <span className="text-[#12301A] font-semibold">{f.subtitleStrong}</span>
            </p>
          </FadeUp>

          {/* ── 6-card grid ──────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 mb-4 lg:mb-5">
            {features.map((feature, i) => (
              <FeatureCard key={i} feature={feature} index={i} delay={0.04 * i} />
            ))}
          </div>

          {/* ── Privacy Gateway — featured wide card ─────────────── */}
          <FadeUp delay={0.27}>
            <div className="group relative w-full bg-[#12301A] text-white rounded-[1.75rem] overflow-hidden transition-transform duration-300 ease-out hover:-translate-y-1">
              <div className="relative p-7 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:gap-10">

                {/* Icon */}
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-lime-400 flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-safe:group-hover:scale-110 motion-safe:group-hover:-rotate-6">
                  <Shield className="w-7 h-7 text-[#12301A]" strokeWidth={1.9} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-1.5">
                    <h3 className="font-display text-xl font-bold tracking-[-0.015em]">{f.privacyTitle}</h3>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/10 text-[9px] font-bold tracking-widest uppercase text-lime-200">
                      {f.badgeAll}
                    </span>
                  </div>
                  <p className="text-sm text-white/65 leading-relaxed max-w-xl">
                    {f.privacyDescription}
                  </p>
                </div>

                {/* Trust stats */}
                <div className="flex items-center gap-8 shrink-0 pl-0 sm:pl-6 sm:border-l sm:border-white/10">
                  {[
                    { value: "9",    label: f.privacyStats[0] },
                    { value: "0",    label: f.privacyStats[1] },
                    { value: "100%", label: f.privacyStats[2] },
                  ].map((stat) => (
                    <div key={stat.value} className="text-center">
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
