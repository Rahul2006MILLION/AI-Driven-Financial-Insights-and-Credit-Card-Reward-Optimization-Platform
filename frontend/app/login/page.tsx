"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, storeSession } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { Sparkles, Lock, Mail, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data: any = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      storeSession({
        accessToken: data.access_token,
        userId: data.user_id,
        email: data.email,
        fullName: data.full_name,
        preferredLanguage: data.preferred_language,
      });

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail("aarav.demo@cliq.finance");
    setPassword("SecurePassword123!");
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel p-8 rounded-2xl border-glow-cyan shadow-cardGlass">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-cliq-cyan to-cliq-emerald p-0.5 mb-3 shadow-neonCyan">
            <div className="w-full h-full bg-cliq-bg rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cliq-cyan" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Welcome Back to CLIQ</h2>
          <p className="text-xs text-cliq-textSecondary mt-1.5">{t.tagline}</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-cliq-danger/10 border border-cliq-danger/30 text-cliq-danger text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="name@example.com"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-cliq-cyan transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cliq-cyan to-cliq-emerald text-cliq-bg font-bold text-sm shadow-neonCyan hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-cliq-border text-center space-y-3">
          <button
            type="button"
            onClick={fillDemoAccount}
            className="text-xs text-cliq-turquoise hover:underline font-medium"
          >
            Fill Demo Credentials
          </button>

          <p className="text-xs text-cliq-textSecondary">
            Don't have an account yet?{" "}
            <Link href="/register" className="text-cliq-cyan font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
