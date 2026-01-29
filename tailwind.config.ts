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
        ocean: {
          DEFAULT: "#0A4B78",
          light: "#0D5A91",
          dark: "#083D63",
          50: "#E6F0F8",
          100: "#B3D4EA",
          200: "#80B8DC",
          300: "#4D9CCE",
          400: "#2680C0",
          500: "#0A4B78",
          600: "#083D63",
          700: "#062F4E",
          800: "#042139",
          900: "#021324",
        },
        gold: {
          DEFAULT: "#D4A853",
          light: "#E0BD7A",
          dark: "#B8903F",
          50: "#FBF6EC",
          100: "#F4E5C6",
          200: "#EDD4A0",
          300: "#E6C37A",
          400: "#DFB254",
          500: "#D4A853",
          600: "#B8903F",
          700: "#9C782B",
          800: "#806017",
          900: "#644803",
        },
        green: {
          DEFAULT: "#2E7D32",
          light: "#4CAF50",
          dark: "#1B5E20",
        },
        sand: {
          DEFAULT: "#F5F0E8",
          dark: "#E8DFD0",
          light: "#FAF8F4",
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
