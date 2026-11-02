"use client";

import { useEffect } from "react";
import { usePointerEffects } from "@/lib/motion";

/** Magnetic pull applies only to compact buttons — not full-width form submits. */
const MAGNETIC_MAX_WIDTH = 320;
const MAGNETIC_STRENGTH = 0.22;
const MAGNETIC_MAX_PX = 6;

/**
 * One delegated pointer listener for the whole app:
 *  - [data-spotlight] elements get --mx / --my for the cursor-following spotlight
 *  - .btn-fx buttons get --tx / --ty for a magnetic pull
 * Mounted once in the root layout; inert on touch devices and with reduced motion.
 */
export function InteractionLayer() {
  const enabled = usePointerEffects();

  useEffect(() => {
    if (!enabled) return;

    let frame = 0;
    let lastEvent: PointerEvent | null = null;
    let magnet: HTMLElement | null = null;

    const releaseMagnet = () => {
      if (!magnet) return;
      magnet.style.setProperty("--tx", "0px");
      magnet.style.setProperty("--ty", "0px");
      magnet = null;
    };

    const apply = () => {
      frame = 0;
      const e = lastEvent;
      if (!e || !(e.target instanceof Element)) return;

      const spot = e.target.closest<HTMLElement>("[data-spotlight]");
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty("--mx", `${e.clientX - r.left}px`);
        spot.style.setProperty("--my", `${e.clientY - r.top}px`);
      }

      const btn = e.target.closest<HTMLElement>(".btn-fx");
      if (btn !== magnet) releaseMagnet();
      if (btn && !btn.matches(":disabled")) {
        const r = btn.getBoundingClientRect();
        if (r.width <= MAGNETIC_MAX_WIDTH) {
          const clamp = (v: number) => Math.max(-MAGNETIC_MAX_PX, Math.min(MAGNETIC_MAX_PX, v));
          btn.style.setProperty("--tx", `${clamp((e.clientX - r.left - r.width / 2) * MAGNETIC_STRENGTH)}px`);
          btn.style.setProperty("--ty", `${clamp((e.clientY - r.top - r.height / 2) * MAGNETIC_STRENGTH)}px`);
          magnet = btn;
        }
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      lastEvent = e;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", releaseMagnet);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", releaseMagnet);
      if (frame) cancelAnimationFrame(frame);
      releaseMagnet();
    };
  }, [enabled]);

  return null;
}
