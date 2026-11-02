"use client";

import React from "react";
import { motion, useMotionTemplate, useTransform } from "framer-motion";
import { usePointerTilt } from "@/lib/motion";
import { Wifi, Sparkles, ShieldCheck } from "lucide-react";
import { getThemeForBank } from "@/lib/cardCatalogue";

interface DigitalCreditCardProps {
  bankName: string;
  cardName: string;
  cardVariant?: string;
  cardholderName?: string;
  nickname?: string;
  lastFourDigits?: string;
  network?: "VISA" | "MASTERCARD" | "AMEX" | "RUPAY" | "DINERS" | string;
  isCompact?: boolean;
  className?: string;
  onClick?: () => void;
  showBack?: boolean;
  disableInternalTilt?: boolean;
  glowShadow?: boolean;
}

export function DigitalCreditCard({
  bankName,
  cardName,
  cardVariant,
  cardholderName,
  nickname,
  lastFourDigits,
  network = "VISA",
  isCompact = false,
  className = "",
  onClick,
  disableInternalTilt = false,
  glowShadow = true,
}: DigitalCreditCardProps) {
  const theme = getThemeForBank(bankName || "custom");

  // Tilt + layered parallax run on motion values (no re-render per pointer move)
  // and are inert on touch devices / reduced motion via usePointerTilt.
  const tilt = usePointerTilt(10);
  const tiltActive = tilt.enabled && !isCompact && !disableInternalTilt;
  const glareOpacity = useTransform([tilt.px, tilt.py], ([x, y]: number[]) =>
    Math.min(0.28, (Math.abs(x) + Math.abs(y)) * 0.5)
  );
  const glare = useMotionTemplate`radial-gradient(circle at ${tilt.glareX} ${tilt.glareY}, rgba(255,255,255,${glareOpacity}) 0%, transparent 60%)`;
  // Depth layers: near content drifts with the pointer, background rings drift against it
  const nearX = useTransform(tilt.px, [-0.5, 0.5], [-5, 5]);
  const nearY = useTransform(tilt.py, [-0.5, 0.5], [-4, 4]);
  const midX = useTransform(tilt.px, [-0.5, 0.5], [-2.5, 2.5]);
  const midY = useTransform(tilt.py, [-0.5, 0.5], [-2, 2]);
  const farX = useTransform(tilt.px, [-0.5, 0.5], [7, -7]);
  const farY = useTransform(tilt.py, [-0.5, 0.5], [6, -6]);
  const near = tiltActive ? { x: nearX, y: nearY } : undefined;
  const mid = tiltActive ? { x: midX, y: midY } : undefined;
  const far = tiltActive ? { x: farX, y: farY } : undefined;

  // Format masked digits
  const displayDigits = lastFourDigits && lastFourDigits.length === 4
    ? `••••  ••••  ••••  ${lastFourDigits}`
    : "••••  ••••  ••••  ••••";

  const displayName = (cardholderName || "CARDHOLDER NAME").trim().toUpperCase();

  // Network badge renderer
  const renderNetworkBadge = () => {
    const net = (network || "VISA").toUpperCase();
    switch (net) {
      case "MASTERCARD":
        return (
          <div className="flex items-center -space-x-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#EB001B] opacity-90 shadow-sm" />
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#F79E1B] opacity-90 shadow-sm" />
          </div>
        );
      case "AMEX":
        return (
          <div className="px-2 py-0.5 rounded bg-[#006FCF] text-white font-black text-[10px] tracking-tighter border border-white/20">
            AMEX
          </div>
        );
      case "RUPAY":
        return (
          <div className="flex items-center gap-0.5 font-black text-xs tracking-wider">
            <span className="text-[#097938]">Ru</span>
            <span className="text-[#F37021]">Pay</span>
            <div className="flex -space-x-1 ml-0.5">
              <span className="w-1.5 h-3 bg-[#097938] transform skew-x-12 inline-block rounded-xs" />
              <span className="w-1.5 h-3 bg-[#F37021] transform skew-x-12 inline-block rounded-xs" />
            </div>
          </div>
        );
      case "DINERS":
        return (
          <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded border border-white/20">
            <div className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[7px] font-black">
              D
            </div>
            <span className="text-[9px] font-bold tracking-widest text-white">DINERS</span>
          </div>
        );
      case "VISA":
      default:
        return (
          <span className="font-extrabold text-base sm:text-lg italic tracking-wider text-white drop-shadow-sm font-serif">
            VISA
          </span>
        );
    }
  };

  return (
    <div
      style={{ perspective: 1000 }}
      className={`w-full ${className}`}
      onClick={onClick}
    >
      <motion.div
        onPointerMove={tiltActive ? tilt.onPointerMove : undefined}
        onPointerLeave={tiltActive ? tilt.onPointerLeave : undefined}
        animate={{ scale: isCompact ? 1 : 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          rotateX: tiltActive ? tilt.rotateX : 0,
          rotateY: tiltActive ? tilt.rotateY : 0,
          transformStyle: "preserve-3d",
          boxShadow: glowShadow
            ? `0 20px 40px -15px ${theme.glowColor}, 0 0 1px 1px rgba(255,255,255,0.1) inset`
            : "0 10px 25px -5px rgba(0,0,0,0.5), 0 0 1px 1px rgba(255,255,255,0.1) inset",
        }}
        className={`relative w-full aspect-[1.586/1] rounded-2xl bg-gradient-to-br ${theme.gradient} border ${theme.borderColor} overflow-hidden cursor-pointer select-none transition-shadow duration-300 p-4 sm:p-6 flex flex-col justify-between`}
      >
        {/* Dynamic Light Sheen Glare */}
        {tiltActive && (
          <motion.div className="absolute inset-0 pointer-events-none" style={{ background: glare }} />
        )}

        {/* Subtle Geometric Background Watermark (far layer) */}
        <motion.div style={far} className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full border border-white/5 pointer-events-none" />
        <motion.div style={far} className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full border border-white/10 pointer-events-none" />

        {/* Card Header: Bank & Card Variant Badge */}
        <motion.div style={near} className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-extrabold tracking-wider uppercase text-white/95">
                {bankName || "ISSUING BANK"}
              </span>
              {nickname && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/15 text-white/90 font-medium">
                  {nickname}
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-xs font-semibold tracking-wide text-white/70">
              {cardName || "Credit Card"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {cardVariant && (
              <span className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-white/90 border border-white/20">
                {cardVariant}
              </span>
            )}
            <Wifi className="w-4 h-4 sm:w-5 sm:h-5 text-white/70 rotate-90" />
          </div>
        </motion.div>

        {/* EMV Chip & Contactless Sensor */}
        <motion.div style={mid} className="relative z-10 flex items-center gap-3 my-auto">
          {/* Realistic metallic EMV chip */}
          <div
            className={`w-10 h-7 sm:w-12 sm:h-9 rounded-md border flex flex-col justify-between p-1 shadow-inner relative overflow-hidden ${
              theme.chipColor === "gold"
                ? "bg-gradient-to-br from-[#FFE082] via-[#FFD54F] to-[#FFB300] border-[#FFA000]/60"
                : "bg-gradient-to-br from-[#E0E0E0] via-[#BDBDBD] to-[#9E9E9E] border-[#757575]/60"
            }`}
          >
            {/* Chip fine circuit paths */}
            <div className="w-full h-[1px] bg-black/20" />
            <div className="flex justify-between items-center h-full">
              <div className="w-[1px] h-full bg-black/20 ml-1" />
              <div className="w-2.5 h-2.5 rounded-sm border border-black/25" />
              <div className="w-[1px] h-full bg-black/20 mr-1" />
            </div>
            <div className="w-full h-[1px] bg-black/20" />
          </div>
        </motion.div>

        {/* Card Number (Masked Last-4) */}
        <motion.div style={mid} className="relative z-10 my-1">
          <div className="font-mono text-sm sm:text-lg lg:text-xl tracking-[0.18em] sm:tracking-[0.22em] text-white/95 drop-shadow font-semibold">
            {displayDigits}
          </div>
        </motion.div>

        {/* Card Footer: Cardholder Name, Expiry & Network Logo */}
        <motion.div style={near} className="relative z-10 flex items-end justify-between pt-1">
          <div className="space-y-0.5">
            <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-white/50 block font-semibold">
              CARDHOLDER
            </span>
            <div className="text-xs sm:text-sm font-bold tracking-wider text-white/95 uppercase drop-shadow-sm font-sans truncate max-w-[170px] sm:max-w-[240px]">
              {displayName}
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-right">
              <span className="text-[7px] sm:text-[8px] uppercase tracking-wider text-white/50 block font-semibold">
                VALID THRU
              </span>
              <span className="font-mono text-[11px] sm:text-xs text-white/90 font-medium">
                12/29
              </span>
            </div>

            <div className="flex items-center justify-end min-w-[50px] sm:min-w-[60px]">
              {renderNetworkBadge()}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

