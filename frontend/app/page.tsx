"use client";

import React from "react";
import { HeroSection }     from "@/components/homepage/HeroSection";
import { JourneysSection } from "@/components/homepage/JourneysSection";
import { UniverseSection } from "@/components/homepage/UniverseSection";
import { AISection }       from "@/components/homepage/AISection";
import { FeaturesSection } from "@/components/homepage/FeaturesSection";
import { PrivacySection }  from "@/components/homepage/PrivacySection";
import { ClosingSection }  from "@/components/homepage/ClosingSection";

export default function LandingPage() {
  return (
    <div className="relative bg-[#040707] overflow-x-hidden">
      <HeroSection />
      <JourneysSection />
      <UniverseSection />
      <AISection />
      <FeaturesSection />
      <PrivacySection />
      <ClosingSection />
    </div>
  );
}
