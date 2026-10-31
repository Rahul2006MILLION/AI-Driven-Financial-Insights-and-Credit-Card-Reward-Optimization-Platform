"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  api,
  CardOffer,
  OfferAuditLog,
  DiscoverySyncResult,
  OfferSource,
  SourceHealthProbe,
  SourceFailureLog,
  AdminOfferDocument,
  ManualOfferCreateRequest,
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
  UploadCloud,
  FileUp,
  AlertCircle,
  Activity,
  PlusCircle,
  Wifi,
  WifiOff,
  Server,
  Zap,
} from "lucide-react";

export default function AdminOfferReviewPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);

  // Active top-level sub-tab
  const [activeTab, setActiveTab] = useState<"review" | "sources" | "upload_circular" | "manual_entry" | "failures">("review");

  // Review Queue state
  const [offers, setOffers] = useState<CardOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters & Search for Review Queue
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

  // --- Source Registry State ---
  const [sources, setSources] = useState<OfferSource[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [probingMap, setProbingMap] = useState<Record<string, boolean>>({});
  const [probeResultMap, setProbeResultMap] = useState<Record<string, SourceHealthProbe>>({});
  const [probeAllLoading, setProbeAllLoading] = useState(false);

  // --- Circular Document Upload State ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSourceId, setUploadSourceId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [documents, setDocuments] = useState<AdminOfferDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);

  // --- Manual Offer Entry State ---
  const [manualForm, setManualForm] = useState<ManualOfferCreateRequest>({
    merchant_name: "",
    offer_title: "",
    category_id: "shopping",
    discount_type: "PERCENTAGE",
    discount_value: 10,
    min_transaction_value: 500,
    max_discount_amount: 1000,
    eligible_bank: "HDFC Bank",
    eligible_network: "VISA",
    eligible_card_names: [],
    valid_to: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    payment_channel: "ONLINE",
    promo_code: "",
    activation_requirement: "",
    terms_and_conditions: "",
    source_url: "",
    source_name: "Official Bank Circular",
    source_evidence: "",
  });
  const [manualSubmitting, setManualSubmitting] = useState(false);

  // --- Failure Logs State ---
  const [failures, setFailures] = useState<SourceFailureLog[]>([]);
  const [failuresLoading, setFailuresLoading] = useState(false);

  useEffect(() => {
    const s = getStoredSession();
    setSession(s);
    if (s) {
      loadQueue(statusFilter, searchQuery);
      loadSources();
    } else {
      setLoading(false);
    }
  }, [statusFilter]);

  // Load sources when switching to sources or upload tab
  useEffect(() => {
    if (activeTab === "sources") {
      loadSources();
    } else if (activeTab === "upload_circular") {
      loadDocuments();
      if (sources.length === 0) loadSources();
    } else if (activeTab === "failures") {
      loadFailures();
    }
  }, [activeTab]);

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

  const loadSources = async () => {
    setSourcesLoading(true);
    try {
      const data = await api.getOfferSources();
      setSources(data);
    } catch (err: any) {
      // Don't overwrite general errors unless active tab is sources
      if (activeTab === "sources") {
        setError(err.message || "Failed to load offer sources.");
      }
    } finally {
      setSourcesLoading(false);
    }
  };

  const loadDocuments = async () => {
    setDocsLoading(true);
    try {
      const data = await api.getAdminDocuments();
      setDocuments(data);
    } catch (err: any) {
      if (activeTab === "upload_circular") {
        setError(err.message || "Failed to load uploaded documents.");
      }
    } finally {
      setDocsLoading(false);
    }
  };

  const loadFailures = async () => {
    setFailuresLoading(true);
    try {
      const data = await api.getSourceFailures({ limit: 50 });
      setFailures(data);
    } catch (err: any) {
      setError(err.message || "Failed to load failure logs.");
    } finally {
      setFailuresLoading(false);
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
      await loadSources();
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
      loadSources();
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

  // --- Source Probe Handlers ---
  const handleProbeSource = async (sourceId: string) => {
    setProbingMap((prev) => ({ ...prev, [sourceId]: true }));
    setError(null);
    try {
      const res = await api.probeSource(sourceId);
      setProbeResultMap((prev) => ({ ...prev, [sourceId]: res }));
      setSuccessMsg(`Probe completed for ${res.source_key}: HTTP ${res.http_status} (${res.health})`);
      loadSources();
    } catch (err: any) {
      setError(err.message || "Probe failed.");
    } finally {
      setProbingMap((prev) => ({ ...prev, [sourceId]: false }));
    }
  };

  const handleProbeAllSources = async () => {
    setProbeAllLoading(true);
    setError(null);
    try {
      const results = await api.probeAllSources();
      const newMap: Record<string, SourceHealthProbe> = {};
      results.forEach((r) => {
        newMap[r.source_key] = r;
      });
      setProbeResultMap((prev) => ({ ...prev, ...newMap }));
      setSuccessMsg(`Parallel health probe completed for ${results.length} sources.`);
      loadSources();
    } catch (err: any) {
      setError(err.message || "Failed to probe all sources.");
    } finally {
      setProbeAllLoading(false);
    }
  };

  // --- Upload Circular Handlers ---
  const handleUploadCircular = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a valid PDF circular file.");
      return;
    }
    setUploading(true);
    setError(null);
    setSuccessMsg(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (uploadSourceId) {
        formData.append("source_id", uploadSourceId);
      }

      const res = await api.uploadCircular(formData);
      setUploadResult(res);
      setSuccessMsg(`Successfully processed "${selectedFile.name}": Extracted ${res.extracted_count} offers, staged ${res.staged_count} into PENDING_REVIEW.`);
      setSelectedFile(null);
      loadDocuments();
      loadQueue(statusFilter, searchQuery);
    } catch (err: any) {
      setError(err.message || "Failed to upload and parse circular PDF.");
    } finally {
      setUploading(false);
    }
  };

  // --- Manual Offer Entry Handler ---
  const handleManualOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.createManualOffer({
        ...manualForm,
        discount_value: Number(manualForm.discount_value),
        min_transaction_value: Number(manualForm.min_transaction_value || 0),
        max_discount_amount: manualForm.max_discount_amount ? Number(manualForm.max_discount_amount) : undefined,
      });
      setSuccessMsg(`Manual offer "${res.offer_title}" created and staged into PENDING_REVIEW with canonical hash.`);
      // Reset form
      setManualForm({
        merchant_name: "",
        offer_title: "",
        category_id: "shopping",
        discount_type: "PERCENTAGE",
        discount_value: 10,
        min_transaction_value: 500,
        max_discount_amount: 1000,
        eligible_bank: "HDFC Bank",
        eligible_network: "VISA",
        eligible_card_names: [],
        valid_to: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        payment_channel: "ONLINE",
        promo_code: "",
        activation_requirement: "",
        terms_and_conditions: "",
        source_url: "",
        source_name: "Official Bank Circular",
        source_evidence: "",
      });
      setActiveTab("review");
      setStatusFilter("PENDING_REVIEW");
      loadQueue("PENDING_REVIEW");
    } catch (err: any) {
      setError(err.message || "Failed to create manual offer.");
    } finally {
      setManualSubmitting(false);
    }
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

  const getConnectorBadge = (status: string) => {
    switch (status) {
      case "IMPLEMENTED":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cliq-emerald/15 text-cliq-emerald border border-cliq-emerald/30">
            IMPLEMENTED
          </span>
        );
      case "PARTIALLY_IMPLEMENTED":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            PARTIAL
          </span>
        );
      case "MANUAL_ONLY":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            MANUAL ONLY
          </span>
        );
      case "BLOCKED":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            BLOCKED
          </span>
        );
      case "ROBOTS_DISALLOWED":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
            ROBOTS DISALLOWED
          </span>
        );
      case "SOURCE_UNAVAILABLE":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-500/15 text-zinc-400 border border-zinc-500/30">
            UNAVAILABLE
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-700/30 text-zinc-400 border border-zinc-700">
            {status}
          </span>
        );
    }
  };

  const getHealthBadge = (health: string) => {
    switch (health) {
      case "HEALTHY":
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-cliq-emerald">
            <span className="w-2 h-2 rounded-full bg-cliq-emerald animate-pulse" />
            HEALTHY
          </span>
        );
      case "DEGRADED":
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            DEGRADED
          </span>
        );
      case "FAILING":
      case "BLOCKED":
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            {health}
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-cliq-textMuted">
            <span className="w-2 h-2 rounded-full bg-zinc-500" />
            {health}
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
                OFFER INTELLIGENCE & VERIFICATION DESK
              </span>
              <span className="text-xs text-cliq-textMuted">Phase 2 Source-Adaptive Ingestion</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Central Offer Intelligence Infrastructure
            </h1>
            <p className="text-sm text-cliq-textSecondary max-w-2xl mt-1">
              Multi-channel ingestion across HTML, PDF circulars, authorized feeds, and manual registry with mandatory human verification.
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

      {/* Primary Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-cliq-border/80 pb-4 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("review")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "review"
              ? "bg-cliq-cyan text-cliq-bg shadow-neonCyan"
              : "bg-cliq-surface text-cliq-textSecondary border border-cliq-border hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          Review Queue ({offers.length})
        </button>

        <button
          onClick={() => setActiveTab("sources")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "sources"
              ? "bg-cliq-cyan text-cliq-bg shadow-neonCyan"
              : "bg-cliq-surface text-cliq-textSecondary border border-cliq-border hover:text-white"
          }`}
        >
          <Server className="w-4 h-4" />
          Source Registry & Health ({sources.length || 8})
        </button>

        <button
          onClick={() => setActiveTab("upload_circular")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "upload_circular"
              ? "bg-cliq-cyan text-cliq-bg shadow-neonCyan"
              : "bg-cliq-surface text-cliq-textSecondary border border-cliq-border hover:text-white"
          }`}
        >
          <FileUp className="w-4 h-4" />
          Upload Circular (PDF)
        </button>

        <button
          onClick={() => setActiveTab("manual_entry")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "manual_entry"
              ? "bg-cliq-cyan text-cliq-bg shadow-neonCyan"
              : "bg-cliq-surface text-cliq-textSecondary border border-cliq-border hover:text-white"
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          Manual Offer Entry
        </button>

        <button
          onClick={() => setActiveTab("failures")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "failures"
              ? "bg-cliq-cyan text-cliq-bg shadow-neonCyan"
              : "bg-cliq-surface text-cliq-textSecondary border border-cliq-border hover:text-white"
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          Failure Logs ({failures.length})
        </button>
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

      {/* ========================================================================= */}
      {/* TAB 1: REVIEW QUEUE                                                       */}
      {/* ========================================================================= */}
      {activeTab === "review" && (
        <div className="space-y-6">
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
                No offers currently matching the &ldquo;{statusFilter}&rdquo; filter. Run discovery sync, upload a circular, or add an offer manually.
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
                          <span className="text-xs text-cliq-textSecondary">
                            Ingested via: <span className="font-mono text-cliq-cyan">{offer.ingestion_channel || "MANUAL_ENTRY"}</span>
                          </span>
                          <span className="text-cliq-textMuted">•</span>
                          <span className="text-xs text-cliq-textSecondary">v{offer.version || 1}</span>
                        </div>
                        <h2 className="text-lg font-extrabold text-white">{offer.offer_title}</h2>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Freshness Badge */}
                        <div className="px-2.5 py-1 rounded-xl bg-cliq-bg border border-cliq-border text-center">
                          <div className="text-[9px] text-cliq-textMuted uppercase font-bold tracking-wider">
                            Freshness
                          </div>
                          <div className="text-[11px] font-bold text-cliq-emerald">
                            {offer.freshness_state || "FRESH"}
                          </div>
                        </div>

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

                    {/* Financial Terms Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 text-xs">
                      <div className="p-3 rounded-xl bg-cliq-bg/50 border border-cliq-border/60">
                        <span className="text-cliq-textMuted block mb-0.5">Discount Benefit</span>
                        <span className="text-sm font-extrabold text-white">
                          {offer.discount_type === "PERCENTAGE"
                            ? `${offer.discount_value}% OFF`
                            : `Flat ₹${offer.discount_value} OFF`}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-cliq-bg/50 border border-cliq-border/60">
                        <span className="text-cliq-textMuted block mb-0.5">Maximum Discount</span>
                        <span className="text-sm font-bold text-white">
                          {offer.max_discount_amount ? `₹${offer.max_discount_amount}` : "No Max Cap"}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-cliq-bg/50 border border-cliq-border/60">
                        <span className="text-cliq-textMuted block mb-0.5">Minimum Spend</span>
                        <span className="text-sm font-bold text-white">
                          {parseFloat(String(offer.min_transaction_value)) > 0
                            ? `₹${offer.min_transaction_value}`
                            : "No Minimum"}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-cliq-bg/50 border border-cliq-border/60">
                        <span className="text-cliq-textMuted block mb-0.5">Expiry Date</span>
                        <span className="text-sm font-bold text-white">
                          {new Date(offer.valid_to).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Eligibility & Cards */}
                    <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                      {offer.eligible_bank && (
                        <span className="px-2.5 py-1 rounded-lg bg-cliq-surface border border-cliq-border text-cliq-textSecondary flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-cliq-cyan" />
                          Bank: <strong className="text-white">{offer.eligible_bank}</strong>
                        </span>
                      )}

                      {offer.eligible_network && (
                        <span className="px-2.5 py-1 rounded-lg bg-cliq-surface border border-cliq-border text-cliq-textSecondary">
                          Network: <strong className="text-white">{offer.eligible_network}</strong>
                        </span>
                      )}

                      {offer.promo_code && (
                        <button
                          onClick={() => copyPromo(offer.promo_code!, offer.id)}
                          className="px-2.5 py-1 rounded-lg bg-cliq-cyan/10 border border-cliq-cyan/30 text-cliq-cyan font-mono font-bold flex items-center gap-1.5 hover:bg-cliq-cyan/20 transition-colors"
                        >
                          <Tag className="w-3 h-3" />
                          Code: {offer.promo_code}
                          {copiedId === offer.id ? <Check className="w-3 h-3 text-cliq-emerald" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}

                      {offer.eligible_card_names && offer.eligible_card_names.length > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-cliq-surface border border-cliq-border text-cliq-textMuted">
                          Variants: {offer.eligible_card_names.join(", ")}
                        </span>
                      )}
                    </div>

                    {/* Admin Action Bar */}
                    <div className="pt-4 border-t border-cliq-border/60 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenAudit(offer)}
                          className="px-3 py-1.5 rounded-lg bg-cliq-bg border border-cliq-border text-xs font-medium text-cliq-textSecondary hover:text-white transition-colors flex items-center gap-1.5"
                        >
                          <History className="w-3.5 h-3.5" />
                          Audit Trail
                        </button>

                        <button
                          onClick={() => handleOpenEdit(offer)}
                          className="px-3 py-1.5 rounded-lg bg-cliq-bg border border-cliq-border text-xs font-medium text-cliq-textSecondary hover:text-white transition-colors flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit Terms
                        </button>

                        {offer.verification_status === "VERIFIED" && (
                          <button
                            onClick={() => handleTriggerReverification(offer)}
                            className="px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-xs font-medium text-orange-400 hover:bg-orange-500/20 transition-colors flex items-center gap-1.5"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Quarantine
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {offer.verification_status !== "REJECTED" && (
                          <button
                            onClick={() => {
                              setRejectingOffer(offer);
                              setRejectionReason("");
                            }}
                            className="px-4 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-colors flex items-center gap-1.5"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        )}

                        {offer.verification_status !== "VERIFIED" && (
                          <button
                            onClick={() => handleApprove(offer)}
                            className="px-5 py-1.5 rounded-xl bg-gradient-to-r from-cliq-cyan to-cliq-emerald text-cliq-bg text-xs font-bold shadow-neonCyan hover:opacity-90 transition-all flex items-center gap-1.5"
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SOURCE REGISTRY & HEALTH                                           */}
      {/* ========================================================================= */}
      {activeTab === "sources" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-cliq-surface border border-cliq-border">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-cliq-cyan" />
                Registered Ingestion Sources ({sources.length})
              </h2>
              <p className="text-xs text-cliq-textSecondary mt-0.5">
                Explicit connector states, robots.txt compliance, anti-bot boundaries, and real-time HTTP health.
              </p>
            </div>
            <button
              onClick={handleProbeAllSources}
              disabled={probeAllLoading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cliq-cyan to-cliq-emerald text-cliq-bg font-bold text-xs shadow-neonCyan hover:opacity-90 transition-all flex items-center gap-2"
            >
              <Zap className={`w-4 h-4 ${probeAllLoading ? "animate-pulse" : ""}`} />
              {probeAllLoading ? "Probing Sources..." : "Probe All Sources (Parallel)"}
            </button>
          </div>

          {sourcesLoading ? (
            <div className="text-center py-16 text-cliq-textSecondary">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-cliq-cyan mb-2" />
              <p className="text-xs">Loading sources registry...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sources.map((src) => {
                const probeRes = probeResultMap[src.id] || probeResultMap[src.source_key];
                const isProbing = Boolean(probingMap[src.id]);

                return (
                  <div
                    key={src.id}
                    className="p-5 rounded-2xl bg-cliq-surface/90 border border-cliq-border flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cliq-bg border border-cliq-border text-cliq-cyan">
                              {src.source_type}
                            </span>
                            <span className="text-xs text-cliq-textMuted font-mono">{src.domain}</span>
                          </div>
                          <h3 className="text-base font-extrabold text-white">{src.source_name}</h3>
                        </div>
                        <div className="text-right shrink-0">
                          {getHealthBadge(src.source_health)}
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-wrap items-center gap-2 my-3">
                        <div className="flex items-center gap-1.5 text-xs text-cliq-textSecondary">
                          <span>Connector:</span>
                          {getConnectorBadge(src.connector_status)}
                        </div>
                      </div>

                      {/* Supported Ingestion Methods */}
                      <div className="my-2.5">
                        <span className="text-[10px] text-cliq-textMuted uppercase font-bold block mb-1">
                          Supported Channels
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(src.supported_ingestion_methods || []).map((method) => (
                            <span
                              key={method}
                              className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cliq-bg border border-cliq-border text-cliq-textSecondary"
                            >
                              {method}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Permission status notes */}
                      <div className="p-2.5 rounded-xl bg-cliq-bg/60 border border-cliq-border/60 text-xs text-cliq-textSecondary mt-3">
                        <span className="text-cliq-cyan font-bold block mb-0.5">Access Boundary:</span>
                        {src.access_permission_status}
                      </div>

                      {/* Live Probe Result Box if available */}
                      {probeRes && (
                        <div className="mt-3 p-3 rounded-xl bg-cliq-bgSecondary/90 border border-cliq-cyan/30 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-cliq-cyan">Live Probe Response:</span>
                            <span className="font-mono text-white">HTTP {probeRes.http_status}</span>
                          </div>
                          <div className="text-cliq-textSecondary">
                            Latency: <strong className="text-white">{probeRes.latency_ms ?? "N/A"} ms</strong>
                            {probeRes.waf && probeRes.waf.length > 0 && (
                              <span className="ml-2 text-amber-400">
                                WAF: {probeRes.waf.join(", ")}
                              </span>
                            )}
                          </div>
                          {probeRes.robots_allowed !== null && (
                            <div className="text-[11px] text-cliq-textMuted">
                              robots.txt: {probeRes.robots_allowed ? "Allowed" : "Disallowed"}
                            </div>
                          )}
                          {probeRes.message && (
                            <div className="text-[11px] text-cliq-textMuted italic">{probeRes.message}</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Footer */}
                    <div className="pt-3 border-t border-cliq-border/60 flex items-center justify-between text-xs">
                      <div className="text-cliq-textMuted">
                        Active Offers: <strong className="text-white">{src.active_offers_count || 0}</strong>
                      </div>
                      <button
                        onClick={() => handleProbeSource(src.id)}
                        disabled={isProbing}
                        className="px-3 py-1.5 rounded-lg bg-cliq-bg border border-cliq-border hover:border-cliq-cyan/50 text-white font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 text-cliq-cyan ${isProbing ? "animate-spin" : ""}`} />
                        {isProbing ? "Probing..." : "Probe Live"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: UPLOAD CIRCULAR (PDF)                                              */}
      {/* ========================================================================= */}
      {activeTab === "upload_circular" && (
        <div className="space-y-8">
          <div className="p-6 rounded-2xl bg-cliq-surface border border-cliq-border space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileUp className="w-5 h-5 text-cliq-cyan" />
                Upload Official Bank Circular (PDF)
              </h2>
              <p className="text-xs text-cliq-textSecondary mt-1">
                Upload official digital bank or merchant circulars. CLIQ Document Intelligence securely extracts terms, discount structures, eligibility rules, and verbatim evidence snippets.
              </p>
            </div>

            {/* OCR Notice Alert */}
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-blue-400">
                <AlertCircle className="w-4 h-4" />
                Digital Text PDFs Only (OCR Explicitly Unsupported)
              </div>
              <p className="text-blue-200/80 leading-relaxed">
                To guarantee zero hallucination and strict financial explainability, scanned raster image documents are rejected. Please provide official digital vector/text PDF circulars issued by banks or merchants.
              </p>
            </div>

            {/* Upload Form */}
            <form onSubmit={handleUploadCircular} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-cliq-textMuted mb-1.5">
                    Select Originating Source (Optional)
                  </label>
                  <select
                    value={uploadSourceId}
                    onChange={(e) => setUploadSourceId(e.target.value)}
                    className="w-full bg-cliq-bg border border-cliq-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cliq-cyan"
                  >
                    <option value="">Auto-Detect from Document Content</option>
                    {sources.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.source_name} ({s.source_type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-cliq-textMuted mb-1.5">
                    Select Circular File (.pdf, max 10MB) *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-cliq-textSecondary file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cliq-cyan file:text-cliq-bg hover:file:opacity-90 cursor-pointer"
                  />
                </div>
              </div>

              {selectedFile && (
                <div className="p-3 rounded-xl bg-cliq-bg/80 border border-cliq-border text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cliq-cyan" />
                    <span className="font-bold text-white">{selectedFile.name}</span>
                    <span className="text-cliq-textMuted">({Math.round(selectedFile.size / 1024)} KB)</span>
                  </div>
                  <span className="text-cliq-emerald text-[11px] font-semibold">Ready to parse</span>
                </div>
              )}

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cliq-cyan to-cliq-emerald text-cliq-bg font-bold text-xs shadow-neonCyan hover:opacity-90 disabled:opacity-40 transition-all flex items-center gap-2"
                >
                  <UploadCloud className={`w-4 h-4 ${uploading ? "animate-bounce" : ""}`} />
                  {uploading ? "Parsing Circular & Staging..." : "Upload & Extract Offers"}
                </button>
              </div>
            </form>

            {/* Extracted Staged Offers Result */}
            {uploadResult && (
              <div className="mt-6 p-5 rounded-xl bg-cliq-bgSecondary/90 border border-cliq-emerald/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cliq-emerald font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    Circular Processed Successfully
                  </div>
                  <span className="text-xs text-cliq-textMuted font-mono">
                    Doc ID: {uploadResult.document_id}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-cliq-bg border border-cliq-border">
                    <span className="text-cliq-textMuted block">Extracted Offers</span>
                    <span className="text-base font-extrabold text-white">{uploadResult.extracted_count}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-cliq-bg border border-cliq-border">
                    <span className="text-cliq-textMuted block">Staged to Pending Review</span>
                    <span className="text-base font-extrabold text-cliq-emerald">{uploadResult.staged_count}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-cliq-bg border border-cliq-border">
                    <span className="text-cliq-textMuted block">Quarantined for Changes</span>
                    <span className="text-base font-extrabold text-orange-400">{uploadResult.quarantined_count}</span>
                  </div>
                </div>

                <div className="text-xs text-cliq-textSecondary">
                  {uploadResult.staged_offers && uploadResult.staged_offers.length > 0 && (
                    <div className="space-y-2 mt-3">
                      <span className="font-bold text-white block">Staged Offers Preview:</span>
                      {uploadResult.staged_offers.map((staged: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg bg-cliq-bg/80 border border-cliq-border text-xs flex items-center justify-between">
                          <div>
                            <span className="font-bold text-white">{staged.offer_title}</span>
                            <span className="text-cliq-textMuted block">
                              {staged.merchant_name} • {staged.discount_type === "PERCENTAGE" ? `${staged.discount_value}%` : `₹${staged.discount_value}`} off • Code: {staged.promo_code || "None"}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold text-[10px]">
                            PENDING REVIEW
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Uploaded Documents Archive Table */}
          <div className="p-6 rounded-2xl bg-cliq-surface border border-cliq-border space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cliq-cyan" />
              Uploaded Official Circulars History ({documents.length})
            </h3>

            {docsLoading ? (
              <div className="text-center py-8 text-cliq-textSecondary text-xs">
                Loading circular documents history...
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-cliq-textMuted text-xs">
                No official circulars uploaded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-cliq-textSecondary">
                  <thead className="bg-cliq-bg/60 text-cliq-textMuted uppercase font-bold border-b border-cliq-border">
                    <tr>
                      <th className="py-2.5 px-3">Filename</th>
                      <th className="py-2.5 px-3">SHA-256 Hash</th>
                      <th className="py-2.5 px-3">Size</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Extracted</th>
                      <th className="py-2.5 px-3">Uploaded At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cliq-border/40">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-cliq-bg/30">
                        <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-cliq-cyan" />
                          {doc.filename}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-cliq-textMuted truncate max-w-[150px]">
                          {doc.sha256_hash}
                        </td>
                        <td className="py-2.5 px-3">{Math.round(doc.file_size_bytes / 1024)} KB</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cliq-emerald/15 text-cliq-emerald border border-cliq-emerald/30">
                            {doc.processing_status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-white">{doc.extracted_offers_count}</td>
                        <td className="py-2.5 px-3 text-cliq-textMuted">
                          {new Date(doc.uploaded_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MANUAL OFFER ENTRY                                                 */}
      {/* ========================================================================= */}
      {activeTab === "manual_entry" && (
        <div className="p-6 rounded-2xl bg-cliq-surface border border-cliq-border space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-cliq-cyan" />
              Manual Offer Registration (Admin Entry)
            </h2>
            <p className="text-xs text-cliq-textSecondary mt-1">
              Add verified offers with mandatory primary source URL and verbatim evidence snippet. Generates canonical hash and stages to PENDING_REVIEW.
            </p>
          </div>

          <form onSubmit={handleManualOfferSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-cliq-textMuted font-bold mb-1">Merchant Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swiggy, Amazon, BookMyShow"
                  value={manualForm.merchant_name}
                  onChange={(e) => setManualForm({ ...manualForm, merchant_name: e.target.value })}
                  className="w-full bg-cliq-bg border border-cliq-border rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-cliq-textMuted font-bold mb-1">Offer Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10% Instant Discount on HDFC Credit Cards"
                  value={manualForm.offer_title}
                  onChange={(e) => setManualForm({ ...manualForm, offer_title: e.target.value })}
                  className="w-full bg-cliq-bg border border-cliq-border rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-cliq-textMuted font-bold mb-1">Category *</label>
                <select
                  value={manualForm.category_id}
                  onChange={(e) => setManualForm({ ...manualForm, category_id: e.target.value })}
                  className="w-full bg-cliq-bg border border-cliq-border rounded-xl px-3 py-2 text-white"
                >
                  <option value="shopping">Shopping</option>
                  <option value="dining">Dining & Food Delivery</option>
                  <option value="travel">Travel & Airlines</option>
                  <option value="grocery">Grocery & Quick Commerce</option>
                  <option value="entertainment">Movies & Entertainment</option>
                  <option value="utility">Utility & Bills</option>
                  <option value="fuel">Fuel & Automotive</option>
                </select>
              </div>

              <div>
                <label className="block text-cliq-textMuted font-bold mb-1">Payment Channel *</label>
                <select
                  value={manualForm.payment_channel}
                  onChange={(e) => setManualForm({ ...manualForm, payment_channel: e.target.value as any })}
                  className="w-full bg-cliq-bg border border-cliq-border rounded-xl px-3 py-2 text-white"
                >
                  <option value="ONLINE">Online Checkout</option>
                  <option value="OFFLINE">In-Store POS / Terminal</option>
                  <option value="BOTH">Omnichannel (Online & Offline)</option>
                </select>
              </div>

              <div>
                <label className="block text-cliq-textMuted font-bold mb-1">Discount Type *</label>
                <select
                  value={manualForm.discount_type}
                  onChange={(e) => setManualForm({ ...manualForm, discount_type: e.target.value as any })}
                  className="w-full bg-cliq-bg border border-cliq-border rounded-xl px-3 py-2 text-white"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FLAT_AMOUNT">Flat Cashback / Discount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-cliq-textMuted font-bold mb-1">
                  Discount Value ({manualForm.discount_type === "PERCENTAGE" ? "%" : "₹"}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={manualForm.discount_value}
                  onChange={(e) => setManualForm({ ...manualForm, discount_value: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-cliq-bg border border-cliq-border rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-cliq-textMuted font-bold mb-1">Minimum Transaction Spend (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={manualForm.min_transaction_value}
                  onChange={(e) => setManualForm({ ...manualForm, min_transaction_value: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-cliq-bg border border-cliq-border rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-cliq-textMuted font-bold mb-1">Max Discount Cap (₹, optional)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Leave empty if uncapped"
                  value={manualForm.max_discount_amount || ""}
                  onChange={(e) => setManualForm({ ...manualForm, max_discount_amount: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full bg-cliq-bg border border-cliq-border rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-cliq-textMuted font-bold mb-1">Eligible Bank</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank, ICICI Bank, Axis Bank"
                  value={manualForm.eligible_bank || ""}
                  onChange={(e) => setManualForm({ ...manualForm, eligible_bank: e.target.value })}
                  className="w-full bg-cliq-bg border border-cliq-border rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-cliq-textMuted font-bold mb-1">Eligible Payment Network</label>
                <select
                  value={manualForm.eligible_network || ""}
                  onChange={(e) => setManualForm({ ...manualForm, eligible_network: e.target.value || undefined })}
                  className="w-full bg-cliq-bg border border-cliq-border rounded-xl px-3 py-2 text-white"
                >
                  <option value="">Any Network</option>
                  <option value="VISA">VISA</option>
                  <option value="MASTERCARD">Mastercard</option>
                  <option value="RUPAY">RuPay</option>
                  <option value="AMEX">American Express</option>
                  <option value="DINERS">Diners Club</option>
                </select>
              </div>

              <div>
                <label className="block text-cliq-textMuted font-bold mb-1">Promo / Coupon Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. HDFCFEST, MMTSBI"
                  value={manualForm.promo_code || ""}
                  onChange={(e) => setManualForm({ ...manualForm, promo_code: e.target.value })}
                  className="w-full bg-cliq-bg border border-cliq-border rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-cliq-textMuted font-bold mb-1">Valid Until (Expiry Date) *</label>
                <input
                  type="date"
                  required
                  value={manualForm.valid_to}
                  onChange={(e) => setManualForm({ ...manualForm, valid_to: e.target.value })}
                  className="w-full bg-cliq-bg border border-cliq-border rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            {/* Attribution Requirements */}
            <div className="p-4 rounded-xl bg-cliq-bg/90 border border-cliq-border space-y-3">
              <span className="font-bold text-white text-xs block">Mandatory Source Attribution</span>

              <div>
                <label className="block text-cliq-textMuted font-bold mb-1">Primary Source URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://www.hdfcbank.com/... or official circular link"
                  value={manualForm.source_url}
                  onChange={(e) => setManualForm({ ...manualForm, source_url: e.target.value })}
                  className="w-full bg-cliq-bg border border-cliq-border rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-cliq-textMuted font-bold mb-1">Verbatim Evidence Snippet *</label>
                <textarea
                  rows={2}
                  required
                  placeholder='Quote the exact text from the source page: "Get 10% instant discount up to ₹1,500 with HDFC Bank Credit Cards on min spend ₹5,000."'
                  value={manualForm.source_evidence}
                  onChange={(e) => setManualForm({ ...manualForm, source_evidence: e.target.value })}
                  className="w-full bg-cliq-bg border border-cliq-border rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="submit"
                disabled={manualSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cliq-cyan to-cliq-emerald text-cliq-bg font-bold text-xs shadow-neonCyan hover:opacity-90 disabled:opacity-40 transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                {manualSubmitting ? "Registering Offer..." : "Submit to Review Queue"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SOURCE FAILURE LOGS                                                */}
      {/* ========================================================================= */}
      {activeTab === "failures" && (
        <div className="p-6 rounded-2xl bg-cliq-surface border border-cliq-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                Ingestion Failure & Retry Logs
              </h2>
              <p className="text-xs text-cliq-textSecondary mt-0.5">
                Audit trail of connection errors, WAF bot mitigations, timeouts, and exponential backoff retry schedules.
              </p>
            </div>
            <button
              onClick={loadFailures}
              disabled={failuresLoading}
              className="px-3 py-1.5 rounded-lg bg-cliq-bg border border-cliq-border hover:border-cliq-cyan/50 text-white font-medium text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cliq-cyan ${failuresLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {failuresLoading ? (
            <div className="text-center py-12 text-cliq-textSecondary text-xs">
              Loading failure logs...
            </div>
          ) : failures.length === 0 ? (
            <div className="text-center py-12 text-cliq-textMuted text-xs">
              <CheckCircle2 className="w-8 h-8 text-cliq-emerald/60 mx-auto mb-2" />
              No failure events recorded in the source logs.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-cliq-textSecondary">
                <thead className="bg-cliq-bg/60 text-cliq-textMuted uppercase font-bold border-b border-cliq-border">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Error Type</th>
                    <th className="py-2.5 px-3">HTTP Status</th>
                    <th className="py-2.5 px-3">Attempt #</th>
                    <th className="py-2.5 px-3">Retry Backoff</th>
                    <th className="py-2.5 px-3">Error Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cliq-border/40">
                  {failures.map((f) => (
                    <tr key={f.id} className="hover:bg-cliq-bg/30">
                      <td className="py-2.5 px-3 text-cliq-textMuted whitespace-nowrap">
                        {new Date(f.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-rose-400">
                        {f.error_type}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-white">
                        {f.http_status ? `HTTP ${f.http_status}` : "N/A"}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white">{f.attempt_number}</td>
                      <td className="py-2.5 px-3 font-mono text-amber-400">
                        {f.retry_after_seconds ? `${f.retry_after_seconds}s` : "None"}
                      </td>
                      <td className="py-2.5 px-3 text-cliq-textSecondary max-w-md truncate" title={f.error_message}>
                        {f.error_message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS                                                                    */}
      {/* ========================================================================= */}

      {/* Edit Offer Modal */}
      {editingOffer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cliq-surface border border-cliq-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cliq-border">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-cliq-cyan" />
                Refine & Edit Offer Terms
              </h3>
              <button onClick={() => setEditingOffer(null)} className="text-cliq-textMuted hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-cliq-textMuted font-bold mb-1">Merchant Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.merchant_name}
                    onChange={(e) => setEditFormData({ ...editFormData, merchant_name: e.target.value })}
                    className="w-full bg-cliq-bg border border-cliq-border rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-cliq-textMuted font-bold mb-1">Offer Title *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.offer_title}
                    onChange={(e) => setEditFormData({ ...editFormData, offer_title: e.target.value })}
                    className="w-full bg-cliq-bg border border-cliq-border rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  <label className="block text-cliq-textMuted font-bold mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="None"
                    value={editFormData.max_discount_amount}
                    onChange={(e) => setEditFormData({ ...editFormData, max_discount_amount: e.target.value })}
                    className="w-full bg-cliq-bg border border-cliq-border rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-cliq-textMuted font-bold mb-1">Min Transaction (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.min_transaction_value}
                    onChange={(e) => setEditFormData({ ...editFormData, min_transaction_value: e.target.value })}
                    className="w-full bg-cliq-bg border border-cliq-border rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-cliq-textMuted font-bold mb-1">Promo Code</label>
                  <input
                    type="text"
                    value={editFormData.promo_code}
                    onChange={(e) => setEditFormData({ ...editFormData, promo_code: e.target.value })}
                    className="w-full bg-cliq-bg border border-cliq-border rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-cliq-textMuted font-bold mb-1">Eligible Bank</label>
                  <input
                    type="text"
                    value={editFormData.eligible_bank}
                    onChange={(e) => setEditFormData({ ...editFormData, eligible_bank: e.target.value })}
                    className="w-full bg-cliq-bg border border-cliq-border rounded-lg px-3 py-2 text-white"
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
