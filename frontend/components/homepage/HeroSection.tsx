"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  motion, useMotionValue, useSpring, useTransform,
  AnimatePresence,
} from "framer-motion";
import { ArrowRight, ChevronDown, TrendingUp, Shield, Target, Sparkles } from "lucide-react";

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
    <div className="fixed top-0 left-0 right-0 z-[200] h-[2px] bg-transparent pointer-events-none">
      <motion.div
        className="h-full origin-left"
        style={{
          scaleX: pct / 100,
          background: "linear-gradient(90deg, #a3e635, #10B981, #14B8A6)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
      />
    </div>
  );
}

/* ── Background node network (decorative SVG) ───────────────── */
const NET_NODES = [
  { x: 8,  y: 15 }, { x: 22, y: 8  }, { x: 40, y: 20 }, { x: 58, y: 10 },
  { x: 72, y: 25 }, { x: 88, y: 12 }, { x: 95, y: 40 }, { x: 82, y: 55 },
  { x: 65, y: 70 }, { x: 48, y: 80 }, { x: 30, y: 72 }, { x: 15, y: 60 },
  { x: 5,  y: 45 }, { x: 35, y: 40 }, { x: 60, y: 45 },
];
const NET_EDGES = [
  [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],
  [12,0],[13,1],[13,9],[13,14],[14,4],[14,7],[2,13],[11,13],
];

function NetworkBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 100 100"
      style={{ opacity: 0.13 }}
    >
      {NET_EDGES.map(([a, b], i) => {
        const na = NET_NODES[a], nb = NET_NODES[b];
        return (
          <line
            key={i}
            x1={`${na.x}%`} y1={`${na.y}%`}
            x2={`${nb.x}%`} y2={`${nb.y}%`}
            stroke="url(#netGrad)"
            strokeWidth="0.3"
            className="net-pulse"
            style={{ animationDelay: `${(i * 0.22) % 3}s` }}
          />
        );
      })}
      {NET_NODES.map((n, i) => (
        <circle
          key={i}
          cx={`${n.x}%`} cy={`${n.y}%`}
          r={i === 13 || i === 14 ? "0.7" : "0.45"}
          fill={i % 3 === 0 ? "#a3e635" : "#10B981"}
          className="net-pulse"
          style={{ animationDelay: `${(i * 0.3) % 3}s` }}
        />
      ))}
      <defs>
        <linearGradient id="netGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a3e635" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── Ambient floating particles ──────────────────────────────── */
