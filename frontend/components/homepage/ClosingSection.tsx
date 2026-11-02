"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Shield, Globe2, Sparkles } from "lucide-react";

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
function CountStat({ end, label, suffix = "" }: { end: number; label: string; suffix?: string }) {
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
    <div ref={ref} className="text-center">
      <div className="text-4xl sm:text-5xl font-black text-white tabular-nums">
        {count}{suffix}
      </div>
      <div className="text-xs text-slate-500 mt-1.5 font-medium">{label}</div>
    </div>
  );
}

/* ── CTA section ─────────────────────────────────────────────── */
export function ClosingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  const navLinks = [
    { label: "Dashboard",        href: "/dashboard" },
    { label: "Credit Cards",     href: "/cards" },
    { label: "Offers",           href: "/offers" },
    { label: "AI Assistant",     href: "/assistant" },
    { label: "CLIQ Learn",       href: "/learn" },
    { label: "Budget",           href: "/budget" },
    { label: "Analytics",        href: "/analytics" },
    { label: "Financial Health", href: "/financial-health" },
  ];

  return (
    <>
      {/* ── Stats bar ───────────────────────────────────────────── */}
      <section className="relative py-16 border-t border-b border-white/[0.05]">
        <div className="absolute inset-0 bg-[#050D09]/70 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <CountStat end={50}  suffix="+"  label="Indian credit cards supported" />
            <CountStat end={6}   label="Financial literacy modules" />
            <CountStat end={9}   label="PII redaction rules" />
            <CountStat end={100} suffix="%" label="Privacy-first architecture" />
          </div>
        </div>
      </section>

      {/* ── Cinematic CTA ────────────────────────────────────────── */}
      <section ref={sectionRef} className="relative py-36 overflow-hidden">
        {/* Parallax background */}
        <motion.div style={{ y: bgY }} className="absolute inset-[-20%] pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-[#00F8D8]/8 rounded-full blur-[150px]" />
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-lime-400/7 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/8 rounded-full blur-[100px]" />
        </motion.div>

        {/* Subtle radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#040707_100%)] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <div className="flex justify-center mb-10">
              <div className="relative">
                <motion.div
                  className="absolute -inset-8 rounded-full bg-[#00F8D8]/10 blur-2xl"
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <Image
                  src="/cliq-logo.png"
                  alt="CLIQ"
                  width={1024}
                  height={381}
                  className="relative h-12 w-auto object-contain"
                />
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.07}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/25 text-lime-400 text-[10px] font-bold tracking-widest uppercase mb-7">
              <Sparkles className="w-3 h-3" />
              Start your journey
            </div>
          </FadeUp>

          <FadeUp delay={0.12}>
            <h2 className="text-5xl sm:text-6xl lg:text-[5.5rem] font-black text-white leading-[1.04] tracking-tight mb-7">
              Your money deserves<br />
              <span className="gradient-text-animated">better intelligence.</span>
            </h2>
          </FadeUp>

          <FadeUp delay={0.18}>
            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
              Join Indians who manage money smarter — whether they hold premium cards or are just beginning their financial journey.
            </p>
          </FadeUp>

          <FadeUp delay={0.23}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-lime-400 hover:bg-lime-300 text-[#030806] font-bold text-base shadow-[0_0_40px_rgba(163,230,53,0.4),0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_60px_rgba(163,230,53,0.65),0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300"
              >
                Create free account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-200" />
              </Link>
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-slate-300 hover:text-white font-medium text-base backdrop-blur-xl transition-all duration-300"
              >
                Sign in to CLIQ
              </Link>
            </div>
          </FadeUp>

          {/* Trust row */}
          <FadeUp delay={0.3}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              <span className="flex items-center gap-2 text-xs text-slate-500">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />256-bit encryption
              </span>
              <span className="flex items-center gap-2 text-xs text-slate-500">
                <Globe2 className="w-3.5 h-3.5 text-lime-400" />No card required to start
              </span>
              <span className="flex items-center gap-2 text-xs text-slate-500">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />English · हिन्दी · ಕನ್ನಡ
              </span>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="relative border-t border-white/[0.06] bg-[#030606]/90 backdrop-blur-xl py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            {/* Brand */}
            <div>
              <div className="mb-4">
                <Image
                  src="/cliq-logo.png"
                  alt="CLIQ"
                  width={1024}
                  height={381}
                  className="h-8 w-auto object-contain"
                />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-[220px]">
                Financial intelligence for every Indian — with or without a credit card.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {["Privacy-first", "India-built", "Open platform"].map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-[10px] text-slate-500">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-4">Platform</div>
              <div className="grid grid-cols-2 gap-x-5 gap-y-2">
                {navLinks.map((l) => (
                  <Link key={l.href} href={l.href}
                    className="text-xs text-slate-400 hover:text-white transition-colors duration-200">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Security */}
            <div>
              <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-4">Security</div>
              <div className="space-y-2.5">
                {[
                  { label: "Zero PAN / CVV storage",   color: "bg-lime-400" },
                  { label: "Row-Level Security",        color: "bg-emerald-400" },
                  { label: "9-layer PII redaction",     color: "bg-teal-400" },
                  { label: "Immutable AI audit log",    color: "bg-lime-400" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-xs text-slate-400">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.color} shrink-0`} />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-slate-600">&copy; {new Date().getFullYear()} CLIQ. Built for India.</p>
            <p className="text-[11px] text-slate-600">
              Deterministic financial math · AI for explanation only · Never for calculations.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
