import typography from "@tailwindcss/typography";
import rtl from "tailwindcss-rtl";

/** @type {import('tailwindcss').Config} */
// Ported verbatim (theme.extend) from the source repo so simulator utility
// classes (bg-primary, text-friendly-purple, prose, etc.) resolve identically.
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#8B5CF6",
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
        },
        secondary: {
          DEFAULT: "#6366F1",
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },
        background: {
          light: "#FFFFFF",
          dark: "#0F0A1A",
        },
        success: "#22C55E",
        danger: "#EF4444",
        warning: "#F59E0B",
        friendly: {
          purple: {
            DEFAULT: "#9B7BFF",
            50: "#FAF8FF",
            100: "#F3F0FF",
            200: "#E8E2FF",
            300: "#D4C9FF",
            400: "#B8A3FF",
            500: "#9B7BFF",
            600: "#8A6AE6",
            700: "#7A5CCC",
            800: "#5C3D99",
            900: "#3D2673",
          },
          gold: {
            DEFAULT: "#FFD700",
            50: "#FFFBEB",
            100: "#FEF3C7",
            200: "#FDE68A",
            300: "#FCD34D",
            400: "#FBBF24",
            500: "#FFD700",
            600: "#D97706",
            700: "#B45309",
            800: "#92400E",
            900: "#78350F",
          },
          cream: "#FFFDF8",
          warm: {
            50: "#FFFBF5",
            100: "#FFF7EB",
            200: "#FFEFD6",
            300: "#FFE4C2",
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [typography, rtl],
};
