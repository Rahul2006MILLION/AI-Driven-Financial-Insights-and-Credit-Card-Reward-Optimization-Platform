"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import {
  Receipt,
  PlusCircle,
  Trash2,
  AlertCircle,
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
    if (!confirm("Delete transaction record?")) return;
    try {
      await apiFetch(`/transactions/${id}`, { method: "DELETE" });
      await fetchData();
    } catch (err) {
      alert("Failed to delete: " + err);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t.nav.transactions}
            </h1>
            <p className="text-xs text-cliq-textSecondary mt-1">
              Historical purchases, rewards earned, and transaction-level optimization analysis.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cliq-cyan to-cliq-emerald text-cliq-bg font-bold text-xs shadow-neonCyan hover:opacity-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Record Transaction</span>
          </button>
        </div>

        {/* Modal for adding transaction */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-panel p-6 rounded-2xl border-glow-cyan max-w-md w-full space-y-4">
              <h3 className="text-base font-bold text-white">Enter Transaction Details</h3>

              <form onSubmit={handleAddTransaction} className="space-y-3 text-xs">
                <div>
                  <label className="block text-cliq-textSecondary mb-1 font-semibold">
                    Merchant Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swiggy, Amazon, HPCL"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cliq-cyan"
                  />
                </div>

                <div>
                  <label className="block text-cliq-textSecondary mb-1 font-semibold">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-cliq-cyan"
                  />
                </div>

                <div>
                  <label className="block text-cliq-textSecondary mb-1 font-semibold">
                    Spending Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cliq-cyan"
                  >
                    <option value="dining">Dining & Delivery</option>
                    <option value="shopping">Online Shopping</option>
                    <option value="grocery">Groceries</option>
                    <option value="utility">Utility & Bills</option>
                    <option value="travel">Travel & Flights</option>
                    <option value="fuel">Fuel (Petrol Pump)</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="other">General Spends</option>
                  </select>
                </div>

                <div>
                  <label className="block text-cliq-textSecondary mb-1 font-semibold">
                    Card Used
                  </label>
                  <select
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value)}
                    className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cliq-cyan"
                  >
                    <option value="">Auto-Detect Optimal Card</option>
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
                    className="rounded bg-cliq-surface border-cliq-border text-cliq-cyan"
                  />
                  <label htmlFor="rec_check" className="text-cliq-textSecondary cursor-pointer">
                    This is a recurring subscription (e.g. Netflix, gym, insurance)
                  </label>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-cliq-surface text-white hover:bg-cliq-surfaceHover"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cliq-cyan to-cliq-emerald text-cliq-bg font-bold shadow-neonCyan"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="glass-panel rounded-2xl border-cliq-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-cliq-bgSecondary/80 text-cliq-textMuted uppercase border-b border-cliq-border">
                <tr>
                  <th className="py-3 px-4 font-semibold">Merchant / Date</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount</th>
                  <th className="py-3 px-4 font-semibold text-right">Reward Earned</th>
                  <th className="py-3 px-4 font-semibold text-right">Optimal Potential</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cliq-border/60">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-cliq-textMuted">
                      No transaction records yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const leakage =
                      Number(tx.potential_optimal_reward) - Number(tx.reward_earned_monetary);
                    const isOptimal = leakage <= 0.01;

                    return (
                      <tr key={tx.id} className="hover:bg-cliq-surface/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{tx.merchant_name}</div>
                          <div className="text-[10px] text-cliq-textMuted flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(tx.transaction_date).toLocaleDateString()}</span>
                            {tx.is_recurring && (
                              <span className="ml-1 px-1.5 py-0.2 rounded bg-cliq-cyan/15 text-cliq-cyan text-[9px] font-bold">
                                RECURRING
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-cliq-textSecondary">
                          {tx.category_id}
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold text-white">
                          ₹{Number(tx.amount).toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold text-cliq-emerald">
                          ₹{Number(tx.reward_earned_monetary).toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold text-cliq-cyan">
                          ₹{Number(tx.potential_optimal_reward).toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {isOptimal ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-cliq-emerald/15 text-cliq-emerald font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Optimal</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-cliq-danger/15 text-cliq-danger font-bold">
                              <TrendingDown className="w-3 h-3" />
                              <span>-₹{leakage.toFixed(2)} Leakage</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-1 rounded text-cliq-textMuted hover:text-cliq-danger hover:bg-cliq-surface"
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
