"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  api,
  CardOffer,
  OfferAuditLog,
  DiscoverySyncResult,
  getStoredSession,
  storeSession,
  UserSession,
} from "@/lib/api";
import {
  ShieldCheck,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit3,
  ExternalLink,
  History,
  FileText,
  Copy,
  Check,
  Tag,
  Clock,
  Sparkles,
  Lock,
  ArrowRight,
  ChevronRight,
  Database,
  Building2,
  Calendar,
  Layers,
} from "lucide-react";

export default function AdminOfferReviewPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [offers, setOffers] = useState<CardOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>("PENDING_REVIEW");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [editingOffer, setEditingOffer] = useState<CardOffer | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [rejectingOffer, setRejectingOffer] = useState<CardOffer | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [auditOffer, setAuditOffer] = useState<CardOffer | null>(null);
  const [auditLogs, setAuditLogs] = useState<OfferAuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Copied promo code helper
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const s = getStoredSession();
    setSession(s);
    if (s) {
      loadQueue(statusFilter, searchQuery);
    } else {
      setLoading(false);
    }
  }, [statusFilter]);

  const loadQueue = async (status: string, query?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAdminReviewQueue({
        status: status === "ALL" ? undefined : status,
        query: query?.trim() || undefined,
      });
      setOffers(data);
    } catch (err: any) {
      setError(err.message || "Failed to load admin offer review queue.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadQueue(statusFilter, searchQuery);
  };

  const handleQuickLoginAdmin = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@cliq.ai", password: "AdminPass@123" }),
      });
      if (!res.ok) throw new Error("Could not authenticate as admin.");
      const data = await res.json();
      const newSession: UserSession = {
        accessToken: data.access_token,
        userId: data.user_id,
        email: data.email,
        fullName: data.full_name || "CLIQ Chief Admin",
        preferredLanguage: data.preferred_language || "en",
        role: data.role || "ADMIN",
        isAdmin: true,
      };
      storeSession(newSession);
      setSession(newSession);
      await loadQueue(statusFilter, searchQuery);
      setSuccessMsg("Logged in as Administrator (admin@cliq.ai). Full verification privileges unlocked.");
    } catch (e: any) {
      setError(e.message || "Failed to log in as administrator.");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncDiscovery = async () => {
    setSyncing(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await api.syncDiscovery();
      setSuccessMsg(
        `Automatic Discovery Complete: Discovered ${res.discovered_count} source records, extracted ${res.extracted_count}, staged ${res.pending_review_count} into Pending Review, quarantined ${res.reverification_triggered_count} for Reverification, and ${res.unchanged_count} unchanged.`
      );
      loadQueue(statusFilter, searchQuery);
    } catch (err: any) {
      setError(err.message || "Discovery sync failed.");
    } finally {
      setSyncing(false);
    }
  };

  const handleApprove = async (offer: CardOffer) => {
    try {
      await api.approveOffer(offer.id, "Verified terms against primary source.");
      setSuccessMsg(`Offer "${offer.offer_title}" successfully APPROVED and promoted to VERIFIED state.`);
      loadQueue(statusFilter, searchQuery);
    } catch (err: any) {
      setError(err.message || "Approval failed.");
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingOffer) return;
    try {
      await api.rejectOffer(rejectingOffer.id, rejectionReason);
      setSuccessMsg(`Offer "${rejectingOffer.offer_title}" marked as REJECTED.`);
      setRejectingOffer(null);
      setRejectionReason("");
      loadQueue(statusFilter, searchQuery);
    } catch (err: any) {
      setError(err.message || "Rejection failed.");
    }
  };

  const handleOpenEdit = (offer: CardOffer) => {
    setEditingOffer(offer);
    setEditFormData({
      offer_title: offer.offer_title,
      merchant_name: offer.merchant_name,
      category_id: offer.category_id,
      discount_type: offer.discount_type,
      discount_value: offer.discount_value,
      min_transaction_value: offer.min_transaction_value,
      max_discount_amount: offer.max_discount_amount || "",
      eligible_bank: offer.eligible_bank || "",
      eligible_network: offer.eligible_network || "",
      eligible_card_names_str: (offer.eligible_card_names || []).join(", "),
      promo_code: offer.promo_code || "",
      activation_requirement: offer.activation_requirement || "",
      terms_and_conditions: offer.terms_and_conditions || "",
      source_url: offer.source_url || "",
      approve_immediately: false,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer) return;
    try {
      const cardNames = editFormData.eligible_card_names_str
        ? editFormData.eligible_card_names_str.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];

      await api.editOffer(editingOffer.id, {
        offer_title: editFormData.offer_title,
        merchant_name: editFormData.merchant_name,
        category_id: editFormData.category_id,
        discount_type: editFormData.discount_type,
        discount_value: parseFloat(editFormData.discount_value),
        min_transaction_value: parseFloat(editFormData.min_transaction_value),
        max_discount_amount: editFormData.max_discount_amount ? parseFloat(editFormData.max_discount_amount) : undefined,
        eligible_bank: editFormData.eligible_bank || undefined,
        eligible_network: editFormData.eligible_network || undefined,
        eligible_card_names: cardNames,
        promo_code: editFormData.promo_code || undefined,
        activation_requirement: editFormData.activation_requirement || undefined,
        terms_and_conditions: editFormData.terms_and_conditions || undefined,
        source_url: editFormData.source_url || undefined,
        approve_immediately: editFormData.approve_immediately,
      });

      setSuccessMsg(`Offer updated successfully${editFormData.approve_immediately ? " and VERIFIED" : ""}.`);
      setEditingOffer(null);
      loadQueue(statusFilter, searchQuery);
    } catch (err: any) {
      setError(err.message || "Failed to update offer.");
    }
  };

  const handleTriggerReverification = async (offer: CardOffer) => {
    try {
      await api.triggerReverification(offer.id, "Flagged for reverification due to suspected terms update.");
      setSuccessMsg(`Offer "${offer.offer_title}" quarantined into NEEDS_REVERIFICATION.`);
      loadQueue(statusFilter, searchQuery);
    } catch (err: any) {
      setError(err.message || "Reverification trigger failed.");
    }
  };

  const handleOpenAudit = async (offer: CardOffer) => {
    setAuditOffer(offer);
    setAuditLoading(true);
    try {
      const logs = await api.getOfferAuditTrail(offer.id);
      setAuditLogs(logs);
    } catch (err: any) {
      setError(err.message || "Failed to load audit history.");
    } finally {
      setAuditLoading(false);
    }
  };

  const copyPromo = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-cliq-emerald/15 text-cliq-emerald border border-cliq-emerald/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            VERIFIED
          </span>
        );
      case "PENDING_REVIEW":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/40 animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            PENDING REVIEW
          </span>
        );
      case "NEEDS_REVERIFICATION":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/15 text-orange-400 border border-orange-500/40 shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5" />
            NEEDS REVERIFICATION
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/40">
            <XCircle className="w-3.5 h-3.5" />
            REJECTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-cliq-surface text-cliq-textSecondary border border-cliq-border">
            {status}
          </span>
        );
    }
  };

  // If user is not logged in as admin, show access guard
  const isAdmin = Boolean(session?.isAdmin || session?.role === "ADMIN");

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/40 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-amber-400" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-3">Administrator Privileges Required</h1>
        <p className="text-cliq-textSecondary max-w-lg mx-auto mb-8 text-sm leading-relaxed">
          The Central Verified Offer Catalog uses a strict <strong className="text-white">Human-in-the-Loop</strong> operating model.
          Only authorized administrators can verify, edit, or promote offers into the recommendation engine.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleQuickLoginAdmin}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cliq-cyan to-cliq-emerald text-cliq-bg font-bold text-sm shadow-neonCyan hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            {loading ? "Authenticating..." : "Login as Admin (admin@cliq.ai)"}
          </button>
          <Link
            href="/offers"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cliq-surface border border-cliq-border text-white font-medium text-sm hover:border-cliq-cyan/40 transition-colors"
          >
            Back to Public Offers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cliq-bgSecondary via-cliq-surface to-cliq-bgSecondary p-8 border border-cliq-border/80 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cliq-cyan/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-cliq-cyan/15 text-cliq-cyan border border-cliq-cyan/40 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                ADMINISTRATIVE VERIFICATION DESK
              </span>
              <span className="text-xs text-cliq-textMuted">India First Hybrid Model</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Offer Discovery & Review Queue
            </h1>
            <p className="text-sm text-cliq-textSecondary max-w-2xl mt-1">
              Automated multi-source discovery combined with mandatory human verification.
              No unverified or stale promotional offer enters the recommendation engine.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSyncDiscovery}
              disabled={syncing}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cliq-cyan to-cliq-emerald text-cliq-bg font-bold text-xs shadow-neonCyan hover:opacity-90 transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Running Ingestion Pipeline..." : "Run Discovery Sync"}
            </button>
            <Link
              href="/offers"
              className="px-4 py-2.5 rounded-xl bg-cliq-surface border border-cliq-border text-xs font-semibold text-cliq-textSecondary hover:text-white transition-colors flex items-center gap-1.5"
            >
              Public View
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-cliq-emerald/10 border border-cliq-emerald/30 text-cliq-emerald text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-cliq-emerald shrink-0 mt-0.5" />
          <div className="flex-1">{successMsg}</div>
          <button onClick={() => setSuccessMsg(null)} className="text-cliq-emerald hover:text-white">✕</button>
        </div>
      )}

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {[
            { id: "PENDING_REVIEW", label: "Pending Review" },
            { id: "NEEDS_REVERIFICATION", label: "Needs Reverification" },
            { id: "VERIFIED", label: "Verified Active" },
            { id: "REJECTED", label: "Rejected" },
            { id: "ALL", label: "All Records" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-cliq-cyan text-cliq-bg font-bold shadow-neonCyan"
                  : "bg-cliq-surface text-cliq-textSecondary border border-cliq-border hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cliq-textMuted" />
          <input
            type="text"
            placeholder="Search merchant, title, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-cliq-surface border border-cliq-border rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-cliq-textMuted focus:outline-none focus:border-cliq-cyan transition-colors"
          />
        </form>
      </div>

      {/* Review Queue Cards */}
      {loading ? (
        <div className="text-center py-20 text-cliq-textSecondary">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-cliq-cyan mb-3" />
          <p className="text-sm">Loading offers verification queue...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-cliq-surface/40 border border-cliq-border">
          <CheckCircle2 className="w-12 h-12 text-cliq-emerald/60 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Queue is Clear</h3>
          <p className="text-sm text-cliq-textSecondary max-w-md mx-auto">
            No offers currently matching the &ldquo;{statusFilter}&rdquo; filter. Run discovery sync or choose another status tab.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {offers.map((offer) => {
            const confidencePct = Math.round(parseFloat(String(offer.extraction_confidence || "0.85")) * 100);
            let prevVersion: any = null;
            if (offer.previous_version_json) {
              try {
                prevVersion = JSON.parse(offer.previous_version_json);
              } catch (_) {}
            }

            return (
              <div
                key={offer.id}
                className={`rounded-2xl border bg-cliq-surface/90 backdrop-blur-md p-6 transition-all ${
                  offer.verification_status === "NEEDS_REVERIFICATION"
                    ? "border-orange-500/50 shadow-neonAmber"
                    : offer.verification_status === "PENDING_REVIEW"
                    ? "border-amber-500/40"
                    : "border-cliq-border"
                }`}
              >
                {/* Header & Badges */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-cliq-border/60">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-cliq-cyan">
                        {offer.merchant_name}
                      </span>
                      <span className="text-cliq-textMuted">•</span>
                      <span className="text-xs text-cliq-textSecondary">
                        Category: <strong className="text-white capitalize">{offer.category_id}</strong>
                      </span>
                      <span className="text-cliq-textMuted">•</span>
                      <span className="text-xs text-cliq-textSecondary">
                        Channel: <strong className="text-white">{offer.payment_channel}</strong>
                      </span>
                      <span className="text-cliq-textMuted">•</span>
                      <span className="text-xs text-cliq-textSecondary">v{offer.version || 1}</span>
                    </div>
                    <h2 className="text-lg font-extrabold text-white">{offer.offer_title}</h2>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Confidence Meter */}
                    <div className="px-3 py-1 rounded-xl bg-cliq-bg border border-cliq-border text-right">
                      <div className="text-[10px] text-cliq-textMuted uppercase font-bold tracking-wider">
                        Confidence
                      </div>
                      <div className="text-xs font-extrabold text-cliq-cyan">{confidencePct}%</div>
                    </div>
                    {getStatusBadge(offer.verification_status)}
                  </div>
                </div>

                {/* Reverification Diff (Material Terms Changed at Source) */}
                {prevVersion && offer.verification_status === "NEEDS_REVERIFICATION" && (
                  <div className="my-4 p-4 rounded-xl bg-orange-950/20 border border-orange-500/40">
                    <div className="flex items-center gap-2 text-xs font-bold text-orange-400 mb-2">
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                      MATERIAL TERMS CHANGED AT SOURCE — QUARANTINED FROM RECOMMENDATIONS
                    </div>
                    <p className="text-xs text-cliq-textSecondary mb-3">
                      Review previous approved parameters vs newly extracted parameters. Approval required to restore active recommendation eligibility.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 rounded-lg bg-cliq-bg/80 border border-cliq-border">
                        <div className="text-cliq-textMuted font-bold mb-1">Previous Approved Version (v{prevVersion.version})</div>
                        <div>Max Discount: <strong className="text-white">₹{prevVersion.max_discount_amount || "None"}</strong></div>
                        <div>Discount Value: <strong className="text-white">{prevVersion.discount_value}%</strong></div>
                        <div>Min Spend: <strong className="text-white">₹{prevVersion.min_transaction_value}</strong></div>
                        <div>Promo Code: <strong className="text-white">{prevVersion.promo_code || "None"}</strong></div>
                        <div className="text-cliq-textMuted truncate mt-1">Terms: {prevVersion.terms}</div>
                      </div>

                      <div className="p-3 rounded-lg bg-orange-900/10 border border-orange-500/30">
                        <div className="text-orange-400 font-bold mb-1">Proposed Source Terms (Current)</div>
                        <div>Max Discount: <strong className="text-white">₹{offer.max_discount_amount || "None"}</strong></div>
                        <div>Discount Value: <strong className="text-white">{offer.discount_value}%</strong></div>
                        <div>Min Spend: <strong className="text-white">₹{offer.min_transaction_value}</strong></div>
                        <div>Promo Code: <strong className="text-white">{offer.promo_code || "None"}</strong></div>
                        <div className="text-cliq-textMuted truncate mt-1">Terms: {offer.terms_and_conditions}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Source Provenance & Evidence Box */}
                <div className="mt-4 p-3.5 rounded-xl bg-cliq-bg/70 border border-cliq-border/80">
                  <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                    <div className="flex items-center gap-2 text-cliq-textMuted">
                      <Database className="w-3.5 h-3.5 text-cliq-cyan" />
                      <span>Source: <strong className="text-white">{offer.source_name || "Official Portal"}</strong></span>
                    </div>
                    {offer.source_url && (
                      <a
                        href={offer.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cliq-cyan hover:underline flex items-center gap-1 font-semibold"
                      >
                        Inspect Primary Source
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {offer.source_evidence && (
                    <div className="font-mono text-[11px] leading-relaxed text-cliq-textSecondary bg-cliq-bgSecondary/90 p-2.5 rounded-lg border border-cliq-border/50">
                      <span className="text-cliq-cyan font-bold mr-2">[EVIDENCE SNIPPET]</span>
                      {offer.source_evidence}
                    </div>
                  )}
                </div>

                {/* Extracted Details Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-4 text-xs">
                  <div className="p-2.5 rounded-xl bg-cliq-bg/50 border border-cliq-border/60">
                    <div className="text-[10px] text-cliq-textMuted uppercase font-bold">Benefit</div>
                    <div className="text-white font-extrabold mt-0.5">
                      {offer.discount_type === "PERCENTAGE" ? `${offer.discount_value}% Instant` : `₹${offer.discount_value} Flat`}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-cliq-bg/50 border border-cliq-border/60">
                    <div className="text-[10px] text-cliq-textMuted uppercase font-bold">Min Spend</div>
                    <div className="text-white font-extrabold mt-0.5">₹{offer.min_transaction_value}</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-cliq-bg/50 border border-cliq-border/60">
                    <div className="text-[10px] text-cliq-textMuted uppercase font-bold">Max Cap</div>
                    <div className="text-white font-extrabold mt-0.5">
                      {offer.max_discount_amount ? `₹${offer.max_discount_amount}` : "No Cap"}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-cliq-bg/50 border border-cliq-border/60">
                    <div className="text-[10px] text-cliq-textMuted uppercase font-bold">Bank / Network</div>
                    <div className="text-white font-bold truncate mt-0.5">
                      {offer.eligible_bank || offer.eligible_network || "All Cards"}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-cliq-bg/50 border border-cliq-border/60">
                    <div className="text-[10px] text-cliq-textMuted uppercase font-bold">Coupon Code</div>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <span className="text-cliq-cyan font-mono font-bold truncate">{offer.promo_code || "Auto"}</span>
                      {offer.promo_code && (
                        <button
                          onClick={() => copyPromo(offer.promo_code!, offer.id)}
                          className="text-cliq-textMuted hover:text-white"
                        >
                          {copiedId === offer.id ? <Check className="w-3 h-3 text-cliq-emerald" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-cliq-bg/50 border border-cliq-border/60">
                    <div className="text-[10px] text-cliq-textMuted uppercase font-bold">Expiry</div>
                    <div className="text-white font-bold mt-0.5">
                      {new Date(offer.valid_to).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Specific Variants & Activation */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  {offer.eligible_card_names && offer.eligible_card_names.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-cliq-textMuted font-medium">Eligible Variants:</span>
                      {offer.eligible_card_names.map((vn, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-cliq-bg border border-cliq-border text-[11px] text-white">
                          {vn}
                        </span>
                      ))}
                    </div>
                  )}

                  {offer.activation_requirement && (
                    <div className="text-cliq-textSecondary text-[11px] ml-auto">
                      Instruction: <span className="text-white">{offer.activation_requirement}</span>
                    </div>
                  )}
                </div>

                {/* Reviewer Stamp if already audited */}
                {offer.reviewed_by_name && (
                  <div className="mt-3 text-[11px] text-cliq-textMuted border-t border-cliq-border/40 pt-2 flex items-center justify-between">
                    <span>
                      Audited by <strong className="text-cliq-cyan">{offer.reviewed_by_name}</strong> on{" "}
                      {offer.reviewed_at ? new Date(offer.reviewed_at).toLocaleString() : "N/A"}
                    </span>
                    {offer.rejection_reason && (
                      <span className="text-rose-400">Reason: {offer.rejection_reason}</span>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-5 pt-4 border-t border-cliq-border flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenAudit(offer)}
                      className="px-3.5 py-1.5 rounded-xl bg-cliq-bg border border-cliq-border text-xs text-cliq-textSecondary hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <History className="w-3.5 h-3.5" />
                      Audit Trail
                    </button>
                    {offer.verification_status === "VERIFIED" && (
                      <button
                        onClick={() => handleTriggerReverification(offer)}
                        className="px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs text-orange-400 hover:bg-orange-500/20 transition-colors flex items-center gap-1.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Flag Reverification
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleOpenEdit(offer)}
                      className="px-4 py-2 rounded-xl bg-cliq-bg border border-cliq-cyan/40 text-xs font-semibold text-cliq-cyan hover:bg-cliq-cyan/10 transition-colors flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Terms
                    </button>

                    {offer.verification_status !== "REJECTED" && (
                      <button
                        onClick={() => setRejectingOffer(offer)}
                        className="px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs font-semibold text-rose-400 hover:bg-rose-500/25 transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject Offer
                      </button>
                    )}

                    {offer.verification_status !== "VERIFIED" && (
                      <button
                        onClick={() => handleApprove(offer)}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-cliq-emerald to-cliq-turquoise text-cliq-bg text-xs font-bold shadow-neonCyan hover:opacity-90 transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve & Verify
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Terms Modal */}
      {editingOffer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cliq-surface border border-cliq-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cliq-border">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-cliq-cyan" />
                Edit Offer Terms & Verification Parameters
              </h3>
              <button onClick={() => setEditingOffer(null)} className="text-cliq-textMuted hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-cliq-textMuted font-bold mb-1">Merchant Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.merchant_name}
                    onChange={(e) => setEditFormData({ ...editFormData, merchant_name: e.target.value })}
                    className="w-full bg-cliq-bg border border-cliq-border rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-cliq-textMuted font-bold mb-1">Offer Title</label>
                  <input
                    type="text"
                    required
                    value={editFormData.offer_title}
                    onChange={(e) => setEditFormData({ ...editFormData, offer_title: e.target.value })}
                    className="w-full bg-cliq-bg border border-cliq-border rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-cliq-textMuted font-bold mb-1">Discount Type</label>
                  <select
                    value={editFormData.discount_type}
                    onChange={(e) => setEditFormData({ ...editFormData, discount_type: e.target.value })}
                    className="w-full bg-cliq-bg border border-cliq-border rounded-lg px-3 py-2 text-white"
                  >
                    <option value="PERCENTAGE">PERCENTAGE (%)</option>
                    <option value="FLAT_AMOUNT">FLAT AMOUNT (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-cliq-textMuted font-bold mb-1">Discount Value</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editFormData.discount_value}
                    onChange={(e) => setEditFormData({ ...editFormData, discount_value: e.target.value })}
                    className="w-full bg-cliq-bg border border-cliq-border rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-cliq-textMuted font-bold mb-1">Max Cap Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Leave empty for no cap"
                    value={editFormData.max_discount_amount}
                    onChange={(e) => setEditFormData({ ...editFormData, max_discount_amount: e.target.value })}
                    className="w-full bg-cliq-bg border border-cliq-border rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-cliq-textMuted font-bold mb-1">Min Spend (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editFormData.min_transaction_value}
                    onChange={(e) => setEditFormData({ ...editFormData, min_transaction_value: e.target.value })}
                    className="w-full bg-cliq-bg border border-cliq-border rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-cliq-textMuted font-bold mb-1">Eligible Bank</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Bank"
                    value={editFormData.eligible_bank}
                    onChange={(e) => setEditFormData({ ...editFormData, eligible_bank: e.target.value })}
                    className="w-full bg-cliq-bg border border-cliq-border rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-cliq-textMuted font-bold mb-1">Promo Code</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFCFEST"
                    value={editFormData.promo_code}
                    onChange={(e) => setEditFormData({ ...editFormData, promo_code: e.target.value })}
                    className="w-full bg-cliq-bg border border-cliq-border rounded-lg px-3 py-2 text-white uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-cliq-textMuted font-bold mb-1">Eligible Specific Card Names (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Millennia, HDFC Regalia Gold"
                  value={editFormData.eligible_card_names_str}
                  onChange={(e) => setEditFormData({ ...editFormData, eligible_card_names_str: e.target.value })}
                  className="w-full bg-cliq-bg border border-cliq-border rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-cliq-textMuted font-bold mb-1">Official Terms & Conditions</label>
                <textarea
                  rows={3}
                  value={editFormData.terms_and_conditions}
                  onChange={(e) => setEditFormData({ ...editFormData, terms_and_conditions: e.target.value })}
                  className="w-full bg-cliq-bg border border-cliq-border rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="p-3 rounded-lg bg-cliq-bg border border-cliq-border flex items-center gap-2">
                <input
                  type="checkbox"
                  id="approveImmediately"
                  checked={editFormData.approve_immediately}
                  onChange={(e) => setEditFormData({ ...editFormData, approve_immediately: e.target.checked })}
                  className="rounded text-cliq-cyan focus:ring-cliq-cyan"
                />
                <label htmlFor="approveImmediately" className="text-white font-medium cursor-pointer">
                  Promote directly to <strong className="text-cliq-emerald">VERIFIED</strong> upon saving
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-cliq-border">
                <button
                  type="button"
                  onClick={() => setEditingOffer(null)}
                  className="px-4 py-2 rounded-xl bg-cliq-bg border border-cliq-border text-cliq-textSecondary hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cliq-cyan to-cliq-emerald text-cliq-bg font-bold shadow-neonCyan"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Offer Modal */}
      {rejectingOffer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cliq-surface border border-rose-500/40 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cliq-border">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 text-rose-400">
                <XCircle className="w-5 h-5 text-rose-400" />
                Reject Promotional Offer
              </h3>
              <button onClick={() => setRejectingOffer(null)} className="text-cliq-textMuted hover:text-white">✕</button>
            </div>

            <p className="text-xs text-cliq-textSecondary">
              Document why this offer is being rejected. This rationale will be permanently recorded in the audit trail.
            </p>

            <form onSubmit={handleReject} className="space-y-4 text-xs">
              <div>
                <label className="block text-cliq-textMuted font-bold mb-1">Rejection Reason *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Source terms expired, issuer confirmed promotion discontinued, or unverified aggregator claims."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-cliq-bg border border-cliq-border rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingOffer(null)}
                  className="px-4 py-2 rounded-xl bg-cliq-bg border border-cliq-border text-cliq-textSecondary hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-colors"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Trail Modal */}
      {auditOffer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cliq-surface border border-cliq-border rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cliq-border">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-cliq-cyan" />
                Offer Audit Trail & Provenance History
              </h3>
              <button onClick={() => setAuditOffer(null)} className="text-cliq-textMuted hover:text-white">✕</button>
            </div>

            <div className="text-xs text-cliq-textSecondary">
              Offer: <strong className="text-white">{auditOffer.offer_title}</strong> ({auditOffer.merchant_name})
            </div>

            {auditLoading ? (
              <div className="text-center py-10 text-cliq-textSecondary">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cliq-cyan mb-2" />
                <p className="text-xs">Loading audit log...</p>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-8 text-cliq-textMuted text-xs">
                No historic audit log events recorded for this offer yet.
              </div>
            ) : (
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-cliq-bg/80 border border-cliq-border text-xs">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-extrabold text-cliq-cyan">{log.action}</span>
                      <span className="text-[10px] text-cliq-textMuted">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-cliq-textSecondary">
                      Actor: <strong className="text-white">{log.actor_name || "System Ingestion Worker"}</strong> ({log.actor_role})
                    </div>
                    {log.from_status && log.to_status && (
                      <div className="text-cliq-textMuted mt-1">
                        Status Transition: {log.from_status} → <strong className="text-white">{log.to_status}</strong>
                      </div>
                    )}
                    {log.notes && (
                      <div className="mt-1.5 p-2 rounded bg-cliq-bgSecondary/60 text-cliq-textSecondary text-[11px] italic">
                        &ldquo;{log.notes}&rdquo;
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

