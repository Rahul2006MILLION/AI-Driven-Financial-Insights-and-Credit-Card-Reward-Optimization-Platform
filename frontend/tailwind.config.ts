import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cliq: {
          bg: "#040707",
          bgSecondary: "#08100E",
          surface: "rgba(10, 22, 18, 0.65)",
          surfaceHover: "rgba(16, 32, 26, 0.8)",
          border: "rgba(255, 255, 255, 0.08)",
          borderGlow: "#10B981",
          cyan: "#10B981", // Harmonized to vibrant Emerald
          mint: "#34D399",
          turquoise: "#14B8A6",
          emerald: "#10B981",
          textPrimary: "#FFFFFF",
          textSecondary: "#94A3B8", // Muted silver
          textMuted: "#64748B",
          danger: "#EF4444",
          warning: "#F59E0B",
        },
      },
      boxShadow: {
        neonCyan: "0 0 25px -4px rgba(16, 185, 129, 0.4)",
        neonEmerald: "0 0 25px -4px rgba(16, 185, 129, 0.5)",
        neonTurquoise: "0 0 25px -4px rgba(20, 184, 166, 0.4)",
        cardGlass: "0 16px 40px -10px rgba(0, 0, 0, 0.7), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)",
        liquidGlass: "0 12px 36px 0 rgba(0, 0, 0, 0.6), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)",
        liquidGlassHover: "0 18px 48px 0 rgba(0, 0, 0, 0.75), 0 0 30px rgba(16, 185, 129, 0.2), inset 0 1px 1px 0 rgba(255, 255, 255, 0.22)",
      },
      backgroundImage: {
        "neon-gradient": "linear-gradient(135deg, #10B981 0%, #34D399 50%, #14B8A6 100%)",
        "card-gradient": "linear-gradient(180deg, rgba(14, 28, 22, 0.85) 0%, rgba(6, 14, 11, 0.95) 100%)",
        "glass-sheen": "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
