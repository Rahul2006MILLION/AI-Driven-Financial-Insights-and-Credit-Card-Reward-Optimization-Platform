export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface UserSession {
  accessToken: string;
  userId: string;
  email: string;
  fullName?: string;
  preferredLanguage?: string;
  role?: string;
  isAdmin?: boolean;
}

export const AUTH_CHANGE_EVENT = "cliq-auth-state-change";

export const getStoredSession = (): UserSession | null => {
  if (typeof window === "undefined") return null;
  if (typeof window !== "undefined" && window.location && window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const qToken = params.get("token");
    if (qToken) {
      localStorage.setItem("cliq_access_token", qToken);
      if (params.get("userId")) localStorage.setItem("cliq_user_id", params.get("userId")!);
      if (params.get("email")) localStorage.setItem("cliq_email", params.get("email")!);
      if (params.get("fullName")) localStorage.setItem("cliq_full_name", params.get("fullName")!);
    }
  }
  const token = localStorage.getItem("cliq_access_token");
  const userId = localStorage.getItem("cliq_user_id");
  const email = localStorage.getItem("cliq_email");
  if (!token || !userId) return null;
  return {
    accessToken: token,
    userId,
    email: email || "",
    fullName: localStorage.getItem("cliq_full_name") || "",
    preferredLanguage: localStorage.getItem("cliq_preferred_language") || "en",
    role: localStorage.getItem("cliq_role") || "USER",
    isAdmin: localStorage.getItem("cliq_is_admin") === "true",
  };
};

export const storeSession = (session: UserSession) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("cliq_access_token", session.accessToken);
  localStorage.setItem("cliq_user_id", session.userId);
  localStorage.setItem("cliq_email", session.email);
  if (session.fullName !== undefined) localStorage.setItem("cliq_full_name", session.fullName);
  if (session.preferredLanguage !== undefined) localStorage.setItem("cliq_preferred_language", session.preferredLanguage);
  if (session.role !== undefined) localStorage.setItem("cliq_role", session.role);
  if (session.isAdmin !== undefined) localStorage.setItem("cliq_is_admin", String(session.isAdmin));

  try {
    window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT, { detail: session }));
  } catch (_) {}
};

export const clearSession = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("cliq_access_token");
  localStorage.removeItem("cliq_user_id");
  localStorage.removeItem("cliq_email");
  localStorage.removeItem("cliq_full_name");
  localStorage.removeItem("cliq_preferred_language");
  localStorage.removeItem("cliq_role");
  localStorage.removeItem("cliq_is_admin");

  try {
    window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT, { detail: null }));
  } catch (_) {}
};

