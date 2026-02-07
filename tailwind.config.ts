import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium resort palette - sharp & professional
        ocean: {
          DEFAULT: "#0D4F8B",  // Deep ocean blue - sharp & professional
          light: "#1565A8",
          dark: "#0A2942",     // Rich navy for backgrounds
          50: "#E8F4FC",
          100: "#C5E0F5",
          200: "#8EC4ED",
          300: "#57A8E5",
          400: "#2088D4",
          500: "#0D4F8B",
          600: "#0B4377",
          700: "#093763",
          800: "#072B4F",
          900: "#051F3B",
        },
        gold: {
          DEFAULT: "#E8941C",  // Rich sunset gold - vibrant
          light: "#F5B041",    // Warm highlight
          dark: "#C77B0A",
          50: "#FEF7E8",
          100: "#FCE9C4",
          200: "#F9D68A",
          300: "#F6C350",
          400: "#F0AD26",
          500: "#E8941C",
          600: "#C77B0A",
          700: "#A66308",
          800: "#854B06",
          900: "#643304",
        },
        cyan: {
          DEFAULT: "#17A2B8",  // Sharp teal
          light: "#20C5DC",
          dark: "#128293",
        },
        green: {
          DEFAULT: "#2D6A4F",  // Deep tropical green
          light: "#40916C",
          dark: "#1B4332",
        },
        sand: {
          DEFAULT: "#FAF8F5",  // Clean off-white
          dark: "#F0EBE3",
          light: "#FFFFFF",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 1s ease-out",
        "fade-in-up": "fadeInUp 0.8s ease-out",
        "slide-in-left": "slideInLeft 0.8s ease-out",
        "slide-in-right": "slideInRight 0.8s ease-out",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-50px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(50px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
