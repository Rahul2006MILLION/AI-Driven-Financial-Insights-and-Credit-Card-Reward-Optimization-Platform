import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";

// Browser Environment Simulation for Chrome and Safari
class LocalStorageMock {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get length(): number {
    return this.store.size;
  }
}

class EventTargetMock {
  private listeners: Map<string, Function[]> = new Map();

  addEventListener(type: string, listener: Function): void {
    const list = this.listeners.get(type) || [];
    list.push(listener);
    this.listeners.set(type, list);
  }

  removeEventListener(type: string, listener: Function): void {
    const list = this.listeners.get(type) || [];
    this.listeners.set(type, list.filter((l) => l !== listener));
  }

  dispatchEvent(event: any): boolean {
    const list = this.listeners.get(event.type) || [];
    for (const listener of list) {
      listener(event);
    }
    return true;
  }
}

const eventTarget = new EventTargetMock();
const localStorage = new LocalStorageMock();

// Attach globals before importing lib/api
(globalThis as any).window = {
  localStorage,
  location: { search: "" },
  addEventListener: eventTarget.addEventListener.bind(eventTarget),
  removeEventListener: eventTarget.removeEventListener.bind(eventTarget),
  dispatchEvent: eventTarget.dispatchEvent.bind(eventTarget),
};
(globalThis as any).localStorage = localStorage;

class CustomEventMock {
  type: string;
  detail: any;
  constructor(type: string, init?: { detail?: any }) {
    this.type = type;
    this.detail = init?.detail;
  }
}
(globalThis as any).CustomEvent = CustomEventMock;

// Import our auth and api functions
import {
  getStoredSession,
  storeSession,
  clearSession,
  apiFetch,
  AUTH_CHANGE_EVENT,
} from "../lib/api.ts";
import type { UserSession } from "../lib/api.ts";

