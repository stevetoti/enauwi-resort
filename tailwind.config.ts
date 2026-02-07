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
        // Brand colors from E'Nauwi logo
        ocean: {
          DEFAULT: "#3CA6FD",  // Sky blue from logo text
          light: "#5BB8FF",
          dark: "#1E3A5F",     // Dark navy for backgrounds
          50: "#EBF5FF",
          100: "#D6EBFF",
          200: "#ADD6FF",
          300: "#85C2FF",
          400: "#5CADFF",
          500: "#3CA6FD",
          600: "#2B8AD4",
          700: "#1E6EAB",
          800: "#145282",
          900: "#0A3659",
        },
        gold: {
          DEFAULT: "#FEA64C",  // Orange from sunset
          light: "#F2C94D",    // Yellow/gold from sunset
          dark: "#E08A30",
          50: "#FFF8EB",
          100: "#FFEFD6",
          200: "#FFDFAD",
          300: "#FFCF85",
          400: "#FFBF5C",
          500: "#FEA64C",
          600: "#E08A30",
          700: "#C16E14",
          800: "#A35200",
          900: "#853600",
        },
        cyan: {
          DEFAULT: "#3CC9EC",  // Turquoise water from logo
          light: "#5DDCFF",
          dark: "#2BA8C7",
        },
        green: {
          DEFAULT: "#669252",  // Palm tree green
          light: "#7AAB64",
          dark: "#3C581E",
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
