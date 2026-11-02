"use client";

import React from "react";
import { motion } from "framer-motion";

interface CLIQLogoProps {
  size?: number;
  wordmark?: boolean;
  variant?: "dark" | "light";
  animated?: boolean;
  className?: string;
}

/* ── CLIQ mark: a network diamond — 4 nodes connected through a central hub ── */
export function CLIQMark({
  size = 36,
  animated = false,
  variant = "dark",
}: Pick<CLIQLogoProps, "size" | "animated" | "variant">) {
  const lime  = "#a3e635";
  const em    = "#10B981";
  const track = variant === "dark" ? "rgba(163,230,53,0.12)" : "rgba(16,185,129,0.2)";

  const pulseProps = animated
    ? { animate: { scale: [1, 1.15, 1], opacity: [0.9, 1, 0.9] }, transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" as const } }
    : {};

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="CLIQ logo mark"
    >
      <defs>
        <linearGradient id="cliq-line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={lime} stopOpacity="0.9" />
          <stop offset="100%" stopColor={em}   stopOpacity="0.9" />
        </linearGradient>
        <filter id="cliq-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Orbital guide ring */}
      <circle cx="20" cy="20" r="14.5" stroke={track} strokeWidth="0.75" strokeDasharray="2 3.5" />

      {/* Connection lines */}
      <line x1="20" y1="20" x2="20" y2="6"  stroke="url(#cliq-line-grad)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="20" x2="34" y2="20" stroke="url(#cliq-line-grad)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="20" x2="20" y2="34" stroke="url(#cliq-line-grad)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="20" x2="6"  y2="20" stroke="url(#cliq-line-grad)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Satellite nodes */}
      <circle cx="20" cy="6"  r="3.2" fill={lime} filter="url(#cliq-glow)" />
      <circle cx="34" cy="20" r="3.2" fill={em}   />
      <circle cx="20" cy="34" r="3.2" fill={lime} />
      <circle cx="6"  cy="20" r="3.2" fill={em}   filter="url(#cliq-glow)" />

      {/* Central hub */}
      {animated ? (
        <motion.circle cx="20" cy="20" r="5.5" fill={lime} {...pulseProps} />
      ) : (
        <circle cx="20" cy="20" r="5.5" fill={lime} />
      )}
      {/* Inner ring for depth */}
      <circle cx="20" cy="20" r="2.5" fill="#040707" opacity="0.35" />
    </svg>
  );
}

/* ── Full logo: mark + wordmark ──────────────────────────────── */
export function CLIQLogo({
  size = 36,
  wordmark = true,
  variant = "dark",
  animated = false,
  className = "",
}: CLIQLogoProps) {
  const textColor = variant === "dark" ? "#FFFFFF" : "#0F1A14";

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <CLIQMark size={size} variant={variant} animated={animated} />
      {wordmark && (
        <span
          style={{
            color: textColor,
            fontSize: `${size * 0.58}px`,
            fontWeight: 900,
            letterSpacing: "0.08em",
            lineHeight: 1,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          CLIQ
        </span>
      )}
    </div>
  );
}

/* ── Icon-only variant for tight spaces ─────────────────────── */
export function CLIQIcon({ size = 24, animated = false }: { size?: number; animated?: boolean }) {
  return <CLIQMark size={size} animated={animated} />;
}
