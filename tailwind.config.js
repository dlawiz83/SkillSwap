/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "#ffffff",
        foreground: "#0f172a", // Slate-900
        muted: "#f1f5f9", // Slate-100
        primary: "#0f172a", // Black/Dark Slate for main buttons
        primaryFg: "#ffffff",
      },
    },
  },
  plugins: [],
};
