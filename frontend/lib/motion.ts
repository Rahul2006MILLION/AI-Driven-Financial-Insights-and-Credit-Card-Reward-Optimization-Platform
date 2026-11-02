"use client";

/**
 * Shared motion tokens + hooks for CLIQ's hover/interaction system.
 * CSS mirrors these values as --ease-* / --dur-* custom properties in globals.css.
 */
import { useEffect, useState, useCallback, type PointerEvent } from "react";
import { useMotionValue, useSpring, useTransform, useReducedMotion, type MotionValue } from "framer-motion";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const SPRING = { type: "spring", stiffness: 420, damping: 34, mass: 0.7 } as const;
export const SPRING_SOFT = { type: "spring", stiffness: 240, damping: 24 } as const;

export const DURATION = { fast: 0.16, base: 0.24, slow: 0.42 } as const;

/** Spring-in popover used by dropdowns and menus. */
export const popoverMotion = {
  initial: { opacity: 0, scale: 0.96, y: -6 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, y: -4, transition: { duration: DURATION.fast, ease: EASE_OUT } },
  transition: SPRING,
} as const;

const FINE_POINTER = "(hover: hover) and (pointer: fine)";

/** True only on devices with a precise hovering pointer (mouse / trackpad). */
export function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(FINE_POINTER);
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return fine;
}

/** Pointer-driven effects run only with a fine pointer and motion allowed. */
export function usePointerEffects(): boolean {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  return fine && !reduce;
}

export interface PointerTilt {
  enabled: boolean;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  /** Normalised pointer position, -0.5 … 0.5 (springed) — for layered parallax. */
  px: MotionValue<number>;
  py: MotionValue<number>;
  /** Pointer position in % for glare gradients. */
  glareX: MotionValue<string>;
  glareY: MotionValue<string>;
  onPointerMove: (e: PointerEvent<HTMLElement>) => void;
  onPointerLeave: () => void;
}

/** 3D tilt driven by motion values (no React re-render per pointer move). */
export function usePointerTilt(maxDeg = 10): PointerTilt {
  const enabled = usePointerEffects();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const px = useSpring(x, { stiffness: 260, damping: 24 });
  const py = useSpring(y, { stiffness: 260, damping: 24 });
  const rotateX = useTransform(py, [-0.5, 0.5], [maxDeg, -maxDeg]);
  const rotateY = useTransform(px, [-0.5, 0.5], [-maxDeg, maxDeg]);
  const glareX = useTransform(px, (v) => `${(v + 0.5) * 100}%`);
  const glareY = useTransform(py, (v) => `${(v + 0.5) * 100}%`);

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (!enabled || e.pointerType !== "mouse") return;
      const r = e.currentTarget.getBoundingClientRect();
      x.set((e.clientX - r.left) / r.width - 0.5);
      y.set((e.clientY - r.top) / r.height - 0.5);
    },
    [enabled, x, y]
  );
  const onPointerLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return { enabled, rotateX, rotateY, px, py, glareX, glareY, onPointerMove, onPointerLeave };
}

/**
 * Eased count-up for progress rings and figures. Jumps straight to the
 * target under prefers-reduced-motion; cancels its frame loop on unmount.
 */
export function useCountUp(target: number | null, durationMs = 1100, delayMs = 250): number {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target == null) return;
    if (reduce) {
      setValue(target);
      return;
    }
    let frame = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => {
      frame = requestAnimationFrame(tick);
    }, delayMs);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [target, durationMs, delayMs, reduce]);

  return value;
}
