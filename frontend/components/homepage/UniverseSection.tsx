"use client";

import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Wallet, CreditCard, TrendingUp, PiggyBank, GraduationCap, Activity } from "lucide-react";
import Image from "next/image";

const ease = [0.22, 1, 0.36, 1] as const;

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.72, delay, ease }}>
      {children}
    </motion.div>
  );
}

/* ── Node card ───────────────────────────────────────────────── */
const NODES = [
  { icon: Wallet,       label: "Income",       sub: "Track every rupee",     accent: "lime",    delay: 0.05 },
  { icon: CreditCard,   label: "Cards",        sub: "Optimize rewards",       accent: "emerald", delay: 0.1  },
  { icon: TrendingUp,   label: "Spending",     sub: "Analyse patterns",       accent: "lime",    delay: 0.15 },
  { icon: PiggyBank,    label: "Savings",      sub: "Build your cushion",     accent: "teal",    delay: 0.2  },
  { icon: GraduationCap,label: "Education",    sub: "Learn & grow",           accent: "emerald", delay: 0.25 },
  { icon: Activity,     label: "Health Score", sub: "Know your number",       accent: "lime",    delay: 0.3  },
];

const accentStyles = {
  lime:    { bg: "bg-lime-400/10",    border: "border-lime-400/20",    icon: "text-lime-400",    glow: "shadow-[0_0_20px_rgba(163,230,53,0.2)]",  line: "#a3e635" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "text-emerald-400", glow: "shadow-[0_0_20px_rgba(16,185,129,0.2)]",   line: "#10B981" },
  teal:    { bg: "bg-teal-500/10",    border: "border-teal-500/20",    icon: "text-teal-400",    glow: "shadow-[0_0_20px_rgba(20,184,166,0.2)]",   line: "#14B8A6" },
};

function NodeCard({ node, index }: { node: typeof NODES[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const s = accentStyles[node.accent as keyof typeof accentStyles];
  return (
    <FadeUp delay={node.delay}>
      <motion.div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        animate={{ y: hovered ? -6 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={`relative p-5 rounded-2xl bg-[#060E0B]/80 border ${s.border} backdrop-blur-xl cursor-default transition-shadow duration-300 ${hovered ? s.glow : ""}`}
      >
        {/* Animated border glow on hover */}
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`absolute inset-0 rounded-2xl border ${s.border} pointer-events-none`}
            style={{ filter: "blur(1px)" }}
          />
        )}
        <div className={`w-10 h-10 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center mb-3`}>
          <node.icon className={`w-5 h-5 ${s.icon}`} />
        </div>
        <div className="text-sm font-bold text-white">{node.label}</div>
        <div className="text-xs text-slate-400 mt-0.5">{node.sub}</div>

        {/* Connection dot */}
        <motion.div
          className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
          style={{ backgroundColor: s.line }}
          animate={{ scale: hovered ? [1, 1.6, 1] : 1, opacity: hovered ? [0.8, 1, 0.8] : 0.5 }}
          transition={{ duration: 1, repeat: hovered ? Infinity : 0 }}
        />
      </motion.div>
    </FadeUp>
  );
}

/* ── Universe section ─────────────────────────────────────────── */
export function UniverseSection() {
  const topNodes    = NODES.slice(0, 3);
  const bottomNodes = NODES.slice(3, 6);

  return (
    <section className="relative py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#040C08]/60" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/7 rounded-full blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeUp className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.1] text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-5">
            The CLIQ ecosystem
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
            Your complete financial<br />
            <span className="gradient-text-animated">universe, connected.</span>
          </h2>
          <p className="mt-5 text-slate-400 text-lg max-w-xl mx-auto">
            CLIQ connects every aspect of your financial life — intelligently, privately and in real time.
          </p>
        </FadeUp>

        {/* Node network layout */}
        <div className="relative">
          {/* Top row of nodes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {topNodes.map((node, i) => (
              <NodeCard key={node.label} node={node} index={i} />
            ))}
          </div>

          {/* Central hub */}
          <FadeUp delay={0.18} className="flex justify-center my-6">
            <div className="relative">
              {/* Glow rings */}
              <div className="absolute inset-0 rounded-full bg-lime-400/15 blur-2xl scale-150 pointer-events-none" />
              <motion.div
                className="absolute -inset-4 rounded-full border border-lime-400/12"
                animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute -inset-8 rounded-full border border-emerald-500/8"
                animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />

              {/* Hub card */}
              <div className="relative w-44 h-44 rounded-full bg-[#060E0B]/95 border border-[#00F8D8]/25 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(0,248,216,0.12),inset_0_1px_0_rgba(255,255,255,0.08)]">
                <Image
                  src="/cliq-logo.png"
                  alt="CLIQ"
                  width={1024}
                  height={381}
                  className="h-8 w-auto object-contain"
                />
                <div className="mt-3 text-[10px] text-slate-400 font-semibold tracking-wider">Powered by</div>
                <div className="text-xs font-bold tracking-widest uppercase" style={{ color: "#00F8D8" }}>CLIQ AI</div>
              </div>
            </div>
          </FadeUp>

          {/* Bottom row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {bottomNodes.map((node, i) => (
              <NodeCard key={node.label} node={node} index={i + 3} />
            ))}
          </div>
        </div>

        {/* Bottom description */}
        <FadeUp delay={0.35} className="text-center mt-14">
          <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
            Every piece of data stays encrypted and consent-gated. CLIQ&rsquo;s AI synthesises signals
            across all six domains to give you insights that no single tool can provide.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
