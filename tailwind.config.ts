import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#F6F7F9",
          light: "#F8F9FA",
          lighter: "#FAFBFC",
        },
        ink: { DEFAULT: "#16202B", soft: "#4A5663", faint: "#8792A0" },
        line: "#DDE1E7",
        accent: { DEFAULT: "#2F4BFF", dark: "#1F35C9" },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(22, 32, 43, 0.06), 0 1px 3px rgba(22, 32, 43, 0.04)',
        'card': '0 4px 16px rgba(22, 32, 43, 0.06), 0 2px 6px rgba(22, 32, 43, 0.04)',
        'card-hover': '0 8px 24px rgba(22, 32, 43, 0.08), 0 4px 12px rgba(22, 32, 43, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
