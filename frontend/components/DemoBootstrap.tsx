"use client";

import React, { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react";

export const DemoBootstrap: React.FC<{ onSeeded?: () => void }> = ({ onSeeded }) => {
  const [loading, setLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const seedSamplePortfolio = async () => {
    setLoading(true);
    try {
      // 1. Add HDFC Millennia
      await apiFetch("/cards", {
        method: "POST",
        body: JSON.stringify({
          card_name: "HDFC Millennia",
          bank_name: "HDFC Bank",
          network: "VISA",
          card_type: "CREDIT",
          last_four_digits: "4892",
          annual_fee: 1000.0,
          renewal_waiver_spend: 100000.0,
          billing_cycle_day: 15,
          rules: [
            {
              category_id: "shopping",
              merchant_pattern: "Amazon, Flipkart, Myntra",
              reward_type: "CASHBACK",
              reward_rate_percentage: 5.0,
              point_monetary_value: 1.0,
              min_transaction_amount: 0.0,
              monthly_cap_amount: 1000.0,
            },
            {
              category_id: "dining",
              merchant_pattern: "Swiggy, Zomato",
              reward_type: "CASHBACK",
              reward_rate_percentage: 5.0,
              point_monetary_value: 1.0,
              monthly_cap_amount: 1000.0,
            },
            {
              category_id: "all",
              reward_type: "CASHBACK",
              reward_rate_percentage: 1.0,
              point_monetary_value: 1.0,
            },
            {
              category_id: "fuel",
              reward_type: "CASHBACK",
              reward_rate_percentage: 0.0,
              is_excluded: true,
              exclusion_reason: "Fuel transactions excluded from cashback",
            },
          ],
          benefits: [
            {
              benefit_type: "LOUNGE_ACCESS",
              title: "Domestic Airport Lounge Access",
              description: "4 complimentary lounge visits per calendar year (1 per quarter).",
              annual_value_estimate: 4000.0,
            },
          ],
        }),
      });

      // 2. Add Axis Ace
      await apiFetch("/cards", {
        method: "POST",
        body: JSON.stringify({
          card_name: "Axis Bank Ace",
          bank_name: "Axis Bank",
          network: "VISA",
          card_type: "CREDIT",
          last_four_digits: "1024",
          annual_fee: 499.0,
          renewal_waiver_spend: 200000.0,
          billing_cycle_day: 20,
          rules: [
            {
              category_id: "utility",
              merchant_pattern: "Google Pay BillPay",
              reward_type: "CASHBACK",
              reward_rate_percentage: 5.0,
              point_monetary_value: 1.0,
              monthly_cap_amount: 500.0,
            },
            {
              category_id: "dining",
              merchant_pattern: "Swiggy, Zomato",
              reward_type: "CASHBACK",
              reward_rate_percentage: 4.0,
              point_monetary_value: 1.0,
              monthly_cap_amount: 500.0,
            },
            {
              category_id: "all",
              reward_type: "CASHBACK",
              reward_rate_percentage: 2.0,
              point_monetary_value: 1.0,
            },
            {
              category_id: "fuel",
              reward_type: "CASHBACK",
              reward_rate_percentage: 0.0,
              is_excluded: true,
              exclusion_reason: "Fuel transactions excluded",
            },
          ],
          benefits: [
            {
              benefit_type: "LOUNGE_ACCESS",
              title: "Domestic Lounge Visits",
              description: "4 complimentary domestic lounge visits per year.",
              annual_value_estimate: 3600.0,
            },
          ],
        }),
      });

      // 3. Add ICICI Amazon Pay
      await apiFetch("/cards", {
        method: "POST",
        body: JSON.stringify({
          card_name: "ICICI Amazon Pay",
          bank_name: "ICICI Bank",
          network: "VISA",
          card_type: "CO_BRANDED",
          last_four_digits: "9912",
          annual_fee: 0.0,
          billing_cycle_day: 5,
          rules: [
            {
              category_id: "shopping",
              merchant_pattern: "Amazon",
              reward_type: "CASHBACK",
              reward_rate_percentage: 5.0,
              point_monetary_value: 1.0,
            },
            {
              category_id: "dining",
              reward_type: "CASHBACK",
              reward_rate_percentage: 2.0,
              point_monetary_value: 1.0,
            },
            {
              category_id: "all",
              reward_type: "CASHBACK",
              reward_rate_percentage: 1.0,
              point_monetary_value: 1.0,
            },
          ],
          benefits: [],
        }),
      });

      // 4. Add Initial Transactions
      const txns = [
        { merchant_name: "Swiggy", amount: 1450.0, category_id: "dining" },
        { merchant_name: "Amazon Shopping", amount: 4899.0, category_id: "shopping" },
        { merchant_name: "Electricity Bill (BESCOM)", amount: 2150.0, category_id: "utility" },
        { merchant_name: "HPCL Petrol", amount: 3200.0, category_id: "fuel" },
        { merchant_name: "Netflix Subscription", amount: 649.0, category_id: "entertainment", is_recurring: true },
        { merchant_name: "Spotify Premium", amount: 119.0, category_id: "entertainment", is_recurring: true },
      ];

      for (const t of txns) {
        await apiFetch("/transactions", {
          method: "POST",
          body: JSON.stringify(t),
        });
      }

      setSeeded(true);
      if (onSeeded) onSeeded();
    } catch (err) {
      console.error("Failed to seed demo portfolio:", err);
    } finally {
      setLoading(false);
    }
  };

  if (seeded) {
    return (
      <div className="flex items-center gap-2 text-xs text-cliq-emerald bg-cliq-emerald/10 border border-cliq-emerald/30 px-3 py-2 rounded-xl">
        <CheckCircle2 className="w-4 h-4" />
        <span>Demo portfolio provisioned with HDFC Millennia, Axis Ace, ICICI Amazon Pay & transactions!</span>
      </div>
    );
  }

  return (
    <button
      onClick={seedSamplePortfolio}
      disabled={loading}
      className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-cliq-surface hover:bg-cliq-surfaceHover border border-cliq-cyan/40 text-cliq-cyan hover:shadow-neonCyan transition-all"
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Provisioning Verified Cards...</span>
        </>
      ) : (
        <>
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load 3 Verified Sample Cards & Data</span>
        </>
      )}
    </button>
  );
};
