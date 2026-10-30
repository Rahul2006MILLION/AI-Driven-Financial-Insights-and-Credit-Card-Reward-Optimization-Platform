"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage, Language } from "@/lib/i18n";
import { apiFetch } from "@/lib/api";
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  User,
  Loader2,
  Globe,
  CheckCircle2,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  timestamp: string;
}

export default function AssistantPage() {
  const { t, language, setLanguage } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        language === "hi"
          ? "नमस्ते! मैं आपका CLIQ वित्तीय सहायक हूँ। आप मुझसे अपने क्रेडिट कार्ड्स, कैशबैक दरों, पेट्रोल नियमों या किसी भी खरीद के बारे में पूछ सकते हैं।"
          : language === "kn"
          ? "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ CLIQ ಆರ್ಥಿಕ ಸಹಾಯಕ. ನಿಮ್ಮ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್‌ಗಳು, ಕ್ಯಾಶ್‌ಬ್ಯಾಕ್ ಮತ್ತು ರಿವಾರ್ಡ್ ನಿಯಮಗಳ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ."
          : "Hello! I am your CLIQ Financial Intelligence Assistant. Ask me anything about your registered cards, reward caps, exclusion policies, or optimal cards for specific purchases.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        <div className="flex items-center justify-between border-b border-cliq-border pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cliq-cyan to-cliq-emerald p-0.5 shadow-neonCyan">
              <div className="w-full h-full bg-cliq-bg rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-cliq-cyan" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span>{t.assistant.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cliq-emerald/20 text-cliq-emerald border border-cliq-emerald/40 font-bold">
                  Grounded
                </span>
              </h1>
              <p className="text-[11px] text-cliq-textSecondary">{t.assistant.groundedIn}</p>
            </div>
          </div>

          {/* Quick Language Toggle */}
          <div className="flex items-center gap-1 bg-cliq-surface px-2 py-1 rounded-lg border border-cliq-border text-xs">
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

                <div className="text-[9px] text-cliq-textMuted text-right mt-1.5">{m.timestamp}</div>
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
                <span>Analyzing grounded card rules...</span>
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
