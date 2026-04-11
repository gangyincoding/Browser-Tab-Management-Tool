import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0D1B2A",
        mist: "#E0EAF2",
        tide: "#6CA6C1",
        ember: "#F47C48",
        moss: "#6E9E75",
        sand: "#F2E7D5"
      },
      boxShadow: {
        card: "0 12px 30px rgba(13, 27, 42, 0.10)"
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        rise: "rise 420ms ease-out both"
      }
    }
  },
  plugins: []
} satisfies Config;
