import { translations, type Translations } from "./translations";
import { fmt } from "./i18n";

/**
 * The financial-health engine and income summary (backend) return English sentences with embedded
 * figures. Match each against the English templates in t.healthMessages — the single
 * source of truth — and re-render it in the active language with the same figures.
 * Unrecognised messages are returned unchanged.
 */
type Key = keyof Translations["healthMessages"];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const PATTERNS: { key: Key; re: RegExp }[] = (Object.keys(translations.en.healthMessages) as Key[]).map((key) => {
  const template = translations.en.healthMessages[key];
  const source = template
    .split(/(\{\w+\})/)
    .map((part) => {
      const m = part.match(/^\{(\w+)\}$/);
      return m ? `(?<${m[1]}>.+?)` : escape(part);
    })
    .join("");
  return { key, re: new RegExp(`^${source}$`) };
});

function matchOne(t: Translations, text: string): string | null {
  for (const { key, re } of PATTERNS) {
    const m = text.match(re);
    if (m) return fmt(t.healthMessages[key], m.groups ?? {});
  }
  return null;
}

/**
 * Some server explanations are several sentences concatenated; fall back to
 * translating sentence by sentence (splitting only at ". " before a capital/digit,
 * so amounts like ₹45,000.00 stay intact).
 */
export function localizeHealthMessage(t: Translations, message: string): string {
  const text = message.trim();
  const whole = matchOne(t, text);
  if (whole) return whole;
  const sentences = text.split(/(?<=\.)\s+(?=[A-Z0-9₹])/);
  if (sentences.length < 2) return message;
  return sentences.map((s) => matchOne(t, s) ?? s).join(" ");
}
