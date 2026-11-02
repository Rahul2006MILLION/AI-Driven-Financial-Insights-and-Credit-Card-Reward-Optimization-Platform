"use client";

import React from "react";
import { MotionConfig } from "framer-motion";
import { InteractionLayer } from "./InteractionLayer";

/** App-wide motion defaults: honour prefers-reduced-motion and mount the pointer layer. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <InteractionLayer />
      {children}
    </MotionConfig>
  );
}