// Generic fetcher with bearer token
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const session = getStoredSession();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (session?.accessToken) {
    headers["Authorization"] = `Bearer ${session.accessToken}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401 && session?.accessToken) {
      clearSession();
    }
    let errMsg = "An error occurred while communicating with the server.";
    try {
      const errData = await res.json();
      if (Array.isArray(errData.detail)) {
        errMsg = errData.detail.map((e: any) => e.msg || e.message || JSON.stringify(e)).join(", ");
      } else if (typeof errData.detail === "string") {
        errMsg = errData.detail;
      } else if (errData.detail && typeof errData.detail === "object") {
        errMsg = JSON.stringify(errData.detail);
      } else if (errData.message) {
        errMsg = errData.message;
      }
    } catch (_) {}
    throw new Error(errMsg);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

// -------------------------------------------------------------
// Core Domain Models & API Types
// -------------------------------------------------------------

export interface CardRewardRule {
  id?: string;
  card_id?: string;
  category_id?: string;
  merchant_pattern?: string;
  reward_type: "CASHBACK" | "REWARD_POINTS" | "MILES";
  reward_rate_percentage: number | string;
  point_monetary_value?: number | string;
  min_transaction_amount?: number | string;
  max_reward_per_transaction?: number | string;
  monthly_cap_amount?: number | string;
  is_excluded?: boolean;
  exclusion_reason?: string;
}

export interface CardBenefit {
  id?: string;
  card_id?: string;
  benefit_type: string; // PERMANENT, PROMOTIONAL, MERCHANT_SPECIFIC, NETWORK_SPECIFIC, LOUNGE_ACCESS, INSURANCE, GOLF, MILESTONE
  title: string;
  description: string;
  applicable_category?: string;
  reward_percentage_or_points?: number | string;
  reward_basis?: string; // PERCENTAGE, FIXED_POINTS_PER_100, CASHBACK_FIXED, COMPLIMENTARY
  max_reward?: number | string;
  min_transaction_amount?: number | string;
  cap_amount?: number | string;
  cap_period?: string;
  eligibility_restrictions?: string;
  valid_from?: string;
  valid_to?: string;
  terms_and_conditions?: string;
  source_reference?: string;
  last_verified_date?: string;
  annual_value_estimate?: number | string;
}

export interface CreditCard {
  id: string;
  user_id: string;
  card_name: string;
  bank_name: string;
  network: "VISA" | "MASTERCARD" | "AMEX" | "RUPAY" | "DINERS";
  card_type: string;
  card_variant?: string;
  cardholder_name?: string;
  nickname?: string;
  last_four_digits?: string;
  joining_fee: number | string;
  annual_fee: number | string;
  renewal_waiver_spend?: number | string;
  fee_waiver_condition_details?: string;
  renewal_date?: string;
  billing_cycle_day?: number;
  terms_source_url?: string;
  is_active: boolean;
  rules?: CardRewardRule[];
  reward_rules: CardRewardRule[];
  benefits: CardBenefit[];
}

export interface CardOffer {
  id: string;
  merchant_name: string;
  offer_title: string;
  category_id: string;
  discount_type: "PERCENTAGE" | "FLAT_AMOUNT";
  discount_value: number | string;
  min_transaction_value: number | string;
  max_discount_amount?: number | string;
  eligible_bank?: string;
  eligible_network?: string;
  eligible_card_names: string[];
  valid_from: string;
  valid_to: string;
  payment_channel: "ONLINE" | "OFFLINE" | "BOTH";
  promo_code?: string;
  activation_requirement?: string;
  terms_and_conditions?: string;
  source_url?: string;
  source_name?: string;
  source_evidence?: string;
  extraction_confidence?: number | string;
  verification_status: "DISCOVERED" | "PENDING_REVIEW" | "VERIFIED" | "REJECTED" | "EXPIRED" | "NEEDS_REVERIFICATION" | "SOURCE_UNAVAILABLE" | "SAMPLE" | "MANUALLY_ENTERED";
  version?: number;
  previous_version_json?: string;
  rejection_reason?: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
  content_hash?: string;
  last_verified_timestamp: string;
  created_at: string;
  matching_user_card_names?: string[];
  is_applicable_to_user?: boolean;
  freshness_state?: string;
  source_id?: string;
  ingestion_channel?: string;
  source_document_id?: string;
}

export interface OfferSource {
  id: string;
  source_key: string;
  source_name: string;
  domain: string;
  source_type: "BANK" | "MERCHANT" | "NETWORK" | "PARTNER";
  supported_ingestion_methods: string[];
  access_permission_status: string;
  connector_status: "IMPLEMENTED" | "PARTIALLY_IMPLEMENTED" | "MANUAL_ONLY" | "BLOCKED" | "ROBOTS_DISALLOWED" | "SOURCE_UNAVAILABLE" | "NOT_INTEGRATED";
  source_health: "HEALTHY" | "DEGRADED" | "FAILING" | "BLOCKED" | "UNKNOWN";
  last_successful_fetch?: string;
  last_attempted_fetch?: string;
  last_http_status?: number;
  last_extraction_result?: string;
  failure_reason?: string;
  consecutive_failures: number;
  rate_limit_per_minute: number;
  active_offers_count: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SourceHealthProbe {
  source_key: string;
  http_status: number;
  latency_ms?: number;
  health: string;
  waf: string[];
  robots_allowed?: boolean;
  message?: string;
  error?: string;
}

export interface SourceFailureLog {
  id: string;
  source_id: string;
  http_status?: number;
  error_type: string;
  error_message: string;
  attempt_number: number;
  retry_after_seconds?: number;
  context_json?: string;
  timestamp: string;
}

export interface AdminOfferDocument {
  id: string;
  source_id?: string;
  filename: string;
  file_path: string;
  mime_type: string;
  file_size_bytes: number;
  sha256_hash: string;
  uploaded_by_id: string;
  uploaded_by_name: string;
  processing_status: string;
  extracted_offers_count: number;
  ocr_supported: boolean;
  error_message?: string;
  raw_text_sample?: string;
  uploaded_at: string;
}

export interface ManualOfferCreateRequest {
  merchant_name: string;
  offer_title: string;
  category_id?: string;
  discount_type: "PERCENTAGE" | "FLAT_AMOUNT";
  discount_value: number;
  min_transaction_value?: number;
  max_discount_amount?: number;
  eligible_bank?: string;
  eligible_network?: string;
  eligible_card_names?: string[];
  valid_from?: string;
  valid_to: string;
  payment_channel?: "ONLINE" | "OFFLINE" | "BOTH";
  promo_code?: string;
  activation_requirement?: string;
  terms_and_conditions?: string;
  source_url: string;
  source_name?: string;
  source_evidence: string;
  source_id?: string;
}

export interface PartnerFeedOfferItem {
  merchant_name: string;
  offer_title: string;
  category_id?: string;
  discount_type?: "PERCENTAGE" | "FLAT_AMOUNT";
  discount_value: number;
  min_transaction_value?: number;
  max_discount_amount?: number;
  eligible_bank?: string;
  eligible_network?: string;
  eligible_card_names?: string[];
  valid_from?: string;
  valid_to?: string;
  payment_channel?: "ONLINE" | "OFFLINE" | "BOTH";
  promo_code?: string;
  activation_requirement?: string;
  terms_and_conditions?: string;
  source_url?: string;
  source_evidence?: string;
}

export interface PartnerFeedIngestRequest {
  partner_id: string;
  offers: PartnerFeedOfferItem[];
  feed_timestamp?: string;
}

export interface AiConsent {
  user_id: string;
  external_ai_enabled: boolean;
  allow_card_context: boolean;
  allow_spending_context: boolean;
  provider_preference: string;
  consent_version: string;
  consent_timestamp: string;
  revoked_at?: string;
  purpose_description?: string;
  privacy_disclosure: string;
}

export interface AiConsentUpdateRequest {
  external_ai_enabled: boolean;
  allow_card_context?: boolean;
  allow_spending_context?: boolean;
  provider_preference?: string;
}

export interface AiAuditLog {
  id: string;
  request_id: string;
  task_type: string;
  data_classification: string;
  provider: string;
  model_name: string;
  consent_status: string;
  redaction_count: number;
  redacted_types: string[];
  status: string;
  rejection_reason?: string;
  latency_ms?: number;
  timestamp: string;
}

export interface DataMinimizationRule {
  field_name: string;
  classification: string;
  action_taken: string;
  rationale: string;
}

export interface OfferAuditLog {
  id: string;
  offer_id: string;
  action: string;
  actor_id?: string;
  actor_name?: string;
  actor_role: string;
  from_status?: string;
  to_status?: string;
  notes?: string;
  snapshot_json?: string;
  timestamp: string;
}

export interface DiscoverySyncResult {
  discovered_count: number;
  extracted_count: number;
  pending_review_count: number;
  reverification_triggered_count: number;
  unchanged_count: number;
  errors: string[];
}

export interface ApplicableOfferSummary {
  offer_id: string;
  merchant_name: string;
  offer_title: string;
  promo_code?: string;
  discount_type: string;
  discount_amount: number | string;
  terms_and_conditions?: string;
  source_url?: string;
  verification_status: string;
}

export interface CalculationStep {
  step_number: number;
  rule_name: string;
  rate_percentage: number | string;
  raw_reward: number | string;
  cap_applied?: number | string;
  final_monetary_value: number | string;
  reason: string;
}

export interface CardRecommendation {
  card_id: string;
  card_name: string;
  bank_name: string;
  network: string;
  card_variant?: string;
  reward_type: string;
  reward_rate_percentage: number | string;
  point_monetary_value: number | string;
  instant_discount_monetary: number | string;
  post_reward_monetary: number | string;
  expected_reward_monetary: number | string;
  net_financial_benefit: number | string;
  effective_rate_percentage: number | string;
  is_excluded: boolean;
  exclusion_reason?: string;
  applicable_offers: ApplicableOfferSummary[];
  missing_information_notes: string[];
  source_references: string[];
  breakdown_steps: CalculationStep[];
}

export interface RecommendResponse {
  transaction_amount: number | string;
  category_id: string;
  merchant_name?: string;
  payment_channel: string;
  recommended_card?: CardRecommendation;
  alternatives: CardRecommendation[];
  explanation: string;
  language: string;
  queried_at: string;
}

// -------------------------------------------------------------
// API Client Functions
// -------------------------------------------------------------

export const api = {
  // Cards
  getCards: (params?: { query?: string; bank?: string; network?: string; is_active?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.query) q.append("query", params.query);
    if (params?.bank) q.append("bank", params.bank);
    if (params?.network) q.append("network", params.network);
    if (params?.is_active !== undefined) q.append("is_active", String(params.is_active));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return apiFetch<CreditCard[]>(`/cards${qs}`);
  },
  getCard: (id: string) => apiFetch<CreditCard>(`/cards/${id}`),
  createCard: (data: Partial<CreditCard>) => apiFetch<CreditCard>("/cards", { method: "POST", body: JSON.stringify(data) }),
  updateCard: (id: string, data: Partial<CreditCard>) => apiFetch<CreditCard>(`/cards/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCard: (id: string) => apiFetch<void>(`/cards/${id}`, { method: "DELETE" }),

  // Offers
  getOffers: (params?: { category?: string; merchant?: string; only_user_cards?: boolean; expiring_soon?: boolean; query?: string }) => {
    const q = new URLSearchParams();
    if (params?.category) q.append("category", params.category);
    if (params?.merchant) q.append("merchant", params.merchant);
    if (params?.only_user_cards) q.append("only_user_cards", "true");
    if (params?.expiring_soon) q.append("expiring_soon", "true");
    if (params?.query) q.append("query", params.query);
    const qs = q.toString() ? `?${q.toString()}` : "";
    return apiFetch<CardOffer[]>(`/offers${qs}`);
  },
  getOffer: (id: string) => apiFetch<CardOffer>(`/offers/${id}`),
  createOffer: (data: Partial<CardOffer>) => apiFetch<CardOffer>("/offers", { method: "POST", body: JSON.stringify(data) }),

  // Optimization
  recommendCard: (data: {
    amount: number;
    category_id: string;
    merchant_name?: string;
    payment_channel?: string;
    language?: string;
  }) => apiFetch<RecommendResponse>("/optimization/recommend", { method: "POST", body: JSON.stringify(data) }),

  compareCards: (data: { card_ids: string[]; simulation_spend?: number }) =>
    apiFetch<any>("/optimization/compare", { method: "POST", body: JSON.stringify(data) }),

  // Admin Offer Review Desk
  getAdminReviewQueue: (params?: { status?: string; query?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append("status_filter", params.status);
    if (params?.query) q.append("query", params.query);
    const qs = q.toString() ? `?${q.toString()}` : "";
    return apiFetch<CardOffer[]>(`/admin/offers/review-queue${qs}`);
  },
  approveOffer: (offerId: string, notes?: string) =>
    apiFetch<CardOffer>(`/admin/offers/${offerId}/approve`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    }),
  rejectOffer: (offerId: string, rejectionReason: string, notes?: string) =>
    apiFetch<CardOffer>(`/admin/offers/${offerId}/reject`, {
      method: "POST",
      body: JSON.stringify({ rejection_reason: rejectionReason, notes }),
    }),
  editOffer: (offerId: string, data: Partial<CardOffer> & { approve_immediately?: boolean; notes?: string }) =>
    apiFetch<CardOffer>(`/admin/offers/${offerId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  triggerReverification: (offerId: string, reason?: string) =>
    apiFetch<CardOffer>(`/admin/offers/${offerId}/reverification`, {
      method: "POST",
      body: JSON.stringify({ reason: reason || "Material terms changed at source" }),
    }),
  getOfferAuditTrail: (offerId: string) =>
    apiFetch<OfferAuditLog[]>(`/admin/offers/${offerId}/audit-trail`),
  syncDiscovery: () =>
    apiFetch<DiscoverySyncResult>("/admin/offers/sync-discovery", {
      method: "POST",
    }),

  // Offer Sources & Intelligence Ingestion
  getOfferSources: () => apiFetch<OfferSource[]>("/offers/sources"),
  probeSource: (sourceId: string) =>
    apiFetch<SourceHealthProbe>(`/offers/sources/${sourceId}/probe`, { method: "POST" }),
  probeAllSources: () =>
    apiFetch<SourceHealthProbe[]>("/offers/sources/probe-all", { method: "POST" }),
  getSourceFailures: (params?: { source_id?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.source_id) q.append("source_id", params.source_id);
    if (params?.limit) q.append("limit", String(params.limit));
    const qs = q.toString() ? `?${q.toString()}` : "";
    return apiFetch<SourceFailureLog[]>(`/offers/failures${qs}`);
  },
  uploadCircular: (formData: FormData) =>
    apiFetch<{
      success: boolean;
      document_id: string;
      extracted_count: number;
      staged_count: number;
      quarantined_count: number;
      ocr_supported: boolean;
      message: string;
      staged_offers: CardOffer[];
    }>("/offers/upload-circular", { method: "POST", body: formData }),
  createManualOffer: (data: ManualOfferCreateRequest) =>
    apiFetch<CardOffer>("/offers/manual", { method: "POST", body: JSON.stringify(data) }),
  ingestPartnerFeed: (data: PartnerFeedIngestRequest) =>
    apiFetch<{ success: boolean; received_count: number; staged_count: number; quarantined_count: number; errors: string[] }>(
      "/offers/partner-feed",
      { method: "POST", body: JSON.stringify(data) }
    ),
  getAdminDocuments: () => apiFetch<AdminOfferDocument[]>("/offers/documents"),

  // Privacy & AI Governance
  getAiConsent: () => apiFetch<AiConsent>("/privacy/consent"),
  updateAiConsent: (data: AiConsentUpdateRequest) =>
    apiFetch<AiConsent>("/privacy/consent", { method: "PUT", body: JSON.stringify(data) }),
  getAiAuditLogs: () => apiFetch<AiAuditLog[]>("/privacy/audit-logs"),
  getDataMinimizationRules: () => apiFetch<DataMinimizationRule[]>("/privacy/data-minimization-rules"),
};