function Particles() {
  const particles = useMemo(() => Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: (i * 4.5 + Math.sin(i * 1.7) * 12 + 50) % 100,
    y: (i * 5.8 + Math.cos(i * 2.1) * 10 + 30) % 100,
    size: (i % 3 === 0) ? 2.5 : (i % 3 === 1) ? 1.5 : 1,
    dur: 7 + (i * 1.3) % 8,
    delay: (i * 0.4) % 4,
    color: i % 2 === 0 ? "#a3e635" : "#10B981",
  })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full particle-float"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}80`,
            "--dur": `${p.dur}s`,
            "--delay": `${p.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* ── Animated health ring ─────────────────────────────────────── */
function HealthRing() {
  const [val, setVal] = useState(0);
  const r = 50, circ = 2 * Math.PI * r;
  const gap = circ - (val / 100) * circ;

  useEffect(() => {
    const t = setTimeout(() => {
      let n = 0;
      const tick = () => { if (n < 87) { n += 1; setVal(n); requestAnimationFrame(tick); } };
      requestAnimationFrame(tick);
    }, 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="url(#hrGrad)" strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={gap}
          style={{ transition: "stroke-dashoffset 0.012s linear" }} />
        <defs>
          <linearGradient id="hrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" /><stop offset="100%" stopColor="#a3e635" />
          </linearGradient>
        </defs>
      </svg>
      <div className="relative text-center z-10">
        <div className="text-[26px] font-black text-white leading-none">{val}</div>
        <div className="text-[9px] text-emerald-400 font-bold tracking-widest uppercase mt-0.5">Health</div>
      </div>
    </div>
  );
}

/* ── Dashboard preview card (right column hero visual) ─────── */
function DashboardCard({ x, y }: { x: ReturnType<typeof useSpring>; y: ReturnType<typeof useSpring> }) {
  const stats = [
    { icon: TrendingUp, label: "Saved",   value: "₹12.4K",  color: "text-lime-400",    bg: "bg-lime-400/10 border-lime-400/20" },
    { icon: Target,     label: "Rewards", value: "4.2×",    color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
    { icon: Shield,     label: "Budget",  value: "On track", color: "text-teal-400",    bg: "bg-teal-400/10 border-teal-400/20" },
  ];
  const bars = [
    { label: "Food",      pct: 62, color: "bg-emerald-400" },
    { label: "Transport", pct: 38, color: "bg-lime-400" },
    { label: "Utilities", pct: 55, color: "bg-teal-400" },
    { label: "Shopping",  pct: 29, color: "bg-emerald-300" },
  ];

  return (
    <motion.div
      style={{ x, y }}
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.1, delay: 0.6, ease: EASE_OUT }}
      className="relative w-full max-w-[420px]"
    >
      {/* Glow halo */}
      <div className="absolute -inset-8 bg-emerald-500/12 rounded-[40px] blur-3xl pointer-events-none" />
      <div className="absolute -inset-4 bg-lime-400/5 rounded-[32px] blur-2xl pointer-events-none" />

      {/* Card */}
      <div className="relative rounded-3xl bg-[#060E0B]/95 border border-emerald-500/20 backdrop-blur-2xl shadow-[0_40px_100px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.07)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-lime-500/3 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 rounded-full bg-lime-400"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs font-bold text-white tracking-wide">Financial Intelligence</span>
          </div>
          <span className="text-[10px] text-slate-500 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-emerald-400" /> CLIQ AI
          </span>
        </div>

        {/* Health + stats */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-4">
            <HealthRing />
            <div className="flex-1 space-y-2">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.3 + i * 0.09, ease: EASE_OUT }}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl border ${s.bg}`}
                >
                  <div className="flex items-center gap-1.5">
                    <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                    <span className="text-[11px] text-slate-400">{s.label}</span>
                  </div>
                  <span className={`text-xs font-bold ${s.color}`}>{s.value}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Spending bars */}
        <div className="px-5 pb-5 space-y-2">
          <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase mb-2.5">Monthly Spending</p>
          {bars.map((b, i) => (
            <div key={b.label} className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">{b.label}</span>
                <span className="text-slate-500">{b.pct}%</span>
              </div>
              <div className="h-[3px] bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${b.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${b.pct}%` }}
                  transition={{ duration: 0.9, delay: 1.5 + i * 0.09, ease: EASE_OUT }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Magnetic CTA button ─────────────────────────────────────── */
function MagneticLink({
  href, children, primary = false,
}: { href: string; children: React.ReactNode; primary?: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 200, damping: 16 });
  const sy = useSpring(my, { stiffness: 200, damping: 16 });

  const handleMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left - r.width  / 2) * 0.35);
    my.set((e.clientY - r.top  - r.height / 2) * 0.35);
  }, [mx, my]);

  const handleLeave = useCallback(() => { mx.set(0); my.set(0); }, [mx, my]);

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x: sx, y: sy }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={primary
        ? "group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-lime-400 hover:bg-lime-300 text-[#030806] font-bold text-sm shadow-[0_0_32px_rgba(163,230,53,0.4)] hover:shadow-[0_0_52px_rgba(163,230,53,0.65)] transition-all duration-300 will-change-transform"
        : "group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-slate-300 hover:text-white font-medium text-sm backdrop-blur-xl transition-all duration-300 will-change-transform"
      }
    >
      {children}
    </motion.a>
  );
}

