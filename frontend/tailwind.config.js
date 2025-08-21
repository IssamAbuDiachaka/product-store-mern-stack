export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#16a34a", // green-600
          light: "#22c55e", // green-500
          dark: "#166534", // green-800
        },
        secondary: {
          DEFAULT: "#f97316", // orange-500
          light: "#fb923c", // orange-400
          dark: "#c2410c", // orange-700
        },
        background: "#f9fafb", // light gray bg
        surface: "#ffffff", // white for cards/panels
        text: {
          DEFAULT: "#111827", // gray-900 (main text)
          muted: "#6b7280", // gray-500 (secondary text)
        },
        success: "#22c55e", // green-500
        error: "#ef4444", // red-500
        warning: "#f59e0b", // amber-500
      },
    },
  },
  plugins: [],
};
