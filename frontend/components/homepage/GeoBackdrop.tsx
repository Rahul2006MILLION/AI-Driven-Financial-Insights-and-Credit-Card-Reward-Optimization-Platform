"use client";

import React, { useEffect, useId } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { usePointerEffects } from "@/lib/motion";

/*
 * Shared decorative geometry for the light homepage panels (hero, features,
 * ecosystem). Everything here is aria-hidden, pointer-events-none and sits behind
 * the section content. Per-section layouts below place the same primitives in each
 * panel's negative space; masks keep headings and body copy on clean paper.
 */

// Brand hues, deepened slightly so they read on the light paper at ~8–10% opacity
const EMERALD = "#2E7C28";
const TURQUOISE = "#00A894";
const LIME = "#6E9612";

/* ── Primitives ──────────────────────────────────────────────── */

/* Isometric (triangular) lattice tile: vertical + ±30° lines. */
const ISO_W = 34.64;
const ISO_H = 40;

function IsoGrid() {
  const id = `iso-${useId().replace(/:/g, "")}`;
  return (
    <svg className="absolute inset-0 w-full h-full" aria-hidden>
      <defs>
        <pattern id={id} width={ISO_W} height={ISO_H} patternUnits="userSpaceOnUse">
          <g fill="none" strokeWidth="0.8">
            <path d={`M0 0V${ISO_H}M${ISO_W / 2} 0V${ISO_H}`} stroke={EMERALD} />
            <path d={`M0 0L${ISO_W} 20M0 20L${ISO_W} 40`} stroke={TURQUOISE} />
            <path d={`M0 20L${ISO_W} 0M0 40L${ISO_W} 20`} stroke={LIME} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* A small node network (connections between money domains). */
const NET_NODES: [number, number][] = [
  [28, 40], [96, 18], [150, 74], [70, 112], [126, 150], [40, 196], [168, 214], [104, 252],
];
const NET_EDGES: [number, number][] = [
  [0, 1], [1, 2], [0, 3], [3, 2], [3, 4], [2, 4], [3, 5], [4, 6], [5, 7], [4, 7], [6, 7],
];

function NetworkCluster({ mirrored = false }: { mirrored?: boolean }) {
  return (
    <svg viewBox="0 0 200 280" className="w-full h-full" style={mirrored ? { transform: "scaleX(-1)" } : undefined} aria-hidden>
      {NET_EDGES.map(([a, b], i) => (
        <line
          key={i}
          x1={NET_NODES[a][0]} y1={NET_NODES[a][1]} x2={NET_NODES[b][0]} y2={NET_NODES[b][1]}
          stroke={i % 2 ? TURQUOISE : EMERALD}
          strokeWidth="1.2"
        />
      ))}
      {NET_NODES.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 5 : 3.5} fill={i % 2 ? LIME : EMERALD} />
      ))}
    </svg>
  );
}

/* An abstract rising trend line over a faint baseline grid. */
function TrendMotif() {
  const pts: [number, number][] = [[10, 210], [52, 182], [86, 196], [124, 140], [160, 152], [196, 92], [230, 60]];
  return (
    <svg viewBox="0 0 240 240" className="w-full h-full" aria-hidden>
      <g stroke={EMERALD} strokeWidth="0.8">
        {[60, 110, 160, 210].map((y) => (
          <line key={y} x1="0" x2="240" y1={y} y2={y} strokeDasharray="3 6" />
        ))}
      </g>
      {[[20, 40], [62, 70], [104, 52], [146, 96], [188, 128]].map(([x, h], i) => (
        <rect key={i} x={x} y={220 - h} width="18" height={h} rx="3" fill={i % 2 ? TURQUOISE : LIME} opacity="0.7" />
      ))}
      <polyline
        points={pts.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke={EMERALD}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill={i === pts.length - 1 ? LIME : EMERALD} />
      ))}
    </svg>
  );
}

/* A patch of dots on an isometric (offset-row) grid. */
function DotGrid({ cols = 6, rows = 8, color = EMERALD }: { cols?: number; rows?: number; color?: string }) {
  const gap = 16;
  const w = cols * gap;
  const h = rows * (gap * 0.866);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <circle key={`${r}-${c}`} cx={c * gap + (r % 2 ? gap / 2 : 0) + 4} cy={r * gap * 0.866 + 4} r="1.6" fill={color} />
        ))
      )}
    </svg>
  );
}

