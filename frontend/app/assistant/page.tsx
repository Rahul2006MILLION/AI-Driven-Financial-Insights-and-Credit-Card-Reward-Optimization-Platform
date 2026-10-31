"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage, Language } from "@/lib/i18n";
import { apiFetch, api, AiConsent } from "@/lib/api";
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  User,
  Loader2,
  Globe,
  CheckCircle2,
  Lock,
  Sliders,
  AlertCircle,
  Eye,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  timestamp: string;
  is_external_ai_used?: boolean;
  provider_used?: string;
  privacy_status?: string;
  redacted_items_count?: number;
}

export default function AssistantPage() {
  const { t, language, setLanguage } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        language === "hi"
          ? "नमस्ते! मैं आपका CLIQ वित्तीय सहायक हूँ। गोपनीयता नीति के तहत, आपका डेटा डिफ़ॉल्ट रूप से स्थानीय रूप से सुरक्षित रखा जाता है।"
          : language === "kn"
          ? "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ CLIQ ಆರ್ಥಿಕ ಸಹಾಯಕ. ಗೌಪ್ಯತೆ ನೀತಿಯಂತೆ, ನಿಮ್ಮ ಹಣಕಾಸಿನ ಮಾಹಿತಿಯನ್ನು ಸ್ಥಳೀಯವಾಗಿ ಸುರಕ್ಷಿತವಾಗಿಡಲಾಗುತ್ತದೆ."
          : "Hello! I am your CLIQ Financial Intelligence Assistant. Under our Privacy-First Architecture, all queries are processed locally by default with zero cloud exposure.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      is_external_ai_used: false,
      provider_used: "local_grounded_engine",
      privacy_status: "LOCAL_PROCESSING_PROTECTED",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Privacy & AI Consent State
  const [consent, setConsent] = useState<AiConsent | null>(null);
  const [consentLoading, setConsentLoading] = useState(false);
  const [showPrivacyPanel, setShowPrivacyPanel] = useState(false);
  const [savingConsent, setSavingConsent] = useState(false);
  const [consentSuccessMsg, setConsentSuccessMsg] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadConsent();
  }, []);

  const loadConsent = async () => {
    setConsentLoading(true);
    try {
      const data = await api.getAiConsent();
      setConsent(data);
    } catch (_) {
      // Unauthenticated or default fallback
    } finally {
      setConsentLoading(false);
    }
  };

  const handleToggleConsent = async (field: "external_ai_enabled" | "allow_card_context" | "allow_spending_context", value: boolean) => {
    if (!consent) return;
    setSavingConsent(true);
    setConsentSuccessMsg(null);
    try {
      const updated = await api.updateAiConsent({
        external_ai_enabled: field === "external_ai_enabled" ? value : consent.external_ai_enabled,
        allow_card_context: field === "allow_card_context" ? value : consent.allow_card_context,
        allow_spending_context: field === "allow_spending_context" ? value : consent.allow_spending_context,
        provider_preference: consent.provider_preference,
      });
      setConsent(updated);
      setConsentSuccessMsg(
        value
          ? `Preference updated: ${field.replace(/_/g, " ")} is now ACTIVE.`
          : `Preference updated: ${field.replace(/_/g, " ")} is now DISABLED (Local processing only).`
      );
      setTimeout(() => setConsentSuccessMsg(null), 3000);
    } catch (_) {
    } finally {
      setSavingConsent(false);
    }
  };

  const handleSend = async (queryText?: string) => {
    const q = queryText || input;
    if (!q.trim() || loading) return;

    const userMsg: Message = {
      role: "user",
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setLoading(true);

    try {
      const data: any = await apiFetch("/assistant/chat", {
        method: "POST",
        body: JSON.stringify({
          query: q,
          language,
        }),
      });

      const botMsg: Message = {
        role: "assistant",
        content: data.response,
        citations: data.citations,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        is_external_ai_used: data.is_external_ai_used,
        provider_used: data.provider_used,
        privacy_status: data.privacy_status,
        redacted_items_count: data.redacted_items_count,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errMsg: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error: " + (err.message || "Please check backend connection."),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cliq-border pb-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cliq-cyan to-cliq-emerald p-0.5 shadow-neonCyan">
              <div className="w-full h-full bg-cliq-bg rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-cliq-cyan" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span>{t.assistant.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cliq-emerald/20 text-cliq-emerald border border-cliq-emerald/40 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Privacy-First
                </span>
              </h1>
              <p className="text-[11px] text-cliq-textSecondary">{t.assistant.groundedIn}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Privacy Controls Button */}
            <button
              onClick={() => setShowPrivacyPanel(!showPrivacyPanel)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cliq-surface hover:bg-cliq-surfaceHover border border-cliq-border text-xs text-cliq-textSecondary hover:text-white transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-cliq-cyan" />
              <span className="font-semibold">AI Privacy</span>
              {showPrivacyPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Quick Language Toggle */}
            <div className="flex items-center gap-1 bg-cliq-surface px-2 py-1 rounded-xl border border-cliq-border text-xs">
              {(["en", "hi", "kn"] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-2 py-0.5 rounded font-bold transition-colors ${
                    language === l ? "bg-cliq-cyan text-cliq-bg" : "text-cliq-textSecondary"
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Expandable Privacy Disclosure & Consent Settings Panel */}
        {showPrivacyPanel && (
          <div className="mb-4 p-4 rounded-2xl bg-cliq-surface/95 border border-cliq-cyan/40 backdrop-blur-md space-y-3 text-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <Lock className="w-4 h-4 text-cliq-cyan" />
                  Privacy Gateway & AI Governance
                </div>
                <p className="text-cliq-textSecondary text-[11px] mt-0.5 leading-relaxed">
                  CLIQ enforces a strict Privacy-First AI Architecture. By default, all answers are generated locally with zero cloud exposure.
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    consent?.external_ai_enabled
                      ? "bg-cliq-cyan/15 text-cliq-cyan border-cliq-cyan/40"
                      : "bg-cliq-emerald/15 text-cliq-emerald border-cliq-emerald/40"
                  }`}
                >
                  {consent?.external_ai_enabled ? "External AI (Gemini 1.5)" : "Local Engine (Zero Exposure)"}
                </span>
              </div>
            </div>

            {consentSuccessMsg && (
              <div className="p-2 rounded-lg bg-cliq-emerald/10 text-cliq-emerald text-[11px] font-semibold border border-cliq-emerald/30">
                {consentSuccessMsg}
              </div>
            )}

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-cliq-bg border border-cliq-border flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">External AI Mode</span>
                  <span className="text-[10px] text-cliq-textMuted">Use Google Gemini</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(consent?.external_ai_enabled)}
                  disabled={savingConsent}
                  onChange={(e) => handleToggleConsent("external_ai_enabled", e.target.checked)}
                  className="rounded text-cliq-cyan focus:ring-cliq-cyan cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-xl bg-cliq-bg border border-cliq-border flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Card Context</span>
                  <span className="text-[10px] text-cliq-textMuted">Share card names & rates</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(consent?.allow_card_context)}
                  disabled={savingConsent || !consent?.external_ai_enabled}
                  onChange={(e) => handleToggleConsent("allow_card_context", e.target.checked)}
                  className="rounded text-cliq-cyan focus:ring-cliq-cyan cursor-pointer disabled:opacity-40"
                />
              </div>

              <div className="p-3 rounded-xl bg-cliq-bg border border-cliq-border flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Spending Context</span>
                  <span className="text-[10px] text-cliq-textMuted">Aggregated totals only</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(consent?.allow_spending_context)}
                  disabled={savingConsent || !consent?.external_ai_enabled}
                  onChange={(e) => handleToggleConsent("allow_spending_context", e.target.checked)}
                  className="rounded text-cliq-cyan focus:ring-cliq-cyan cursor-pointer disabled:opacity-40"
                />
              </div>
            </div>

            {/* PII Redaction Guarantee Box */}
            <div className="p-2.5 rounded-xl bg-cliq-bgSecondary/80 border border-cliq-border/60 text-[10px] text-cliq-textSecondary leading-relaxed flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Strict Redaction Guarantee:</strong> Full 16-digit card numbers, CVVs, PINs, OTPs, Aadhaar, Income Tax PAN, bank account numbers, passwords, and raw statements are <strong className="text-amber-300">never transmitted</strong> to any external AI provider.
              </div>
            </div>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-cliq-surface border border-cliq-cyan/40 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-cliq-cyan" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-cliq-cyan/20 to-cliq-emerald/20 border border-cliq-cyan/40 text-white rounded-br-none"
                    : "glass-panel border-cliq-border text-white rounded-bl-none shadow-sm"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {m.citations && m.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-cliq-border/60 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-cliq-textMuted uppercase font-semibold">
                      Grounded in:
                    </span>
                    {m.citations.map((c, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-cliq-surface border border-cliq-border text-cliq-cyan font-medium"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {/* Privacy Badge on Assistant Replies */}
                {m.role === "assistant" && (
                  <div className="mt-2.5 pt-2 border-t border-cliq-border/40 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      {m.is_external_ai_used ? (
                        <span className="text-cliq-cyan font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-cliq-cyan" />
                          Gemini 1.5 Flash • PII Redacted
                        </span>
                      ) : (
                        <span className="text-cliq-emerald font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-cliq-emerald" />
                          Local Engine • Zero Cloud Exposure
                        </span>
                      )}

                      {m.redacted_items_count && m.redacted_items_count > 0 ? (
                        <span className="text-amber-400 font-bold ml-1">
                          ({m.redacted_items_count} items redacted)
                        </span>
                      ) : null}
                    </div>
                    <span className="text-cliq-textMuted">{m.timestamp}</span>
                  </div>
                )}

                {m.role === "user" && (
                  <div className="text-[9px] text-cliq-textMuted text-right mt-1.5">{m.timestamp}</div>
                )}
              </div>

              {m.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-cliq-cyan text-cliq-bg flex items-center justify-center shrink-0 font-bold">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-cliq-surface border border-cliq-cyan/40 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-cliq-cyan animate-spin" />
              </div>
              <div className="glass-panel p-3.5 rounded-2xl text-xs text-cliq-textSecondary flex items-center gap-2">
                <span>Processing through Privacy Gateway...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Prompts */}
        <div className="py-2 flex items-center gap-2 overflow-x-auto">
          {t.assistant.suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-full bg-cliq-surface hover:bg-cliq-surfaceHover border border-cliq-border hover:border-cliq-cyan text-cliq-textSecondary hover:text-white transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="pt-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-cliq-surface border border-cliq-border focus-within:border-cliq-cyan rounded-2xl p-2 transition-colors"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.assistant.placeholder}
              className="flex-1 bg-transparent px-3 text-white text-xs focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-cliq-cyan to-cliq-emerald text-cliq-bg font-bold shadow-neonCyan hover:opacity-95 disabled:opacity-50 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
