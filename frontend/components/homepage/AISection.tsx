"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Sparkles, Shield, Lock, Brain } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

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
  const { t } = useLanguage();
  const a = t.home.ai;

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
          <div className="max-w-[78%] px-4 py-3 rounded-3xl rounded-tr-md bg-[#12301A] text-sm text-lime-100 font-medium leading-snug">
            {a.chatQuestion}
          </div>
        </motion.div>
      )}

      {/* Typing */}
      {stage === 2 && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
          className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-lime-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[#12301A]" />
          </div>
          <div className="px-4 py-3 rounded-3xl rounded-tl-md bg-[#EEF2E4]">
            <div className="flex items-center gap-1">
              {[0, 0.16, 0.32].map((d, i) => (
                <motion.div key={i} className="w-1.5 h-1.5 bg-[#12301A] rounded-full"
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
          <div className="w-7 h-7 rounded-full bg-lime-400 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-[#12301A]" />
          </div>
          <div className="flex-1 px-4 py-4 rounded-3xl rounded-tl-md bg-[#EEF2E4] text-sm text-[#12301A]/80 leading-relaxed space-y-3">
            <p>{a.chatIntro}</p>
            <div className="space-y-1.5 bg-white rounded-2xl p-3">
              <div className="flex justify-between text-xs">
                <span className="text-[#12301A]/55">{a.chatIncome}</span>
                <span className="text-[#12301A] font-semibold tabular">₹42,000</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#12301A]/55">{a.chatExpenses}</span>
                <span className="text-[#12301A] font-semibold tabular">₹35,480</span>
              </div>
              <div className="h-px bg-[#12301A]/10 my-1" />
              <div className="flex justify-between text-xs">
                <span className="text-[#12301A]/55">{a.chatSurplus}</span>
                <span className="px-2 rounded-full bg-lime-400 text-[#12301A] font-bold tabular">₹6,520</span>
              </div>
            </div>
            <p className="text-xs text-[#12301A] font-semibold">
              {a.chatVerdict}
            </p>
          </div>
        </motion.div>
      )}

      {/* Follow-up hint */}
      {stage >= 4 && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}
          className="flex justify-end">
          <div className="px-3 py-2 rounded-full bg-[#EEF2E4] text-[11px] text-[#12301A]/50 italic">
            {a.chatHint}
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ── AI section ──────────────────────────────────────────────── */
export function AISection() {
  const { t } = useLanguage();
  const a = t.home.ai;
  const trust = [Shield, Lock, Brain].map((icon, i) => ({ icon, ...a.trust[i] }));

  return (
    <section className="relative px-3 sm:px-4 py-4">
      <div className="relative rounded-[2rem] sm:rounded-[2.5rem] bg-lime-400 text-[#12301A] overflow-hidden py-16 sm:py-20">
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left: editorial copy */}
            <FadeUp>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#12301A] text-lime-300 text-[11px] font-bold tracking-wide mb-6">
                <Sparkles className="w-3 h-3" />
                {a.eyebrow}
              </div>

              <h2 className="font-display text-[clamp(2rem,4.4vw,3.4rem)] font-extrabold uppercase leading-[1] tracking-[-0.03em] mb-6">
                {a.line1}<br />
                {a.line2}<br />
                <span className="inline-block bg-white rounded-full px-[0.3em] mt-[0.08em]">{a.line3}</span>
              </h2>

              <p className="text-[#12301A]/75 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
                {a.subtitle}
              </p>

              {/* Trust signals */}
              <div className="space-y-4">
                {trust.map((item, i) => (
                  <FadeUp key={i} delay={0.1 + i * 0.08}>
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-full bg-[#12301A] flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4 text-lime-300" />
                      </div>
                      <div>
                        <div className="text-sm font-bold">{item.label}</div>
                        <div className="text-xs text-[#12301A]/65 mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                  </FadeUp>
                ))}
              </div>
            </FadeUp>

            {/* Right: chat panel */}
            <FadeUp delay={0.15}>
              <div className="relative rounded-[2rem] bg-white text-[#12301A] shadow-[0_40px_80px_-30px_rgba(18,48,26,0.55)] overflow-hidden">
                {/* Chat header */}
                <div className="px-5 py-4 border-b border-[#12301A]/[0.07] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#12301A] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-lime-300" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">{a.assistantName}</div>
                      <div className="text-[10px] text-[#12301A]/55 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-lime-500 inline-block" />
                        {a.status}
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] font-semibold text-[#12301A] bg-lime-300 px-2.5 py-1 rounded-full">
                    Gemini 2.5 Flash
                  </div>
                </div>

                {/* Chat body */}
                <div className="p-5">
                  <ChatSequence />
                </div>

                {/* Input bar */}
                <div className="px-5 pb-5">
                  <div className="flex items-center gap-3 pl-5 pr-1.5 py-1.5 rounded-full bg-[#EEF2E4]">
                    <span className="text-xs text-[#12301A]/50 flex-1">{a.inputPlaceholder}</span>
                    <div className="w-9 h-9 rounded-full bg-[#12301A] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-lime-300" />
                    </div>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
