"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage } from "@/lib/i18n";
import { api, CreditCard } from "@/lib/api";
import { DemoBootstrap } from "@/components/DemoBootstrap";
import {
  CreditCard as CardIcon,
  PlusCircle,
  GitCompare,
  Trash2,
  Shield,
  Zap,
  Info,
  Loader2,
  Calendar,
  Search,
  ExternalLink,
  Edit2,
  X,
  CheckCircle2,
  AlertCircle,
  Award,
  Filter,
} from "lucide-react";

export default function MyCreditCardsPage() {
  const { t } = useLanguage();
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState<string>("ALL");
  const [selectedBank, setSelectedBank] = useState<string>("ALL");
  const [selectedCardForDetails, setSelectedCardForDetails] = useState<CreditCard | null>(null);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [editForm, setEditForm] = useState({
    card_name: "",
    bank_name: "",
    network: "VISA",
    card_variant: "",
    annual_fee: 0,
    renewal_waiver_spend: 0,
    fee_waiver_condition_details: "",
    terms_source_url: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCards = async () => {
    try {
      const data = await api.getCards({
        query: searchQuery || undefined,
        network: selectedNetwork !== "ALL" ? selectedNetwork : undefined,
        bank: selectedBank !== "ALL" ? selectedBank : undefined,
      });
      setCards(data || []);
    } catch (err) {
      console.error("Failed to load cards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [searchQuery, selectedNetwork, selectedBank]);

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("Are you sure you want to deactivate this credit card?")) return;
    setDeletingId(cardId);
    try {
      await api.deleteCard(cardId);
      await fetchCards();
    } catch (err) {
      alert("Failed to delete card: " + err);
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (card: CreditCard) => {
    setEditingCard(card);
    setEditForm({
      card_name: card.card_name,
      bank_name: card.bank_name,
      network: card.network,
      card_variant: card.card_variant || "",
      annual_fee: Number(card.annual_fee),
      renewal_waiver_spend: Number(card.renewal_waiver_spend || 0),
      fee_waiver_condition_details: card.fee_waiver_condition_details || "",
      terms_source_url: card.terms_source_url || "",
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;
    setSavingEdit(true);
    try {
      await api.updateCard(editingCard.id, {
        card_name: editForm.card_name,
        bank_name: editForm.bank_name,
        network: editForm.network as any,
        card_variant: editForm.card_variant || undefined,
        annual_fee: editForm.annual_fee,
        renewal_waiver_spend: editForm.renewal_waiver_spend || undefined,
        fee_waiver_condition_details: editForm.fee_waiver_condition_details || undefined,
        terms_source_url: editForm.terms_source_url || undefined,
      });
      setEditingCard(null);
      await fetchCards();
    } catch (err: any) {
      alert("Failed to update card: " + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const uniqueBanks = Array.from(new Set(cards.map((c) => c.bank_name))).filter(Boolean);

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
              <CardIcon className="w-8 h-8 text-cliq-cyan" />
              <span>{t.cards.title}</span>
            </h1>
            <p className="text-xs text-cliq-textSecondary mt-1">{t.cards.subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/offers"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cliq-surface hover:bg-cliq-surfaceHover border border-cliq-cyan/40 text-cliq-cyan font-bold text-xs shadow-sm transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-cliq-turquoise" />
              <span>Active Card Offers</span>
            </Link>
            <Link
              href="/cards/compare"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cliq-surface hover:bg-cliq-surfaceHover border border-cliq-border text-white font-semibold text-xs transition-colors"
            >
              <GitCompare className="w-3.5 h-3.5 text-cliq-turquoise" />
              <span>{t.cards.compare}</span>
            </Link>
            <Link
              href="/cards/new"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cliq-cyan to-cliq-emerald text-cliq-bg font-bold text-xs shadow-neonCyan hover:opacity-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t.cards.addNew}</span>
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-cliq-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by card name, bank, or variant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-cliq-surface border border-cliq-border rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-cliq-textMuted focus:border-cliq-cyan focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1 text-xs text-cliq-textMuted">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </div>

            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="bg-cliq-surface border border-cliq-border text-white text-xs rounded-xl px-3 py-2 focus:border-cliq-cyan focus:outline-none"
            >
              <option value="ALL">All Networks</option>
              <option value="VISA">Visa</option>
              <option value="MASTERCARD">Mastercard</option>
              <option value="RUPAY">RuPay</option>
              <option value="AMEX">Amex</option>
              <option value="DINERS">Diners Club</option>
            </select>

            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="bg-cliq-surface border border-cliq-border text-white text-xs rounded-xl px-3 py-2 focus:border-cliq-cyan focus:outline-none"
            >
              <option value="ALL">All Issuers</option>
              {uniqueBanks.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Card Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-cliq-cyan mx-auto" />
            <p className="text-xs text-cliq-textSecondary mt-2">Loading your card wallet...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center space-y-4 max-w-lg mx-auto">
            <CardIcon className="w-12 h-12 text-cliq-cyan mx-auto opacity-75" />
            <h3 className="text-lg font-bold text-white">No Registered Cards Match Your Filter</h3>
            <p className="text-xs text-cliq-textSecondary">
              Add your existing cards to unlock personalized reward calculations, instant coupon discovery, and fee waiver tracking.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <DemoBootstrap onSeeded={fetchCards} />
              <Link
                href="/cards/new"
                className="px-4 py-2 rounded-xl bg-cliq-cyan text-cliq-bg font-bold text-xs"
              >
                Add Custom Card
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => {
              const annualFeeNum = Number(card.annual_fee);
              const waiverSpendNum = card.renewal_waiver_spend ? Number(card.renewal_waiver_spend) : null;

              return (
                <div
                  key={card.id}
                  className="glass-panel rounded-2xl p-6 border-cliq-border hover:border-cliq-cyan/40 transition-all flex flex-col justify-between relative group"
                >
                  <div>
                    {/* Network & Variant Tag */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-cliq-surface border border-cliq-border text-cliq-cyan">
                          {card.network}
                        </span>
                        {card.card_variant && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cliq-surfaceHover text-cliq-turquoise border border-cliq-turquoise/30">
                            {card.card_variant}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-cliq-textMuted">
                        {card.last_four_digits ? `•••• ${card.last_four_digits}` : "Active"}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-white group-hover:text-cliq-cyan transition-colors">
                      {card.card_name}
                    </h3>
                    <div className="text-xs text-cliq-textSecondary mt-0.5">
                      {card.bank_name} • {card.card_type}
                    </div>

                    {/* Fees & Waiver Conditions */}
                    <div className="mt-4 pt-3 border-t border-cliq-border/60 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-cliq-textMuted block">Annual Fee</span>
                        <span className="font-bold text-white">
                          {annualFeeNum === 0 ? "Lifetime Free" : `₹${annualFeeNum.toLocaleString("en-IN")}`}
                        </span>
                      </div>
                      {waiverSpendNum ? (
                        <div>
                          <span className="text-[10px] text-cliq-textMuted block">Spend Waiver</span>
                          <span className="font-bold text-cliq-turquoise">
                            ₹{waiverSpendNum.toLocaleString("en-IN")}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[10px] text-cliq-textMuted block">Renewal Date</span>
                          <span className="text-white font-medium">
                            {card.renewal_date ? new Date(card.renewal_date).toLocaleDateString() : "Annual"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Reward Rules Snapshot */}
                    <div className="mt-4 pt-3 border-t border-cliq-border/60">
                      <div className="text-[11px] font-bold text-white flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-cliq-cyan" />
                          <span>{t.cards.rules}</span>
                        </div>
                        <span className="text-[10px] text-cliq-textMuted font-mono">
                          {card.reward_rules?.length || 0} active
                        </span>
                      </div>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                        {card.reward_rules?.map((rule: any) => (
                          <div
                            key={rule.id}
                            className="text-[11px] p-2 rounded-lg bg-cliq-surface flex items-center justify-between"
                          >
                            <span className="text-cliq-textSecondary truncate max-w-[140px]">
                              {rule.merchant_pattern || rule.category_id}
                            </span>
                            {rule.is_excluded ? (
                              <span className="text-cliq-danger font-semibold text-[10px]">
                                Excluded (0%)
                              </span>
                            ) : (
                              <span className="text-cliq-emerald font-bold">
                                {rule.reward_rate_percentage}% {rule.reward_type}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Benefits Preview */}
                    {card.benefits && card.benefits.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-cliq-border/60">
                        <div className="text-[11px] font-bold text-white flex items-center gap-1 mb-1">
                          <Shield className="w-3.5 h-3.5 text-cliq-emerald" />
                          <span>Key Benefits</span>
                        </div>
                        <p className="text-[11px] text-cliq-textSecondary line-clamp-2">
                          {card.benefits.map((b: any) => b.title).join(" • ")}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-6 pt-4 border-t border-cliq-border flex items-center justify-between">
                    <button
                      onClick={() => setSelectedCardForDetails(card)}
                      className="text-xs font-semibold text-cliq-cyan hover:underline flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Full Details & Rules</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(card)}
                        title="Edit Card Details"
                        className="p-1.5 rounded-lg text-cliq-textSecondary hover:text-cliq-cyan hover:bg-cliq-surface transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        disabled={deletingId === card.id}
                        className="p-1.5 rounded-lg text-cliq-textMuted hover:text-cliq-danger hover:bg-cliq-surface transition-colors"
                        title="Deactivate Card"
                      >
                        {deletingId === card.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-cliq-danger" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Card Details & Full Benefit Manifesto */}
        {selectedCardForDetails && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-panel border-cliq-cyan/30 rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6">
              <div className="flex items-start justify-between border-b border-cliq-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cliq-surface text-cliq-cyan border border-cliq-border">
                      {selectedCardForDetails.network}
                    </span>
                    {selectedCardForDetails.card_variant && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cliq-surface text-cliq-turquoise border border-cliq-turquoise/30">
                        {selectedCardForDetails.card_variant}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-extrabold text-white mt-1">
                    {selectedCardForDetails.card_name}
                  </h2>
                  <p className="text-xs text-cliq-textSecondary">
                    Issued by {selectedCardForDetails.bank_name} • {selectedCardForDetails.card_type}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCardForDetails(null)}
                  className="p-1 rounded-lg text-cliq-textSecondary hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Fee & Waiver Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-cliq-surface border border-cliq-border text-xs">
                <div>
                  <span className="text-[10px] text-cliq-textMuted block">Joining / Annual Fee</span>
                  <span className="font-bold text-white text-sm">
                    ₹{Number(selectedCardForDetails.annual_fee).toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-cliq-textMuted block">Fee Waiver Target</span>
                  <span className="font-bold text-cliq-turquoise text-sm">
                    {selectedCardForDetails.renewal_waiver_spend
                      ? `₹${Number(selectedCardForDetails.renewal_waiver_spend).toLocaleString("en-IN")}`
                      : "None"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-cliq-textMuted block">Billing Cycle</span>
                  <span className="font-medium text-white">
                    Day {selectedCardForDetails.billing_cycle_day || 15} of each month
                  </span>
                </div>
                {selectedCardForDetails.fee_waiver_condition_details && (
                  <div className="sm:col-span-3 pt-2 border-t border-cliq-border/60 text-cliq-textSecondary text-[11px]">
                    <span className="font-bold text-white">Waiver Condition: </span>
                    {selectedCardForDetails.fee_waiver_condition_details}
                  </div>
                )}
              </div>

              {/* Complete Rules Table */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-cliq-cyan" />
                  <span>Verified Reward Multipliers & Caps</span>
                </h4>
                <div className="space-y-2">
                  {selectedCardForDetails.reward_rules?.map((rule: any) => (
                    <div
                      key={rule.id}
                      className="p-3 rounded-xl bg-cliq-surface border border-cliq-border flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">
                          {rule.merchant_pattern ? `Merchant: ${rule.merchant_pattern}` : `Category: ${rule.category_id}`}
                        </div>
                        <div className="text-[10px] text-cliq-textMuted mt-0.5">
                          {rule.is_excluded ? (
                            <span className="text-cliq-danger">{rule.exclusion_reason || "Excluded from rewards"}</span>
                          ) : (
                            <span>
                              Min spend: ₹{Number(rule.min_transaction_amount || 0)} • Cap:{" "}
                              {rule.monthly_cap_amount ? `₹${Number(rule.monthly_cap_amount)}/mo` : "No limit"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-extrabold ${rule.is_excluded ? "text-cliq-danger" : "text-cliq-emerald"}`}>
                          {rule.is_excluded ? "0.0%" : `${rule.reward_rate_percentage}%`}
                        </span>
                        <span className="text-[10px] block text-cliq-textMuted uppercase font-mono">
                          {rule.reward_type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Benefits */}
              {selectedCardForDetails.benefits && selectedCardForDetails.benefits.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-cliq-emerald" />
                    <span>Perks & Privileges ({selectedCardForDetails.benefits.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedCardForDetails.benefits.map((ben: any) => (
                      <div
                        key={ben.id || ben.title}
                        className="p-3 rounded-xl bg-cliq-surface border border-cliq-border text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-cliq-emerald" />
                            {ben.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-cliq-surfaceHover text-cliq-cyan font-mono">
                            {ben.benefit_type}
                          </span>
                        </div>
                        <p className="text-[11px] text-cliq-textSecondary">{ben.description}</p>
                        {Number(ben.annual_value_estimate) > 0 && (
                          <span className="text-[10px] text-cliq-turquoise font-medium block">
                            Estimated annual value: ₹{Number(ben.annual_value_estimate).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Source Reference Link */}
              {selectedCardForDetails.terms_source_url && (
                <div className="pt-2 border-t border-cliq-border flex items-center justify-between text-xs text-cliq-textSecondary">
                  <span>Official Issuer Schedule:</span>
                  <a
                    href={selectedCardForDetails.terms_source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cliq-cyan hover:underline flex items-center gap-1"
                  >
                    <span>View Official Bank Terms</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Edit Card */}
        {editingCard && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-panel border-cliq-cyan/30 rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-6">
              <div className="flex items-center justify-between border-b border-cliq-border pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-cliq-cyan" />
                  <span>Edit Card Details</span>
                </h3>
                <button onClick={() => setEditingCard(null)} className="text-cliq-textSecondary hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-cliq-textMuted mb-1 font-semibold">Card Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.card_name}
                    onChange={(e) => setEditForm({ ...editForm, card_name: e.target.value })}
                    className="w-full bg-cliq-surface border border-cliq-border rounded-xl px-3 py-2 text-white focus:border-cliq-cyan focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-cliq-textMuted mb-1 font-semibold">Issuer / Bank</label>
                    <input
                      type="text"
                      required
                      value={editForm.bank_name}
                      onChange={(e) => setEditForm({ ...editForm, bank_name: e.target.value })}
                      className="w-full bg-cliq-surface border border-cliq-border rounded-xl px-3 py-2 text-white focus:border-cliq-cyan focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-cliq-textMuted mb-1 font-semibold">Network</label>
                    <select
                      value={editForm.network}
                      onChange={(e) => setEditForm({ ...editForm, network: e.target.value })}
                      className="w-full bg-cliq-surface border border-cliq-border rounded-xl px-3 py-2 text-white focus:border-cliq-cyan focus:outline-none"
                    >
                      <option value="VISA">VISA</option>
                      <option value="MASTERCARD">MASTERCARD</option>
                      <option value="RUPAY">RUPAY</option>
                      <option value="AMEX">AMEX</option>
                      <option value="DINERS">DINERS</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-cliq-textMuted mb-1 font-semibold">Card Variant</label>
                    <input
                      type="text"
                      placeholder="e.g. Signature, Metal, Gold"
                      value={editForm.card_variant}
                      onChange={(e) => setEditForm({ ...editForm, card_variant: e.target.value })}
                      className="w-full bg-cliq-surface border border-cliq-border rounded-xl px-3 py-2 text-white focus:border-cliq-cyan focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-cliq-textMuted mb-1 font-semibold">Annual Fee (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.annual_fee}
                      onChange={(e) => setEditForm({ ...editForm, annual_fee: Number(e.target.value) })}
                      className="w-full bg-cliq-surface border border-cliq-border rounded-xl px-3 py-2 text-white focus:border-cliq-cyan focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-cliq-textMuted mb-1 font-semibold">Annual Fee Waiver Spend (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 100000"
                    value={editForm.renewal_waiver_spend}
                    onChange={(e) => setEditForm({ ...editForm, renewal_waiver_spend: Number(e.target.value) })}
                    className="w-full bg-cliq-surface border border-cliq-border rounded-xl px-3 py-2 text-white focus:border-cliq-cyan focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-cliq-textMuted mb-1 font-semibold">Waiver Condition Details</label>
                  <input
                    type="text"
                    placeholder="e.g. Spend ₹1,00,000 in anniversary year to waive fee"
                    value={editForm.fee_waiver_condition_details}
                    onChange={(e) => setEditForm({ ...editForm, fee_waiver_condition_details: e.target.value })}
                    className="w-full bg-cliq-surface border border-cliq-border rounded-xl px-3 py-2 text-white focus:border-cliq-cyan focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-cliq-textMuted mb-1 font-semibold">Official Terms URL</label>
                  <input
                    type="url"
                    placeholder="https://bank.com/terms"
                    value={editForm.terms_source_url}
                    onChange={(e) => setEditForm({ ...editForm, terms_source_url: e.target.value })}
                    className="w-full bg-cliq-surface border border-cliq-border rounded-xl px-3 py-2 text-white focus:border-cliq-cyan focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingCard(null)}
                    className="px-4 py-2 rounded-xl text-cliq-textSecondary hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cliq-cyan to-cliq-emerald text-cliq-bg font-bold shadow-neonCyan hover:opacity-95 flex items-center gap-1.5"
                  >
                    {savingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
