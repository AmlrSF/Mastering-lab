// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Use class strategy for dark mode
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors for better dark mode support
        dark: {
          100: '#1e1e2e',
          200: '#181825',
          300: '#11111b',
        }
      }
    },
  },
  plugins: [],
}