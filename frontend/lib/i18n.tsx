"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, Translations, translations } from "./translations";

export type { Language, Translations };
export { translations };

export const LANGUAGE_STORAGE_KEY = "cliq_preferred_language";

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
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language) : null;
    if (saved && (saved === "en" || saved === "hi" || saved === "kn")) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
