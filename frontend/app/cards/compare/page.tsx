"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import { GitCompare, Loader2, Sparkles, Check } from "lucide-react";
import { ToastContainer, useToast } from "@/components/Toast";

export default function CompareCardsPage() {
  const { t } = useLanguage();
  const { toasts, addToast, removeToast } = useToast();
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
    } catch (err: any) {
      addToast("Comparison failed: " + (err.message || err), "error");
    } finally {
      setComparing(false);
    }
  };

  useEffect(() => {
    if (selectedIds.length >= 2) {
      handleRunComparison();
    }
  }, [selectedIds.length]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-[#0E1013]">
      <Sidebar />

      <main className="flex-1 p-5 sm:p-7 lg:p-9 max-w-7xl mx-auto w-full space-y-7">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            {t.compare?.title || "Card Comparison"}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.compare?.subtitle || "Side-by-side multiplier matrix and annual fee breakeven analysis"}
          </p>
        </div>

        {/* Card Selector Pills in Liquid Glass */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.6)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {t.compare?.selectionPrompt || "Select 2 to 5 Cards"} ({selectedIds.length} {t.cards?.verifiedCountLabel ? "Selected" : "Selected"})
            </span>
            <button
              onClick={handleRunComparison}
              disabled={comparing || selectedIds.length < 2}
              className="px-4 py-1.5 rounded-full btn-fx bg-lime-400 hover:bg-lime-300 text-[#0E1013] font-semibold text-xs shadow-[0_0_15px_rgba(76,192,63,0.35)] transition-all flex items-center gap-1.5 disabled:opacity-40"
            >
              {comparing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GitCompare className="w-3.5 h-3.5" />}
              <span>{comparing ? (t.compare?.comparing || "Comparing...") : (t.compare?.runComparison || "Compare")}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {cards.map((c) => {
              const isSelected = selectedIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleSelectCard(c.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-2 transition-all ${
                    isSelected
                      ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-400 shadow-[0_0_15px_rgba(76,192,63,0.25)]"
                      : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                      isSelected ? "bg-emerald-500 text-[#0E1013]" : "border border-white/20"
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
                    className="p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_12px_36px_0_rgba(0,0,0,0.5)] flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        {card.network}
                      </span>
                      <h3 className="text-base font-extrabold text-white mt-2">
                        {card.card_name}
                      </h3>
                      <div className="text-xs text-slate-400">{card.bank_name}</div>

                      <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Annual Fee:</span>
                          <span className="font-bold text-white">
                            {Number(cardMeta?.annual_fee) === 0
                              ? "Lifetime Free"
                              : `₹${Number(cardMeta?.annual_fee).toFixed(0)}`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Breakeven Spend:</span>
                          <span className="font-bold text-emerald-400">
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
            <div className="rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.6)] overflow-hidden">
              <div className="p-4 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Category Yield Matrix (%)
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">
                  Leading Yield Highlighted
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-white/[0.01] text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/[0.06]">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Category</th>
                      {comparisonResult.cards.map((c: any) => (
                        <th key={c.card_id} className="py-3.5 px-4 font-semibold text-center">
                          {c.card_name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {comparisonResult.category_matrix.map((row: any) => {
                      const yields = Object.values(row.card_yields).map((y: any) => Number(y));
                      const maxYield = Math.max(...yields);

                      return (
                        <tr key={row.category_id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white">
                            {row.display_name}
                          </td>
                          {comparisonResult.cards.map((c: any) => {
                            const val = Number(row.card_yields[c.card_id] || 0);
                            const isWinner = val === maxYield && maxYield > 0;
                            return (
                              <td key={c.card_id} className="py-3.5 px-4 text-center">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full font-bold ${
                                    isWinner
                                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(76,192,63,0.25)]"
                                      : val === 0
                                      ? "text-rose-400 font-medium"
                                      : "text-slate-300"
                                  }`}
                                >
                                  {val > 0 ? `${val.toFixed(1)}%` : "0.0%"}
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
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-300 flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{comparisonResult.summary_verdict}</span>
            </div>
          </div>
        )}
      </main>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
