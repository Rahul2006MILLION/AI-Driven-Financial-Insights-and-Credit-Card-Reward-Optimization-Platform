"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage } from "@/lib/i18n";
import { api, CardOffer } from "@/lib/api";
import {
  Tag,
  Search,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  AlertCircle,
  Filter,
  CreditCard,
  Percent,
  Clock,
  Sparkles,
  ShieldCheck,
  Loader2,
  Building2,
  ArrowRight,
  Globe,
  Store,
} from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All Offers" },
  { id: "food_delivery", label: "Food Delivery" },
  { id: "dining", label: "Dining Out" },
  { id: "shopping", label: "Shopping" },
  { id: "travel", label: "Travel & Flights" },
  { id: "entertainment", label: "Entertainment" },
  { id: "grocery", label: "Grocery & Mart" },
];

export default function OffersDiscoveryPage() {
  const { t } = useLanguage();
  const [offers, setOffers] = useState<CardOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [onlyUserCards, setOnlyUserCards] = useState(false);
  const [expiringSoon, setExpiringSoon] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const data = await api.getOffers({
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        only_user_cards: onlyUserCards || undefined,
        expiring_soon: expiringSoon || undefined,
        query: searchQuery || undefined,
      });
      setOffers(data || []);
    } catch (err) {
      console.error("Failed to load offers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [selectedCategory, onlyUserCards, expiringSoon, searchQuery]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
              <Tag className="w-8 h-8 text-cliq-turquoise" />
              <span>{t.offers.title}</span>
            </h1>
            <p className="text-xs text-cliq-textSecondary mt-1">{t.offers.subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/optimization"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cliq-cyan to-cliq-emerald text-cliq-bg font-bold text-xs shadow-neonCyan hover:opacity-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Optimize a Transaction</span>
            </Link>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl space-y-4">
          {/* Top row: search & switches */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-cliq-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search merchant, coupon, or deal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-cliq-surface border border-cliq-border rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-cliq-textMuted focus:border-cliq-cyan focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-white">
                <input
                  type="checkbox"
                  checked={onlyUserCards}
                  onChange={(e) => setOnlyUserCards(e.target.checked)}
                  className="rounded border-cliq-border bg-cliq-surface text-cliq-cyan focus:ring-0 focus:ring-offset-0 h-4 w-4"
                />
                <span className="font-semibold text-cliq-cyan">{t.offers.myCardsOnly}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-white">
                <input
                  type="checkbox"
                  checked={expiringSoon}
                  onChange={(e) => setExpiringSoon(e.target.checked)}
                  className="rounded border-cliq-border bg-cliq-surface text-cliq-danger focus:ring-0 focus:ring-offset-0 h-4 w-4"
                />
                <span className="font-semibold text-cliq-danger flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t.offers.expiringSoon}</span>
                </span>
              </label>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? "bg-gradient-to-r from-cliq-cyan/20 to-cliq-emerald/20 text-cliq-cyan border border-cliq-cyan/50 shadow-sm"
                      : "bg-cliq-surface text-cliq-textSecondary hover:text-white border border-cliq-border"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Offers Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-cliq-cyan mx-auto" />
            <p className="text-xs text-cliq-textSecondary mt-2">Discovering matching card promotions...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center space-y-4 max-w-lg mx-auto">
            <Tag className="w-12 h-12 text-cliq-turquoise mx-auto opacity-75" />
            <h3 className="text-lg font-bold text-white">No Offers Found</h3>
            <p className="text-xs text-cliq-textSecondary">
              {onlyUserCards
                ? "No active promotions currently match your registered cards. Try toggling off 'My Cards Only' to view all merchant offers."
                : "No offers match the current filter criteria."}
            </p>
            {onlyUserCards && (
              <button
                onClick={() => setOnlyUserCards(false)}
                className="px-4 py-2 rounded-xl bg-cliq-cyan text-cliq-bg font-bold text-xs"
              >
                Show All Available Offers
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => {
              const isVerified = offer.verification_status === "VERIFIED";
              const isPercentage = offer.discount_type === "PERCENTAGE";
              const discountDisplay = isPercentage
                ? `${Number(offer.discount_value)}% OFF`
                : `₹${Number(offer.discount_value).toLocaleString("en-IN")} FLAT OFF`;

              const validDateStr = new Date(offer.valid_to).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={offer.id}
                  className={`glass-panel rounded-2xl p-6 border flex flex-col justify-between relative transition-all group ${
                    offer.is_applicable_to_user
                      ? "border-cliq-turquoise/50 bg-gradient-to-b from-cliq-bgSecondary to-cliq-bg"
                      : "border-cliq-border hover:border-cliq-cyan/30"
                  }`}
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-gradient-to-r from-cliq-cyan to-cliq-emerald text-cliq-bg shadow-sm">
                          {discountDisplay}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                            isVerified
                              ? "bg-cliq-emerald/10 border-cliq-emerald/40 text-cliq-emerald"
                              : "bg-cliq-surface border-cliq-border text-cliq-textMuted"
                          }`}
                        >
                          {offer.verification_status}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-cliq-textMuted font-mono">
                        {offer.payment_channel === "OFFLINE" ? (
                          <span className="flex items-center gap-1 text-cliq-turquoise" title="In-store retail only">
                            <Store className="w-3.5 h-3.5" />
                            <span>In-Store</span>
                          </span>
                        ) : offer.payment_channel === "ONLINE" ? (
                          <span className="flex items-center gap-1 text-cliq-cyan" title="Online checkout">
                            <Globe className="w-3.5 h-3.5" />
                            <span>Online</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-white" title="Online and In-Store">
                            <span>Omnichannel</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Merchant & Title */}
                    <div className="text-xs font-bold text-cliq-turquoise uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      <span>{offer.merchant_name}</span>
                    </div>

                    <h3 className="text-base font-extrabold text-white group-hover:text-cliq-cyan transition-colors leading-snug">
                      {offer.offer_title}
                    </h3>

                    {/* Offer Terms Snapshot */}
                    <div className="mt-4 pt-3 border-t border-cliq-border/60 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-cliq-textMuted block">{t.offers.minSpend}</span>
                        <span className="font-bold text-white">
                          ₹{Number(offer.min_transaction_value).toLocaleString("en-IN")}
                        </span>
                      </div>
                      {offer.max_discount_amount && (
                        <div>
                          <span className="text-[10px] text-cliq-textMuted block">Max Saving</span>
                          <span className="font-bold text-cliq-turquoise">
                            ₹{Number(offer.max_discount_amount).toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Eligible Issuer / Cards */}
                    <div className="mt-3 p-2.5 rounded-xl bg-cliq-surface border border-cliq-border/70 text-xs">
                      <span className="text-[10px] text-cliq-textMuted block font-semibold mb-1">
                        Eligible Cards:
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {offer.eligible_bank && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cliq-surfaceHover text-white border border-cliq-border">
                            {offer.eligible_bank}
                          </span>
                        )}
                        {offer.eligible_network && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cliq-surfaceHover text-cliq-cyan border border-cliq-cyan/30">
                            {offer.eligible_network}
                          </span>
                        )}
                        {!offer.eligible_bank && !offer.eligible_network && (
                          <span className="text-[10px] text-cliq-textSecondary">All major cards</span>
                        )}
                      </div>

                      {offer.matching_user_card_names && offer.matching_user_card_names.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-cliq-border/50 text-[11px] text-cliq-emerald font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Matches: {offer.matching_user_card_names.join(", ")}</span>
                        </div>
                      )}
                    </div>

                    {/* Promo Code or Activation */}
                    {offer.promo_code && (
                      <div className="mt-3 flex items-center justify-between p-2 rounded-xl bg-cliq-bg border border-cliq-cyan/40">
                        <div>
                          <span className="text-[9px] text-cliq-textMuted uppercase font-bold block">Coupon Code</span>
                          <span className="font-mono text-xs font-extrabold text-cliq-cyan tracking-wider">
                            {offer.promo_code}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopyCode(offer.promo_code!)}
                          className="px-2.5 py-1 rounded-lg bg-cliq-surface hover:bg-cliq-surfaceHover text-white text-[11px] font-semibold flex items-center gap-1 transition-colors border border-cliq-border"
                        >
                          {copiedCode === offer.promo_code ? (
                            <>
                              <Check className="w-3 h-3 text-cliq-emerald" />
                              <span className="text-cliq-emerald">{t.offers.codeCopied}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>{t.offers.copyCode}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Footer & Source URL */}
                  <div className="mt-5 pt-3 border-t border-cliq-border flex items-center justify-between text-[11px] text-cliq-textMuted">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{t.offers.validTill}: {validDateStr}</span>
                    </div>

                    {offer.source_url && (
                      <a
                        href={offer.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cliq-cyan hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>Terms</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
