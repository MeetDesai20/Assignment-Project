/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Surface hierarchy - Tonal layering for depth
        "surface-dim": "#0c0e14",
        "surface": "#0c0e14",
        "surface-bright": "#272c39",
        "surface-container-lowest": "#000000",
        "surface-container-low": "#11131a",
        "surface-container": "#161922",
        "surface-container-high": "#1c1f29",
        "surface-container-highest": "#222631",
        
        // Primary colors - Neon Blue
        "primary": "#81ecff",
        "primary-dim": "#00d4ec",
        "primary-fixed": "#00e3fd",
        "primary-fixed-dim": "#00d4ec",
        "primary-container": "#00e3fd",
        "on-primary": "#005762",
        "on-primary-fixed": "#003840",
        "on-primary-fixed-variant": "#005762",
        "on-primary-container": "#004d57",
        
        // Secondary colors - Purple
        "secondary": "#cdbdff",
        "secondary-dim": "#7e51ff",
        "secondary-fixed": "#e8deff",
        "secondary-fixed-dim": "#dacdff",
        "secondary-container": "#2b007a",
        "on-secondary": "#4800bf",
        "on-secondary-fixed": "#4700bd",
        "on-secondary-fixed-variant": "#652fe7",
        "on-secondary-container": "#ac93ff",
        
        // Tertiary colors - Emerald Green
        "tertiary": "#9effc8",
        "tertiary-dim": "#00ec9a",
        "tertiary-fixed": "#1dfba5",
        "tertiary-fixed-dim": "#00ec9a",
        "tertiary-container": "#1dfba5",
        "on-tertiary": "#00643e",
        "on-tertiary-fixed": "#00452a",
        "on-tertiary-fixed-variant": "#00653f",
        "on-tertiary-container": "#005a38",
        
        // Neutral text colors
        "on-surface": "#e2e5f4",
        "on-background": "#e2e5f4",
        "on-surface-variant": "#a7aab9",
        
        // Outlines
        "outline": "#717583",
        "outline-variant": "#444854",
        
        // Error states
        "error": "#fd6f85",
        "error-dim": "#c8475d",
        "error-container": "#8a1632",
        "on-error": "#490013",
        "on-error-container": "#ff97a3",
        
        // Inverse colors
        "inverse-surface": "#faf8ff",
        "inverse-on-surface": "#53555c",
        "inverse-primary": "#006976",
        
        // Background
        "background": "#0c0e14",
        "surface-tint": "#81ecff",
      },
      
      fontFamily: {
        // Editorial headlines
        "headline": ["Manrope", "sans-serif"],
        // Functional body text
        "body": ["Inter", "sans-serif"],
        // Labels and small text
        "label": ["Inter", "sans-serif"],
      },
      
      borderRadius: {
        "DEFAULT": "0.25rem",
        "sm": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "full": "9999px",
      },
      
      fontSize: {
        // Display sizes
        "display-lg": ["3.5rem", { lineHeight: "3.5rem", letterSpacing: "-0.02em" }],
        "display-md": ["2.8rem", { lineHeight: "2.8rem", letterSpacing: "-0.02em" }],
        "display-sm": ["2.25rem", { lineHeight: "2.25rem", letterSpacing: "-0.02em" }],
        
        // Headline sizes
        "headline-lg": ["2rem", { lineHeight: "2.25rem" }],
        "headline-md": ["1.625rem", { lineHeight: "2rem" }],
        "headline-sm": ["1.375rem", { lineHeight: "1.75rem" }],
        
        // Title sizes
        "title-lg": ["1.375rem", { lineHeight: "1.75rem", letterSpacing: "0" }],
        "title-md": ["1rem", { lineHeight: "1.5rem", letterSpacing: "0.015em" }],
        "title-sm": ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0.01em" }],
        
        // Body sizes
        "body-lg": ["1rem", { lineHeight: "1.5rem", letterSpacing: "0.5px" }],
        "body-md": ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0.25px" }],
        "body-sm": ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.4px" }],
        
        // Label sizes
        "label-lg": ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0.125em" }],
        "label-md": ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.125em" }],
        "label-sm": ["0.625rem", { lineHeight: "0.875rem", letterSpacing: "0.125em" }],
      },
      
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "12px",
        lg: "20px",
        xl: "40px",
        "2xl": "80px",
      },
      
      boxShadow: {
        // Ambient glows instead of traditional shadows
        "glow-primary": "0 20px 80px rgba(129, 236, 255, 0.08)",
        "glow-secondary": "0 20px 80px rgba(205, 189, 255, 0.08)",
        "glow-tertiary": "0 20px 80px rgba(158, 255, 200, 0.08)",
        "glow-error": "0 20px 80px rgba(253, 111, 133, 0.08)",
        "inner-glow": "inset 0 1px 3px rgba(129, 236, 255, 0.2)",
      },
      
      animation: {
        "pulse-soft": "pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
      },
      
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.7 },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
};