describe("Frontend Authentication Lifecycle & Session Management", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("Requirement 1 & 2: Signup and login store session and dispatch global auth event immediately", () => {
    let receivedEventDetail: UserSession | null = null;
    const authListener = (event: any) => {
      receivedEventDetail = event.detail;
    };

    window.addEventListener(AUTH_CHANGE_EVENT, authListener);

    const testSession: UserSession = {
      accessToken: "mock.jwt.token.12345",
      userId: "usr_998877",
      email: "rohan@cliq.finance",
      fullName: "Rohan Deshmukh",
      preferredLanguage: "en",
      role: "USER",
      isAdmin: false,
    };

    // Simulate login or automatic login on signup
    storeSession(testSession);

    // Assert stored in localStorage
    assert.strictEqual(localStorage.getItem("cliq_access_token"), "mock.jwt.token.12345");
    assert.strictEqual(localStorage.getItem("cliq_user_id"), "usr_998877");
    assert.strictEqual(localStorage.getItem("cliq_email"), "rohan@cliq.finance");
    assert.strictEqual(localStorage.getItem("cliq_full_name"), "Rohan Deshmukh");

    // Assert global auth event was fired immediately
    assert.notStrictEqual(receivedEventDetail, null);
    assert.strictEqual((receivedEventDetail as any)?.userId, "usr_998877");
    assert.strictEqual((receivedEventDetail as any)?.accessToken, "mock.jwt.token.12345");

    window.removeEventListener(AUTH_CHANGE_EVENT, authListener);
  });

  test("Requirement 4: Persist and securely restore session after page refresh", () => {
    // Populate storage as if session had previously been stored
    localStorage.setItem("cliq_access_token", "persisted_jwt_token_abcdef");
    localStorage.setItem("cliq_user_id", "usr_persistent_01");
    localStorage.setItem("cliq_email", "priya@cliq.finance");
    localStorage.setItem("cliq_full_name", "Priya Nair");
    localStorage.setItem("cliq_preferred_language", "hi");
    localStorage.setItem("cliq_role", "ADMIN");
    localStorage.setItem("cliq_is_admin", "true");

    // Call getStoredSession to simulate page mount restoration
    const restored = getStoredSession();

    assert.notStrictEqual(restored, null);
    assert.strictEqual(restored?.accessToken, "persisted_jwt_token_abcdef");
    assert.strictEqual(restored?.userId, "usr_persistent_01");
    assert.strictEqual(restored?.email, "priya@cliq.finance");
    assert.strictEqual(restored?.fullName, "Priya Nair");
    assert.strictEqual(restored?.preferredLanguage, "hi");
    assert.strictEqual(restored?.role, "ADMIN");
    assert.strictEqual(restored?.isAdmin, true);
  });

  test("Requirement 7: On logout, clear session and notify UI immediately", () => {
    // Setup active session
    storeSession({
      accessToken: "logout_test_token",
      userId: "usr_to_logout",
      email: "logout@cliq.finance",
      fullName: "Logout Test User",
    });

    assert.notStrictEqual(getStoredSession(), null);

    let receivedEventDetail: any = "uninitialized";
    const authListener = (event: any) => {
      receivedEventDetail = event.detail;
    };
    window.addEventListener(AUTH_CHANGE_EVENT, authListener);

    // Execute logout
    clearSession();

    // Verify localStorage cleared
    assert.strictEqual(localStorage.getItem("cliq_access_token"), null);
    assert.strictEqual(localStorage.getItem("cliq_user_id"), null);
    assert.strictEqual(getStoredSession(), null);

    // Verify UI notified immediately with null session
    assert.strictEqual(receivedEventDetail, null);

    window.removeEventListener(AUTH_CHANGE_EVENT, authListener);
  });

  test("Requirement 8: Handle expired and invalid tokens on 401 response by clearing session", async () => {
    storeSession({
      accessToken: "expired_token_value",
      userId: "usr_expired",
      email: "expired@cliq.finance",
    });

    assert.notStrictEqual(getStoredSession(), null);

    // Mock fetch to simulate 401 Unauthorized from backend
    (globalThis as any).fetch = async (url: string, init?: any) => {
      return {
        ok: false,
        status: 401,
        json: async () => ({ detail: "Invalid or expired authentication token" }),
      };
    };

    // Calling apiFetch should catch 401, invoke clearSession(), and throw error
    await assert.rejects(
      async () => {
        await apiFetch("/cards");
      },
      (err: any) => {
        assert.match(err.message, /expired|invalid/i);
        return true;
      }
    );

    // Assert that the invalid/expired session was removed from storage
    assert.strictEqual(getStoredSession(), null);
    assert.strictEqual(localStorage.getItem("cliq_access_token"), null);
  });

  test("Requirement 6: Injects Authorization Bearer header only when authenticated", async () => {
    let capturedHeaders: any = null;

    (globalThis as any).fetch = async (url: string, init?: any) => {
      capturedHeaders = init?.headers;
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      };
    };

    // 1. Without session
    clearSession();
    await apiFetch("/public-endpoint");
    assert.strictEqual(capturedHeaders["Authorization"], undefined);

    // 2. With session
    storeSession({
      accessToken: "valid_bearer_token_123",
      userId: "usr_authed",
      email: "authed@cliq.finance",
    });
    await apiFetch("/cards");
    assert.strictEqual(capturedHeaders["Authorization"], "Bearer valid_bearer_token_123");
  });

  test("Requirement 9: Cross-browser storage resilience (Safari private browsing / empty storage)", () => {
    // When storage is completely empty or restricted
    localStorage.clear();
    const emptySession = getStoredSession();
    assert.strictEqual(emptySession, null);

    // If query string provides token during external redirect
    (window as any).location = { search: "?token=safari_redirect_token&userId=usr_safari&email=safari@cliq.finance" };
    const redirectedSession = getStoredSession();
    assert.strictEqual(redirectedSession?.accessToken, "safari_redirect_token");
    assert.strictEqual(redirectedSession?.userId, "usr_safari");

    // Clean up
    (window as any).location = { search: "" };
    clearSession();
  });
});
