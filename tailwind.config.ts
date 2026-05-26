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
        ink: "#1d2630",
        paper: "#f8f5ef",
        palm: "#1f6b57",
        river: "#2f6f9f",
        lacquer: "#a63d2a",
        brass: "#c89742"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(29, 38, 48, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
