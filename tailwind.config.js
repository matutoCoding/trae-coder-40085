/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: "#f0f5ff",
          100: "#e0eaff",
          200: "#b9d0ff",
          300: "#7ba0ff",
          400: "#3a6df0",
          500: "#1e3a5f",
          600: "#172e4d",
          700: "#12253d",
          800: "#0e1e31",
          900: "#0a1727",
        },
        accent: {
          amber: "#f59e0b",
          emerald: "#10b981",
          rose: "#ef4444",
          sky: "#0ea5e9",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "serif"],
        sans: ['"LXGW WenKai"', "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-in": "slideIn 0.3s ease-out forwards",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
