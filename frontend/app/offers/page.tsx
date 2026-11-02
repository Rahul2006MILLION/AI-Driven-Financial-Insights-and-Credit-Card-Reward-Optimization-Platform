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
  Clock,
  Sparkles,
  ShieldCheck,
  Loader2,
  Building2,
  Globe,
  Store,
  ChevronRight,
} from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All Offers" },
  { id: "food_delivery", label: "Dining & Delivery" },
  { id: "shopping", label: "Shopping" },
  { id: "travel", label: "Travel & Flights" },
  { id: "grocery", label: "Grocery & Mart" },
  { id: "entertainment", label: "Entertainment" },
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
    <div className="flex-1 flex flex-col lg:flex-row bg-[#0E1013]">
      <Sidebar />

      <main className="flex-1 p-5 sm:p-7 lg:p-9 max-w-7xl mx-auto w-full space-y-7">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              {t.offers?.title || "Offers & Promotions"}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.offers?.subtitle || "Verified merchant partnerships and credit card discounts"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/offers"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold text-xs hover:bg-amber-500/20 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.offers?.reviewDeskCta || "Review Desk"}</span>
            </Link>
            <Link
              href="/optimization"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full btn-fx bg-lime-400 hover:bg-lime-300 text-[#0E1013] font-semibold text-xs shadow-[0_0_20px_rgba(76,192,63,0.35)] transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.offers?.optimizeSpendCta || "Optimize Spend"}</span>
            </Link>
          </div>
        </div>

        {/* Liquid Glass Filters Bar */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_12px_36px_0_rgba(0,0,0,0.5)] space-y-4">
          {/* Top row: search & switches */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.offers?.searchPlaceholder || "Search merchant, coupon, or deal..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={onlyUserCards}
                  onChange={(e) => setOnlyUserCards(e.target.checked)}
                  className="rounded border-white/20 bg-white/[0.05] text-emerald-500 focus:ring-0 h-4 w-4"
                />
                <span className="font-semibold text-emerald-400">{t.offers?.myCardsOnly || "My Cards Only"}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={expiringSoon}
                  onChange={(e) => setExpiringSoon(e.target.checked)}
                  className="rounded border-white/20 bg-white/[0.05] text-emerald-500 focus:ring-0 h-4 w-4"
                />
                <span>{t.offers?.expiringSoon || "Expiring Soon"}</span>
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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? "bg-emerald-500 text-[#0E1013] shadow-[0_0_15px_rgba(76,192,63,0.35)]"
                      : "bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06]"
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
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
            <p className="text-xs text-slate-400 mt-2">Loading promotions...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl text-center space-y-4 max-w-lg mx-auto">
            <Tag className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Offers Found</h3>
            <p className="text-xs text-slate-400">
              {onlyUserCards
                ? "No active promotions currently match your portfolio cards."
                : "No offers match the current filter criteria."}
            </p>
            {onlyUserCards && (
              <button
                onClick={() => setOnlyUserCards(false)}
                className="px-4 py-2 rounded-full bg-emerald-500 text-[#0E1013] font-bold text-xs"
              >
                Show All Offers
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
                  className={`rounded-3xl p-6 border flex flex-col justify-between relative transition-all group backdrop-blur-2xl ${
                    offer.is_applicable_to_user
                      ? "border-emerald-500/40 bg-white/[0.04] shadow-[0_16px_40px_0_rgba(0,0,0,0.6)]"
                      : "border-white/[0.08] bg-white/[0.02] hover:border-emerald-500/25"
                  }`}
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-500 text-[#0E1013] shadow-[0_0_15px_rgba(76,192,63,0.3)]">
                          {discountDisplay}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                            isVerified
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : "bg-white/[0.04] border-white/10 text-slate-400"
                          }`}
                        >
                          {offer.verification_status}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        {offer.payment_channel === "OFFLINE" ? (
                          <span className="flex items-center gap-1 text-slate-300">
                            <Store className="w-3.5 h-3.5 text-emerald-400" />
                            <span>In-Store</span>
                          </span>
                        ) : offer.payment_channel === "ONLINE" ? (
                          <span className="flex items-center gap-1 text-slate-300">
                            <Globe className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Online</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-300">
                            <span>Omni</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Merchant & Title */}
                    <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{offer.merchant_name}</span>
                    </div>

                    <h3 className="text-base font-extrabold text-white group-hover:text-emerald-400 transition-colors leading-snug">
                      {offer.offer_title}
                    </h3>

                    {/* Offer Terms Snapshot */}
                    <div className="mt-4 pt-3 border-t border-white/[0.07] grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Min Spend</span>
                        <span className="font-bold text-white">
                          ₹{Number(offer.min_transaction_value).toLocaleString("en-IN")}
                        </span>
                      </div>
                      {offer.max_discount_amount && (
                        <div>
                          <span className="text-[10px] text-slate-500 block">Max Savings</span>
                          <span className="font-bold text-emerald-400">
                            ₹{Number(offer.max_discount_amount).toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Eligible Issuer / Cards */}
                    <div className="mt-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs">
                      <span className="text-[10px] text-slate-500 block font-semibold mb-1">
                        Eligible Cards:
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {offer.eligible_bank && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.05] text-white border border-white/10">
                            {offer.eligible_bank}
                          </span>
                        )}
                        {offer.eligible_network && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {offer.eligible_network}
                          </span>
                        )}
                        {!offer.eligible_bank && !offer.eligible_network && (
                          <span className="text-[10px] text-slate-400">All major cards</span>
                        )}
                      </div>

                      {offer.matching_user_card_names && offer.matching_user_card_names.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/[0.06] text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Wallet Match: {offer.matching_user_card_names.join(", ")}</span>
                        </div>
                      )}
                    </div>

                    {/* Promo Code */}
                    {offer.promo_code && (
                      <div className="mt-3 flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] border border-white/10">
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase font-bold block">Coupon</span>
                          <span className="font-mono text-xs font-bold text-emerald-400">
                            {offer.promo_code}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopyCode(offer.promo_code!)}
                          className="px-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.08] text-white text-[11px] font-medium flex items-center gap-1 transition-colors border border-white/10"
                        >
                          {copiedCode === offer.promo_code ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Footer & Source URL */}
                  <div className="mt-5 pt-3 border-t border-white/[0.07] flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Expires {validDateStr}</span>
                    </div>

                    {offer.source_url && (
                      <a
                        href={offer.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
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
