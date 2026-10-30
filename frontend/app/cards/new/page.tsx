"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage } from "@/lib/i18n";
import { api } from "@/lib/api";
import {
  CreditCard,
  PlusCircle,
  Trash2,
  ArrowLeft,
  Loader2,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";

export default function AddCardPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [cardName, setCardName] = useState("");
  const [bankName, setBankName] = useState("HDFC Bank");
  const [network, setNetwork] = useState("VISA");
  const [cardVariant, setCardVariant] = useState("Metal");
  const [lastFour, setLastFour] = useState("");
  const [joiningFee, setJoiningFee] = useState<number>(0);
  const [annualFee, setAnnualFee] = useState<number>(1000);
  const [waiverSpend, setWaiverSpend] = useState<number>(100000);
  const [waiverDetails, setWaiverDetails] = useState("");
  const [cycleDay, setCycleDay] = useState<number>(15);
  const [termsUrl, setTermsUrl] = useState("");

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
      category_id: "dining",
      merchant_pattern: "Swiggy, Zomato",
      reward_type: "CASHBACK",
      reward_rate_percentage: 5.0,
      monthly_cap_amount: 1000.0,
      is_excluded: false,
    },
    {
      category_id: "all",
      merchant_pattern: "",
      reward_type: "CASHBACK",
      reward_rate_percentage: 1.0,
      monthly_cap_amount: null,
      is_excluded: false,
    },
  ]);

  // Dynamic Benefits
  const [benefits, setBenefits] = useState<any[]>([
    {
      benefit_type: "LOUNGE_ACCESS",
      title: "Airport Lounge Access",
      description: "Complimentary domestic lounge visits per calendar quarter.",
      applicable_category: "travel",
      reward_basis: "COMPLIMENTARY",
      annual_value_estimate: 4000.0,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addRule = () => {
    setRules([
      ...rules,
      {
        category_id: "grocery",
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

  const addBenefit = () => {
    setBenefits([
      ...benefits,
      {
        benefit_type: "PERMANENT",
        title: "Dining Privileges",
        description: "Up to 20% off at partner restaurants.",
        applicable_category: "dining",
        reward_basis: "COMPLIMENTARY",
        annual_value_estimate: 2000.0,
      },
    ]);
  };

  const removeBenefit = (idx: number) => {
    setBenefits(benefits.filter((_, i) => i !== idx));
  };

  const updateBenefit = (idx: number, field: string, val: any) => {
    const updated = [...benefits];
    updated[idx][field] = val;
    setBenefits(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.createCard({
        card_name: cardName,
        bank_name: bankName,
        network: network as any,
        card_variant: cardVariant || undefined,
        last_four_digits: lastFour || undefined,
        joining_fee: joiningFee,
        annual_fee: annualFee,
        renewal_waiver_spend: waiverSpend || undefined,
        fee_waiver_condition_details: waiverDetails || undefined,
        billing_cycle_day: cycleDay,
        terms_source_url: termsUrl || undefined,
        rules,
        benefits,
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
              Register a card with customized category rules, lounge perks, waiver targets, and official terms.
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
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-cliq-cyan" />
              <span>Card Identity & Specifications</span>
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
                  Card Variant / Edition
                </label>
                <input
                  type="text"
                  placeholder="e.g. Signature, Metal, Platinum, Select"
                  value={cardVariant}
                  onChange={(e) => setCardVariant(e.target.value)}
                  className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cliq-cyan"
                />
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
                  Annual Fee Waiver Spend Target (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={waiverSpend}
                  onChange={(e) => setWaiverSpend(Number(e.target.value))}
                  className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cliq-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cliq-textSecondary mb-1.5">
                  Fee Waiver Condition Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. Spend ₹1 Lakh in calendar year to waive annual fee"
                  value={waiverDetails}
                  onChange={(e) => setWaiverDetails(e.target.value)}
                  className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cliq-cyan"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-cliq-textSecondary mb-1.5">
                  Official Terms & Schedule URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://www.bank.com/credit-cards/terms-and-conditions"
                  value={termsUrl}
                  onChange={(e) => setTermsUrl(e.target.value)}
                  className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cliq-cyan"
                />
              </div>
            </div>
          </div>

          {/* Reward Multipliers & Rules */}
          <div className="glass-panel p-6 rounded-2xl border-cliq-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cliq-cyan" />
                  <span>Category Multipliers & Reward Rules</span>
                </h3>
                <p className="text-xs text-cliq-textSecondary mt-0.5">
                  Specify exact cashback % or reward point multipliers for specific merchants or categories.
                </p>
              </div>

              <button
                type="button"
                onClick={addRule}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cliq-surface hover:bg-cliq-surfaceHover border border-cliq-border text-cliq-cyan text-xs font-bold transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Rule</span>
              </button>
            </div>

            <div className="space-y-3">
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-cliq-surface/90 border border-cliq-border space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Rule #{idx + 1}</span>
                    {rules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRule(idx)}
                        className="text-cliq-textMuted hover:text-cliq-danger p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-cliq-textMuted mb-1">Category</label>
                      <select
                        value={rule.category_id}
                        onChange={(e) => updateRule(idx, "category_id", e.target.value)}
                        className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-lg p-2 text-white"
                      >
                        <option value="all">All / Standard Base</option>
                        <option value="dining">Dining & Restaurants</option>
                        <option value="food_delivery">Food Delivery</option>
                        <option value="shopping">Online Shopping</option>
                        <option value="grocery">Grocery & Supermarket</option>
                        <option value="travel">Travel, Flights & Hotels</option>
                        <option value="utility">Utility & Bills</option>
                        <option value="fuel">Fuel & Petrol</option>
                        <option value="entertainment">Entertainment</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-cliq-textMuted mb-1">Merchant Keyword</label>
                      <input
                        type="text"
                        placeholder="e.g. Swiggy, Amazon"
                        value={rule.merchant_pattern || ""}
                        onChange={(e) => updateRule(idx, "merchant_pattern", e.target.value)}
                        className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-lg p-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-cliq-textMuted mb-1">Reward Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={rule.reward_rate_percentage}
                        onChange={(e) => updateRule(idx, "reward_rate_percentage", Number(e.target.value))}
                        className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-lg p-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-cliq-textMuted mb-1">Monthly Cap (₹)</label>
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
                        className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Perks & Privileges */}
          <div className="glass-panel p-6 rounded-2xl border-cliq-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cliq-emerald" />
                  <span>Card Perks & Privileges</span>
                </h3>
                <p className="text-xs text-cliq-textSecondary mt-0.5">
                  Track lounge access, travel protection, and concierge privileges.
                </p>
              </div>

              <button
                type="button"
                onClick={addBenefit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cliq-surface hover:bg-cliq-surfaceHover border border-cliq-border text-cliq-emerald text-xs font-bold transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Perk</span>
              </button>
            </div>

            <div className="space-y-3">
              {benefits.map((ben, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-cliq-surface/90 border border-cliq-border space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Benefit #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeBenefit(idx)}
                      className="text-cliq-textMuted hover:text-cliq-danger p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-cliq-textMuted mb-1">Benefit Type</label>
                      <select
                        value={ben.benefit_type}
                        onChange={(e) => updateBenefit(idx, "benefit_type", e.target.value)}
                        className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-lg p-2 text-white"
                      >
                        <option value="LOUNGE_ACCESS">Airport Lounge Access</option>
                        <option value="PERMANENT">Permanent Feature / Milestone</option>
                        <option value="INSURANCE">Insurance & Protection</option>
                        <option value="GOLF">Golf Privileges</option>
                        <option value="CONCIERGE">Concierge Service</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-cliq-textMuted mb-1">Title</label>
                      <input
                        type="text"
                        value={ben.title}
                        onChange={(e) => updateBenefit(idx, "title", e.target.value)}
                        className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-lg p-2 text-white"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-cliq-textMuted mb-1">Description</label>
                      <input
                        type="text"
                        value={ben.description}
                        onChange={(e) => updateBenefit(idx, "description", e.target.value)}
                        className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cliq-cyan via-cliq-turquoise to-cliq-emerald text-cliq-bg font-extrabold text-sm shadow-neonCyan hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Save Card to Portfolio</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
