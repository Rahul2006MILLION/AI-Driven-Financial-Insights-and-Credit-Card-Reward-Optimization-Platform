"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { motion } from "framer-motion";
import { CreditCard } from "@/lib/api";
import { DigitalCreditCard } from "@/components/DigitalCreditCard";
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
} from "lucide-react";

interface CardFanCollectionProps {
  cards: CreditCard[];
  selectedCard: CreditCard | null;
  onSelectCard: (card: CreditCard) => void;
  className?: string;
}

interface StackMetric {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  zIndex: number;
  opacity: number;
  pointerEvents: "auto" | "none";
}

export function CardFanCollection({
  cards,
  selectedCard,
  onSelectCard,
  className = "",
}: CardFanCollectionProps) {
  const { t } = useLanguage();
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const totalCards = cards.length;
  const selectedIndex = cards.findIndex((c) => c.id === selectedCard?.id);
  const currentIndex = selectedIndex >= 0 ? selectedIndex : 0;

  // Responsive breakpoint tracking for layout metrics
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Synchronize selection if none selected on load
  useEffect(() => {
    if (!selectedCard && cards.length > 0) {
      onSelectCard(cards[0]);
    }
  }, [cards, selectedCard, onSelectCard]);

  // Keyboard navigation for accessible interaction (ArrowLeft, ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (cards.length <= 1) return;
      if (e.key === "ArrowRight") {
        const nextIndex = (currentIndex + 1) % cards.length;
        onSelectCard(cards[nextIndex]);
      } else if (e.key === "ArrowLeft") {
        const prevIndex = (currentIndex - 1 + cards.length) % cards.length;
        onSelectCard(cards[prevIndex]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cards, currentIndex, onSelectCard]);

  // Step to previous card
  const handlePrevCard = () => {
    if (cards.length <= 1) return;
    const prevIndex = (currentIndex - 1 + cards.length) % cards.length;
    onSelectCard(cards[prevIndex]);
  };

  // Step to next card
  const handleNextCard = () => {
    if (cards.length <= 1) return;
    const nextIndex = (currentIndex + 1) % cards.length;
    onSelectCard(cards[nextIndex]);
  };

  /**
   * Calculate deterministic stack positions.
   * Uses shortest circular distance when totalCards >= 3 to ensure continuous,
   * smooth transitions without asymmetrical cliffs.
   */
  const getCardMetrics = (cardIndex: number): StackMetric => {
    if (totalCards <= 1) {
      const isHovered = hoveredCardId === cards[cardIndex]?.id;
      return {
        x: 0,
        y: isHovered ? -16 : 0,
        rotate: 0,
        scale: isHovered ? 1.04 : 1.0,
        zIndex: 50,
        opacity: 1,
        pointerEvents: "auto",
      };
    }

    let d: number;
    if (totalCards === 2) {
      // 2-card portfolio: active is center, other card is offset right
      d = cardIndex === currentIndex ? 0 : 1;
    } else {
      // Circular shortest distance around current active card
      let rawDiff = cardIndex - currentIndex;
      if (rawDiff > totalCards / 2) rawDiff -= totalCards;
      else if (rawDiff < -totalCards / 2) rawDiff += totalCards;
      d = rawDiff;
    }

    const isHovered = hoveredCardId === cards[cardIndex]?.id;

    // Active Card (Front & Center)
    if (d === 0) {
      return {
        x: 0,
        y: isHovered ? -20 : -10,
        rotate: 0,
        scale: isHovered ? 1.05 : 1.02,
        zIndex: 50,
        opacity: 1,
        pointerEvents: "auto",
      };
    }

    // Previous Card (Offset Left, ~ -12° rotation)
    if (d === -1) {
      return {
        x: isMobile ? -48 : -72,
        y: isHovered ? -2 : 12,
        rotate: isHovered ? -6 : -12,
        scale: isHovered ? 0.98 : 0.94,
        zIndex: isHovered ? 48 : 40,
        opacity: 0.88,
        pointerEvents: "auto",
      };
    }

    // Next Card (Offset Right, ~ +12° rotation)
    if (d === 1) {
      return {
        x: isMobile ? 48 : 72,
        y: isHovered ? -2 : 12,
        rotate: isHovered ? 6 : 12,
        scale: isHovered ? 0.98 : 0.94,
        zIndex: isHovered ? 48 : 40,
        opacity: 0.88,
        pointerEvents: "auto",
      };
    }

    // 2nd Previous Card (Further Left, ~ -18° rotation)
    if (d === -2) {
      return {
        x: isMobile ? -84 : -130,
        y: isHovered ? 14 : 26,
        rotate: isHovered ? -12 : -18,
        scale: isHovered ? 0.92 : 0.88,
        zIndex: isHovered ? 38 : 30,
        opacity: 0.65,
        pointerEvents: "auto",
      };
    }

    // 2nd Next Card (Further Right, ~ +18° rotation)
    if (d === 2) {
      return {
        x: isMobile ? 84 : 130,
        y: isHovered ? 14 : 26,
        rotate: isHovered ? 12 : 18,
        scale: isHovered ? 0.92 : 0.88,
        zIndex: isHovered ? 38 : 30,
        opacity: 0.65,
        pointerEvents: "auto",
      };
    }

    // Background Wing Cards (|d| >= 3) for portfolios with 6+ cards
    const sign = d < 0 ? -1 : 1;
    return {
      x: sign * (isMobile ? 105 : 155),
      y: 38,
      rotate: sign * 20,
      scale: 0.82,
      zIndex: Math.max(10, 20 - Math.abs(d)),
      opacity: 0,
      pointerEvents: "none",
    };
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hand / Stack Status Bar */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Layers className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <span>{t.cards.stackShowcase}</span>
              <Sparkles className="w-3 h-3 text-emerald-400" />
            </h3>
            <p className="text-[10px] text-slate-400">
              {t.cards.stackHint}
            </p>
          </div>
        </div>

        {/* Counter and Stepper */}
        {totalCards > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevCard}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-colors"
              title={t.cards.prevCardHint}
              aria-label={t.cards.prevCard}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-semibold text-slate-300 min-w-[55px] text-center">
              {currentIndex + 1} of {totalCards}
            </span>
            <button
              type="button"
              onClick={handleNextCard}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-colors"
              title={t.cards.nextCardHint}
              aria-label={t.cards.nextCard}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Interactive Card Stack Stage Area */}
      <div className="relative w-full h-[320px] sm:h-[360px] md:h-[380px] flex items-center justify-center overflow-hidden rounded-2xl select-none py-4">
        {/* Subtle Ambient Background Lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Left Floating Step Button (Desktop) */}
        {totalCards > 1 && (
          <button
            type="button"
            onClick={handlePrevCard}
            className="absolute left-2 z-50 p-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-slate-300 hover:text-emerald-400 backdrop-blur-md transition-all hidden sm:flex items-center justify-center shadow-lg hover:scale-110"
            title={t.cards.prevCard}
            aria-label={t.cards.prevCard}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Relative Positioning Container for Overlapping Stack */}
        <div className="relative w-full max-w-[500px] h-[220px] sm:h-[240px] flex items-center justify-center">
          {cards.map((card, idx) => {
            const isHovered = hoveredCardId === card.id;
            const isSelected = selectedCard?.id === card.id;
            const metrics = getCardMetrics(idx);

            return (
              <motion.div
                key={card.id}
                onMouseEnter={() => setHoveredCardId(card.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                onClick={() => onSelectCard(card)}
                animate={{
                  x: metrics.x,
                  y: metrics.y,
                  rotate: metrics.rotate,
                  scale: metrics.scale,
                  zIndex: metrics.zIndex,
                  opacity: metrics.opacity,
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 24,
                  mass: 0.8,
                }}
                style={{
                  position: "absolute",
                  transformOrigin: "bottom center",
                  pointerEvents: metrics.pointerEvents,
                }}
                className="w-[250px] xs:w-[270px] sm:w-[310px] cursor-pointer drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)]"
              >
                {/* Active Selection Glow Ring */}
                {isSelected && (
                  <motion.div
                    layoutId="activeCardGlow"
                    className="absolute -inset-1.5 rounded-[22px] bg-gradient-to-r from-emerald-500/40 via-teal-400/30 to-emerald-400/40 blur-md pointer-events-none"
                    transition={{ duration: 0.25 }}
                  />
                )}

                <div
                  className={`transition-all duration-300 ${
                    !isSelected && !isHovered ? "brightness-95 contrast-[0.98]" : "brightness-100"
                  }`}
                >
                  <DigitalCreditCard
                    bankName={card.bank_name}
                    cardName={card.card_name}
                    cardVariant={card.card_variant}
                    cardholderName={card.cardholder_name}
                    nickname={card.nickname}
                    lastFourDigits={card.last_four_digits}
                    network={card.network}
                    disableInternalTilt
                    glowShadow={isHovered || isSelected}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right Floating Step Button (Desktop) */}
        {totalCards > 1 && (
          <button
            type="button"
            onClick={handleNextCard}
            className="absolute right-2 z-50 p-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-slate-300 hover:text-emerald-400 backdrop-blur-md transition-all hidden sm:flex items-center justify-center shadow-lg hover:scale-110"
            title={t.cards.nextCard}
            aria-label={t.cards.nextCard}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Card Selector Pills for Touch & Quick Switch */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        {cards.map((c) => {
          const isCurrent = selectedCard?.id === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectCard(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                isCurrent
                  ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-400 shadow-[0_0_15px_rgba(76,192,63,0.25)]"
                  : "bg-white/[0.03] border-white/10 hover:border-emerald-500/30 text-slate-400 hover:text-white"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span className="truncate max-w-[120px]">{c.card_name}</span>
              {c.last_four_digits && (
                <span className="font-mono text-[10px] opacity-75">
                  ••{c.last_four_digits}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
