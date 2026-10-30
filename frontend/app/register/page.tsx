"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, storeSession } from "@/lib/api";
import { useLanguage, Language } from "@/lib/i18n";
import { Sparkles, Lock, Mail, User, Globe, Loader2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preferredLanguage, setPrefLanguage] = useState<Language>(language);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data: any = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
          preferred_language: preferredLanguage,
          currency: "INR",
        }),
      });

      setLanguage(preferredLanguage);

      storeSession({
        accessToken: data.access_token,
        userId: data.user_id,
        email: data.email,
        fullName: data.full_name,
        preferredLanguage: data.preferred_language,
      });

      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel p-8 rounded-2xl border-glow-cyan shadow-cardGlass">
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-cliq-cyan to-cliq-emerald p-0.5 mb-3 shadow-neonCyan">
            <div className="w-full h-full bg-cliq-bg rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cliq-cyan" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Create Your CLIQ Account</h2>
          <p className="text-xs text-cliq-textSecondary mt-1.5">{t.supporting}</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-cliq-danger/10 border border-cliq-danger/30 text-cliq-danger text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-cliq-textSecondary mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-cliq-textMuted absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-cliq-cyan transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-cliq-textSecondary mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-cliq-textMuted absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav@example.com"
                className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-cliq-cyan transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-cliq-textSecondary mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-cliq-textMuted absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-cliq-cyan transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-cliq-textSecondary mb-1.5">
              Preferred Language / ಭಾಷೆ / भाषा
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: "en", label: "English" },
                { code: "hi", label: "हिन्दी" },
                { code: "kn", label: "ಕನ್ನಡ" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.code}
                  onClick={() => setPrefLanguage(item.code as Language)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    preferredLanguage === item.code
                      ? "bg-cliq-cyan text-cliq-bg border-cliq-cyan shadow-neonCyan"
                      : "bg-cliq-bgSecondary border-cliq-border text-cliq-textSecondary hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cliq-cyan to-cliq-emerald text-cliq-bg font-bold text-sm shadow-neonCyan hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-cliq-border text-center">
          <p className="text-xs text-cliq-textSecondary">
            Already registered?{" "}
            <Link href="/login" className="text-cliq-cyan font-bold hover:underline">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
