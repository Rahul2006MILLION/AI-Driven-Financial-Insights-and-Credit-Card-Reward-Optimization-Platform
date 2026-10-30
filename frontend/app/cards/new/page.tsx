"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import {
  CreditCard,
  PlusCircle,
  Trash2,
  ArrowLeft,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function AddCardPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [cardName, setCardName] = useState("");
  const [bankName, setBankName] = useState("HDFC Bank");
  const [network, setNetwork] = useState("VISA");
  const [lastFour, setLastFour] = useState("");
  const [annualFee, setAnnualFee] = useState<number>(0);
  const [waiverSpend, setWaiverSpend] = useState<number>(100000);
  const [cycleDay, setCycleDay] = useState<number>(15);

  // Dynamic Rules
  const [rules, setRules] = useState<any[]>([
    {
      category_id: "shopping",
      merchant_pattern: "Amazon, Flipkart",
      reward_type: "CASHBACK",
      reward_rate_percentage: 5.0,
      monthly_cap_amount: 1000.0,
      is_excluded: false,
    },
    {
      category_id: "all",
      merchant_pattern: "",
      reward_type: "CASHBACK",
      reward_rate_percentage: 1.5,
      monthly_cap_amount: null,
      is_excluded: false,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addRule = () => {
    setRules([
      ...rules,
      {
        category_id: "dining",
        merchant_pattern: "",
        reward_type: "CASHBACK",
        reward_rate_percentage: 2.0,
        monthly_cap_amount: null,
        is_excluded: false,
      },
    ]);
  };

  const removeRule = (idx: number) => {
    setRules(rules.filter((_, i) => i !== idx));
  };

  const updateRule = (idx: number, field: string, val: any) => {
    const updated = [...rules];
    updated[idx][field] = val;
    setRules(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiFetch("/cards", {
        method: "POST",
        body: JSON.stringify({
          card_name: cardName,
          bank_name: bankName,
          network,
          last_four_digits: lastFour || null,
          annual_fee: annualFee,
          renewal_waiver_spend: waiverSpend || null,
          billing_cycle_day: cycleDay,
          rules,
          benefits: [],
        }),
      });

      router.push("/cards");
    } catch (err: any) {
      setError(err.message || "Failed to create credit card.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-cliq-surface hover:bg-cliq-surfaceHover text-cliq-textSecondary hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-white">{t.cards.addNew}</h1>
            <p className="text-xs text-cliq-textSecondary">
              Register a card with customized category cashback rules and monthly caps.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-cliq-danger/10 border border-cliq-danger/30 text-cliq-danger text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card Basic Details */}
          <div className="glass-panel p-6 rounded-2xl border-cliq-border space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Card Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-cliq-textSecondary mb-1.5">
                  Card Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Regalia Gold, SBI Cashback"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cliq-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cliq-textSecondary mb-1.5">
                  Bank / Issuer *
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cliq-cyan"
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="SBI Card">SBI Card</option>
                  <option value="American Express">American Express</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  <option value="IDFC FIRST Bank">IDFC FIRST Bank</option>
                  <option value="Other">Other Bank</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-cliq-textSecondary mb-1.5">
                  Card Network
                </label>
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cliq-cyan"
                >
                  <option value="VISA">VISA</option>
                  <option value="MASTERCARD">Mastercard</option>
                  <option value="AMEX">American Express</option>
                  <option value="RUPAY">RuPay</option>
                  <option value="DINERS">Diners Club</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-cliq-textSecondary mb-1.5">
                  Last 4 Digits (Optional)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. 4892"
                  value={lastFour}
                  onChange={(e) => setLastFour(e.target.value)}
                  className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cliq-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cliq-textSecondary mb-1.5">
                  Annual Fee (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={annualFee}
                  onChange={(e) => setAnnualFee(Number(e.target.value))}
                  className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cliq-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cliq-textSecondary mb-1.5">
                  Annual Fee Waiver Spend (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={waiverSpend}
                  onChange={(e) => setWaiverSpend(Number(e.target.value))}
                  className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cliq-cyan"
                />
              </div>
            </div>
          </div>

          {/* Reward Multipliers & Rules */}
          <div className="glass-panel p-6 rounded-2xl border-cliq-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Deterministic Multipliers & Rules
                </h3>
                <p className="text-[11px] text-cliq-textSecondary">
                  Define category multipliers, accelerated merchants, caps, and exclusions.
                </p>
              </div>
              <button
                type="button"
                onClick={addRule}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cliq-surface hover:bg-cliq-surfaceHover text-cliq-cyan text-xs font-semibold border border-cliq-cyan/40"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Rule</span>
              </button>
            </div>

            <div className="space-y-3">
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-cliq-bgSecondary/80 border border-cliq-border space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] text-cliq-textMuted uppercase mb-1">
                        Category
                      </label>
                      <select
                        value={rule.category_id}
                        onChange={(e) => updateRule(idx, "category_id", e.target.value)}
                        className="w-full bg-cliq-surface border border-cliq-border rounded-lg px-2.5 py-1.5 text-white text-xs"
                      >
                        <option value="shopping">Online Shopping</option>
                        <option value="dining">Dining & Delivery</option>
                        <option value="grocery">Groceries</option>
                        <option value="utility">Utility & Bills</option>
                        <option value="travel">Travel & Flights</option>
                        <option value="fuel">Fuel (Petrol Pumps)</option>
                        <option value="all">General (All Spends)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-cliq-textMuted uppercase mb-1">
                        Merchant (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Swiggy, Amazon"
                        value={rule.merchant_pattern || ""}
                        onChange={(e) => updateRule(idx, "merchant_pattern", e.target.value)}
                        className="w-full bg-cliq-surface border border-cliq-border rounded-lg px-2.5 py-1.5 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-cliq-textMuted uppercase mb-1">
                        Reward Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={rule.reward_rate_percentage}
                        onChange={(e) =>
                          updateRule(idx, "reward_rate_percentage", Number(e.target.value))
                        }
                        className="w-full bg-cliq-surface border border-cliq-border rounded-lg px-2.5 py-1.5 text-white text-xs font-bold"
                      />
                    </div>

                    <div className="flex items-end justify-between gap-2">
                      <div className="flex-1">
                        <label className="block text-[10px] text-cliq-textMuted uppercase mb-1">
                          Monthly Cap (₹)
                        </label>
                        <input
                          type="number"
                          placeholder="No cap"
                          value={rule.monthly_cap_amount || ""}
                          onChange={(e) =>
                            updateRule(
                              idx,
                              "monthly_cap_amount",
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                          className="w-full bg-cliq-surface border border-cliq-border rounded-lg px-2.5 py-1.5 text-white text-xs"
                        />
                      </div>

                      {rules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRule(idx)}
                          className="p-2 rounded-lg text-cliq-textMuted hover:text-cliq-danger hover:bg-cliq-surface"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id={`exclude_${idx}`}
                      checked={rule.is_excluded}
                      onChange={(e) => updateRule(idx, "is_excluded", e.target.checked)}
                      className="rounded bg-cliq-surface border-cliq-border text-cliq-cyan"
                    />
                    <label
                      htmlFor={`exclude_${idx}`}
                      className="text-xs text-cliq-textSecondary cursor-pointer"
                    >
                      Mark this category as an exclusion (0% rewards, e.g. Fuel, Wallet top-up)
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-xl bg-cliq-surface border border-cliq-border text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cliq-cyan to-cliq-emerald text-cliq-bg font-bold text-xs shadow-neonCyan hover:opacity-95 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Card to Portfolio</span>}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
