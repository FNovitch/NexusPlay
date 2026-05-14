import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        kriar: {
          background: "#f5f6f7",
          surface: "#fefcfc",
          primary: "#38616f",
          secondary: "#9c6146",
          accent: "#b39e8e",
          contrast: "#1d2733",
          muted: "#5c6773",
          light: "#fefcfc",
          line: "#e5e7eb",
          success: "#3a7d44",
          warning: "#c98a2e",
          error: "#b42318",
          paper: "#f5f6f7",
          support: "#b39e8e"
        }
      },
      boxShadow: {
        soft: "0 12px 34px rgba(29, 39, 51, 0.06)",
        card: "0 14px 36px rgba(29, 39, 51, 0.07)",
        lift: "0 18px 48px rgba(29, 39, 51, 0.10)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Fraunces", "ui-serif", "Georgia", "serif"]
      }
    }
  },
  plugins: []
} satisfies Config;
