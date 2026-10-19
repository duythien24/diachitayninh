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
        ink: "#18231f",
        paper: "#f7f2e8",
        sand: "#ede4d3",
        palm: "#1d5c4a",
        river: "#2c5f82",
        lacquer: "#9c3b26",
        brass: "#c8963e"
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
        sm: "0 1px 2px rgba(24, 35, 31, 0.05)",
        soft: "0 12px 40px -12px rgba(24, 35, 31, 0.18)",
        book: "0 1px 2px rgba(24, 35, 31, 0.2), 0 18px 36px -12px rgba(24, 35, 31, 0.45)"
      }
    }
  },
  plugins: []
};

export default config;
