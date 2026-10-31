"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard } from "@/lib/api";
import { DigitalCreditCard } from "@/components/DigitalCreditCard";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface CardFanCollectionProps {
  cards: CreditCard[];
  selectedCard: CreditCard | null;
  onSelectCard: (card: CreditCard) => void;
  className?: string;
}

export function CardFanCollection({
  cards,
  selectedCard,
  onSelectCard,
  className = "",
}: CardFanCollectionProps) {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);

  // Maximum visible cards in one fan hand
  const MAX_VISIBLE = 5;
  const totalCards = cards.length;

  // Window of cards to display in fan
  const visibleCards = totalCards <= MAX_VISIBLE
    ? cards
    : cards.slice(pageIndex * MAX_VISIBLE, (pageIndex + 1) * MAX_VISIBLE);

  // Keep page index valid if cards count changes
  useEffect(() => {
    if (pageIndex * MAX_VISIBLE >= totalCards && totalCards > 0) {
      setPageIndex(0);
    }
  }, [totalCards, pageIndex]);

  // Synchronize selection if none selected
  useEffect(() => {
    if (!selectedCard && cards.length > 0) {
      onSelectCard(cards[0]);
    }
  }, [cards, selectedCard, onSelectCard]);

  // Keyboard navigation for accessible interaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (cards.length <= 1) return;
      const currentIndex = cards.findIndex((c) => c.id === selectedCard?.id);
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
  }, [cards, selectedCard, onSelectCard]);

  // Calculate fan position metrics for an index in visibleCards
  const getFanMetrics = (index: number, count: number) => {
    if (count === 1) {
      return { rotate: 0, x: 0, y: 0, z: 20 };
    }

    const mid = (count - 1) / 2;
    const diff = index - mid;

    switch (count) {
      case 2:
        return {
          rotate: diff * 12, // -6deg, +6deg
          x: diff * 120,    // -60px, +60px
          y: Math.abs(diff) * 14,
          z: 20 + index,
        };
      case 3:
        return {
          rotate: diff * 13, // -13deg, 0deg, +13deg
          x: diff * 130,    // -130px, 0px, +130px
          y: Math.abs(diff) * 18,
          z: 20 + index,
        };
      case 4:
        return {
          rotate: diff * 10.5, // -15.75, -5.25, +5.25, +15.75
          x: diff * 105,     // -157px, -52px, +52px, +157px
          y: Math.abs(diff) * 14,
          z: 20 + index,
        };
      case 5:
      default:
        return {
          rotate: diff * 9,   // -18deg, -9deg, 0deg, +9deg, +18deg
          x: diff * 95,      // -190px, -95px, 0px, +95px, +190px
          y: Math.abs(diff) * 14,
          z: 20 + index,
        };
    }
  };

  const handleNextBatch = () => {
    if ((pageIndex + 1) * MAX_VISIBLE < totalCards) {
      setPageIndex(pageIndex + 1);
      const nextCard = cards[(pageIndex + 1) * MAX_VISIBLE];
      if (nextCard) onSelectCard(nextCard);
    }
  };

  const handlePrevBatch = () => {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
      const prevCard = cards[(pageIndex - 1) * MAX_VISIBLE];
      if (prevCard) onSelectCard(prevCard);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hand Status Bar */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-cliq-cyan/10 border border-cliq-cyan/20 text-cliq-cyan">
            <Layers className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Interactive Card Hand
            </h3>
            <p className="text-[10px] text-cliq-textSecondary">
              Hover or tap to pull card forward • Arrow keys to switch
            </p>
          </div>
        </div>

        {/* Multi-page controls if user owns more than 5 cards */}
        {totalCards > MAX_VISIBLE && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pageIndex === 0}
              onClick={handlePrevBatch}
              className="p-1.5 rounded-lg bg-cliq-surface hover:bg-cliq-surfaceHover border border-cliq-border text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous Cards"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-semibold text-cliq-textSecondary">
              {pageIndex * MAX_VISIBLE + 1}–{Math.min((pageIndex + 1) * MAX_VISIBLE, totalCards)} of {totalCards}
            </span>
            <button
              type="button"
              disabled={(pageIndex + 1) * MAX_VISIBLE >= totalCards}
              onClick={handleNextBatch}
              className="p-1.5 rounded-lg bg-cliq-surface hover:bg-cliq-surfaceHover border border-cliq-border text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next Cards"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Fan Stage Area */}
      <div className="relative w-full h-[320px] sm:h-[360px] flex items-center justify-center overflow-visible select-none py-6">
        <div className="relative w-full max-w-[560px] h-[220px] sm:h-[240px] flex items-center justify-center">
          {visibleCards.map((card, idx) => {
            const isHovered = hoveredCardId === card.id;
            const isSelected = selectedCard?.id === card.id;
            const anyHovered = hoveredCardId !== null;

            const base = getFanMetrics(idx, visibleCards.length);

            // Responsive scale factor for mobile screens
            // On desktop, card width ~320px, on mobile ~260px
            return (
              <motion.div
                key={card.id}
                onMouseEnter={() => {
                  setHoveredCardId(card.id);
                  onSelectCard(card);
                }}
                onMouseLeave={() => setHoveredCardId(null)}
                onClick={() => onSelectCard(card)}
                animate={{
                  x: isHovered ? base.x * 0.9 : base.x,
                  y: isHovered
                    ? -42
                    : isSelected && !anyHovered
                    ? -18
                    : base.y,
                  rotate: isHovered
                    ? 0
                    : isSelected && !anyHovered
                    ? base.rotate * 0.35
                    : base.rotate,
                  scale: isHovered
                    ? 1.07
                    : anyHovered
                    ? 0.94
                    : isSelected
                    ? 1.03
                    : 1,
                  zIndex: isHovered ? 60 : isSelected ? 45 : base.z,
                  opacity: anyHovered && !isHovered ? 0.65 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 24,
                }}
                style={{
                  position: "absolute",
                  transformOrigin: "bottom center",
                }}
                className="w-[280px] sm:w-[330px] cursor-pointer drop-shadow-2xl"
              >
                {/* Active Selection Glow Ring */}
                {isSelected && (
                  <motion.div
                    layoutId="activeGlowRing"
                    className="absolute -inset-1 rounded-[22px] bg-gradient-to-r from-emerald-500/40 via-teal-400/30 to-emerald-400/40 blur-sm pointer-events-none"
                    transition={{ duration: 0.2 }}
                  />
                )}

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
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Card Selector Pills for Touch & Quick Switch */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        {cards.map((c, i) => {
          const isCurrent = selectedCard?.id === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectCard(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                isCurrent
                  ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
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

