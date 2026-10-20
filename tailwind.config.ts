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
        // Heritage palette (after diachivietnam.vn): lacquer red, ivory paper, gold leaf, dark-brown ink.
        // Names are historical: "palm" is the primary (red) and "lacquer" the small-label gold-brown.
        ink: "#2a1810",
        paper: "#fbf4e6",
        sand: "#f1e3c4",
        palm: "#8e1b1b",
        maroon: "#6b1212",
        river: "#2f5d3a",
        lacquer: "#9a6a1c",
        brass: "#d4a94c",
        // Older pages and admin screens use these names; without them their accents rendered colourless.
        gold: "#d4a94c",
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
        sm: "0 1px 2px rgba(42, 24, 16, 0.06)",
        soft: "0 12px 40px -12px rgba(42, 24, 16, 0.2)",
        book: "0 1px 2px rgba(42, 24, 16, 0.2), 0 18px 36px -12px rgba(42, 24, 16, 0.45)"
      }
    }
  },
  plugins: []
};

export default config;