/* Outline shapes (stroke-only, same 2.4–2.6 weight on a 100-unit box). */
function IsoCube({ size, color = EMERALD }: { size: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <g fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round">
        <path d="M50 8 L88 30 L88 72 L50 94 L12 72 L12 30 Z" />
        <path d="M12 30 L50 52 L88 30 M50 52 L50 94" />
      </g>
    </svg>
  );
}
function CubeCluster({ size }: { size: number }) {
  // Three stacked isometric cube outlines
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden>
      <g fill="none" strokeWidth="2.4" strokeLinejoin="round">
        <g stroke={EMERALD} transform="translate(30 4) scale(0.6)">
          <path d="M50 8 L88 30 L88 72 L50 94 L12 72 L12 30 Z" />
          <path d="M12 30 L50 52 L88 30 M50 52 L50 94" />
        </g>
        <g stroke={TURQUOISE} transform="translate(7 40) scale(0.6)">
          <path d="M50 8 L88 30 L88 72 L50 94 L12 72 L12 30 Z" />
          <path d="M12 30 L50 52 L88 30 M50 52 L50 94" />
        </g>
        <g stroke={LIME} transform="translate(53 40) scale(0.6)">
          <path d="M50 8 L88 30 L88 72 L50 94 L12 72 L12 30 Z" />
          <path d="M12 30 L50 52 L88 30 M50 52 L50 94" />
        </g>
      </g>
    </svg>
  );
}
function WireframePrism({ size }: { size: number }) {
  // Abstract 3D polygon: triangular prism with hidden edges dashed
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <g fill="none" stroke={TURQUOISE} strokeWidth="2.4" strokeLinejoin="round">
        <path d="M20 30 L50 12 L80 30 L80 74 L50 92 L20 74 Z" />
        <path d="M50 12 L50 56 M20 30 L50 56 L80 30" />
        <path d="M20 74 L50 56 L80 74" strokeDasharray="4 5" />
      </g>
    </svg>
  );
}
function Diamond({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <g fill="none" stroke={TURQUOISE} strokeWidth="2.6" strokeLinejoin="round">
        <path d="M50 6 L94 50 L50 94 L6 50 Z" />
        <path d="M50 28 L72 50 L50 72 L28 50 Z" />
      </g>
    </svg>
  );
}
function Ring({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <g fill="none" stroke={LIME} strokeWidth="2.6">
        <circle cx="50" cy="50" r="42" />
        <circle cx="50" cy="50" r="26" strokeDasharray="4 7" />
      </g>
    </svg>
  );
}
function Hexagon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <path d="M28 10 H72 L94 50 L72 90 H28 L6 50 Z" fill="none" stroke={EMERALD} strokeWidth="2.6" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Layouts ─────────────────────────────────────────────────── */

type Motion = "drift" | "spin" | "breathe";
interface Piece {
  /** Tailwind position/visibility classes, e.g. "left-[3%] top-[14%] hidden md:block" */
  at: string;
  /** Opacity, kept in the same 8–12% band across every section */
  o: number;
  el: React.ReactNode;
  motion?: Motion;
  dur?: string;
  delay?: string;
}
interface Layout {
  /** CSS mask(s); multiple masks are intersected so every listed area stays clear */
  mask: string[];
  grid: number;
  far: Piece[];
  near: Piece[];
}

