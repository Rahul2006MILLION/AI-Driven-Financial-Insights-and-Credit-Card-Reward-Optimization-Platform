"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Globe,
  FileText,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Coins,
  Cpu,
} from "lucide-react";

export default function LandingPage() {
  const { t, language, setLanguage } = useLanguage();
  const [demoAmount, setDemoAmount] = useState(2500);
  const [demoMerchant, setDemoMerchant] = useState("Swiggy");

  // Interactive quick calculator preview on landing page
  const calculatePreviewReward = () => {
    if (demoMerchant.toLowerCase().includes("swiggy")) {
      return { card: "HDFC Millennia", rate: "5.0%", reward: (demoAmount * 0.05).toFixed(2), reason: "Accelerated 5% Dining & Food Delivery Partnership" };
    } else if (demoMerchant.toLowerCase().includes("amazon")) {
      return { card: "ICICI Amazon Pay", rate: "5.0%", reward: (demoAmount * 0.05).toFixed(2), reason: "5% Unlimited Shopping Cashback" };
    } else {
      return { card: "Axis Bank Ace", rate: "2.0%", reward: (demoAmount * 0.02).toFixed(2), reason: "2% Flat Base Rate on All Transactions" };
    }
  };

  const preview = calculatePreviewReward();

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        {/* Cinematic glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cliq-cyan/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-cliq-emerald/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cliq-surface border border-cliq-cyan/40 text-cliq-cyan text-xs font-semibold mb-6 shadow-neonCyan animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Financial Intelligence Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            CLIQ — <span className="text-transparent bg-clip-text bg-gradient-to-r from-cliq-cyan via-cliq-turquoise to-cliq-emerald glow-cyan">Money Made Simple.</span> <br />
            <span className="text-3xl sm:text-5xl lg:text-6xl text-cliq-textSecondary font-bold">
              In Your Language.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-cliq-textSecondary max-w-2xl mx-auto font-medium">
            {t.supporting}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cliq-cyan via-cliq-turquoise to-cliq-emerald text-cliq-bg font-bold text-sm shadow-neonCyan hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cliq-surface hover:bg-cliq-surfaceHover border border-cliq-border text-white font-semibold text-sm transition-all"
            >
              Sign In to Your Dashboard
            </Link>
          </div>

          {/* Interactive Live Preview Card */}
          <div className="mt-16 max-w-3xl mx-auto glass-panel p-6 sm:p-8 rounded-2xl border-glow-cyan text-left">
            <div className="flex items-center justify-between border-b border-cliq-border pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cliq-cyan" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  Live Deterministic Engine Simulation
                </span>
              </div>
              <span className="text-[11px] text-cliq-emerald bg-cliq-emerald/10 border border-cliq-emerald/30 px-2.5 py-0.5 rounded-full font-semibold">
                Pure Python Decimal Math
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-cliq-textSecondary mb-1.5">
                  Transaction Amount (₹)
                </label>
                <input
                  type="number"
                  value={demoAmount}
                  onChange={(e) => setDemoAmount(Number(e.target.value) || 0)}
                  className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-cliq-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cliq-textSecondary mb-1.5">
                  Merchant / Vendor
                </label>
                <select
                  value={demoMerchant}
                  onChange={(e) => setDemoMerchant(e.target.value)}
                  className="w-full bg-cliq-bgSecondary border border-cliq-border rounded-xl px-4 py-2.5 text-white font-medium text-sm focus:outline-none focus:border-cliq-cyan"
                >
                  <option value="Swiggy">Swiggy (Dining & Delivery)</option>
                  <option value="Amazon">Amazon (Online Shopping)</option>
                  <option value="Utility / BESCOM">BESCOM (Electricity & Utility)</option>
                  <option value="Fuel / HPCL">HPCL (Fuel Pump - Exclusion Test)</option>
                </select>
              </div>
            </div>

            {/* Recommendation Result Banner */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-cliq-surface to-cliq-bgSecondary border border-cliq-cyan/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs text-cliq-textSecondary">Optimal Card Detected:</div>
                <div className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{preview.card}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-cliq-cyan/20 text-cliq-cyan font-semibold">
                    {preview.rate}
                  </span>
                </div>
                <div className="text-xs text-cliq-textMuted mt-0.5">{preview.reason}</div>
              </div>

              <div className="sm:text-right">
                <div className="text-xs text-cliq-textSecondary">Expected Return:</div>
                <div className="text-2xl font-extrabold text-cliq-emerald glow-emerald">
                  ₹{preview.reward}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Matrix */}
      <section className="py-20 bg-cliq-bgSecondary/40 border-t border-cliq-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white">
              Complete Financial Intelligence. Built for Correctness.
            </h2>
            <p className="mt-3 text-sm text-cliq-textSecondary">
              Unlike generic AI chatbots that guess reward percentages, CLIQ couples strict arbitrary-precision calculations with multilingual comprehension.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-panel p-6 rounded-2xl glass-panel-hover transition-all">
              <div className="w-12 h-12 rounded-xl bg-cliq-cyan/10 border border-cliq-cyan/30 flex items-center justify-center mb-5 text-cliq-cyan">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Deterministic Optimization</h3>
              <p className="mt-2 text-xs text-cliq-textSecondary leading-relaxed">
                Calculates exact cashback, reward points, and miles using Python Decimal math. Enforces merchant rules, category caps, minimum spends, and exclusions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel p-6 rounded-2xl glass-panel-hover transition-all">
              <div className="w-12 h-12 rounded-xl bg-cliq-turquoise/10 border border-cliq-turquoise/30 flex items-center justify-center mb-5 text-cliq-turquoise">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Native Multilingual Experience</h3>
              <p className="mt-2 text-xs text-cliq-textSecondary leading-relaxed">
                Accessible in English, Hindi (हिन्दी), and Kannada (ಕನ್ನಡ). Chat with the AI assistant or navigate complex card fine print in your mother tongue.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel p-6 rounded-2xl glass-panel-hover transition-all">
              <div className="w-12 h-12 rounded-xl bg-cliq-emerald/10 border border-cliq-emerald/30 flex items-center justify-center mb-5 text-cliq-emerald">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Document Intelligence</h3>
              <p className="mt-2 text-xs text-cliq-textSecondary leading-relaxed">
                Upload card statement or policy PDFs. CLIQ parses reward rates, annual fees, and exclusions into a staging table for human review before activation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-cliq-border py-8 bg-cliq-bg text-center text-xs text-cliq-textSecondary">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white glow-cyan">CLIQ</span>
            <span>— {t.tagline}</span>
          </div>
          <div className="flex items-center gap-4 text-cliq-textMuted">
            <span>Deterministic Math</span>
            <span>•</span>
            <span>RLS Multi-Tenant Security</span>
            <span>•</span>
            <span>English • हिन्दी • ಕನ್ನಡ</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
