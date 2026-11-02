"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Sparkles, Shield, Lock, Brain } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease }}>
      {children}
    </motion.div>
  );
}

/* ── Animated chat sequence ──────────────────────────────────── */
function ChatSequence() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const timers = [
      setTimeout(() => setStage(1), 300),
      setTimeout(() => setStage(2), 1100),
      setTimeout(() => setStage(3), 2300),
      setTimeout(() => setStage(4), 3800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  return (
    <div ref={ref} className="space-y-4 min-h-[300px]">
      {/* User message */}
      {stage >= 1 && (
        <motion.div initial={{ opacity: 0, y: 10, x: 10 }} animate={{ opacity: 1, y: 0, x: 0 }} transition={{ duration: 0.4, ease }}
          className="flex justify-end">
          <div className="max-w-[78%] px-4 py-3 rounded-2xl rounded-tr-sm bg-white/[0.07] border border-white/10 text-sm text-slate-200 font-medium leading-snug">
            Can I afford to save ₹3,000 every month?
          </div>
        </motion.div>
      )}

      {/* Typing */}
      {stage === 2 && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
          className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[#0C1A12]/90 border border-emerald-500/20">
            <div className="flex items-center gap-1">
              {[0, 0.16, 0.32].map((d, i) => (
                <motion.div key={i} className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: d }} />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* AI response */}
      {stage >= 3 && (
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease }}
          className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex-1 px-4 py-4 rounded-2xl rounded-tl-sm bg-[#0C1A12]/90 border border-emerald-500/20 text-sm text-slate-300 leading-relaxed space-y-3">
            <p>Let&rsquo;s examine your recorded income and expenses to understand whether this savings target is sustainable.</p>
            <div className="space-y-1.5 bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Monthly income (3-month median)</span>
                <span className="text-white font-semibold">₹42,000</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Recorded expenses</span>
                <span className="text-slate-200 font-semibold">₹35,480</span>
              </div>
              <div className="h-px bg-white/[0.06] my-1" />
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Available surplus</span>
                <span className="text-lime-400 font-bold">₹6,520</span>
              </div>
            </div>
            <p className="text-xs text-emerald-300 font-medium">
              Yes — your current surplus comfortably covers ₹3,000 with a ₹3,520 safety buffer remaining.
            </p>
          </div>
        </motion.div>
      )}

      {/* Follow-up hint */}
      {stage >= 4 && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}
          className="flex justify-end">
          <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[11px] text-slate-500 italic">
            Ask about your spending patterns, debt payoff, or investment readiness...
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ── AI section ──────────────────────────────────────────────── */
export function AISection() {
  const trust = [
    { icon: Shield, label: "Privacy Gateway", desc: "9-layer PII redaction before any AI call" },
    { icon: Lock, label: "Consent-gated", desc: "You control what data the AI can access" },
    { icon: Brain, label: "Explainable", desc: "Every answer cites your actual numbers" },
  ];

  return (
    <section className="relative py-28 overflow-hidden">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[500px] bg-emerald-500/6 rounded-full blur-[130px]" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-lime-400/4 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: editorial copy */}
          <FadeUp>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/25 text-emerald-400 text-[10px] font-bold tracking-widest uppercase mb-6">
              <Sparkles className="w-3 h-3" />
              AI financial intelligence
            </div>

            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
              Your 24/7 financial<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-400">
                intelligence advisor.
              </span>
            </h2>

            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Ask anything about your money in plain language — Hindi, English or Kannada.
              CLIQ&rsquo;s AI analyses your real income and spending data, never guesses.
            </p>

            {/* Trust signals */}
            <div className="space-y-4">
              {trust.map((t, i) => (
                <FadeUp key={t.label} delay={0.1 + i * 0.08}>
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <t.icon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{t.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{t.desc}</div>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </FadeUp>

          {/* Right: chat panel */}
          <FadeUp delay={0.15}>
            <div className="relative">
              {/* Glow behind chat */}
              <div className="absolute -inset-6 bg-emerald-500/8 rounded-3xl blur-2xl pointer-events-none" />

              <div className="relative rounded-3xl bg-[#070F0C]/90 border border-emerald-500/20 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden">
                {/* Chat header */}
                <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">CLIQ AI Assistant</div>
                      <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                        Active — 3 sources analysed
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 bg-white/[0.03] border border-white/[0.06] px-2.5 py-1 rounded-full">
                    Gemini 2.5 Flash
                  </div>
                </div>

                {/* Chat body */}
                <div className="p-5">
                  <ChatSequence />
                </div>

                {/* Input bar */}
                <div className="px-5 pb-5">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                    <span className="text-xs text-slate-500 flex-1">Ask about your finances...</span>
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
