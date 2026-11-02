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
  lime:    { tile: "bg-lime-400 text-[#12301A]",  dot: "#8AB518" },
  emerald: { tile: "bg-[#12301A] text-lime-300",  dot: "#12301A" },
  teal:    { tile: "bg-[#F6E58D] text-[#3A3005]", dot: "#C9A920" },
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
        className="relative p-5 rounded-3xl bg-white text-[#12301A] cursor-default shadow-[0_1px_2px_rgba(18,48,26,0.06),0_12px_30px_-14px_rgba(18,48,26,0.25)] flex items-center gap-4"
      >
        <div className={`w-12 h-12 rounded-2xl ${s.tile} flex items-center justify-center shrink-0`}>
          <node.icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="font-display text-base font-bold tracking-tight">{node.label}</div>
          <div className="text-xs text-[#12301A]/60 mt-0.5">{node.sub}</div>
        </div>

        {/* Connection dot */}
        <motion.div
          className="absolute top-1/2 right-4 -translate-y-1/2 w-2 h-2 rounded-full"
          style={{ backgroundColor: s.dot }}
          animate={{ scale: hovered ? [1, 1.6, 1] : 1, opacity: hovered ? [0.8, 1, 0.8] : 0.35 }}
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
    <section className="relative px-3 sm:px-4 py-4">
      <div className="relative rounded-[2rem] sm:rounded-[2.5rem] bg-[#F4F6EE] text-[#12301A] overflow-hidden py-20 sm:py-24">
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <FadeUp className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12301A] text-lime-300 text-[11px] font-bold tracking-wide mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
              The CLIQ ecosystem
            </div>
            <h2 className="font-display text-[clamp(2rem,4.6vw,3.6rem)] font-extrabold uppercase leading-[1] tracking-[-0.03em]">
              See your <span className="text-[#5E8C12]">money clearly,</span><br />
              all in one place.
            </h2>
            <p className="mt-5 text-[#12301A]/65 text-base sm:text-lg max-w-xl mx-auto">
              CLIQ connects every aspect of your financial life — intelligently, privately and in real time.
            </p>
          </FadeUp>

          {/* Node network layout */}
          <div className="relative">
            {/* Top row of nodes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {topNodes.map((node, i) => (
                <NodeCard key={node.label} node={node} index={i} />
              ))}
            </div>

            {/* Central hub */}
            <FadeUp delay={0.18} className="flex justify-center my-10">
              <div className="relative">
                <motion.div
                  className="absolute -inset-5 rounded-full border-2 border-dashed border-[#12301A]/15"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                />
                {/* Hub */}
                <div className="relative w-40 h-40 rounded-full bg-[#12301A] flex flex-col items-center justify-center shadow-[0_24px_50px_-20px_rgba(18,48,26,0.7)]">
                  <Image
                    src="/cliq-logo.png"
                    alt="CLIQ"
                    width={1024}
                    height={381}
                    className="h-8 w-auto object-contain [filter:hue-rotate(-95deg)_saturate(1.15)]"
                  />
                  <div className="mt-3 text-[10px] text-lime-200/60 font-semibold tracking-wider">Powered by</div>
                  <div className="text-xs font-bold tracking-widest uppercase text-lime-300">CLIQ AI</div>
                </div>
              </div>
            </FadeUp>

            {/* Bottom row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {bottomNodes.map((node, i) => (
                <NodeCard key={node.label} node={node} index={i + 3} />
              ))}
            </div>
          </div>

          {/* Bottom description */}
          <FadeUp delay={0.35} className="text-center mt-14">
            <p className="text-[#12301A]/60 text-sm max-w-2xl mx-auto leading-relaxed">
              Every piece of data stays encrypted and consent-gated. CLIQ&rsquo;s AI synthesises signals
              across all six domains to give you insights that no single tool can provide.
            </p>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
