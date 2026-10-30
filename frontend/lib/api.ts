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