const LAYOUTS: Record<"hero" | "features" | "ecosystem", Layout> = {
  hero: {
    mask: ["radial-gradient(ellipse 34% 62% at 50% 40%, transparent 0%, transparent 55%, black 92%)"],
    grid: 0.08,
    far: [
      { at: "left-[3%] top-[14%] w-[200px] h-[280px] hidden md:block", o: 0.12, el: <NetworkCluster /> },
      { at: "right-[3%] top-[30%] w-[240px] h-[240px] hidden md:block", o: 0.11, el: <TrendMotif /> },
    ],
    near: [
      { at: "left-[13%] top-[60%]", o: 0.12, el: <IsoCube size={92} />, motion: "drift", dur: "22s" },
      { at: "right-[16%] top-[12%]", o: 0.11, el: <Diamond size={70} />, motion: "drift", dur: "26s", delay: "-6s" },
      { at: "left-[24%] top-[8%]", o: 0.1, el: <Ring size={58} />, motion: "drift", dur: "24s", delay: "-12s" },
      { at: "right-[9%] top-[68%]", o: 0.11, el: <Hexagon size={64} />, motion: "drift", dur: "20s", delay: "-3s" },
    ],
  },
  // "Everything you need" — heading band + outer edges; the solid cards cover the centre
  features: {
    mask: ["radial-gradient(ellipse 30% 15% at 50% 13%, transparent 0%, transparent 62%, black 100%)"],
    grid: 0.08,
    far: [
      { at: "left-[1.5%] top-[28%] hidden xl:block", o: 0.1, el: <DotGrid cols={4} rows={12} /> },
      { at: "right-[1.5%] top-[46%] hidden xl:block", o: 0.1, el: <DotGrid cols={4} rows={12} color={TURQUOISE} /> },
      { at: "left-[-2%] top-[58%] w-[190px] h-[266px] hidden xl:block", o: 0.11, el: <NetworkCluster /> },
      { at: "right-[-1%] top-[18%] w-[170px] h-[238px] hidden xl:block", o: 0.11, el: <NetworkCluster mirrored /> },
    ],
    near: [
      { at: "left-[9%] top-[4%] hidden md:block", o: 0.12, el: <IsoCube size={84} />, motion: "drift", dur: "22s" },
      { at: "left-[19%] top-[12%] hidden lg:block", o: 0.1, el: <Ring size={46} />, motion: "breathe", dur: "11s", delay: "-4s" },
      { at: "right-[10%] top-[5%] hidden md:block", o: 0.11, el: <WireframePrism size={76} />, motion: "spin", dur: "90s" },
      { at: "right-[20%] top-[13%] hidden lg:block", o: 0.1, el: <Diamond size={42} />, motion: "drift", dur: "26s", delay: "-8s" },
      { at: "left-[3%] bottom-[5%] hidden md:block", o: 0.11, el: <CubeCluster size={96} />, motion: "drift", dur: "24s", delay: "-10s" },
      { at: "right-[4%] bottom-[7%] hidden md:block", o: 0.11, el: <Hexagon size={58} />, motion: "drift", dur: "20s", delay: "-3s" },
    ],
  },
  // "See your money clearly" — outer edges; heading and footnote kept clear
  ecosystem: {
    mask: [
      "radial-gradient(ellipse 30% 15% at 50% 15%, transparent 0%, transparent 62%, black 100%)",
      "radial-gradient(ellipse 32% 9% at 50% 93%, transparent 0%, transparent 60%, black 100%)",
    ],
    grid: 0.08,
    far: [
      { at: "left-[1%] top-[34%] w-[200px] h-[280px] hidden xl:block", o: 0.12, el: <NetworkCluster /> },
      { at: "right-[1%] top-[50%] w-[220px] h-[220px] hidden xl:block", o: 0.11, el: <TrendMotif /> },
      { at: "right-[2.5%] top-[24%] hidden xl:block", o: 0.1, el: <DotGrid cols={4} rows={9} color={TURQUOISE} /> },
      { at: "left-[3%] bottom-[16%] hidden xl:block", o: 0.1, el: <DotGrid cols={5} rows={6} /> },
    ],
    near: [
      { at: "left-[10%] top-[6%] hidden md:block", o: 0.11, el: <Ring size={56} />, motion: "drift", dur: "24s", delay: "-12s" },
      { at: "right-[11%] top-[5%] hidden md:block", o: 0.12, el: <IsoCube size={80} />, motion: "spin", dur: "120s" },
      { at: "left-[5%] bottom-[5%] hidden md:block", o: 0.11, el: <CubeCluster size={92} />, motion: "drift", dur: "22s", delay: "-5s" },
      { at: "right-[6%] bottom-[7%] hidden md:block", o: 0.11, el: <WireframePrism size={66} />, motion: "drift", dur: "26s", delay: "-9s" },
    ],
  },
};

const MOTION_CLASS: Record<Motion, string> = {
  drift: "geo-drift",
  spin: "geo-spin",
  breathe: "geo-breathe",
};

function PieceView({ p }: { p: Piece }) {
  // Opacity/position on the outer box; animation on the inner one so keyframes
  // never override either.
  return (
    <div className={`absolute ${p.at}`} style={{ opacity: p.o }}>
      <div
        className={p.motion ? MOTION_CLASS[p.motion] : undefined}
        style={{ "--dur": p.dur, "--delay": p.delay } as React.CSSProperties}
      >
        {p.el}
      </div>
    </div>
  );
}

/** Pointer parallax shared by all layouts: far layer barely moves, near a little more. */
function useParallax() {
  const pointer = usePointerEffects();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 });
  const sy = useSpring(my, { stiffness: 40, damping: 20 });
  const farX = useTransform(sx, [-0.5, 0.5], [-6, 6]);
  const farY = useTransform(sy, [-0.5, 0.5], [-4, 4]);
  const nearX = useTransform(sx, [-0.5, 0.5], [-16, 16]);
  const nearY = useTransform(sy, [-0.5, 0.5], [-10, 10]);

  useEffect(() => {
    if (!pointer) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [pointer, mx, my]);

  return {
    far: pointer ? { x: farX, y: farY } : undefined,
    near: pointer ? { x: nearX, y: nearY } : undefined,
  };
}

