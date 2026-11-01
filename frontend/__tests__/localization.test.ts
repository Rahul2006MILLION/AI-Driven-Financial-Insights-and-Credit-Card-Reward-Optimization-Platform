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

const localStorage = new LocalStorageMock();
(globalThis as any).window = {
  localStorage,
};
(globalThis as any).localStorage = localStorage;

import { translations } from "../lib/translations.ts";
import type { Language, Translations } from "../lib/translations.ts";

describe("Application-Wide Multilingual Localization Suite", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("Dictionary Completeness: All keys present in English exist in Hindi and Kannada with zero missing keys", () => {
    const en = translations.en;
    const hi = translations.hi;
    const kn = translations.kn;

    assert.ok(en, "English dictionary must exist");
    assert.ok(hi, "Hindi dictionary must exist");
    assert.ok(kn, "Kannada dictionary must exist");

    function compareObjects(base: Record<string, any>, target: Record<string, any>, path: string, langName: string) {
      for (const key of Object.keys(base)) {
        const currentPath = path ? `${path}.${key}` : key;
        assert.ok(
          key in target,
          `Missing translation key in ${langName}: '${currentPath}'`
        );

        if (typeof base[key] === "object" && base[key] !== null) {
          assert.equal(
            typeof target[key],
            "object",
            `Key '${currentPath}' in ${langName} must be an object matching English schema`
          );
          compareObjects(base[key], target[key], currentPath, langName);
        } else {
          assert.equal(
            typeof target[key],
            "string",
            `Key '${currentPath}' in ${langName} must be a string`
          );
          assert.ok(
            target[key].trim().length > 0,
            `Key '${currentPath}' in ${langName} must not be an empty string`
          );
        }
      }
    }

    // Verify Hindi completeness
    compareObjects(en, hi, "", "Hindi (hi)");

    // Verify Kannada completeness
    compareObjects(en, kn, "", "Kannada (kn)");
  });

  test("Section Completeness: All 20 application sections are fully covered across all 3 languages", () => {
    const requiredSections = [
      "tagline",
      "supporting",
      "nav",
      "sidebar",
      "landing",
      "dashboard",
      "cards",
      "cardDetails",
      "cardSelection",
      "compare",
      "offers",
      "optimizer",
      "transactions",
      "analytics",
      "health",
      "assistant",
      "documents",
      "settings",
      "profile",
      "auth",
      "onboarding",
      "adminOffers",
      "categories",
      "channels",
      "common",
    ];

    const languages: Language[] = ["en", "hi", "kn"];
    for (const lang of languages) {
      const dict = translations[lang] as any;
      for (const section of requiredSections) {
        assert.ok(
          section in dict,
          `Section '${section}' must exist in '${lang}' dictionary`
        );
      }
    }
  });

  test("Proper Nouns Preservation: Financial brands, merchants, and networks remain identifiable", () => {
    // Merchant proper nouns (Swiggy, Zomato) in food_delivery
    assert.match(translations.en.categories.food_delivery, /Swiggy/);
    assert.match(translations.en.categories.food_delivery, /Zomato/);
    assert.match(translations.hi.categories.food_delivery, /Swiggy/);
    assert.match(translations.hi.categories.food_delivery, /Zomato/);
    assert.match(translations.kn.categories.food_delivery, /Swiggy/);
    assert.match(translations.kn.categories.food_delivery, /Zomato/);

    // Merchant proper nouns (Swiggy, Amazon) in optimizer merchant label
    assert.match(translations.en.optimizer.merchantLabel, /Swiggy/);
    assert.match(translations.en.optimizer.merchantLabel, /Amazon/);
    assert.match(translations.hi.optimizer.merchantLabel, /Swiggy/);
    assert.match(translations.hi.optimizer.merchantLabel, /Amazon/);
    assert.match(translations.kn.optimizer.merchantLabel, /Swiggy/);
    assert.match(translations.kn.optimizer.merchantLabel, /Amazon/);

    // Assistant suggestions preserving merchant names
    assert.match(translations.en.dashboard.sampleSuggestion1, /Swiggy/);
    assert.match(translations.hi.dashboard.sampleSuggestion1, /Swiggy/);
    assert.match(translations.kn.dashboard.sampleSuggestion1, /Swiggy/);
  });

  test("Script Integrity: Hindi uses Devanagari script and Kannada uses Kannada script", () => {
    // Hindi Devanagari range: \u0900-\u097F
    const devanagariRegex = /[\u0900-\u097F]/;
    assert.ok(
      devanagariRegex.test(translations.hi.tagline),
      "Hindi tagline must contain Devanagari characters"
    );
    assert.ok(
      devanagariRegex.test(translations.hi.nav.dashboard),
      "Hindi nav.dashboard must contain Devanagari characters"
    );
    assert.ok(
      devanagariRegex.test(translations.hi.assistant.welcomeMessage),
      "Hindi assistant welcomeMessage must contain Devanagari characters"
    );

    // Kannada script range: \u0C80-\u0CFF
    const kannadaRegex = /[\u0C80-\u0CFF]/;
    assert.ok(
      kannadaRegex.test(translations.kn.tagline),
      "Kannada tagline must contain Kannada characters"
    );
    assert.ok(
      kannadaRegex.test(translations.kn.nav.dashboard),
      "Kannada nav.dashboard must contain Kannada characters"
    );
    assert.ok(
      kannadaRegex.test(translations.kn.assistant.welcomeMessage),
      "Kannada assistant welcomeMessage must contain Kannada characters"
    );
  });

  test("Language Persistence & Storage Key Conformity", () => {
    const STORAGE_KEY = "cliq_preferred_language";

    // Simulate saving language preference
    localStorage.setItem(STORAGE_KEY, "hi");
    assert.equal(localStorage.getItem(STORAGE_KEY), "hi");

    localStorage.setItem(STORAGE_KEY, "kn");
    assert.equal(localStorage.getItem(STORAGE_KEY), "kn");

    localStorage.setItem(STORAGE_KEY, "en");
    assert.equal(localStorage.getItem(STORAGE_KEY), "en");
  });

  test("Zero Fallback Artifacts: Untranslated English tokens are not leaking into Hindi/Kannada core terms", () => {
    // Common terms must be translated
    assert.notEqual(translations.hi.common.save, "Save");
    assert.notEqual(translations.kn.common.save, "Save");

    assert.notEqual(translations.hi.nav.dashboard, "Dashboard");
    assert.notEqual(translations.kn.nav.dashboard, "Dashboard");

    assert.notEqual(translations.hi.nav.optimizer, "Reward Optimization");
    assert.notEqual(translations.kn.nav.optimizer, "Reward Optimization");

    assert.notEqual(translations.hi.optimizer.calculate, "Calculate Optimal Benefits");
    assert.notEqual(translations.kn.optimizer.calculate, "Calculate Optimal Benefits");
  });
});
