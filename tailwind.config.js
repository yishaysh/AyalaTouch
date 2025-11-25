/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#c2410c', // Amber-700
        secondary: '#1e293b', // Slate-800
        accent: '#10b981', // Emerald-500
      },
      fontFamily: {
        sans: ['Rubik', 'sans-serif'],
      }
    },
  },
  plugins: [],
}