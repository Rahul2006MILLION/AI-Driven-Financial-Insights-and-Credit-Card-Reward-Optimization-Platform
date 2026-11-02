"use client";

import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useState } from "react";
import { Language, Translations, translations } from "./translations";
import { AUTH_CHANGE_EVENT, apiFetch } from "./api";

export type { Language, Translations };
export { translations };

/**
 * Single source of truth for the UI language. lib/api.ts reads the same key for
 * session.preferredLanguage but only seeds it (never overwrites an explicit choice).
 */
export const LANGUAGE_STORAGE_KEY = "cliq_preferred_language";
/** Set by the inline script in app/layout.tsx while a non-English language is being applied. */
export const LANGUAGE_PENDING_ATTR = "data-lang-pending";

const isLanguage = (v: unknown): v is Language => v === "en" || v === "hi" || v === "kn";

const readStoredLanguage = (): Language | null => {
  try {
    const v = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguage(v) ? v : null;
  } catch {
    return null;
  }
};

const hasAuthToken = (): boolean => {
  try {
    return !!localStorage.getItem("cliq_access_token");
  } catch {
    return false;
  }
};

/** Keep the account's server-side preference aligned with the UI choice (best effort). */
const syncAccountLanguage = (lang: Language) => {
  if (!hasAuthToken()) return;
  apiFetch("/profile", {
    method: "PUT",
    body: JSON.stringify({ preferred_language: lang }),
  }).catch(() => {
    /* non-blocking: the local choice still applies */
  });
};

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: translations.en,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Server render is always English; the stored language is applied in a layout
  // effect (before first paint) so there is no hydration mismatch and no flicker.
  const [language, setLanguageState] = useState<Language>("en");

  useIsoLayoutEffect(() => {
    const saved = readStoredLanguage();
    if (saved) setLanguageState(saved);
  }, []);

  // Reflect the active language on <html> and release the pre-hydration guard.
  useEffect(() => {
    const root = document.documentElement;
    root.lang = language;
    root.removeAttribute(LANGUAGE_PENDING_ATTR);
  }, [language]);

  // Stay in sync with login/logout/profile refreshes and with other tabs.
  useEffect(() => {
    const onAuthChange = (e: Event) => {
      const stored = readStoredLanguage();
      if (stored) setLanguageState(stored);
      const serverLang = (e as CustomEvent<{ preferredLanguage?: string } | null>).detail?.preferredLanguage;
      if (stored && isLanguage(serverLang) && serverLang !== stored) syncAccountLanguage(stored);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === LANGUAGE_STORAGE_KEY && isLanguage(e.newValue)) setLanguageState(e.newValue);
    };
    window.addEventListener(AUTH_CHANGE_EVENT, onAuthChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, onAuthChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      /* storage unavailable: language still applies for this session */
    }
    syncAccountLanguage(lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
