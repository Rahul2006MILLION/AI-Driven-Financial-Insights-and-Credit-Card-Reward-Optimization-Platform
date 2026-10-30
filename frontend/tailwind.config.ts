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
          bg: "#020B12",
          bgSecondary: "#071923",
          surface: "#0B202A",
          surfaceHover: "#112D3B",
          border: "#133240",
          borderGlow: "#00E5E5",
          cyan: "#00E5E5",
          turquoise: "#00F5C8",
          emerald: "#00D69B",
          textPrimary: "#FFFFFF",
          textSecondary: "#A9BBC5",
          textMuted: "#6B8594",
          danger: "#FF4D4D",
          warning: "#FFB800",
        },
      },
      boxShadow: {
        neonCyan: "0 0 20px -3px rgba(0, 229, 229, 0.4)",
        neonEmerald: "0 0 20px -3px rgba(0, 214, 155, 0.4)",
        neonTurquoise: "0 0 20px -3px rgba(0, 245, 200, 0.4)",
        cardGlass: "0 8px 32px 0 rgba(0, 15, 25, 0.7)",
      },
      backgroundImage: {
        "neon-gradient": "linear-gradient(135deg, #00E5E5 0%, #00F5C8 50%, #00D69B 100%)",
        "card-gradient": "linear-gradient(180deg, rgba(11, 32, 42, 0.8) 0%, rgba(7, 25, 35, 0.9) 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
