"use client";

import React, { useState } from "react";
import Link from "next/link";
import { api, CreditCard } from "@/lib/api";
import {
  BANK_ISSUERS,
  BankIssuer,
  CatalogueCard,
  CatalogueRule,
  CatalogueBenefit,
} from "@/lib/cardCatalogue";
import { DigitalCreditCard } from "@/components/DigitalCreditCard";
import { DemoBootstrap } from "@/components/DemoBootstrap";
import {
  CreditCard as CardIcon,
  Building2,
  Layers,
  Award,
  Zap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Trash2,
  Loader2,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Info,
  X,
} from "lucide-react";

interface CardSelectionFlowProps {
  onCardAdded: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export function CardSelectionFlow({
  onCardAdded,
  onCancel,
  isModal = false,
}: CardSelectionFlowProps) {
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
  const [showRulesAccordion, setShowRulesAccordion] = useState(false);
  const [showBenefitsAccordion, setShowBenefitsAccordion] = useState(false);

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
    if (lastFour && !/^[0-9]{4}$/.test(lastFour.trim())) {
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

      setSuccessMessage("Card successfully added! Updating your digital collection...");
      setTimeout(() => {
        onCardAdded();
      }, 700);
    } catch (err: any) {
      setError(err.message || "Failed to add card. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome & Instruction Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cliq-surface via-[#0F1B3A] to-cliq-surface border border-cliq-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cliq-cyan/10 border border-cliq-cyan/30 text-cliq-cyan text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Onboarding</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Select Your Card to Build Your Digital Wallet
          </h2>
          <p className="text-xs sm:text-sm text-cliq-textSecondary max-w-2xl">
            Choose from 10 verified Indian credit card catalogues with real fee schedules and reward multipliers, or enter a custom card.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero PAN / CVV Storage</span>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 rounded-lg text-cliq-textSecondary hover:text-white hover:bg-cliq-surfaceHover"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* STEP 1: Select Issuing Bank */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cliq-cyan flex items-center gap-1.5">
            <Building2 className="w-4 h-4" />
            <span>1. Select Card Issuer</span>
          </h3>
          <span className="text-xs text-cliq-textSecondary">10 Issuers Available</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {BANK_ISSUERS.map((issuer) => {
            const isSelected = issuer.id === selectedBankId;
            return (
              <button
                key={issuer.id}
                type="button"
                onClick={() => handleSelectBank(issuer)}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between h-20 ${
                  isSelected
                    ? "bg-cliq-surface border-cliq-cyan shadow-md shadow-cliq-cyan/15 ring-1 ring-cliq-cyan"
                    : "bg-cliq-surface/60 border-cliq-border hover:border-cliq-cyan/50 hover:bg-cliq-surface"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-extrabold text-xs tracking-wider text-white">
                    {issuer.shortName}
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cliq-cyan" />}
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-cliq-textPrimary truncate">
                    {issuer.name}
                  </div>
                  <div className="text-[9px] text-cliq-textSecondary">
                    {issuer.cards.length} {issuer.cards.length === 1 ? "card" : "cards"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: Select Card Variant */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cliq-cyan flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            <span>2. Select Card Variant</span>
          </h3>
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
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-cliq-surface border-cliq-cyan ring-1 ring-cliq-cyan shadow-md shadow-cliq-cyan/10"
                    : "bg-cliq-surface/50 border-cliq-border hover:border-cliq-cyan/40 hover:bg-cliq-surface"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cliq-cyan/10 text-cliq-cyan border border-cliq-cyan/20">
                      {card.cardVariant}
                    </span>
                    {card.badgeType === "VERIFIED_CATALOGUE" ? (
                      <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-400">Custom</span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {card.cardName}
                  </h4>
                  <p className="text-xs text-cliq-turquoise font-medium mt-0.5">
                    {card.highlightTag}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-cliq-border/60 flex items-center justify-between text-[11px] text-cliq-textSecondary">
                  <div>
                    Fee:{" "}
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

      {/* STEP 3: Two-Column Form & Real-Time Live Preview */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cliq-cyan flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            <span>3. Review, Personalize & Save to Wallet</span>
          </h3>
          <div className="flex items-center gap-1 text-xs text-cliq-textSecondary">
            <Info className="w-3.5 h-3.5 text-cliq-cyan" />
            <span>Updates live in preview</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Side */}
          <div className="lg:col-span-7 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-5">
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

              {/* Identity Fields */}
              <div className="p-5 rounded-2xl bg-cliq-surface border border-cliq-border space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-cliq-textSecondary flex items-center justify-between">
                      <span>Cardholder Name *</span>
                      <span className="text-[10px] text-cliq-cyan">Appears on card</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      placeholder="e.g. RAHUL JAIN"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-sm focus:outline-none focus:border-cliq-cyan uppercase font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-cliq-textSecondary">Card Name *</label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs focus:outline-none focus:border-cliq-cyan"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-cliq-textSecondary">Issuing Bank *</label>
                    <input
                      type="text"
                      required
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs focus:outline-none focus:border-cliq-cyan"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-cliq-textSecondary">Payment Network *</label>
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

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-cliq-textSecondary">Variant / Tier</label>
                    <input
                      type="text"
                      value={cardVariant}
                      onChange={(e) => setCardVariant(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs focus:outline-none focus:border-cliq-cyan"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-cliq-textSecondary">Nickname (Optional)</label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="e.g. Primary Travel"
                      className="w-full px-3.5 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs focus:outline-none focus:border-cliq-cyan"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-cliq-textSecondary flex items-center justify-between">
                      <span>Last 4 Digits (Optional)</span>
                      <span className="text-[10px] text-emerald-400">Safe masked</span>
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

              {/* Fees and Waivers */}
              <div className="p-5 rounded-2xl bg-cliq-surface border border-cliq-border space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-cliq-textSecondary">Joining Fee (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={joiningFee}
                      onChange={(e) => setJoiningFee(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-cliq-textSecondary">Annual Fee (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={annualFee}
                      onChange={(e) => setAnnualFee(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-cliq-textSecondary">Waiver Spend (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={waiverSpend}
                      onChange={(e) => setWaiverSpend(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-3">
                    <label className="text-xs font-semibold text-cliq-textSecondary">Waiver Condition</label>
                    <input
                      type="text"
                      value={waiverDetails}
                      onChange={(e) => setWaiverDetails(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cliq-cyan via-cliq-turquoise to-emerald-400 text-cliq-navy font-extrabold text-sm hover:opacity-95 shadow-lg shadow-cliq-cyan/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Adding to Wallet...</span>
                    </>
                  ) : (
                    <>
                      <CardIcon className="w-4 h-4" />
                      <span>Add Card to My Collection</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview Side */}
          <div className="lg:col-span-5 sticky top-6 space-y-4">
            <div className="p-4 rounded-2xl bg-cliq-surface border border-cliq-border space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-cliq-cyan flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cliq-turquoise" />
                <span>Live Card Preview</span>
              </span>

              <DigitalCreditCard
                bankName={bankName}
                cardName={cardName}
                cardVariant={cardVariant}
                cardholderName={cardholderName}
                nickname={nickname}
                lastFourDigits={lastFour}
                network={network}
                className="max-w-[380px] mx-auto"
              />

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-cliq-border/60">
                <div className="p-2.5 rounded-xl bg-cliq-surfaceHover/60 border border-cliq-border">
                  <span className="text-[10px] text-cliq-textSecondary block">Annual Fee</span>
                  <span className="font-bold text-white">
                    {annualFee === 0 ? "FREE" : `₹${annualFee.toLocaleString("en-IN")}`}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-cliq-surfaceHover/60 border border-cliq-border">
                  <span className="text-[10px] text-cliq-textSecondary block">Waiver Spend</span>
                  <span className="font-bold text-emerald-400">
                    {waiverSpend > 0 ? `₹${waiverSpend.toLocaleString("en-IN")}` : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Demo Seed Option */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cliq-surface to-cliq-cyan/5 border border-cliq-cyan/20 space-y-2">
              <div className="flex items-center gap-2 text-cliq-cyan text-xs font-bold">
                <Zap className="w-4 h-4 text-cliq-turquoise" />
                <span>Want to test the Fan Collection immediately?</span>
              </div>
              <p className="text-[11px] text-cliq-textSecondary">
                Instantly seed 3 sample cards (HDFC Millennia, SBI Cashback, Axis Ace) to test the interactive fan hand.
              </p>
              <div className="pt-1">
                <DemoBootstrap onSeeded={onCardAdded} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

