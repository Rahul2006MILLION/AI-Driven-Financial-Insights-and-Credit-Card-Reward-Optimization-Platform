"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  ChevronRight,
} from "lucide-react";
import { DigitalCreditCard } from "@/components/DigitalCreditCard";
import { BANK_ISSUERS } from "@/lib/cardCatalogue";

export default function LandingPage() {
  // Use a premier verified card (e.g. HDFC Regalia Gold or Infinia) for the hero floating visual
  const heroCard = BANK_ISSUERS[0]?.cards[0] || {
    id: "hdfc-infinia",
    bankId: "hdfc",
    bankName: "HDFC Bank",
    cardName: "HDFC Infinia Metal",
    cardVariant: "Infinia Metal",
    defaultNetwork: "VISA" as const,
    joiningFee: 12500,
    annualFee: 12500,
    billingCycleDay: 1,
    termsSourceUrl: "https://www.hdfcbank.com",
    highlightTag: "Super Premium Metal",
    badgeType: "VERIFIED_CATALOGUE" as const,
    rules: [],
    benefits: [],
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden bg-[#040707]">
      {/* Layered Emerald Ambient Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[300px] bg-teal-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Subtle Orbital Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full border border-emerald-500/10 pointer-events-none opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] rounded-full border border-white/[0.03] pointer-events-none" />

      {/* Main Hero Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 flex-1 flex flex-col items-center justify-center text-center">
        {/* Subtle Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl text-emerald-400 text-xs font-semibold mb-8 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span className="tracking-wide">Liquid Glass Fintech Platform</span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white max-w-4xl leading-[1.08]"
        >
          Money, Made <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 glow-emerald">
            Intelligent.
          </span>
        </motion.h1>

        {/* Short Supporting Sentence */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-slate-400 max-w-xl font-normal leading-relaxed"
        >
          Your cards. Your rewards. Your financial clarity.
        </motion.p>

        {/* Primary and Secondary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-4"
        >
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#040707] font-bold text-sm shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] transition-all flex items-center justify-center gap-2 group"
          >
            <span>Explore CLIQ</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white font-medium text-sm backdrop-blur-xl transition-all"
          >
            Sign In
          </Link>
        </motion.div>

        {/* Large Floating 3D Credit Card Centerpiece */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="mt-16 sm:mt-20 relative max-w-lg w-full flex justify-center items-center"
        >
          {/* Radial Sheen underneath card */}
          <div className="absolute -inset-8 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 rounded-3xl blur-2xl opacity-60 pointer-events-none" />

          {/* Floating interactive 3D Card */}
          <div className="relative z-10 w-full max-w-[420px] transform hover:-translate-y-2 transition-transform duration-500">
            <DigitalCreditCard
              bankName={heroCard.bankName}
              cardName={heroCard.cardName}
              cardVariant={heroCard.cardVariant}
              cardholderName="VIKRAM MALHOTRA"
              lastFourDigits="8824"
              network={heroCard.defaultNetwork || "VISA"}
              glowShadow={true}
            />
          </div>
        </motion.div>

        {/* Glass Feature Strips with Minimal Labels */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 text-left"
        >
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.07] backdrop-blur-xl hover:border-emerald-500/30 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Purchase Optimizer</h3>
            <p className="text-xs text-slate-400 mt-1">
              Exact calculations for merchant rewards and fee waivers.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.07] backdrop-blur-xl hover:border-emerald-500/30 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Fan Wallet</h3>
            <p className="text-xs text-slate-400 mt-1">
              Interactive 3D collection with real issuer card specs.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.07] backdrop-blur-xl hover:border-emerald-500/30 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Privacy Gateway</h3>
            <p className="text-xs text-slate-400 mt-1">
              Local processing by default. Zero unauthorized egress.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Minimal Glass Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-[#040707]/60 backdrop-blur-xl py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-bold text-white tracking-wider glow-emerald">CLIQ</span>
            <span>• Money, Made Intelligent.</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>256-Bit RLS Protection</span>
            <span>•</span>
            <span>Zero PAN Storage</span>
            <span>•</span>
            <span>India First</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
