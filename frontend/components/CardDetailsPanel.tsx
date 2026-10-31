"use client";

import React from "react";
import Link from "next/link";
import { CreditCard } from "@/lib/api";
import {
  ShieldCheck,
  Zap,
  Award,
  Sparkles,
  Edit2,
  Trash2,
  ExternalLink,
  GitCompare,
  Plane,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lock,
} from "lucide-react";

interface CardDetailsPanelProps {
  card: CreditCard | null;
  onEdit: (card: CreditCard) => void;
  onDelete: (cardId: string) => void;
  deletingId?: string | null;
  className?: string;
}

export function CardDetailsPanel({
  card,
  onEdit,
  onDelete,
  deletingId,
  className = "",
}: CardDetailsPanelProps) {
  if (!card) {
    return (
      <div className={`p-6 rounded-3xl bg-white/[0.02] border border-dashed border-white/10 text-center flex flex-col items-center justify-center min-h-[420px] backdrop-blur-xl ${className}`}>
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
          <Sparkles className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-white">Select a Card</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Hover or tap any card in the collection to inspect multipliers, fee waivers, and verified benefits.
        </p>
      </div>
    );
  }

  const annualFeeNum = Number(card.annual_fee || 0);
  const joiningFeeNum = Number(card.joining_fee || 0);
  const waiverSpendNum = Number(card.renewal_waiver_spend || 0);

  // Verification classification
  const isVerifiedBankData = Boolean(
    card.terms_source_url && card.terms_source_url.startsWith("https://")
  );

  return (
    <div className={`p-6 sm:p-7 rounded-3xl bg-white/[0.03] border border-white/[0.08] shadow-[0_16px_40px_0_rgba(0,0,0,0.6)] space-y-6 relative overflow-hidden backdrop-blur-2xl ${className}`}>
      {/* Ambient background highlight */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header & Card Identity */}
      <div className="flex items-start justify-between gap-3 border-b border-cliq-border/60 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-cliq-cyan/10 text-cliq-cyan border border-cliq-cyan/30">
              {card.bank_name}
            </span>
            {card.card_variant && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/90">
                {card.card_variant}
              </span>
            )}
            {card.nickname && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                "{card.nickname}"
              </span>
            )}
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            {card.card_name}
          </h3>
          <div className="flex items-center gap-3 text-xs text-cliq-textSecondary mt-1">
            <span>Cardholder: <strong className="text-white font-medium uppercase">{card.cardholder_name || "Not specified"}</strong></span>
            <span>•</span>
            <span className="font-mono">
              Ending: <strong className="text-white">{card.last_four_digits ? `•••• ${card.last_four_digits}` : "Masked"}</strong>
            </span>
          </div>
        </div>

        {/* Verification Status Pill */}
        <div className="shrink-0 text-right">
          {isVerifiedBankData ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
              <CheckCircle2 className="w-3 h-3" />
              <span>Verified Bank Data</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
              <AlertCircle className="w-3 h-3" />
              <span>User-Entered</span>
            </span>
          )}
        </div>
      </div>

      {/* FEES & WAIVER METRICS */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-cliq-textSecondary block">
          Schedule of Charges & Fee Waivers
        </span>
        <div className="grid grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-cliq-surface/80 border border-cliq-border">
            <span className="text-[10px] text-cliq-textSecondary block">Joining Fee</span>
            <span className="font-bold text-white text-sm">
              {joiningFeeNum === 0 ? "FREE" : `₹${joiningFeeNum.toLocaleString("en-IN")}`}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-cliq-surface/80 border border-cliq-border">
            <span className="text-[10px] text-cliq-textSecondary block">Annual Fee</span>
            <span className="font-bold text-white text-sm">
              {annualFeeNum === 0 ? "FREE" : `₹${annualFeeNum.toLocaleString("en-IN")}`}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-cliq-surface/80 border border-cliq-border">
            <span className="text-[10px] text-cliq-textSecondary block">Renewal Waiver</span>
            <span className="font-bold text-emerald-400 text-sm">
              {waiverSpendNum > 0 ? `₹${waiverSpendNum.toLocaleString("en-IN")}` : "No Waiver"}
            </span>
          </div>
        </div>

        {card.fee_waiver_condition_details ? (
          <div className="p-2.5 rounded-xl bg-cliq-surface/50 border border-cliq-border text-[11px] text-cliq-textSecondary">
            <strong className="text-white font-semibold">Waiver Condition: </strong>
            {card.fee_waiver_condition_details}
          </div>
        ) : (
          <div className="p-2 rounded-xl bg-cliq-surface/30 border border-cliq-border text-[10px] text-cliq-textSecondary italic">
            Specific waiver spend conditions: Not configured
          </div>
        )}
      </div>

      {/* REWARD MULTIPLIERS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cliq-cyan flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>Category Multipliers & Cashback</span>
          </span>
          <span className="text-[10px] text-cliq-textSecondary">
            {card.reward_rules?.length || 0} active {card.reward_rules?.length === 1 ? "rule" : "rules"}
          </span>
        </div>

        {card.reward_rules && card.reward_rules.length > 0 ? (
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {card.reward_rules.map((rule, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-cliq-surface/80 border border-cliq-border flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <span className="capitalize">{rule.category_id} Spends</span>
                    {rule.merchant_pattern && (
                      <span className="text-[10px] font-normal text-cliq-textSecondary">
                        ({rule.merchant_pattern})
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-cliq-textSecondary mt-0.5">
                    Type: {rule.reward_type} {rule.monthly_cap_amount ? `• Cap: ₹${Number(rule.monthly_cap_amount).toLocaleString("en-IN")}/mo` : "• Unlimited"}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-cliq-turquoise">
                    {rule.reward_rate_percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-cliq-surface/40 border border-cliq-border text-xs text-cliq-textSecondary">
            Standard baseline 1.0% cashback across all categories.
          </div>
        )}
      </div>

      {/* BENEFITS & PERKS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Lounge & Lifestyle Perks</span>
          </span>
          <span className="text-[10px] text-cliq-textSecondary">
            {card.benefits?.length || 0} configured
          </span>
        </div>

        {card.benefits && card.benefits.length > 0 ? (
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {card.benefits.map((b, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-cliq-surface/80 border border-cliq-border text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-1">
                    <Plane className="w-3 h-3 text-purple-400" />
                    <span>{b.title}</span>
                  </span>
                  {Number(b.annual_value_estimate || 0) > 0 && (
                    <span className="text-[10px] text-emerald-400 font-medium">
                      Est. ₹{Number(b.annual_value_estimate).toLocaleString("en-IN")}/yr
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-cliq-textSecondary line-clamp-2">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-cliq-surface/40 border border-cliq-border text-xs text-cliq-textSecondary">
            Lounge & lifestyle benefits: Not configured for this card.
          </div>
        )}
      </div>

      {/* Terms Link */}
      {card.terms_source_url && (
        <div className="pt-2 border-t border-cliq-border/60 flex items-center justify-between text-xs">
          <span className="text-cliq-textSecondary">Verified Source:</span>
          <a
            href={card.terms_source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cliq-cyan hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Official Schedule of Charges</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Action Controls */}
      <div className="pt-3 border-t border-cliq-border/60 flex items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={() => onEdit(card)}
          className="flex-1 py-2 px-3.5 rounded-xl bg-cliq-surface hover:bg-cliq-surfaceHover border border-cliq-border text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5 text-cliq-cyan" />
          <span>Edit Specs</span>
        </button>

        <Link
          href={`/cards/compare`}
          className="py-2 px-3.5 rounded-xl bg-cliq-surface hover:bg-cliq-surfaceHover border border-cliq-border text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <GitCompare className="w-3.5 h-3.5 text-cliq-turquoise" />
          <span>Compare</span>
        </Link>

        <button
          type="button"
          disabled={deletingId === card.id}
          onClick={() => onDelete(card.id)}
          className="py-2 px-3 rounded-xl bg-cliq-surface hover:bg-red-950/50 border border-cliq-border text-cliq-textSecondary hover:text-red-400 text-xs font-semibold transition-colors disabled:opacity-50"
          title="Deactivate Card"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

