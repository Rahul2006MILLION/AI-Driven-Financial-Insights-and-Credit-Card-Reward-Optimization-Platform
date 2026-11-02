"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Shield, Globe2, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const ease = [0.22, 1, 0.36, 1] as const;

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease }}>
      {children}
    </motion.div>
  );
}

/* ── Cinematic counter stats ─────────────────────────────────── */
function CountStat({ end, label, suffix = "", accent = false }: { end: number; label: string; suffix?: string; accent?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(end / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end]);

  return (
    <div
      ref={ref}
      className={`rounded-[1.75rem] p-5 sm:p-6 ${accent ? "bg-lime-400 text-[#12301A]" : "bg-[#1C1F25] border border-white/[0.06] text-white"}`}
    >
      <div className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight tabular-nums">
        {count}{suffix}
      </div>
      <div className={`text-xs mt-2 font-medium ${accent ? "text-[#12301A]/70" : "text-slate-400"}`}>{label}</div>
    </div>
  );
}

/* ── CTA section ─────────────────────────────────────────────── */
export function ClosingSection() {
  const { t } = useLanguage();
  const c = t.home.closing;
  // Labels pair by index with t.home.closing.footerLinks
  const navLinks = [
    "/dashboard", "/cards", "/offers", "/assistant", "/learn", "/budget", "/analytics", "/financial-health",
  ].map((href, i) => ({ href, label: c.footerLinks[i] }));

  return (
    <>
      {/* ── Stats tiles ─────────────────────────────────────────── */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <CountStat end={50}  suffix="+" label={c.stats[0]} accent />
          <CountStat end={6}   label={c.stats[1]} />
          <CountStat end={9}   label={c.stats[2]} />
          <CountStat end={100} suffix="%" label={c.stats[3]} />
        </div>
      </section>

      {/* ── CTA panel ───────────────────────────────────────────── */}
      <section className="relative px-3 sm:px-4 py-4">
        <div className="relative rounded-[2rem] sm:rounded-[2.5rem] bg-[#E3F2CF] text-[#12301A] overflow-hidden py-20 sm:py-28">
          {/* Oversized watermark */}
          <span
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 bottom-[-0.22em] font-display font-extrabold uppercase text-[clamp(6rem,22vw,18rem)] leading-none tracking-[-0.05em] text-[#12301A]/[0.05] select-none pointer-events-none whitespace-nowrap"
          >
            CLIQ
          </span>

          <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 text-center">
            <FadeUp>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#12301A] text-lime-300 text-[11px] font-bold tracking-wide mb-7">
                <Sparkles className="w-3 h-3" />
                {c.eyebrow}
              </div>
            </FadeUp>

            <FadeUp delay={0.07}>
              <h2 className="font-display text-[clamp(2.3rem,6vw,4.8rem)] font-extrabold uppercase leading-[0.96] tracking-[-0.035em] mb-6">
                <span className="text-[#5E8C12]">{c.titleAccent}</span> {c.titleRest}<br />
                {c.titleLine2}
              </h2>
            </FadeUp>

            <FadeUp delay={0.13}>
              <p className="text-base sm:text-lg text-[#12301A]/70 leading-relaxed max-w-xl mx-auto mb-10">
                {c.subtitle}
              </p>
            </FadeUp>

            <FadeUp delay={0.18}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full btn-fx bg-[#12301A] hover:bg-[#1B4426] text-lime-300 font-bold text-base transition-colors duration-300"
                >
                  {c.ctaCreate}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-200" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full btn-fx bg-lime-400 hover:bg-lime-300 text-[#12301A] font-bold text-base transition-colors duration-300"
                >
                  {c.ctaSignIn}
                </Link>
              </div>
            </FadeUp>

            {/* Trust row */}
            <FadeUp delay={0.24}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs font-medium text-[#12301A]/70">
                <span className="flex items-center gap-2"><Shield className="w-3.5 h-3.5" />{c.trust[0]}</span>
                <span className="flex items-center gap-2"><Globe2 className="w-3.5 h-3.5" />{c.trust[1]}</span>
                <span className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" />{c.trust[2]}</span>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="relative px-3 sm:px-4 pt-4 pb-3">
        <div className="rounded-[2rem] sm:rounded-[2.5rem] bg-[#F4F6EE] text-[#12301A] overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-12 pb-10 grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Brand */}
            <div>
              <div className="mb-4 inline-flex rounded-full bg-[#12301A] px-4 py-2">
                <Image
                  src="/cliq-logo.png"
                  alt="CLIQ"
                  width={1024}
                  height={381}
                  className="h-6 w-auto object-contain"
                />
              </div>
              <p className="text-xs text-[#12301A]/60 leading-relaxed max-w-[240px]">
                {c.footerTagline}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {c.footerTags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 rounded-full bg-lime-300/60 text-[10px] font-semibold text-[#12301A]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <div className="text-[10px] text-[#12301A]/50 font-bold tracking-widest uppercase mb-4">{c.footerPlatform}</div>
              <div className="grid grid-cols-2 gap-x-5 gap-y-2">
                {navLinks.map((l) => (
                  <Link key={l.href} href={l.href}
                    className="text-xs font-medium text-[#12301A]/75 hover:text-[#12301A] hover:underline underline-offset-4 transition-colors duration-200">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Security */}
            <div>
              <div className="text-[10px] text-[#12301A]/50 font-bold tracking-widest uppercase mb-4">{c.footerSecurity}</div>
              <div className="space-y-2.5">
                {c.footerSecurityItems.map((label) => (
                  <div key={label} className="flex items-center gap-2 text-xs text-[#12301A]/75">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5E8C12] shrink-0" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#12301A] text-lime-100/70 px-6 sm:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[11px]">&copy; {new Date().getFullYear()} {c.footerCopyright}</p>
            <p className="text-[11px] text-center">
              {c.footerDisclaimer}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
