"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import { DemoBootstrap } from "@/components/DemoBootstrap";
import {
  CreditCard,
  PlusCircle,
  GitCompare,
  Trash2,
  Shield,
  Zap,
  Info,
  Loader2,
  Calendar,
} from "lucide-react";

export default function MyCreditCardsPage() {
  const { t } = useLanguage();
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCards = async () => {
    try {
      const data: any = await apiFetch("/cards");
      setCards(data || []);
    } catch (err) {
      console.error("Failed to load cards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("Are you sure you want to deactivate this credit card?")) return;
    setDeletingId(cardId);
    try {
      await apiFetch(`/cards/${cardId}`, { method: "DELETE" });
      await fetchCards();
    } catch (err) {
      alert("Failed to delete card: " + err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t.cards.title}
            </h1>
            <p className="text-xs text-cliq-textSecondary mt-1">{t.cards.subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/cards/compare"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cliq-surface hover:bg-cliq-surfaceHover border border-cliq-border text-white font-semibold text-xs transition-colors"
            >
              <GitCompare className="w-3.5 h-3.5 text-cliq-turquoise" />
              <span>{t.cards.compare}</span>
            </Link>
            <Link
              href="/cards/new"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cliq-cyan to-cliq-emerald text-cliq-bg font-bold text-xs shadow-neonCyan hover:opacity-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t.cards.addNew}</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-cliq-cyan mx-auto" />
            <p className="text-xs text-cliq-textSecondary mt-2">Loading card portfolio...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center space-y-4 max-w-lg mx-auto">
            <CreditCard className="w-12 h-12 text-cliq-cyan mx-auto opacity-75" />
            <h3 className="text-lg font-bold text-white">No Registered Cards Found</h3>
            <p className="text-xs text-cliq-textSecondary">
              Add your existing credit cards or bootstrap with realistic sample cards to begin maximizing your rewards.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <DemoBootstrap onSeeded={fetchCards} />
              <Link
                href="/cards/new"
                className="px-4 py-2 rounded-xl bg-cliq-cyan text-cliq-bg font-bold text-xs"
              >
                Add Custom Card
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <div
                key={card.id}
                className="glass-panel rounded-2xl p-6 border-cliq-border hover:border-cliq-cyan/40 transition-all flex flex-col justify-between relative group"
              >
                <div>
                  {/* Card Header Tag */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-cliq-surface border border-cliq-border text-cliq-cyan">
                      {card.network}
                    </span>
                    <span className="text-xs font-mono text-cliq-textMuted">
                      {card.last_four_digits ? `•••• ${card.last_four_digits}` : "Active"}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-white group-hover:text-cliq-cyan transition-colors">
                    {card.card_name}
                  </h3>
                  <div className="text-xs text-cliq-textSecondary mt-0.5">
                    {card.bank_name} • {card.card_type}
                  </div>

                  <div className="mt-4 pt-4 border-t border-cliq-border/60 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-cliq-textMuted block">Annual Fee</span>
                      <span className="font-bold text-white">
                        {Number(card.annual_fee) === 0 ? "Lifetime Free" : `₹${Number(card.annual_fee).toFixed(0)}`}
                      </span>
                    </div>
                    {card.renewal_waiver_spend && (
                      <div>
                        <span className="text-[10px] text-cliq-textMuted block">Fee Waiver At</span>
                        <span className="font-bold text-cliq-turquoise">
                          ₹{Number(card.renewal_waiver_spend).toFixed(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Multiplier Rules Snapshot */}
                  <div className="mt-4 pt-4 border-t border-cliq-border/60">
                    <div className="text-[11px] font-bold text-white flex items-center gap-1 mb-2">
                      <Zap className="w-3.5 h-3.5 text-cliq-cyan" />
                      <span>{t.cards.rules}</span>
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {card.reward_rules?.map((rule: any) => (
                        <div
                          key={rule.id}
                          className="text-[11px] p-2 rounded-lg bg-cliq-surface flex items-center justify-between"
                        >
                          <span className="text-cliq-textSecondary truncate max-w-[140px]">
                            {rule.merchant_pattern || rule.category_id}
                          </span>
                          {rule.is_excluded ? (
                            <span className="text-cliq-danger font-semibold text-[10px]">
                              Excluded (0%)
                            </span>
                          ) : (
                            <span className="text-cliq-emerald font-bold">
                              {rule.reward_rate_percentage}% {rule.reward_type}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  {card.benefits && card.benefits.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-cliq-border/60">
                      <div className="text-[11px] font-bold text-white flex items-center gap-1 mb-1.5">
                        <Shield className="w-3.5 h-3.5 text-cliq-emerald" />
                        <span>{t.cards.benefits}</span>
                      </div>
                      <div className="text-[11px] text-cliq-textSecondary">
                        {card.benefits.map((b: any) => b.title).join(" • ")}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-cliq-border flex items-center justify-between">
                  <div className="text-[10px] text-cliq-textMuted flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Cycle: Day {card.billing_cycle_day || 15}</span>
                  </div>

                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    disabled={deletingId === card.id}
                    className="p-1.5 rounded-lg text-cliq-textMuted hover:text-cliq-danger hover:bg-cliq-surface transition-colors"
                    title="Deactivate Card"
                  >
                    {deletingId === card.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-cliq-danger" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
