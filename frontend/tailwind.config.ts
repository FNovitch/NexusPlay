import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        kriar: {
          primary: "#175063",
          secondary: "#9d533a",
          support: "#cc9f7b",
          contrast: "#56260f",
          paper: "#fdfdfd"
        }
      },
      boxShadow: {
        soft: "0 18px 60px rgba(23, 80, 99, 0.12)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
} satisfies Config;
