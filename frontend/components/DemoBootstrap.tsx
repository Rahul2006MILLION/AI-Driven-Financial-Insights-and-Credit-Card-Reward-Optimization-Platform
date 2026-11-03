"use client";

import React, { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react";

export const DemoBootstrap: React.FC<{ onSeeded?: () => void }> = ({ onSeeded }) => {
  const { t } = useLanguage();
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
          card_variant: "CashBack",
          last_four_digits: "4892",
          annual_fee: 1000.0,
          renewal_waiver_spend: 100000.0,
          fee_waiver_condition_details: "Spend ₹1,00,000 in preceding 12 months to waive annual fee.",
          terms_source_url: "https://www.hdfcbank.com/personal/pay/cards/credit-cards/millennia-credit-card",
          billing_cycle_day: 15,
          rules: [
            {
              category_id: "shopping",
              merchant_pattern: "Amazon, Flipkart, Myntra, Tata CLiQ",
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
              category_id: "grocery",
              merchant_pattern: "Blinkit, Instamart",
              reward_type: "CASHBACK",
              reward_rate_percentage: 1.0,
              point_monetary_value: 1.0,
            },
            {
              category_id: "travel",
              merchant_pattern: "Uber, Flight bookings",
              reward_type: "CASHBACK",
              reward_rate_percentage: 5.0,
              point_monetary_value: 1.0,
              monthly_cap_amount: 1000.0,
            },
            {
              category_id: "utility",
              merchant_pattern: "Electricity, Water, Gas bills",
              reward_type: "CASHBACK",
              reward_rate_percentage: 1.0,
              point_monetary_value: 1.0,
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
              exclusion_reason: "Fuel transactions excluded from CashPoints; 1% surcharge waiver applies",
            },
          ],
          benefits: [
            {
              benefit_type: "LOUNGE_ACCESS",
              title: "Domestic Airport Lounge Access",
              description: "4 complimentary lounge visits per calendar year (1 per quarter on ₹1L spend).",
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
          card_variant: "Cashback Signature",
          last_four_digits: "1024",
          annual_fee: 499.0,
          renewal_waiver_spend: 200000.0,
          fee_waiver_condition_details: "Spend ₹2,00,000 in preceding year to waive renewal fee.",
          terms_source_url: "https://www.axisbank.com/retail/cards/credit-card/ace-credit-card",
          billing_cycle_day: 20,
          rules: [
            {
              category_id: "utility",
              merchant_pattern: "Google Pay BillPay, DTH, Mobile Recharge",
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
              category_id: "travel",
              merchant_pattern: "Ola Cabs",
              reward_type: "CASHBACK",
              reward_rate_percentage: 4.0,
              point_monetary_value: 1.0,
              monthly_cap_amount: 500.0,
            },
            {
              category_id: "shopping",
              reward_type: "CASHBACK",
              reward_rate_percentage: 1.5,
              point_monetary_value: 1.0,
            },
            {
              category_id: "grocery",
              reward_type: "CASHBACK",
              reward_rate_percentage: 1.5,
              point_monetary_value: 1.0,
            },
            {
              category_id: "all",
              reward_type: "CASHBACK",
              reward_rate_percentage: 1.5,
              point_monetary_value: 1.0,
            },
            {
              category_id: "fuel",
              reward_type: "CASHBACK",
              reward_rate_percentage: 0.0,
              is_excluded: true,
              exclusion_reason: "Fuel transactions excluded; 1% surcharge waiver applies",
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
          card_variant: "Platinum",
          last_four_digits: "9912",
          annual_fee: 0.0,
          renewal_waiver_spend: 0.0,
          fee_waiver_condition_details: "Unconditional Lifetime Free card with ₹0 annual fee.",
          terms_source_url: "https://www.icicibank.com/personal-banking/cards/credit-cards/amazon-pay-credit-card",
          billing_cycle_day: 5,
          rules: [
            {
              category_id: "shopping",
              merchant_pattern: "Amazon Shopping",
              reward_type: "CASHBACK",
              reward_rate_percentage: 5.0,
              point_monetary_value: 1.0,
            },
            {
              category_id: "dining",
              merchant_pattern: "Partner Dining, Swiggy, Zomato",
              reward_type: "CASHBACK",
              reward_rate_percentage: 2.0,
              point_monetary_value: 1.0,
            },
            {
              category_id: "grocery",
              merchant_pattern: "Amazon Fresh, Partner Supermarkets",
              reward_type: "CASHBACK",
              reward_rate_percentage: 2.0,
              point_monetary_value: 1.0,
            },
            {
              category_id: "utility",
              merchant_pattern: "Amazon Pay Recharges & Bill Payments",
              reward_type: "CASHBACK",
              reward_rate_percentage: 2.0,
              point_monetary_value: 1.0,
            },
            {
              category_id: "travel",
              merchant_pattern: "Flight and bus bookings via Amazon Pay",
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
            {
              category_id: "fuel",
              reward_type: "CASHBACK",
              reward_rate_percentage: 0.0,
              is_excluded: true,
              exclusion_reason: "Fuel spends excluded from cashback; 1% surcharge waiver applies",
            },
          ],
          benefits: [],
        }),
      });

      // 4. Add SBI Cashback Card
      await apiFetch("/cards", {
        method: "POST",
        body: JSON.stringify({
          card_name: "SBI Cashback Card",
          bank_name: "SBI Card",
          network: "VISA",
          card_type: "CASHBACK",
          card_variant: "Signature",
          last_four_digits: "4321",
          annual_fee: 999.0,
          renewal_waiver_spend: 200000.0,
          fee_waiver_condition_details: "Spend ₹2,00,000 in previous year to waive ₹999 annual fee.",
          terms_source_url: "https://www.sbicard.com/en/personal/credit-cards/rewards/cashback-sbi-card.page",
          billing_cycle_day: 10,
          rules: [
            {
              category_id: "shopping",
              merchant_pattern: "Online merchants, retail portals",
              reward_type: "CASHBACK",
              reward_rate_percentage: 5.0,
              point_monetary_value: 1.0,
              monthly_cap_amount: 5000.0,
            },
            {
              category_id: "dining",
              merchant_pattern: "Online food ordering",
              reward_type: "CASHBACK",
              reward_rate_percentage: 5.0,
              point_monetary_value: 1.0,
              monthly_cap_amount: 5000.0,
            },
            {
              category_id: "grocery",
              merchant_pattern: "Online quick commerce & supermarkets",
              reward_type: "CASHBACK",
              reward_rate_percentage: 5.0,
              point_monetary_value: 1.0,
              monthly_cap_amount: 5000.0,
            },
            {
              category_id: "travel",
              merchant_pattern: "Online flight & hotel bookings",
              reward_type: "CASHBACK",
              reward_rate_percentage: 5.0,
              point_monetary_value: 1.0,
              monthly_cap_amount: 5000.0,
            },
            {
              category_id: "utility",
              reward_type: "CASHBACK",
              reward_rate_percentage: 1.0,
              point_monetary_value: 1.0,
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
              exclusion_reason: "Fuel purchases excluded; 1% fuel surcharge waiver applies",
            },
          ],
          benefits: [],
        }),
      });

      // 5. Add Amex Platinum Travel
      await apiFetch("/cards", {
        method: "POST",
        body: JSON.stringify({
          card_name: "Amex Platinum Travel",
          bank_name: "American Express",
          network: "AMEX",
          card_type: "PREMIUM",
          card_variant: "Platinum",
          last_four_digits: "1008",
          annual_fee: 5000.0,
          renewal_waiver_spend: 400000.0,
          fee_waiver_condition_details: "Spend ₹4,00,000 for milestone Taj & travel vouchers.",
          terms_source_url: "https://www.americanexpress.com/in/credit-cards/platinum-travel-card/",
          billing_cycle_day: 25,
          rules: [
            {
              category_id: "travel",
              merchant_pattern: "Airlines, MakeMyTrip, Taj Hotels",
              reward_type: "REWARD_POINTS",
              reward_rate_percentage: 2.0,
              point_monetary_value: 0.5,
            },
            {
              category_id: "shopping",
              reward_type: "REWARD_POINTS",
              reward_rate_percentage: 1.0,
              point_monetary_value: 0.5,
            },
            {
              category_id: "dining",
              reward_type: "REWARD_POINTS",
              reward_rate_percentage: 1.0,
              point_monetary_value: 0.5,
            },
            {
              category_id: "grocery",
              reward_type: "REWARD_POINTS",
              reward_rate_percentage: 1.0,
              point_monetary_value: 0.5,
            },
            {
              category_id: "all",
              reward_type: "REWARD_POINTS",
              reward_rate_percentage: 1.0,
              point_monetary_value: 0.5,
            },
            {
              category_id: "utility",
              reward_type: "REWARD_POINTS",
              reward_rate_percentage: 0.0,
              is_excluded: true,
              exclusion_reason: "Utilities excluded from Membership Rewards accumulation",
            },
            {
              category_id: "fuel",
              reward_type: "REWARD_POINTS",
              reward_rate_percentage: 0.0,
              is_excluded: true,
              exclusion_reason: "Fuel spends excluded from Membership Rewards points",
            },
          ],
          benefits: [
            {
              benefit_type: "LOUNGE_ACCESS",
              title: "Complimentary Airport Lounge Access",
              description: "8 complimentary domestic lounge visits per year (2 per quarter).",
              annual_value_estimate: 6400.0,
            },
          ],
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
      <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3.5 py-1.5 rounded-full">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>{t.common.samplePortfolioInitialized}</span>
      </div>
    );
  }

  return (
    <button
      onClick={seedSamplePortfolio}
      disabled={loading}
      className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-emerald-400 hover:text-emerald-300 transition-all disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>{t.common.provisioningPortfolio}</span>
        </>
      ) : (
        <>
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.common.samplePortfolio}</span>
        </>
      )}
    </button>
  );
};
