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
  Lock,
  Sliders,
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
      content: t.assistant.welcomeMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      is_external_ai_used: false,
      provider_used: "local_grounded_engine",
      privacy_status: "LOCAL_PROCESSING_PROTECTED",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update initial message if language changes and only initial message is present
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === "assistant") {
        return [
          {
            ...prev[0],
            content: t.assistant.welcomeMessage,
          },
        ];
      }
      return prev;
    });
  }, [language, t.assistant.welcomeMessage]);

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
          ? `Consent updated: ${field.replace(/_/g, " ")} is now enabled.`
          : `Consent updated: ${field.replace(/_/g, " ")} is now disabled.`
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
        content: "I encountered an error: " + (err.message || "Please check backend connection."),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-[#0E1013]">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full flex flex-col h-[calc(100vh-4rem)]">
        {/* Floating Glass Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-lime-400 to-emerald-500 p-0.5 shadow-neonLime">
              <div className="w-full h-full bg-[#17191E] rounded-[10px] flex items-center justify-center">
                <Bot className="w-4 h-4 text-lime-400" />
              </div>
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>{t.assistant.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/25 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {t.assistant.localProtectedStatus}
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">{t.assistant.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Privacy Controls Button */}
            <button
              onClick={() => setShowPrivacyPanel(!showPrivacyPanel)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-xs text-slate-300 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-lime-400" />
              <span className="font-medium">Governance</span>
              {showPrivacyPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Language Toggle */}
            <div className="flex items-center gap-1 bg-white/[0.03] px-2 py-1 rounded-full border border-white/10 text-xs">
              {(["en", "hi", "kn"] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-2 py-0.5 rounded-full font-bold text-[10px] transition-colors ${
                    language === l ? "bg-lime-400 text-[#0E1013]" : "text-slate-400"
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Expandable Privacy & Consent Panel */}
        {showPrivacyPanel && (
          <div className="mb-4 p-4 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-xl space-y-3 text-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-bold text-white text-xs">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  {t.assistant.privacyGatewayTitle}
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                  {t.assistant.privacyGatewaySubtitle}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                    consent?.external_ai_enabled
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-white/[0.05] text-slate-400 border-white/10"
                  }`}
                >
                  {consent?.external_ai_enabled ? t.assistant.activeProviderLabel : t.assistant.localProtectedStatus}
                </span>
              </div>
            </div>

            {consentSuccessMsg && (
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-[11px] font-medium border border-emerald-500/20">
                {consentSuccessMsg}
              </div>
            )}

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">{t.assistant.externalAiToggleLabel}</span>
                  <span className="text-[10px] text-slate-500">Google Gemini</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(consent?.external_ai_enabled)}
                  disabled={savingConsent}
                  onChange={(e) => handleToggleConsent("external_ai_enabled", e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">{t.assistant.allowCardContextLabel}</span>
                  <span className="text-[10px] text-slate-500">Card names & rates</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(consent?.allow_card_context)}
                  disabled={savingConsent || !consent?.external_ai_enabled}
                  onChange={(e) => handleToggleConsent("allow_card_context", e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-0 cursor-pointer disabled:opacity-40"
                />
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">{t.assistant.allowSpendingContextLabel}</span>
                  <span className="text-[10px] text-slate-500">Aggregated totals</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(consent?.allow_spending_context)}
                  disabled={savingConsent || !consent?.external_ai_enabled}
                  onChange={(e) => handleToggleConsent("allow_spending_context", e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-0 cursor-pointer disabled:opacity-40"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-[10px] text-slate-400 flex items-start gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Strict Redaction Guarantee:</strong> 16-digit PANs, CVVs, PINs, OTPs, Aadhaar, and credentials are <strong className="text-amber-300">never transmitted</strong> to any external AI provider.
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
                <div className="w-7 h-7 rounded-full bg-lime-400/10 border border-lime-400/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-3xl p-4 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-lime-400/10 border border-lime-400/25 text-white rounded-br-none shadow-[0_0_20px_rgba(196,242,63,0.1)]"
                    : "bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl text-white rounded-bl-none shadow-[0_12px_36px_0_rgba(0,0,0,0.5)]"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {m.citations && m.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-white/[0.07] flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">
                      Grounded:
                    </span>
                    {m.citations.map((c, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-emerald-400 font-medium"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {/* Privacy Badge on Assistant Replies */}
                {m.role === "assistant" && (
                  <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      {m.is_external_ai_used ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          Gemini 2.5 Flash • PII Redacted
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          Local Engine • Zero Exposure
                        </span>
                      )}

                      {m.redacted_items_count && m.redacted_items_count > 0 ? (
                        <span className="text-amber-400 font-bold ml-1">
                          ({m.redacted_items_count} items redacted)
                        </span>
                      ) : null}
                    </div>
                    <span className="text-slate-500">{m.timestamp}</span>
                  </div>
                )}

                {m.role === "user" && (
                  <div className="text-[9px] text-slate-500 text-right mt-1.5">{m.timestamp}</div>
                )}
              </div>

              {m.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-lime-400 text-[#0E1013] flex items-center justify-center shrink-0 font-bold">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-full bg-lime-400/10 border border-lime-400/20 flex items-center justify-center">
                <Loader2 className="w-3.5 h-3.5 text-lime-400 animate-spin" />
              </div>
              <div className="p-3.5 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl text-xs text-slate-400 flex items-center gap-2">
                <span>Analyzing portfolio rules...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {(language === "hi"
            ? [
                "न्यूनतम देय (Minimum Due) क्यों नहीं चुकाना चाहिए?",
                "बिलिंग चक्र और ग्रेस पीरियड कैसे काम करते हैं?",
                "50-30-20 बजट नियम क्या है?",
                "भोजन के लिए कौन सा कार्ड सबसे अच्छा है?",
                "लाउंज विज़िट सीमाएं दिखाएं",
              ]
            : language === "kn"
            ? [
                "ಕನಿಷ್ಠ ಬಾಕಿ (Minimum Due) ಪಾವತಿಯ ಅಪಾಯಗಳೇನು?",
                "ಬಿಲ್ಲಿಂಗ್ ಸೈಕಲ್ ಮತ್ತು ರಿಯಾಯಿತಿ ಅವಧಿ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ?",
                "50-30-20 ಬಜೆಟ್ ಸೂತ್ರ ಎಂದರೇನು?",
                "ಡೈನಿಂಗ್‌ಗಾಗಿ ಯಾವ ಕಾರ್ಡ್ ಅತ್ಯುತ್ತಮವಾಗಿದೆ?",
                "ಲೌಂಜ್ ಪ್ರವೇಶ ಮಿತಿಗಳನ್ನು ತೋರಿಸಿ",
              ]
            : [
                "Why should I avoid paying only the minimum due?",
                "How does the billing cycle and grace period work?",
                "Explain the 50-30-20 budget framework",
                "Which card is best for dining?",
                "Show lounge visit limits",
              ]
          ).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-[11px] px-3 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-slate-300 hover:text-white whitespace-nowrap transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Minimal Liquid Glass Input Bar */}
        <div className="pt-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 p-1.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-[0_12px_36px_0_rgba(0,0,0,0.5)] focus-within:border-lime-400/50 transition-all"
          >
            <input
              type="text"
              placeholder={t.assistant.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-transparent px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-full bg-lime-400 hover:bg-lime-300 text-[#0E1013] disabled:opacity-40 shadow-neonLime transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
