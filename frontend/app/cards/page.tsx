"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage } from "@/lib/i18n";
import { api, CreditCard } from "@/lib/api";
import { CardFanCollection } from "@/components/CardFanCollection";
import { CardDetailsPanel } from "@/components/CardDetailsPanel";
import { CardSelectionFlow } from "@/components/CardSelectionFlow";
import { DigitalCreditCard } from "@/components/DigitalCreditCard";
import {
  CreditCard as CardIcon,
  PlusCircle,
  GitCompare,
  Trash2,
  ShieldCheck,
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
  Sparkles,
  Plane,
  Eye,
  Layers,
  LayoutGrid,
} from "lucide-react";

export default function MyCreditCardsPage() {
  const { t } = useLanguage();
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState<string>("ALL");
  const [selectedBank, setSelectedBank] = useState<string>("ALL");

  // Selected card in the Fan / Details view
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);

  // View mode for existing users: "fan" vs "grid"
  const [viewMode, setViewMode] = useState<"fan" | "grid">("fan");

  // Add Card modal / overlay state
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit card modal state
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [editForm, setEditForm] = useState({
    card_name: "",
    bank_name: "",
    cardholder_name: "",
    nickname: "",
    network: "VISA",
    card_variant: "",
    last_four_digits: "",
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
      const cardList = data || [];
      setCards(cardList);
      if (cardList.length > 0) {
        // Keep selected card if still present, else default to first
        setSelectedCard((prev) => {
          if (!prev) return cardList[0];
          const found = cardList.find((c) => c.id === prev.id);
          return found || cardList[0];
        });
      } else {
        setSelectedCard(null);
      }
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
    if (!confirm("Are you sure you want to deactivate this credit card? Historical transaction links will be preserved.")) {
      return;
    }
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
      cardholder_name: card.cardholder_name || "",
      nickname: card.nickname || "",
      network: card.network,
      card_variant: card.card_variant || "",
      last_four_digits: card.last_four_digits || "",
      annual_fee: Number(card.annual_fee),
      renewal_waiver_spend: Number(card.renewal_waiver_spend || 0),
      fee_waiver_condition_details: card.fee_waiver_condition_details || "",
      terms_source_url: card.terms_source_url || "",
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;

    if (editForm.last_four_digits && !/^[0-9]{4}$/.test(editForm.last_four_digits.trim())) {
      alert("Last 4 digits must contain exactly 4 numeric digits.");
      return;
    }

    setSavingEdit(true);
    try {
      await api.updateCard(editingCard.id, {
        card_name: editForm.card_name.trim(),
        bank_name: editForm.bank_name.trim(),
        cardholder_name: editForm.cardholder_name.trim() || undefined,
        nickname: editForm.nickname.trim() || undefined,
        network: editForm.network as any,
        card_variant: editForm.card_variant.trim() || undefined,
        last_four_digits: editForm.last_four_digits.trim() || undefined,
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

  // Aggregate metrics
  const verifiedCount = cards.filter(
    (c) => c.terms_source_url && c.terms_source_url.startsWith("https://")
  ).length;

  const totalAnnualFee = cards.reduce((sum, c) => sum + Number(c.annual_fee || 0), 0);
  const totalWaiverSpend = cards.reduce((sum, c) => sum + Number(c.renewal_waiver_spend || 0), 0);

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-screen bg-[#070C18]">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-7">
        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-24 space-y-4">
            <Loader2 className="w-9 h-9 text-cliq-cyan animate-spin" />
            <p className="text-xs text-cliq-textSecondary tracking-wide">
              Loading your credit card wallet...
            </p>
          </div>
        ) : cards.length === 0 ? (
          /* ============================================================
             EXPERIENCE A: FIRST-TIME USER (0 registered cards)
             Show the bank and card selection experience directly.
             No empty placeholder wallet!
             ============================================================ */
          <div className="space-y-6">
            <CardSelectionFlow
              onCardAdded={fetchCards}
            />
          </div>
        ) : (
          /* ============================================================
             EXPERIENCE B: EXISTING USER (1+ registered cards)
             Display the signature FAN-SHAPED card collection!
             ============================================================ */
          <div className="space-y-7">
            {/* Wallet Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.07] pb-5">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white glow-emerald">
                  Card Collection
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Interactive multi-card portfolio & privileges
                </p>
              </div>

              {/* Header Badges & Actions */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Metrics Badges */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-400">Cards:</span>
                  <strong className="text-white font-bold">{cards.length}</strong>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-400">Verified:</span>
                  <strong className="text-white font-bold">{verifiedCount}</strong>
                </div>

                {/* View Mode Toggle: Fan vs Grid */}
                <div className="flex items-center p-0.5 rounded-full bg-white/[0.03] border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode("fan")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold transition-all ${
                      viewMode === "fan"
                        ? "bg-emerald-500 text-[#040707] shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Fan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold transition-all ${
                      viewMode === "grid"
                        ? "bg-emerald-500 text-[#040707] shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Grid</span>
                  </button>
                </div>

                {/* Add Card Button */}
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#040707] font-semibold text-xs shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Card</span>
                </button>
              </div>
            </div>

            {/* Quick Filter Bar */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter cards by name, bank, or nickname..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#06100C] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Banks ({uniqueBanks.length})</option>
                  {uniqueBanks.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedNetwork}
                  onChange={(e) => setSelectedNetwork(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs focus:outline-none focus:border-cliq-cyan"
                >
                  <option value="ALL">All Networks</option>
                  <option value="VISA">VISA</option>
                  <option value="MASTERCARD">Mastercard</option>
                  <option value="AMEX">Amex</option>
                  <option value="RUPAY">RuPay</option>
                  <option value="DINERS">Diners</option>
                </select>
              </div>
            </div>

            {/* PRIMARY SHOWCASE: THE FAN COLLECTION + COMPANION DETAILS PANEL */}
            {viewMode === "fan" ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT / CENTER: INTERACTIVE OVERLAPPING CARD STACK */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="p-6 rounded-3xl bg-gradient-to-b from-[#0B1428] via-[#070D1C] to-[#040812] border border-cliq-border/80 shadow-2xl relative overflow-hidden">
                    {/* Ambient subtle backlighting */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cliq-cyan/5 rounded-full blur-3xl pointer-events-none" />

                    <CardFanCollection
                      cards={cards}
                      selectedCard={selectedCard}
                      onSelectCard={(c) => setSelectedCard(c)}
                    />
                  </div>

                  {/* Summary metric callout */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-cliq-surface/60 border border-cliq-border flex items-center justify-between">
                      <span className="text-cliq-textSecondary">Total Annual Fees:</span>
                      <strong className="text-white font-bold">
                        {totalAnnualFee === 0 ? "FREE" : `₹${totalAnnualFee.toLocaleString("en-IN")}`}
                      </strong>
                    </div>

                    <div className="p-3 rounded-2xl bg-cliq-surface/60 border border-cliq-border flex items-center justify-between">
                      <span className="text-cliq-textSecondary">Potential Waiver Targets:</span>
                      <strong className="text-emerald-400 font-bold">
                        {totalWaiverSpend > 0 ? `₹${totalWaiverSpend.toLocaleString("en-IN")}` : "N/A"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* RIGHT: COMPANION DETAILS PANEL */}
                <div className="lg:col-span-5 sticky top-6">
                  <CardDetailsPanel
                    card={selectedCard}
                    onEdit={openEditModal}
                    onDelete={handleDeleteCard}
                    deletingId={deletingId}
                  />
                </div>
              </div>
            ) : (
              /* ALTERNATIVE VIEW: ALL CARDS GRID */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => {
                  const annualFeeNum = Number(card.annual_fee || 0);
                  const waiverSpendNum = Number(card.renewal_waiver_spend || 0);

                  return (
                    <div
                      key={card.id}
                      className="rounded-2xl bg-cliq-surface border border-cliq-border hover:border-cliq-cyan/40 p-4 space-y-4 transition-all flex flex-col justify-between shadow-md shadow-black/20"
                    >
                      <div
                        onClick={() => {
                          setSelectedCard(card);
                          setViewMode("fan");
                        }}
                        className="cursor-pointer"
                      >
                        <DigitalCreditCard
                          bankName={card.bank_name}
                          cardName={card.card_name}
                          cardVariant={card.card_variant}
                          cardholderName={card.cardholder_name}
                          nickname={card.nickname}
                          lastFourDigits={card.last_four_digits}
                          network={card.network}
                          isCompact
                        />
                      </div>

                      <div className="space-y-2 pt-1 text-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-cliq-textSecondary block">Annual Fee</span>
                            <span className="font-bold text-white">
                              {annualFeeNum === 0 ? "FREE" : `₹${annualFeeNum.toLocaleString("en-IN")}`}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-cliq-textSecondary block">Renewal Waiver</span>
                            <span className="font-bold text-emerald-400">
                              {waiverSpendNum > 0 ? `₹${waiverSpendNum.toLocaleString("en-IN")}` : "N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-cliq-border/60">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCard(card);
                              setViewMode("fan");
                            }}
                            className="text-cliq-cyan hover:underline text-xs font-semibold flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View in Fan</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(card)}
                              className="p-1.5 rounded-lg bg-cliq-surfaceHover hover:bg-cliq-border text-cliq-textSecondary hover:text-white"
                              title="Edit Card"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCard(card.id)}
                              className="p-1.5 rounded-lg bg-cliq-surfaceHover hover:bg-red-950/60 text-cliq-textSecondary hover:text-red-400"
                              title="Deactivate Card"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ADD CARD MODAL (FOR EXISTING USERS CLICKING "+ Add Another Card") */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#070C18] border border-cliq-border rounded-3xl max-w-5xl w-full p-6 space-y-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
              <CardSelectionFlow
                isModal
                onCancel={() => setShowAddModal(false)}
                onCardAdded={() => {
                  setShowAddModal(false);
                  fetchCards();
                }}
              />
            </div>
          </div>
        )}

        {/* EDIT METADATA MODAL */}
        {editingCard && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#0B1120] border border-cliq-border rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setEditingCard(null)}
                className="absolute right-4 top-4 p-1.5 rounded-lg text-cliq-textSecondary hover:text-white hover:bg-cliq-surfaceHover"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-cliq-cyan" />
                <span>Edit Card Specifications</span>
              </h3>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-cliq-textSecondary font-semibold">Card Name *</label>
                    <input
                      type="text"
                      required
                      value={editForm.card_name}
                      onChange={(e) => setEditForm({ ...editForm, card_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs focus:outline-none focus:border-cliq-cyan"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-cliq-textSecondary font-semibold">Bank Name *</label>
                    <input
                      type="text"
                      required
                      value={editForm.bank_name}
                      onChange={(e) => setEditForm({ ...editForm, bank_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs focus:outline-none focus:border-cliq-cyan"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-cliq-textSecondary font-semibold">Cardholder Name</label>
                    <input
                      type="text"
                      value={editForm.cardholder_name}
                      onChange={(e) => setEditForm({ ...editForm, cardholder_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs uppercase focus:outline-none focus:border-cliq-cyan"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-cliq-textSecondary font-semibold">Nickname</label>
                    <input
                      type="text"
                      value={editForm.nickname}
                      onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                      placeholder="e.g. Travel Card"
                      className="w-full px-3 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs focus:outline-none focus:border-cliq-cyan"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-cliq-textSecondary font-semibold">Last 4 Digits</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={editForm.last_four_digits}
                      onChange={(e) =>
                        setEditForm({ ...editForm, last_four_digits: e.target.value.replace(/\D/g, "") })
                      }
                      placeholder="e.g. 8821"
                      className="w-full px-3 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs font-mono focus:outline-none focus:border-cliq-cyan"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-cliq-textSecondary font-semibold">Network</label>
                    <select
                      value={editForm.network}
                      onChange={(e) => setEditForm({ ...editForm, network: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs focus:outline-none focus:border-cliq-cyan"
                    >
                      <option value="VISA">VISA</option>
                      <option value="MASTERCARD">Mastercard</option>
                      <option value="AMEX">American Express</option>
                      <option value="RUPAY">RuPay</option>
                      <option value="DINERS">Diners Club</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-cliq-textSecondary font-semibold">Annual Fee (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.annual_fee}
                      onChange={(e) => setEditForm({ ...editForm, annual_fee: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs focus:outline-none focus:border-cliq-cyan"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-cliq-textSecondary font-semibold">Renewal Waiver Spend (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.renewal_waiver_spend}
                      onChange={(e) =>
                        setEditForm({ ...editForm, renewal_waiver_spend: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs focus:outline-none focus:border-cliq-cyan"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-cliq-textSecondary font-semibold">Waiver Condition Details</label>
                    <input
                      type="text"
                      value={editForm.fee_waiver_condition_details}
                      onChange={(e) =>
                        setEditForm({ ...editForm, fee_waiver_condition_details: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs focus:outline-none focus:border-cliq-cyan"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-cliq-textSecondary font-semibold">Terms URL</label>
                    <input
                      type="url"
                      value={editForm.terms_source_url}
                      onChange={(e) => setEditForm({ ...editForm, terms_source_url: e.target.value })}
                      placeholder="https://www.bank.com/terms"
                      className="w-full px-3 py-2 rounded-xl bg-cliq-surfaceHover border border-cliq-border text-white text-xs focus:outline-none focus:border-cliq-cyan"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-cliq-border/60">
                  <button
                    type="button"
                    onClick={() => setEditingCard(null)}
                    className="px-4 py-2 rounded-xl bg-cliq-surfaceHover text-white text-xs font-semibold hover:bg-cliq-border"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-5 py-2 rounded-xl bg-cliq-cyan text-cliq-navy text-xs font-extrabold hover:opacity-95 disabled:opacity-50 flex items-center gap-1.5"
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
