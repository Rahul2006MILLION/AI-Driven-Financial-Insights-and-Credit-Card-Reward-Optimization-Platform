export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface UserSession {
  accessToken: string;
  userId: string;
  email: string;
  fullName?: string;
  preferredLanguage?: string;
}

export const getStoredSession = (): UserSession | null => {
  if (typeof window === "undefined") return null;
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
  };
};

export const storeSession = (session: UserSession) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("cliq_access_token", session.accessToken);
  localStorage.setItem("cliq_user_id", session.userId);
  localStorage.setItem("cliq_email", session.email);
  if (session.fullName) localStorage.setItem("cliq_full_name", session.fullName);
  if (session.preferredLanguage) localStorage.setItem("cliq_preferred_language", session.preferredLanguage);
};

export const clearSession = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("cliq_access_token");
  localStorage.removeItem("cliq_user_id");
  localStorage.removeItem("cliq_email");
  localStorage.removeItem("cliq_full_name");
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
    let errMsg = "An error occurred while communicating with the server.";
    try {
      const errData = await res.json();
      errMsg = errData.detail || errData.message || errMsg;
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
  verification_status: "VERIFIED" | "SAMPLE" | "MANUALLY_ENTERED" | "EXPIRED";
  last_verified_timestamp: string;
  created_at: string;
  matching_user_card_names?: string[];
  is_applicable_to_user?: boolean;
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
  }) => apiFetch<RecommendResponse>("/optimization/recommend", { method: "POST", body: JSON.stringify(data) }),

  compareCards: (data: { card_ids: string[]; simulation_spend?: number }) =>
    apiFetch<any>("/optimization/compare", { method: "POST", body: JSON.stringify(data) }),
};
