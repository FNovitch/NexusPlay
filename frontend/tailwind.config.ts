import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nexus: {
          background: "#eef1ec",
          surface: "#ffffff",
          primary: "#242330",
          secondary: "#287d8e",
          accent: "#f0cf72",
          contrast: "#242330",
          muted: "#6f716f",
          light: "#ffffff",
          line: "#d9ddd5",
          success: "#16a34a",
          warning: "#d97706",
          error: "#b42318",
          paper: "#f5f6f1",
          support: "#d86f56",
          metal: "#aeb4ad"
        }
      },
      boxShadow: {
        soft: "0 1px 2px rgba(36, 35, 48, 0.06)",
        card: "0 10px 28px rgba(36, 35, 48, 0.09)",
        lift: "0 18px 48px rgba(36, 35, 48, 0.12)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
      }
    }
  },
  plugins: []
} satisfies Config;
