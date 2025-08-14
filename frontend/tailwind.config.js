/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // enables class-based dark mode for ThemeSwitcher
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // scans all your React files
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#f97316", // orange-500 for light mode
          dark: "#fb923c",  // lighter orange for dark mode
        },
        background: {
          light: "#ffffff",
          dark: "#1f1f1f",
        }
      }
    },
  },
  plugins: [],
};
