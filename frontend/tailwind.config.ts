import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        kriar: {
          primary: "#0f5b66",
          secondary: "#a45a3d",
          support: "#d7b797",
          contrast: "#1f2a32",
          muted: "#6d756f",
          paper: "#f8f6f2",
          surface: "#ffffff",
          line: "#e8e1d8"
        }
      },
      boxShadow: {
        soft: "0 18px 60px rgba(31, 42, 50, 0.08)",
        card: "0 16px 44px rgba(31, 42, 50, 0.07)",
        lift: "0 24px 70px rgba(15, 91, 102, 0.14)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
} satisfies Config;
