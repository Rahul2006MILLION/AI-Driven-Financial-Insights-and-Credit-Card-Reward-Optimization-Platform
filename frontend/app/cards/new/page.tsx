"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage } from "@/lib/i18n";
import { api } from "@/lib/api";
import {
  BANK_ISSUERS,
  BankIssuer,
  CatalogueCard,
  CatalogueRule,
  CatalogueBenefit,
} from "@/lib/cardCatalogue";
import { DigitalCreditCard } from "@/components/DigitalCreditCard";
import {
  CreditCard as CardIcon,
  PlusCircle,
  Trash2,
  ArrowLeft,
  Loader2,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Building2,
  Layers,
  Award,
  Info,
} from "lucide-react";

export default function AddCreditCardPage() {
  const router = useRouter();
  const { t } = useLanguage();

  // Selection states
  const [selectedBankId, setSelectedBankId] = useState<string>("hdfc");
  const [selectedCardId, setSelectedCardId] = useState<string>("hdfc-regalia-gold");

  // Current Issuer & Card
  const currentBank = BANK_ISSUERS.find((b) => b.id === selectedBankId) || BANK_ISSUERS[0];
  const currentCatalogueCard =
    currentBank.cards.find((c) => c.id === selectedCardId) || currentBank.cards[0] || BANK_ISSUERS[9].cards[0];

  // Editable Form State
  const [cardholderName, setCardholderName] = useState("RAHUL JAIN");
  const [nickname, setNickname] = useState("");
  const [lastFour, setLastFour] = useState("");
  const [bankName, setBankName] = useState(currentCatalogueCard.bankName);
  const [cardName, setCardName] = useState(currentCatalogueCard.cardName);
  const [cardVariant, setCardVariant] = useState(currentCatalogueCard.cardVariant);
  const [network, setNetwork] = useState<"VISA" | "MASTERCARD" | "AMEX" | "RUPAY" | "DINERS">(
    currentCatalogueCard.defaultNetwork
  );
  const [joiningFee, setJoiningFee] = useState<number>(currentCatalogueCard.joiningFee);
  const [annualFee, setAnnualFee] = useState<number>(currentCatalogueCard.annualFee);
  const [waiverSpend, setWaiverSpend] = useState<number>(currentCatalogueCard.renewalWaiverSpend || 0);
  const [waiverDetails, setWaiverDetails] = useState(currentCatalogueCard.feeWaiverConditionDetails || "");
  const [cycleDay, setCycleDay] = useState<number>(currentCatalogueCard.billingCycleDay || 15);
  const [termsUrl, setTermsUrl] = useState(currentCatalogueCard.termsSourceUrl || "");
  const [badgeType, setBadgeType] = useState<"VERIFIED_CATALOGUE" | "MANUAL_CUSTOM">(
    currentCatalogueCard.badgeType
  );

  // Dynamic Rules & Benefits
  const [rules, setRules] = useState<CatalogueRule[]>(currentCatalogueCard.rules || []);
  const [benefits, setBenefits] = useState<CatalogueBenefit[]>(currentCatalogueCard.benefits || []);

  // UI Accordion Toggles
  const [showRulesAccordion, setShowRulesAccordion] = useState(true);
  const [showBenefitsAccordion, setShowBenefitsAccordion] = useState(true);

  // Form Submission
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Select a bank from the issuer grid
  const handleSelectBank = (issuer: BankIssuer) => {
    setSelectedBankId(issuer.id);
    const firstCard = issuer.cards[0];
    if (firstCard) {
      applyCardToForm(firstCard);
    }
  };

  // Select a card variant from the catalogue
  const applyCardToForm = (card: CatalogueCard) => {
    setSelectedCardId(card.id);
    setBankName(card.bankName);
    setCardName(card.cardName);
    setCardVariant(card.cardVariant);
    setNetwork(card.defaultNetwork);
    setJoiningFee(card.joiningFee);
    setAnnualFee(card.annualFee);
    setWaiverSpend(card.renewalWaiverSpend || 0);
    setWaiverDetails(card.feeWaiverConditionDetails || "");
    setCycleDay(card.billingCycleDay || 15);
    setTermsUrl(card.termsSourceUrl || "");
    setBadgeType(card.badgeType);
    setRules([...card.rules]);
    setBenefits([...card.benefits]);
    setError(null);
  };

  // Rule operations
  const addCustomRule = () => {
    setRules([
      ...rules,
      {
        category_id: "dining",
        merchant_pattern: "",
        reward_type: "CASHBACK",
        reward_rate_percentage: 2.0,
        point_monetary_value: 1.0,
        monthly_cap_amount: null,
      },
    ]);
  };

  const removeRule = (idx: number) => {
    setRules(rules.filter((_, i) => i !== idx));
  };

  const updateRuleField = (idx: number, field: keyof CatalogueRule, value: any) => {
    const updated = [...rules];
    updated[idx] = { ...updated[idx], [field]: value };
    setRules(updated);
  };

  // Benefit operations
  const addCustomBenefit = () => {
    setBenefits([
      ...benefits,
      {
        benefit_type: "LOUNGE_ACCESS",
        title: "Airport Lounge Access",
        description: "Complimentary airport lounge visits per calendar quarter.",
        applicable_category: "travel",
        reward_basis: "COMPLIMENTARY",
        annual_value_estimate: 3200,
      },
    ]);
  };

  const removeBenefit = (idx: number) => {
    setBenefits(benefits.filter((_, i) => i !== idx));
  };

  const updateBenefitField = (idx: number, field: keyof CatalogueBenefit, value: any) => {
    const updated = [...benefits];
    updated[idx] = { ...updated[idx], [field]: value };
    setBenefits(updated);
  };

  // Form Validation & Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // 1. Validate Cardholder Name
    if (!cardholderName.trim()) {
      setError("Please enter the cardholder name as displayed on the physical or virtual card.");
      return;
    }

    // 2. Validate Last 4 Digits if provided
    if (lastFour && (!/^[0-9]{4}$/.test(lastFour.trim()))) {
      setError("Last 4 digits must contain exactly 4 numeric digits (e.g. 8821).");
      return;
    }

    // 3. Validate Non-negative fees
    if (joiningFee < 0 || annualFee < 0 || waiverSpend < 0) {
      setError("Fees and renewal waiver thresholds cannot be negative numbers.");
      return;
    }

    // 4. Validate terms URL
    if (termsUrl && !termsUrl.startsWith("https://") && !termsUrl.startsWith("http://")) {
      setError("Official terms URL must begin with https:// or http://");
      return;
    }

    setLoading(true);

    try {
      await api.createCard({
        card_name: cardName.trim(),
        bank_name: bankName.trim(),
        cardholder_name: cardholderName.trim(),
        nickname: nickname.trim() || undefined,
        network: network,
        card_type: "CREDIT",
        card_variant: cardVariant.trim() || undefined,
        last_four_digits: lastFour.trim() || undefined,
        joining_fee: joiningFee,
        annual_fee: annualFee,
        renewal_waiver_spend: waiverSpend > 0 ? waiverSpend : undefined,
        fee_waiver_condition_details: waiverDetails.trim() || undefined,
        billing_cycle_day: cycleDay,
        terms_source_url: termsUrl.trim() || undefined,
        rules: rules.map((r) => ({
          category_id: r.category_id,
          merchant_pattern: r.merchant_pattern || undefined,
          reward_type: r.reward_type,
          reward_rate_percentage: r.reward_rate_percentage,
          point_monetary_value: r.point_monetary_value || 1.0,
          monthly_cap_amount: r.monthly_cap_amount || undefined,
          is_excluded: false,
        })),
        benefits: benefits.map((b) => ({
          benefit_type: b.benefit_type,
          title: b.title,
          description: b.description,
          applicable_category: b.applicable_category,
          reward_basis: b.reward_basis,
          annual_value_estimate: b.annual_value_estimate || 0,
        })),
      });

      setSuccessMessage("Credit card registered successfully! Redirecting to wallet...");
      setTimeout(() => {
        router.push("/cards");
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to add card. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-screen bg-[#040707]">
      <Sidebar />

      <main className="flex-1 p-5 sm:p-7 lg:p-9 max-w-7xl mx-auto w-full space-y-7">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.07] pb-5">
          <div className="space-y-1">
            <Link
              href="/cards"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Wallet</span>
            </Link>
            <h1 className="text-3xl font-black text-white tracking-tight glow-emerald">
              Add Credit Card
            </h1>
            <p className="text-xs text-slate-400">
              Select an issuer catalogue or customize your own card specifications
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero PAN / CVV Storage</span>
            </div>
          </div>
        </div>

        {/* STEP 1: Select Issuing Bank */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>1. Select Card Issuer</span>
            </h2>
            <span className="text-xs text-slate-500">10 Issuers</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {BANK_ISSUERS.map((issuer) => {
              const isSelected = issuer.id === selectedBankId;
              return (
                <button
                  key={issuer.id}
                  type="button"
                  onClick={() => handleSelectBank(issuer)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-24 backdrop-blur-xl ${
                    isSelected
                      ? `bg-emerald-500/15 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/50`
                      : `bg-white/[0.02] border-white/[0.07] hover:border-emerald-500/30 hover:bg-white/[0.04]`
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-extrabold text-xs tracking-wider text-white">
                      {issuer.shortName}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-cliq-cyan" />
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-cliq-textPrimary truncate">
                      {issuer.name}
                    </div>
                    <div className="text-[9px] text-cliq-textSecondary mt-0.5">
                      {issuer.cards.length} {issuer.cards.length === 1 ? "card" : "cards"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: Select Card Variant from Bank Catalogue */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-cliq-cyan flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>2. Select Card Variant</span>
            </h2>
            <span className="text-xs text-cliq-textSecondary">
              Pre-configured with official rewards & benefits
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentBank.cards.map((card) => {
              const isSelected = card.id === selectedCardId;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => applyCardToForm(card)}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? `bg-cliq-surface border-cliq-cyan ring-1 ring-cliq-cyan shadow-md shadow-cliq-cyan/10`
                      : `bg-cliq-surface/50 border-cliq-border hover:border-cliq-cyan/40 hover:bg-cliq-surface`
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cliq-cyan/10 text-cliq-cyan border border-cliq-cyan/20">
                        {card.cardVariant}
                      </span>
                      {card.badgeType === "VERIFIED_CATALOGUE" ? (
                        <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-400">
                          Custom
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {card.cardName}
                    </h3>
                    <p className="text-xs text-cliq-turquoise font-medium mt-0.5">
                      {card.highlightTag}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-cliq-border/60 flex items-center justify-between text-[11px] text-cliq-textSecondary">
                    <div>
                      Annual Fee:{" "}
                      <span className="text-white font-semibold">
                        {card.annualFee === 0 ? "FREE" : `₹${card.annualFee.toLocaleString("en-IN")}`}
                      </span>
                    </div>
                    <div>
                      Network: <span className="text-white font-semibold">{card.defaultNetwork}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 3: Two-Column Form & Real-Time Interactive Card Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-cliq-cyan flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>3. Review, Customize & Save Card</span>
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-cliq-textSecondary">
              <Info className="w-3.5 h-3.5 text-cliq-cyan" />
              <span>Card preview updates in real time</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Specification & Customization Form */}
            <div className="lg:col-span-7 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error / Success Notifications */}
                {error && (
                  <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 text-red-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1 font-medium">{error}</div>
                  </div>
                )}
                {successMessage && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex-1 font-medium">{successMessage}</div>
                  </div>
                )}

                {/* Primary Card Identity Section */}
                <div className="p-5 rounded-2xl bg-cliq-surface border border-cliq-border space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-cliq-border/60">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Card Identity & Specifications</span>
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        badgeType === "VERIFIED_CATALOGUE"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {badgeType === "VERIFIED_CATALOGUE" ? "Verified Bank Data" : "Custom Manual"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Cardholder Name */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-cliq-textSecondary flex items-center justify-between">
                        <span>Cardholder Name *</span>
                        <span className="text-[10px] text-cliq-cyan">Appears on card face</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        placeholder="e.g. PRIYA SHARMA"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-sm focus:outline-none focus:border-cliq-cyan font-medium uppercase"
                      />
                    </div>

                    {/* Card Name */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-cliq-textSecondary">
                        Card Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs focus:outline-none focus:border-cliq-cyan"
                      />
                    </div>

                    {/* Bank Name */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-cliq-textSecondary">
                        Issuing Bank *
                      </label>
                      <input
                        type="text"
                        required
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs focus:outline-none focus:border-cliq-cyan"
                      />
                    </div>

                    {/* Network Selector */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-cliq-textSecondary">
                        Payment Network *
                      </label>
                      <select
                        value={network}
                        onChange={(e) => setNetwork(e.target.value as any)}
                        className="w-full px-3.5 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs focus:outline-none focus:border-cliq-cyan"
                      >
                        <option value="VISA">VISA</option>
                        <option value="MASTERCARD">Mastercard</option>
                        <option value="AMEX">American Express</option>
                        <option value="RUPAY">RuPay</option>
                        <option value="DINERS">Diners Club</option>
                      </select>
                    </div>

                    {/* Card Variant */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-cliq-textSecondary">
                        Variant / Tier
                      </label>
                      <input
                        type="text"
                        value={cardVariant}
                        onChange={(e) => setCardVariant(e.target.value)}
                        placeholder="e.g. Signature, Metal, Infinite"
                        className="w-full px-3.5 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs focus:outline-none focus:border-cliq-cyan"
                      />
                    </div>

                    {/* Optional Nickname */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-cliq-textSecondary">
                        Nickname (Optional)
                      </label>
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="e.g. Primary Travel, Daily Groceries"
                        className="w-full px-3.5 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs focus:outline-none focus:border-cliq-cyan"
                      />
                    </div>

                    {/* Last 4 Digits */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-cliq-textSecondary flex items-center justify-between">
                        <span>Last 4 Digits (Optional)</span>
                        <span className="text-[10px] text-emerald-400">Safe: masked only</span>
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={lastFour}
                        onChange={(e) => setLastFour(e.target.value.replace(/\D/g, ""))}
                        placeholder="e.g. 8821"
                        className="w-full px-3.5 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs font-mono focus:outline-none focus:border-cliq-cyan"
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Specifications & Fee Waivers */}
                <div className="p-5 rounded-2xl bg-cliq-surface border border-cliq-border space-y-4">
                  <h3 className="text-sm font-bold text-white pb-3 border-b border-cliq-border/60">
                    Annual Fees & Renewal Waiver Spend
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-cliq-textSecondary">
                        Joining Fee (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={joiningFee}
                        onChange={(e) => setJoiningFee(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs focus:outline-none focus:border-cliq-cyan"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-cliq-textSecondary">
                        Annual Fee (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={annualFee}
                        onChange={(e) => setAnnualFee(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs focus:outline-none focus:border-cliq-cyan"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-cliq-textSecondary">
                        Renewal Waiver Spend (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={waiverSpend}
                        onChange={(e) => setWaiverSpend(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs focus:outline-none focus:border-cliq-cyan"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-cliq-textSecondary">
                        Waiver Condition Details
                      </label>
                      <input
                        type="text"
                        value={waiverDetails}
                        onChange={(e) => setWaiverDetails(e.target.value)}
                        placeholder="e.g. Spend ₹4,00,000 in anniversary year to waive fee."
                        className="w-full px-3.5 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs focus:outline-none focus:border-cliq-cyan"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-cliq-textSecondary">
                        Billing Cycle Day
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={cycleDay}
                        onChange={(e) => setCycleDay(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs focus:outline-none focus:border-cliq-cyan"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-3">
                      <label className="text-xs font-semibold text-cliq-textSecondary flex items-center justify-between">
                        <span>Official Terms & Schedule of Charges URL</span>
                        {termsUrl && termsUrl.startsWith("https://") && (
                          <a
                            href={termsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-cliq-cyan hover:underline flex items-center gap-1"
                          >
                            <span>Open URL</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </label>
                      <input
                        type="url"
                        value={termsUrl}
                        onChange={(e) => setTermsUrl(e.target.value)}
                        placeholder="https://www.bank.com/credit-card-terms"
                        className="w-full px-3.5 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs focus:outline-none focus:border-cliq-cyan"
                      />
                    </div>
                  </div>
                </div>

                {/* Expandable Accordion: Category Multipliers & Reward Rules */}
                <div className="rounded-2xl bg-cliq-surface border border-cliq-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowRulesAccordion(!showRulesAccordion)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-cliq-surfaceHover/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cliq-cyan" />
                      <span className="text-sm font-bold text-white">
                        Category Multipliers & Reward Rules ({rules.length})
                      </span>
                    </div>
                    {showRulesAccordion ? (
                      <ChevronUp className="w-4 h-4 text-cliq-textSecondary" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-cliq-textSecondary" />
                    )}
                  </button>

                  {showRulesAccordion && (
                    <div className="p-5 pt-0 space-y-3 border-t border-cliq-border/60">
                      <p className="text-xs text-cliq-textSecondary">
                        CLIQ's optimization engine uses these rules to evaluate real net cashback and points on every spend.
                      </p>

                      <div className="space-y-3">
                        {rules.map((rule, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-cliq-surfaceHover/70 border border-cliq-border space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-cliq-cyan">
                                Rule #{idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeRule(idx)}
                                className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] text-cliq-textSecondary font-semibold">
                                  Category
                                </label>
                                <select
                                  value={rule.category_id}
                                  onChange={(e) => updateRuleField(idx, "category_id", e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-cliq-surface border border-cliq-border text-white text-xs"
                                >
                                  <option value="all">All Retail Spends</option>
                                  <option value="shopping">Shopping / E-commerce</option>
                                  <option value="dining">Dining & Food Delivery</option>
                                  <option value="travel">Travel & Flights</option>
                                  <option value="grocery">Grocery & Supermarket</option>
                                  <option value="utility">Utility Bills</option>
                                  <option value="fuel">Fuel</option>
                                  <option value="entertainment">Entertainment & Movies</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] text-cliq-textSecondary font-semibold">
                                  Reward Type
                                </label>
                                <select
                                  value={rule.reward_type}
                                  onChange={(e) => updateRuleField(idx, "reward_type", e.target.value as any)}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-cliq-surface border border-cliq-border text-white text-xs"
                                >
                                  <option value="CASHBACK">Direct Cashback (%)</option>
                                  <option value="REWARD_POINTS">Reward Points</option>
                                  <option value="MILES">Airlines Miles</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] text-cliq-textSecondary font-semibold">
                                  Rate (% or Pts per 100)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={rule.reward_rate_percentage}
                                  onChange={(e) =>
                                    updateRuleField(idx, "reward_rate_percentage", parseFloat(e.target.value) || 0)
                                  }
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-cliq-surface border border-cliq-border text-white text-xs"
                                />
                              </div>

                              <div className="space-y-1 sm:col-span-2">
                                <label className="text-[10px] text-cliq-textSecondary font-semibold">
                                  Merchant Pattern (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={rule.merchant_pattern || ""}
                                  onChange={(e) => updateRuleField(idx, "merchant_pattern", e.target.value)}
                                  placeholder="e.g. Amazon, Swiggy, Flipkart"
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-cliq-surface border border-cliq-border text-white text-xs"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] text-cliq-textSecondary font-semibold">
                                  Monthly Cap (₹)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="No cap"
                                  value={rule.monthly_cap_amount ?? ""}
                                  onChange={(e) =>
                                    updateRuleField(
                                      idx,
                                      "monthly_cap_amount",
                                      e.target.value ? parseFloat(e.target.value) : null
                                    )
                                  }
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-cliq-surface border border-cliq-border text-white text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={addCustomRule}
                          className="w-full py-2.5 rounded-xl border border-dashed border-cliq-cyan/40 hover:border-cliq-cyan text-cliq-cyan hover:bg-cliq-cyan/5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>Add Reward Rule</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expandable Accordion: Lounge & Premium Benefits */}
                <div className="rounded-2xl bg-cliq-surface border border-cliq-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowBenefitsAccordion(!showBenefitsAccordion)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-cliq-surfaceHover/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cliq-turquoise" />
                      <span className="text-sm font-bold text-white">
                        Lounge & Premium Benefits ({benefits.length})
                      </span>
                    </div>
                    {showBenefitsAccordion ? (
                      <ChevronUp className="w-4 h-4 text-cliq-textSecondary" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-cliq-textSecondary" />
                    )}
                  </button>

                  {showBenefitsAccordion && (
                    <div className="p-5 pt-0 space-y-3 border-t border-cliq-border/60">
                      <div className="space-y-3">
                        {benefits.map((benefit, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-cliq-surfaceHover/70 border border-cliq-border space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-cliq-turquoise">
                                {benefit.title}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeBenefit(idx)}
                                className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            </div>

                            <p className="text-xs text-cliq-textSecondary">
                              {benefit.description}
                            </p>

                            <div className="flex items-center justify-between text-[11px] text-white/80 pt-1">
                              <span>Type: {benefit.benefit_type}</span>
                              <span>Est. Annual Value: ₹{benefit.annual_value_estimate.toLocaleString("en-IN")}</span>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={addCustomBenefit}
                          className="w-full py-2.5 rounded-xl border border-dashed border-cliq-turquoise/40 hover:border-cliq-turquoise text-cliq-turquoise hover:bg-cliq-turquoise/5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>Add Lounge / Custom Perk</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Privacy Safeguard Note */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs text-slate-300 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-white">Privacy Safeguard & Data Minimization</p>
                    <p className="text-slate-400">
                      CLIQ never solicits or stores primary account numbers (PAN), CVVs, expiration credentials, or net banking passwords. Only authorized reward rules and your reference alias are saved.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cliq-cyan via-cliq-turquoise to-emerald-400 text-cliq-navy font-extrabold text-sm hover:opacity-95 shadow-lg shadow-cliq-cyan/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Registering Credit Card...</span>
                      </>
                    ) : (
                      <>
                        <CardIcon className="w-4 h-4" />
                        <span>Save to Credit Card Wallet</span>
                      </>
                    )}
                  </button>

                  <Link
                    href="/cards"
                    className="py-3.5 px-5 rounded-xl bg-cliq-surface border border-cliq-border hover:bg-cliq-surfaceHover text-white text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>

            {/* RIGHT COLUMN: Sticky Real-Time Interactive Digital Card Preview */}
            <div className="lg:col-span-5 sticky top-6 space-y-5">
              <div className="p-4 rounded-2xl bg-cliq-surface border border-cliq-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cliq-cyan flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cliq-turquoise" />
                    <span>Live Interactive Card</span>
                  </span>
                  <span className="text-[10px] text-cliq-textSecondary">
                    Hover to tilt 3D sheen
                  </span>
                </div>

                {/* Digital Card Preview Component */}
                <div className="py-2">
                  <DigitalCreditCard
                    bankName={bankName}
                    cardName={cardName}
                    cardVariant={cardVariant}
                    cardholderName={cardholderName}
                    nickname={nickname}
                    lastFourDigits={lastFour}
                    network={network}
                    className="max-w-[420px] mx-auto"
                  />
                </div>

                {/* Card Specs Summary Underneath */}
                <div className="space-y-3 pt-2 border-t border-cliq-border/60">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-cliq-surfaceHover/60 border border-cliq-border">
                      <span className="text-[10px] text-cliq-textSecondary block">Annual Fee</span>
                      <span className="font-bold text-white text-sm">
                        {annualFee === 0 ? "FREE" : `₹${annualFee.toLocaleString("en-IN")}`}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-cliq-surfaceHover/60 border border-cliq-border">
                      <span className="text-[10px] text-cliq-textSecondary block">Renewal Waiver</span>
                      <span className="font-bold text-emerald-400 text-sm">
                        {waiverSpend > 0 ? `₹${waiverSpend.toLocaleString("en-IN")}` : "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Highlights Pill List */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-cliq-textSecondary">
                      Reward Highlights
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {rules.slice(0, 3).map((r, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded-md bg-cliq-cyan/10 border border-cliq-cyan/20 text-cliq-cyan text-[10px] font-semibold"
                        >
                          {r.reward_rate_percentage}% {r.category_id}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Top Benefit Pill */}
                  {benefits.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-cliq-cyan/5 border border-cliq-cyan/20 text-xs">
                      <div className="flex items-center gap-1.5 text-cliq-turquoise font-semibold text-[11px] mb-0.5">
                        <Sparkles className="w-3 h-3" />
                        <span>Key Perk</span>
                      </div>
                      <p className="text-white text-[11px] font-medium truncate">
                        {benefits[0].title}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
