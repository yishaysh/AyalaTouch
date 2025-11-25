/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#c2410c',
        secondary: '#1e293b',
        accent: '#10b981',
      },
      fontFamily: {
        sans: ['Rubik', 'sans-serif'],
      }
    },
  },
  plugins: [],
}