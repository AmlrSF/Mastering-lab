
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Use class strategy for dark mode
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
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