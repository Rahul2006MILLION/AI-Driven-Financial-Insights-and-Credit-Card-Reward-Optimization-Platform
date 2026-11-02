"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { usePointerEffects } from "@/lib/motion";

/*
 * Decorative geometry for the light hero panel. Everything here is aria-hidden,
 * pointer-events-none and sits behind the hero content. A radial mask keeps the
 * headline / CTA / card-fan column on clean paper so text contrast is unchanged.
 */

// Brand hues, deepened slightly so they read on the light paper at ~8–10% opacity
const EMERALD = "#2E7C28";
const TURQUOISE = "#00A894";
const LIME = "#6E9612";

/** Clear centre column; pattern shows toward the edges only. */
const EDGE_MASK =
  "radial-gradient(ellipse 34% 62% at 50% 40%, transparent 0%, transparent 55%, black 92%)";

/* Isometric (triangular) lattice tile: vertical + ±30° lines. */
const ISO_W = 34.64;
const ISO_H = 40;

function IsoGrid() {
  return (
    <svg className="absolute inset-0 w-full h-full" aria-hidden>
      <defs>
        <pattern id="hero-iso" width={ISO_W} height={ISO_H} patternUnits="userSpaceOnUse">
          <g fill="none" strokeWidth="0.8">
            <path d={`M0 0V${ISO_H}M${ISO_W / 2} 0V${ISO_H}`} stroke={EMERALD} />
            <path d={`M0 0L${ISO_W} 20M0 20L${ISO_W} 40`} stroke={TURQUOISE} />
            <path d={`M0 20L${ISO_W} 0M0 40L${ISO_W} 20`} stroke={LIME} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hero-iso)" />
    </svg>
  );
}

/* Left: a small node network (connections between money domains). */
const NET_NODES: [number, number][] = [
  [28, 40], [96, 18], [150, 74], [70, 112], [126, 150], [40, 196], [168, 214], [104, 252],
];
const NET_EDGES: [number, number][] = [
  [0, 1], [1, 2], [0, 3], [3, 2], [3, 4], [2, 4], [3, 5], [4, 6], [5, 7], [4, 7], [6, 7],
];

function NetworkCluster() {
  return (
    <svg viewBox="0 0 200 280" className="w-full h-full" aria-hidden>
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

/* Right: an abstract rising trend line over a faint baseline grid. */
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

/* Outline shapes that drift very slowly. */
function IsoCube({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <g fill="none" stroke={EMERALD} strokeWidth="2.4" strokeLinejoin="round">
        <path d="M50 8 L88 30 L88 72 L50 94 L12 72 L12 30 Z" />
        <path d="M12 30 L50 52 L88 30 M50 52 L50 94" />
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

export function HeroBackdrop() {
  const pointer = usePointerEffects();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 });
  const sy = useSpring(my, { stiffness: 40, damping: 20 });
  // Two depth layers: far geometry barely moves, near shapes move a little more
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

  const far = pointer ? { x: farX, y: farY } : undefined;
  const near = pointer ? { x: nearX, y: nearY } : undefined;

  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ maskImage: EDGE_MASK, WebkitMaskImage: EDGE_MASK }}
    >
      {/* Far layer: architectural iso grid + data motifs */}
      <motion.div style={far} className="absolute -inset-8">
        <div className="absolute inset-0 opacity-[0.08]">
          <IsoGrid />
        </div>
        <div className="absolute left-[3%] top-[14%] w-[200px] h-[280px] opacity-[0.12] hidden md:block">
          <NetworkCluster />
        </div>
        <div className="absolute right-[3%] top-[30%] w-[240px] h-[240px] opacity-[0.11] hidden md:block">
          <TrendMotif />
        </div>
      </motion.div>

      {/* Near layer: a few slow-drifting outline shapes */}
      <motion.div style={near} className="absolute inset-0 hidden sm:block">
        <div className="geo-drift absolute left-[13%] top-[60%] opacity-[0.12]" style={{ "--dur": "22s" } as React.CSSProperties}>
          <IsoCube size={92} />
        </div>
        <div className="geo-drift absolute right-[16%] top-[12%] opacity-[0.11]" style={{ "--dur": "26s", "--delay": "-6s" } as React.CSSProperties}>
          <Diamond size={70} />
        </div>
        <div className="geo-drift absolute left-[24%] top-[8%] opacity-[0.10]" style={{ "--dur": "24s", "--delay": "-12s" } as React.CSSProperties}>
          <Ring size={58} />
        </div>
        <div className="geo-drift absolute right-[9%] top-[68%] opacity-[0.11]" style={{ "--dur": "20s", "--delay": "-3s" } as React.CSSProperties}>
          <Hexagon size={64} />
        </div>
      </motion.div>
    </div>
  );
}
