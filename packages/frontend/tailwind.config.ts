import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },

    extend: {
      fontFamily: {
        primary: "Manrope",
        secondary: "Quicksand",
      },

      colors: {
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          soft: "var(--primary-soft)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        success: "var(--success)",
        destructive: "var(--destructive)",
        info: "var(--info)",
        background: "var(--background)",
        surface: "var(--surface)",
        input: "var(--input)",
        popup: "var(--popup)",
        text: "var(--text-color)",
        ghost: "var(--ghost)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        expand: {
          "0%": { transform: "scale(0)" },
          "100%": { transform: "scale(1)" },
        },
        slideDown: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "fade-in-slide": {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-out-slide": {
          "0%": {
            opacity: "1",
            transform: "translateY(0)",
          },
          "100%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
        },
        "fade-in-scale": {
          "0%": {
            opacity: "0",
            transform: "scale(0.90)",
          },
          "100%": {
            zIndex: "50",
            opacity: "1",
            transform: "scale(1)",
          },
        },
        "fade-out-scale": {
          "0%": {
            opacity: "1",
            transform: "scale(1)",
          },
          "90%": {
            opacity: "0",
            transform: "scale(0.95)",
          },
          "100%": {
            zIndex: "-10",
          },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        fadeIn: "fadeIn 0.5s ease-in-out",
        expand: "expand 0.3s ease-out",
        slideDown: "slideDown 0.5s ease-out",
        "fade-in-slide": "fade-in-slide 0.1s ease-out forwards",
        "fade-out-slide": "fade-out-slide 0.1s ease-out forwards",
        "fade-in-scale": "fade-in-scale 0.2s ease-out forwards",
        "fade-out-scale": "fade-out-scale 0.3s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
