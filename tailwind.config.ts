import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        // Tây Ninh palette: night indigo, Bà Đen mist, Cao Đài blue and turmeric, rubber-forest green, temple red
        ink: "#16213a",
        paper: "#eef1ee",
        sand: "#dde4e0",
        palm: "#1f4f8c",
        river: "#2e7464",
        lacquer: "#a8362a",
        brass: "#e0a42c",
        // Older pages and admin screens use these names; without them their accents rendered colourless.
        gold: "#e0a42c",
        blue: "#2f6fae"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"]
      },
      borderRadius: {
        DEFAULT: "0.5rem"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) both",
        float: "float 7s ease-in-out infinite"
      },
      boxShadow: {
        sm: "0 1px 2px rgba(22, 33, 58, 0.06)",
        soft: "0 12px 40px -12px rgba(22, 33, 58, 0.2)",
        book: "0 1px 2px rgba(22, 33, 58, 0.2), 0 18px 36px -12px rgba(22, 33, 58, 0.45)"
      }
    }
  },
  plugins: []
};

export default config;