/* ── Hero word animation ─────────────────────────────────────── */
const headlineLines = ["Your money.", "Your choices.", "Your future."];

function AnimatedHeadline() {
  return (
    <div className="space-y-0.5">
      {headlineLines.map((line, i) => (
        <motion.div
          key={line}
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: 0.15 + i * 0.14, ease: EASE_OUT }}
          className={`block text-[clamp(2.6rem,5.5vw,4.6rem)] font-black leading-[1.06] tracking-tight ${
            i === 2 ? "gradient-text-animated" : "text-white"
          }`}
        >
          {line}
        </motion.div>
      ))}
    </div>
  );
}

/* ── Hero section ─────────────────────────────────────────────── */
export function HeroSection() {
  // Mouse parallax values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cardX  = useSpring(useTransform(mouseX, [-0.5, 0.5], [-16, 16]), { stiffness: 60, damping: 22 });
  const cardY  = useSpring(useTransform(mouseY, [-0.5, 0.5], [-10, 10]), { stiffness: 60, damping: 22 });
  const orbX   = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8,  8 ]), { stiffness: 30, damping: 18 });
  const orbY   = useSpring(useTransform(mouseY, [-0.5, 0.5], [-5,  5 ]), { stiffness: 30, damping: 18 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth  - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, [mouseX, mouseY]);

  return (
    <>
      <ScrollProgress />

      <section className="relative min-h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
        {/* ── Background layers ── */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Ambient orbs */}
          <motion.div style={{ x: orbX, y: orbY }} className="absolute inset-0">
            <div className="absolute top-[-5%] left-[40%] w-[700px] h-[500px] bg-emerald-500/11 rounded-full blur-[140px]" />
            <div className="absolute top-[30%] right-[-5%] w-[450px] h-[450px] bg-lime-400/6 rounded-full blur-[120px]" />
            <div className="absolute bottom-10 left-[5%] w-[380px] h-[380px] bg-teal-500/7 rounded-full blur-[110px]" />
          </motion.div>

          {/* Network grid lines */}
          <div
            className="absolute inset-0 opacity-[0.022]"
            style={{
              backgroundImage: "linear-gradient(rgba(163,230,53,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,0.6) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
            }}
          />

          {/* SVG node network */}
          <NetworkBackground />

          {/* Floating particles */}
          <Particles />
        </div>

        {/* ── Main content ── */}
        <div className="relative z-10 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 py-16 lg:py-20">

            {/* Left: copy */}
            <div className="flex flex-col justify-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, ease: EASE_OUT }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-400/10 border border-lime-400/25 text-lime-400 text-[11px] font-bold tracking-widest uppercase mb-8 w-fit shadow-[0_0_20px_rgba(163,230,53,0.15)]"
              >
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-lime-400"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
                Financial intelligence for everyone
              </motion.div>

              {/* Headline */}
              <AnimatedHeadline />

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6, ease: EASE_OUT }}
                className="mt-7 text-slate-400 text-lg leading-relaxed max-w-[460px]"
              >
                Whether you&rsquo;re maximizing credit card rewards or building your first
                savings — CLIQ gives every Indian the financial intelligence they deserve.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.72, ease: EASE_OUT }}
                className="mt-8 flex flex-col sm:flex-row gap-3"
              >
                <MagneticLink href="/register" primary>
                  Start free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </MagneticLink>
                <MagneticLink href="/login">
                  Sign in
                </MagneticLink>
              </motion.div>

              {/* Trust row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-slate-500"
              >
                {["Privacy-first", "No card required to start", "EN · हिन्दी · ಕನ್ನಡ"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-400/70" />{t}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right: dashboard card with parallax */}
            <div className="flex items-center justify-center lg:justify-end">
              <DashboardCard x={cardX} y={cardY} />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="relative z-10 flex justify-center pb-8"
        >
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1.5 text-slate-500"
          >
            <span className="text-[10px] tracking-widest uppercase font-medium">Explore</span>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
