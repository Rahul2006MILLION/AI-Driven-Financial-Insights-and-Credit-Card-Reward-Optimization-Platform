"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Wifi } from "lucide-react";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/* ── Scroll progress bar ─────────────────────────────────────── */
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      setPct((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-[3px] bg-transparent pointer-events-none">
      <motion.div
        className="h-full origin-left bg-lime-400"
        style={{ scaleX: pct / 100 }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
      />
    </div>
  );
}

/* ── Fanned card trio ────────────────────────────────────────── */
type CardTone = "pale" | "lime" | "forest";

const CARD_TONES: Record<CardTone, { bg: string; ink: string; mark: string }> = {
  pale:   { bg: "bg-[#E4EDD3]", ink: "text-[#12301A]", mark: "text-[#12301A]/[0.07]" },
  lime:   { bg: "bg-lime-400",  ink: "text-[#12301A]", mark: "text-[#12301A]/[0.09]" },
  forest: { bg: "bg-[#12301A]", ink: "text-lime-300",  mark: "text-lime-300/[0.08]" },
};

function HeroCard({ tone, label }: { tone: CardTone; label: string }) {
  const c = CARD_TONES[tone];
  return (
    <div
      className={`relative w-[150px] sm:w-[200px] md:w-[230px] aspect-[5/8] rounded-[1.6rem] ${c.bg} ${c.ink} shadow-[0_30px_60px_-20px_rgba(18,48,26,0.45)] overflow-hidden`}
    >
      {/* Vertical watermark */}
      <span
        aria-hidden
        className={`absolute -right-3 top-1/2 -translate-y-1/2 rotate-90 origin-center font-display font-extrabold text-[5.5rem] md:text-[7rem] leading-none tracking-tight ${c.mark} select-none`}
      >
        CLIQ
      </span>
      <div className="relative h-full flex flex-col justify-between p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-70">{label}</span>
          <Wifi className="w-4 h-4 rotate-90 opacity-70" />
        </div>
        <div>
          <div className="w-9 h-7 rounded-md bg-gradient-to-br from-[#F6E7A6] to-[#C9AE52] mb-4 opacity-90" />
          <p className="font-display font-extrabold text-xl tracking-tight">CLIQ</p>
          <p className="text-[10px] font-semibold opacity-60 tabular">•••• 4821</p>
        </div>
      </div>
    </div>
  );
}

function CardFan() {
  const reduce = useReducedMotion();
  const cards: { tone: CardTone; label: string; rotate: number; x: number; y: number; delay: number }[] = [
    { tone: "pale",   label: "Savings", rotate: -16, x: -46, y: 30, delay: 0.55 },
    { tone: "lime",   label: "Rewards", rotate: 0,   x: 0,   y: 0,  delay: 0.45 },
    { tone: "forest", label: "Premium", rotate: 16,  x: 46,  y: 30, delay: 0.65 },
  ];
  return (
    <div className="relative h-[280px] sm:h-[360px] md:h-[400px] flex items-end justify-center">
      {cards.map((card, i) => (
        <motion.div
          key={card.tone}
          className="absolute bottom-[-60px] md:bottom-[-70px]"
          style={{ zIndex: i === 1 ? 3 : i === 0 ? 1 : 2 }}
          initial={reduce ? false : { opacity: 0, y: 120, rotate: 0, x: 0 }}
          animate={{ opacity: 1, y: card.y, rotate: card.rotate, x: `${card.x}%` }}
          whileHover={reduce ? undefined : { y: card.y - 18 }}
          transition={{ type: "spring", stiffness: 90, damping: 16, delay: card.delay }}
        >
          <HeroCard tone={card.tone} label={card.label} />
        </motion.div>
      ))}
    </div>
  );
}

/* ── Feature chip cloud ──────────────────────────────────────── */
const CHIPS: { label: string; tone: "lime" | "sun" | "forest" | "mist" }[] = [
  { label: "Reward Optimizer",    tone: "lime"   },
  { label: "Budget Planner",      tone: "sun"    },
  { label: "Savings Goals",       tone: "forest" },
  { label: "Emergency Fund",      tone: "mist"   },
  { label: "Statement Import",    tone: "lime"   },
  { label: "AI Assistant",        tone: "forest" },
  { label: "Financial Health",    tone: "lime"   },
  { label: "Live Card Offers",    tone: "mist"   },
  { label: "EN · हिन्दी · ಕನ್ನಡ", tone: "sun"    },
];

const CHIP_TONE = {
  lime:   "bg-lime-300 text-[#12301A]",
  sun:    "bg-[#F6E58D] text-[#3A3005]",
  forest: "bg-[#12301A] text-lime-200",
  mist:   "bg-[#E6EEDB] text-[#12301A]",
};

/* ── Hero section ─────────────────────────────────────────────── */
export function HeroSection() {
  const reduce = useReducedMotion();
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE_OUT },
  });

  return (
    <>
      <ScrollProgress />

      <section className="px-3 sm:px-4 pt-2 pb-4">
        <div className="relative rounded-[2rem] sm:rounded-[2.5rem] bg-[#F4F6EE] text-[#12301A] overflow-hidden">
          {/* ── Hero ── */}
          <div className="relative bg-gradient-to-b from-[#F4F6EE] via-[#EEF4DF] to-[#DCEFB0] rounded-[2rem] sm:rounded-[2.5rem] mx-2 mt-2 sm:mx-3 sm:mt-3 overflow-hidden">
            <div className="max-w-5xl mx-auto px-5 pt-12 sm:pt-16 text-center">
              <motion.div
                {...rise(0)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12301A] text-lime-300 text-[11px] font-bold tracking-wide mb-7"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
                Financial intelligence for every Indian
              </motion.div>

              <motion.h1
                {...rise(0.08)}
                className="font-display font-extrabold uppercase text-[clamp(2.4rem,7.2vw,5.6rem)] leading-[0.95] tracking-[-0.035em]"
              >
                Money made
                <br />
                simple, in
                <br />
                <span className="inline-flex flex-wrap items-center justify-center gap-x-[0.18em] align-middle">
                  your
                  <span className="inline-flex items-center gap-[0.18em] rounded-full bg-lime-400 pl-[0.08em] pr-[0.28em] py-[0.06em] text-[0.42em] tracking-normal normal-case align-middle">
                    <span className="inline-flex items-center justify-center w-[1.7em] h-[1.7em] rounded-full bg-[#12301A] text-lime-300">
                      <ArrowRight className="w-[0.9em] h-[0.9em]" />
                    </span>
                    EN&nbsp;हि&nbsp;ಕ
                  </span>
                  language
                </span>
              </motion.h1>

              <motion.p
                {...rise(0.2)}
                className="mt-6 mx-auto max-w-md text-[15px] leading-relaxed text-[#12301A]/70"
              >
                Maximise every card reward, or build your first savings habit. Deterministic
                math, plain-language guidance, and your data stays yours.
              </motion.p>

              <motion.div {...rise(0.3)} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#12301A] hover:bg-[#1B4426] text-lime-300 font-bold text-sm transition-colors"
                >
                  Start free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-lime-400 hover:bg-lime-300 text-[#12301A] font-bold text-sm transition-colors"
                >
                  Sign in
                </Link>
              </motion.div>
            </div>

            <CardFan />
          </div>

          {/* ── Everything in one place ── */}
          <div className="px-5 pt-14 pb-14 sm:pb-16 text-center">
            <motion.h2
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: EASE_OUT }}
              className="font-display font-extrabold uppercase text-[clamp(1.5rem,3.2vw,2.35rem)] leading-[1.05] tracking-[-0.02em]"
            >
              <span className="text-[#5E8C12]">Everything</span> your money
              <br />
              needs, in one place.
            </motion.h2>
            <div className="mt-8 flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
              {CHIPS.map((chip, i) => (
                <motion.span
                  key={chip.label}
                  initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: i * 0.04 }}
                  className={`px-4 py-2 rounded-full text-[13px] font-semibold ${CHIP_TONE[chip.tone]}`}
                >
                  {chip.label}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
