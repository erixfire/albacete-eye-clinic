/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a56db',
          dark: '#1e429f',
          soft: '#ebf0ff',
        },
        surface: '#ffffff',
        surface2: '#f7f9fc',
      }
    },
  },
  plugins: [],
}
