"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import {
  Receipt,
  Plus,
  Trash2,
  CheckCircle2,
  TrendingDown,
  Loader2,
  Calendar,
} from "lucide-react";

export default function TransactionsPage() {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New transaction form
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState<number>(1000);
  const [category, setCategory] = useState("dining");
  const [cardId, setCardId] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [txData, cardsData]: any = await Promise.all([
        apiFetch("/transactions?limit=100"),
        apiFetch("/cards"),
      ]);
      setTransactions(txData || []);
      setCards(cardsData || []);
      if (cardsData && cardsData.length > 0 && !cardId) {
        setCardId(cardsData[0].id);
      }
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch("/transactions", {
        method: "POST",
        body: JSON.stringify({
          merchant_name: merchant,
          amount,
          category_id: category,
          card_id: cardId || null,
          is_recurring: isRecurring,
        }),
      });
      setShowAddModal(false);
      setMerchant("");
      setAmount(1000);
      await fetchData();
    } catch (err) {
      alert("Failed to create transaction: " + err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.transactions.deletePrompt)) return;
    try {
      await apiFetch(`/transactions/${id}`, { method: "DELETE" });
      await fetchData();
    } catch (err) {
      alert(t.transactions.deleteFailed + ": " + err);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-[#040707]">
      <Sidebar />

      <main className="flex-1 p-5 sm:p-7 lg:p-9 max-w-7xl mx-auto w-full space-y-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white glow-emerald">
              {t.transactions.title}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.transactions.subtitle}
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#040707] font-semibold text-xs shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.transactions.addNewTransaction}</span>
          </button>
        </div>

        {/* Modal for adding transaction */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="p-6 sm:p-7 rounded-3xl bg-[#06100C]/95 border border-white/10 shadow-2xl max-w-md w-full space-y-4">
              <h3 className="text-base font-bold text-white">{t.transactions.addModalTitle}</h3>

              <form onSubmit={handleAddTransaction} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">
                    {t.transactions.merchantLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swiggy, Amazon, HPCL"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">
                    {t.transactions.amountLabel} *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">
                    {t.transactions.categoryLabel}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#06100C] border border-white/10 rounded-2xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="dining">{t.categories.dining}</option>
                    <option value="shopping">{t.categories.shopping}</option>
                    <option value="grocery">{t.categories.grocery}</option>
                    <option value="utility">{t.categories.utility}</option>
                    <option value="travel">{t.categories.travel}</option>
                    <option value="fuel">{t.categories.fuel}</option>
                    <option value="entertainment">{t.categories.entertainment}</option>
                    <option value="other">{t.categories.other}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">
                    {t.transactions.cardLabel}
                  </label>
                  <select
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value)}
                    className="w-full bg-[#06100C] border border-white/10 rounded-2xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">{t.cards.allBanks}</option>
                    {cards.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.card_name} ({c.bank_name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="rec_check"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="rounded bg-white/[0.05] border-white/20 text-emerald-500 focus:ring-0"
                  />
                  <label htmlFor="rec_check" className="text-slate-400 cursor-pointer text-xs">
                    {t.transactions.recurringLabel}
                  </label>
                </div>

                <div className="pt-3 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-full bg-white/[0.05] text-slate-300 hover:text-white"
                  >
                    {t.cards.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#040707] font-bold shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-1.5">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t.transactions.recording}</span>
                      </div>
                    ) : (
                      t.transactions.recordTransactionButton
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transactions Table in Liquid Glass Container */}
        <div className="rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-white/[0.02] text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/[0.06]">
                <tr>
                  <th className="py-3.5 px-5 font-semibold">{t.transactions.tableMerchant}</th>
                  <th className="py-3.5 px-5 font-semibold">{t.transactions.tableCategory}</th>
                  <th className="py-3.5 px-5 font-semibold text-right">{t.transactions.tableAmount}</th>
                  <th className="py-3.5 px-5 font-semibold text-right">{t.transactions.tableReward}</th>
                  <th className="py-3.5 px-5 font-semibold text-right">{t.optimizer.intelligenceTitle}</th>
                  <th className="py-3.5 px-5 font-semibold text-center">{t.optimizer.breakdown}</th>
                  <th className="py-3.5 px-5 text-center">{t.transactions.tableActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      {t.transactions.noTransactionsFound}
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const leakage =
                      Number(tx.potential_optimal_reward) - Number(tx.reward_earned_monetary);
                    const isOptimal = leakage <= 0.01;

                    return (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-white">{tx.merchant_name}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(tx.transaction_date).toLocaleDateString()}</span>
                            {tx.is_recurring && (
                              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-bold">
                                RECURRING
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-5 font-medium text-slate-300">
                          {tx.category_id}
                        </td>

                        <td className="py-3.5 px-5 text-right font-bold text-white">
                          ₹{Number(tx.amount).toFixed(2)}
                        </td>

                        <td className="py-3.5 px-5 text-right font-bold text-emerald-400">
                          ₹{Number(tx.reward_earned_monetary).toFixed(2)}
                        </td>

                        <td className="py-3.5 px-5 text-right font-bold text-white">
                          ₹{Number(tx.potential_optimal_reward).toFixed(2)}
                        </td>

                        <td className="py-3.5 px-5 text-center">
                          {isOptimal ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{t.dashboard.optimalRecommendation}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                              <TrendingDown className="w-3 h-3" />
                              <span>-₹{leakage.toFixed(2)} {t.analytics.leakage}</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-5 text-center">
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-1 rounded-full text-slate-500 hover:text-rose-400 hover:bg-white/[0.05] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
