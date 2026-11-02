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
        // Chartreuse — primary accent (replaces Tailwind lime)
        lime: {
          50: "#F8FEE8", 100: "#EFFCC9", 200: "#E0F99B", 300: "#D2F76A", 400: "#C4F23F",
          500: "#ADDC25", 600: "#8AB518", 700: "#688A13", 800: "#4B6512", 900: "#2F4210", 950: "#1A260A",
        },
        // Fern — secondary / success accent (replaces Tailwind emerald)
        emerald: {
          50: "#EFFCEB", 100: "#D8F8CF", 200: "#B4F0A3", 300: "#8AE577", 400: "#6BD65A",
          500: "#4CC03F", 600: "#389E2F", 700: "#2E7C28", 800: "#276224", 900: "#20501F", 950: "#0D2C0E",
        },
        cliq: {
          // ── Canvas & surfaces ──────────────────────────────
          bg:           "#0E1013",  // Charcoal canvas
          bgSecondary:  "#17191E",
          bgCard:       "#1C1F25",
          surface:      "rgba(29, 32, 38, 0.85)",
          surfaceHover: "rgba(38, 42, 50, 0.9)",
          paper:        "#F4F6EE",  // Light contrast panel
          forest:       "#12301A",  // Deep forest — ink on lime / paper
          // ── Borders ────────────────────────────────────────
          border:       "rgba(255, 255, 255, 0.08)",
          borderHover:  "rgba(255, 255, 255, 0.14)",
          borderGlow:   "rgba(196, 242, 63, 0.35)",
          // ── Brand accents ──────────────────────────────────
          lime:         "#C4F23F",  // Electric lime — primary CTA
          limeHover:    "#D2F76A",
          limeDim:      "#ADDC25",
          emerald:      "#4CC03F",  // Emerald — secondary accent
          mint:         "#8AE577",
          teal:         "#14B8A6",
          turquoise:    "#C4F23F",  // Folded into chartreuse
          turquoiseDim: "#ADDC25",
          // ── Semantic ───────────────────────────────────────
          success:      "#4CC03F",
          warning:      "#F59E0B",
          danger:       "#EF4444",
          info:         "#38BDF8",
          // ── Text hierarchy ─────────────────────────────────
          textPrimary:   "#FFFFFF",
          textSecondary: "#94A3B8",
          textMuted:     "#64748B",
          textDisabled:  "#334155",
        },
      },
      borderRadius: {
        xl:    "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      fontFamily: {
        display: ["\"Bricolage Grotesque\"", "Inter", "sans-serif"],
        sans: [
          "\"Plus Jakarta Sans\"",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        // Neon glows
        neonLime:       "0 0 28px -4px rgba(196, 242, 63, 0.5)",
        neonEmerald:    "0 0 28px -4px rgba(76, 192, 63, 0.5)",
        neonTurquoise:  "0 0 28px -4px rgba(196, 242, 63, 0.4)",
        neonCyan:       "0 0 25px -4px rgba(76, 192, 63, 0.4)",
        // Card surfaces
        cardGlass:      "0 16px 40px -10px rgba(0, 0, 0, 0.7), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)",
        cardGlassHover: "0 22px 52px -10px rgba(0, 0, 0, 0.85), 0 0 30px rgba(196, 242, 63, 0.1), inset 0 1px 1px 0 rgba(255, 255, 255, 0.18)",
        liquidGlass:    "0 12px 36px 0 rgba(0, 0, 0, 0.6), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)",
        liquidGlassHover: "0 18px 48px 0 rgba(0, 0, 0, 0.75), 0 0 30px rgba(76, 192, 63, 0.2), inset 0 1px 1px 0 rgba(255, 255, 255, 0.22)",
        // Elevation
        elevated:       "0 8px 32px rgba(0, 0, 0, 0.5)",
        floating:       "0 24px 64px rgba(0, 0, 0, 0.8)",
      },
      backgroundImage: {
        // Gradients
        "lime-emerald":    "linear-gradient(135deg, #C4F23F 0%, #4CC03F 100%)",
        "emerald-teal":    "linear-gradient(135deg, #4CC03F 0%, #14B8A6 100%)",
        "neon-gradient":   "linear-gradient(135deg, #C4F23F 0%, #4CC03F 50%, #14B8A6 100%)",
        "card-gradient":   "linear-gradient(180deg, rgba(14, 28, 22, 0.85) 0%, rgba(23, 25, 30, 0.95) 100%)",
        "glass-sheen":     "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%)",
        "hero-radial":     "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(196, 242, 63, 0.15) 0%, transparent 70%)",
        "section-dark":    "linear-gradient(180deg, #0E1013 0%, #17191E 50%, #0E1013 100%)",
      },
      animation: {
        "gradient-flow":  "gradient-flow 6s ease infinite",
        "glow-pulse":     "glow-ring 2.5s ease-in-out infinite",
        "float-slow":     "particle-drift 10s ease-in-out infinite",
        "score-fill":     "score-fill 1.5s ease-out forwards",
      },
      keyframes: {
        "score-fill": {
          "0%":   { "stroke-dashoffset": "314" },
          "100%": {},
        },
      },
    },
  },
  plugins: [],
};
export default config;
