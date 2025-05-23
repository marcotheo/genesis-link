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
        soft: "var(--soft)",
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
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeOut: {
          from: { opacity: "1" },
          to: { opacity: "0" },
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
            opacity: "1",
            transform: "scale(1)",
          },
        },
        "fade-out-scale": {
          "0%": {
            opacity: "1",
            transform: "scale(1)",
          },
          "100%": {
            opacity: "0",
            transform: "scale(0.90)",
          },
        },
        "sheet-open": {
          from: {
            opacity: "0",
            transform: "translateX(-100%)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0%)",
          },
        },
        "sheet-close": {
          from: {
            opacity: "1",
            transform: "translateX(0%)",
          },
          to: {
            opacity: "0",
            transform: "translateX(-100%)",
          },
        },
        "sheet-up": {
          from: {
            opacity: "0",
            transform: "translateY(100%)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0%)",
          },
        },
        "sheet-down": {
          from: {
            opacity: "1",
            transform: "translateY(0%)",
          },
          to: {
            opacity: "0",
            transform: "translateY(100%)",
          },
        },
        "collapsible-open": {
          "0%": { height: "0" },
          "100%": { height: "var(--qwikui-collapsible-content-height)" },
        },
        "collapsible-closed": {
          "0%": { height: "var(--qwikui-collapsible-content-height)" },
          "100%": { height: "0" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        fadeIn: "fadeIn 0.75s var(--modal-animation)",
        fadeOut: "fadeOut 0.75s var(--modal-animation)",
        expand: "expand 0.3s ease-out",
        slideDown: "slideDown 0.5s ease-out",
        "fade-in-slide": "fade-in-slide 0.1s ease-out forwards",
        "fade-out-slide": "fade-out-slide 0.1s ease-out forwards",
        "fade-in-scale": "fade-in-scale 0.2s ease-out forwards",
        "fade-out-scale": "fade-out-scale 0.2s ease-out forwards",
        "sheet-open": "sheet-open 0.75s var(--modal-animation)",
        "sheet-close": "sheet-close 0.75s var(--modal-animation)",
        "sheet-up": "sheet-up 0.75s var(--modal-animation)",
        "sheet-down": "sheet-down 0.75s var(--modal-animation)",
        "collapsible-open":
          "collapsible-open 550ms cubic-bezier(0.87, 0, 0.13, 1) forwards",
        "collapsible-closed":
          "collapsible-closed 350ms cubic-bezier(0.87, 0, 0.13, 1) forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
