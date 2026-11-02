"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useLanguage, Language } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { apiFetch, getStoredSession, storeSession } from "@/lib/api";
import { User, CheckCircle2, Loader2, Save } from "lucide-react";
import { ToastContainer, useToast } from "@/components/Toast";

export default function ProfilePage() {
  const { t, language, setLanguage } = useLanguage();
  const { updateUser } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [preferredLang, setPreferredLang] = useState<Language>(language);
  const [financialPathway, setFinancialPathway] = useState("CREDIT_CARD");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data: any = await apiFetch("/profile");
        setProfile(data);
        setFullName(data.full_name || "");
        setCurrency(data.currency || "INR");
        setFinancialPathway(data.financial_pathway || "CREDIT_CARD");
        if (data.preferred_language) {
          setPreferredLang(data.preferred_language as Language);
          setLanguage(data.preferred_language as Language);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const updated: any = await apiFetch("/profile", {
        method: "PUT",
        body: JSON.stringify({
          full_name: fullName,
          preferred_language: preferredLang,
          currency,
          financial_pathway: financialPathway,
        }),
      });

      setProfile(updated);
      setLanguage(preferredLang);
      updateUser({
        fullName: updated.full_name,
        preferredLanguage: updated.preferred_language,
        financialPathway: updated.financial_pathway,
      });

      setSavedSuccess(true);
    } catch (err: any) {
      addToast("Failed to save profile: " + (err.message || err), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-[#0E1013]">
      <Sidebar />

      <main className="flex-1 p-5 sm:p-7 lg:p-9 max-w-4xl mx-auto w-full space-y-7">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            {t.profile.title}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.profile.subtitle}
          </p>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{t.profile.savedSuccess}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
            <p className="text-xs text-slate-400 mt-2">{t.common.loading}</p>
          </div>
        ) : (
          <div className="p-7 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.6)]">
            <form onSubmit={handleSave} className="space-y-6 text-xs">
              <div className="flex items-center gap-4 border-b border-white/[0.07] pb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 p-0.5 shadow-[0_0_20px_rgba(76,192,63,0.35)]">
                  <div className="w-full h-full bg-[#17191E] rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{fullName || "CLIQ User"}</h3>
                  <div className="text-xs text-slate-400">{profile?.email}</div>
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                    {t.nav.proMember}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1.5">
                    {t.profile.fullNameLabel}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1.5">
                    {t.profile.emailLabel}
                  </label>
                  <input
                    type="email"
                    disabled
                    value={profile?.email || ""}
                    className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl px-4 py-2.5 text-slate-500 text-sm cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1.5">
                    {t.profile.currencyLabel}
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-[#17191E] border border-white/10 rounded-2xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1.5">
                    {t.profile.preferredLanguageLabel}
                  </label>
                  <select
                    value={preferredLang}
                    onChange={(e) => setPreferredLang(e.target.value as Language)}
                    className="w-full bg-[#17191E] border border-white/10 rounded-2xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="kn">ಕನ್ನಡ (Kannada)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-medium mb-1.5">
                    Financial Pathway Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFinancialPathway("CREDIT_CARD")}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        financialPathway === "CREDIT_CARD"
                          ? "bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_15px_rgba(76,192,63,0.15)]"
                          : "bg-white/[0.02] border-white/10 hover:border-white/20 text-slate-400"
                      }`}
                    >
                      <p className={`font-bold text-xs ${financialPathway === "CREDIT_CARD" ? "text-emerald-400" : "text-white"}`}>
                        Credit Card Optimization
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Reward maximizer, card comparisons, merchant offer radar, and statement analytics.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFinancialPathway("NO_CREDIT_CARD")}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        financialPathway === "NO_CREDIT_CARD"
                          ? "bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_15px_rgba(76,192,63,0.15)]"
                          : "bg-white/[0.02] border-white/10 hover:border-white/20 text-slate-400"
                      }`}
                    >
                      <p className={`font-bold text-xs ${financialPathway === "NO_CREDIT_CARD" ? "text-emerald-400" : "text-white"}`}>
                        Cash &amp; Savings Pathway
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        50/30/20 budget framework, emergency runway shield, UPI &amp; cash expense log, and savings goals.
                      </p>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.07] flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full bg-lime-400 hover:bg-lime-300 text-[#0E1013] font-bold text-xs shadow-neonLime transition-all flex items-center gap-2 disabled:opacity-40"
                >
                  {saving ? (
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t.profile.saving}</span>
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{t.profile.saveProfileButton}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
