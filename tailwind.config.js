// tailwind.config.js - UPDATED with dark mode
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  darkMode: 'class', // Enable dark mode
  theme: {
    extend: {},
  },
  plugins: [],
}