export function GeoBackdrop({ variant }: { variant: keyof typeof LAYOUTS }) {
  const layout = LAYOUTS[variant];
  const { far, near } = useParallax();
  const mask = layout.mask.join(", ");
  const composite = layout.mask.length > 1 ? layout.mask.map(() => "intersect").join(", ") : undefined;

  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{
        maskImage: mask,
        WebkitMaskImage: mask,
        maskComposite: composite,
        WebkitMaskComposite: composite ? layout.mask.map(() => "source-in").join(", ") : undefined,
      } as React.CSSProperties}
    >
      {/* Far layer: architectural iso grid + data motifs */}
      <motion.div style={far} className="absolute -inset-8">
        <div className="absolute inset-0" style={{ opacity: layout.grid }}>
          <IsoGrid />
        </div>
        {layout.far.map((p, i) => <PieceView key={i} p={p} />)}
      </motion.div>

      {/* Near layer: a few slow-moving outline shapes */}
      <motion.div style={near} className="absolute inset-0 hidden sm:block">
        {layout.near.map((p, i) => <PieceView key={i} p={p} />)}
      </motion.div>
    </div>
  );
}

/** Kept for the hero's existing import. */
export const HeroBackdrop = () => <GeoBackdrop variant="hero" />;

/* ── Ecosystem emblem halo ───────────────────────────────────── */

/**
 * Sits exactly in the band between the two card rows (240px: hub + my-10), so it
 * never overlaps the cards. Orbits + connectors radiate from the CLIQ AI emblem
 * toward each card column; the solid emblem stays the focal point.
 */
export function EmblemHalo() {
  const W = 900;
  const H = 240;
  const cx = W / 2;
  const cy = H / 2;
  const cols = [W / 6, W / 2, (5 * W) / 6];
  return (
    <div
      aria-hidden
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 pointer-events-none hidden sm:block"
      style={{ width: W, height: H, opacity: 0.1 }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <g fill="none" strokeWidth="1.2">
          {/* connectors from the emblem toward each card in both rows */}
          {cols.map((x, i) => (
            <g key={i} stroke={i === 1 ? EMERALD : TURQUOISE}>
              <path d={`M${cx} ${cy} L${x} 6`} strokeDasharray={i === 1 ? undefined : "2 6"} />
              <path d={`M${cx} ${cy} L${x} ${H - 6}`} strokeDasharray={i === 1 ? undefined : "2 6"} />
            </g>
          ))}
          {/* horizontal data rail */}
          <path d={`M40 ${cy} H${cx - 120} M${cx + 120} ${cy} H${W - 40}`} stroke={EMERALD} />
          {/* orbits */}
          <circle cx={cx} cy={cy} r="112" stroke={LIME} strokeDasharray="1 7" strokeLinecap="round" strokeWidth="2.2" />
          <ellipse cx={cx} cy={cy} rx="210" ry="104" stroke={EMERALD} strokeDasharray="5 9" />
        </g>
        {/* rail + connector nodes */}
        {[40, 150, 240, W - 240, W - 150, W - 40].map((x, i) => (
          <circle key={i} cx={x} cy={cy} r={i % 2 ? 3.5 : 5} fill={i % 2 ? LIME : EMERALD} />
        ))}
        {cols.map((x, i) => (
          <g key={i} fill={i === 1 ? EMERALD : TURQUOISE}>
            <circle cx={x} cy={6} r="3.5" />
            <circle cx={x} cy={H - 6} r="3.5" />
          </g>
        ))}
        {/* small iso cubes riding the rail */}
        <g fill="none" strokeWidth="2" strokeLinejoin="round">
          <g stroke={EMERALD} transform={`translate(${cx - 290} ${cy - 62}) scale(0.42)`}>
            <path d="M50 8 L88 30 L88 72 L50 94 L12 72 L12 30 Z" />
            <path d="M12 30 L50 52 L88 30 M50 52 L50 94" />
          </g>
          <g stroke={TURQUOISE} transform={`translate(${cx + 250} ${cy + 18}) scale(0.42)`}>
            <path d="M50 8 L88 30 L88 72 L50 94 L12 72 L12 30 Z" />
            <path d="M12 30 L50 52 L88 30 M50 52 L50 94" />
          </g>
        </g>
      </svg>
      {/* slowly turning dotted orbit (reads as gentle rotation around the emblem) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="geo-spin" style={{ "--dur": "120s" } as React.CSSProperties}>
          <svg width="268" height="268" viewBox="0 0 268 268" className="block">
            <circle cx="134" cy="134" r="130" fill="none" stroke={TURQUOISE} strokeWidth="2" strokeDasharray="14 18" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
