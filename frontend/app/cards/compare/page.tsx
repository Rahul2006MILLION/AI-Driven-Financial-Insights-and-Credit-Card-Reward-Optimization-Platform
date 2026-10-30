"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import { GitCompare, Loader2, Sparkles, Check, CheckCircle2, Shield } from "lucide-react";

export default function CompareCardsPage() {
  const { t } = useLanguage();
  const [cards, setCards] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<any>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data: any = await apiFetch("/cards");
        setCards(data || []);
        if (data && data.length >= 2) {
          // Default select first 2 or 3
          setSelectedIds(data.slice(0, 3).map((c: any) => c.id));
        }
      } catch (err) {
        console.error("Failed to load cards:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  const toggleSelectCard = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 2) {
        setSelectedIds(selectedIds.filter((x) => x !== id));
      }
    } else {
      if (selectedIds.length < 5) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const handleRunComparison = async () => {
    if (selectedIds.length < 2) return;
    setComparing(true);
    try {
      const res: any = await apiFetch("/optimization/compare", {
        method: "POST",
        body: JSON.stringify({ card_ids: selectedIds }),
      });
      setComparisonResult(res);
    } catch (err) {
      alert("Comparison failed: " + err);
    } finally {
      setComparing(false);
    }
  };

  // Run automatically when selections load
  useEffect(() => {
    if (selectedIds.length >= 2) {
      handleRunComparison();
    }
  }, [selectedIds.length]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.cards.compare}
          </h1>
          <p className="text-xs text-cliq-textSecondary mt-1">
            Side-by-side comparative analysis of reward yields, category multipliers, and fee breakeven.
          </p>
        </div>

        {/* Card Selector Pills */}
        <div className="glass-panel p-5 rounded-2xl border-cliq-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Select 2 to 5 Cards to Compare ({selectedIds.length} Selected)
            </span>
            <button
              onClick={handleRunComparison}
              disabled={comparing || selectedIds.length < 2}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cliq-cyan to-cliq-emerald text-cliq-bg font-bold text-xs shadow-neonCyan hover:opacity-95 flex items-center gap-1.5"
            >
              {comparing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GitCompare className="w-3.5 h-3.5" />}
              <span>Compare Selected</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {cards.map((c) => {
              const isSelected = selectedIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleSelectCard(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
                    isSelected
                      ? "bg-cliq-cyan/20 border-cliq-cyan text-cliq-cyan shadow-neonCyan"
                      : "bg-cliq-surface border-cliq-border text-cliq-textSecondary hover:text-white"
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                      isSelected ? "bg-cliq-cyan text-cliq-bg" : "border border-cliq-border"
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span>{c.card_name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Comparison Matrix Output */}
        {comparisonResult && (
          <div className="space-y-6">
            {/* Header Cards Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparisonResult.cards.map((card: any) => {
                const cardMeta = cards.find((c) => c.id === card.card_id);
                return (
                  <div
                    key={card.card_id}
                    className="glass-panel p-5 rounded-2xl border-glow-cyan/40 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] uppercase font-bold text-cliq-cyan px-2 py-0.5 rounded bg-cliq-surface border border-cliq-border">
                        {card.network}
                      </span>
                      <h3 className="text-base font-extrabold text-white mt-2">
                        {card.card_name}
                      </h3>
                      <div className="text-xs text-cliq-textSecondary">{card.bank_name}</div>

                      <div className="mt-4 pt-3 border-t border-cliq-border space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-cliq-textMuted">Annual Fee:</span>
                          <span className="font-bold text-white">
                            {Number(cardMeta?.annual_fee) === 0
                              ? "Lifetime Free"
                              : `₹${Number(cardMeta?.annual_fee).toFixed(0)}`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-cliq-textMuted">Fee Breakeven Spend:</span>
                          <span className="font-bold text-cliq-turquoise">
                            ₹{Number(comparisonResult.annual_break_even_spends[card.card_id] || 0).toFixed(0)}/yr
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Category Yield Matrix Table */}
            <div className="glass-panel rounded-2xl border-cliq-border overflow-hidden">
              <div className="p-4 bg-cliq-surface border-b border-cliq-border flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Category Yield Matrix (Effective Return %)
                </span>
                <span className="text-[11px] text-cliq-emerald font-semibold">
                  Highest Yield Highlighted in Neon
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-cliq-bgSecondary/80 text-cliq-textMuted uppercase border-b border-cliq-border">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Category</th>
                      {comparisonResult.cards.map((c: any) => (
                        <th key={c.card_id} className="py-3 px-4 font-semibold text-center">
                          {c.card_name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cliq-border/60">
                    {comparisonResult.category_matrix.map((row: any) => {
                      // find max yield in row
                      const yields = Object.values(row.card_yields).map((y: any) => Number(y));
                      const maxYield = Math.max(...yields);

                      return (
                        <tr key={row.category_id} className="hover:bg-cliq-surface/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white">
                            {row.display_name}
                          </td>
                          {comparisonResult.cards.map((c: any) => {
                            const val = Number(row.card_yields[c.card_id] || 0);
                            const isWinner = val === maxYield && maxYield > 0;
                            return (
                              <td key={c.card_id} className="py-3.5 px-4 text-center">
                                <span
                                  className={`inline-block px-2.5 py-1 rounded-lg font-extrabold ${
                                    isWinner
                                      ? "bg-cliq-emerald/20 text-cliq-emerald border border-cliq-emerald/40 shadow-neonEmerald"
                                      : val === 0
                                      ? "text-cliq-danger font-medium"
                                      : "text-cliq-textSecondary"
                                  }`}
                                >
                                  {val > 0 ? `${val.toFixed(1)}%` : "0.0% (Excl)"}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Verdict */}
            <div className="p-4 rounded-xl bg-cliq-surface border border-cliq-cyan/30 text-xs text-cliq-textSecondary flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-cliq-cyan shrink-0" />
              <span>{comparisonResult.summary_verdict}</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
