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
          DEFAULT: '#0891B2', // Cyan 600
          dark: '#0e7490',    // Cyan 700
          soft: '#E8F1F6',    // Muted light blue/teal
        },
        accent: {
          DEFAULT: '#16A34A', // Green 600
          dark: '#15803d',    // Green 700
          soft: '#dcfce7',    // Green 50
        },
        surface: '#ffffff',
        surface2: '#F0FDFA',  // Teal 50
      },
      fontFamily: {
        sans: ['Figtree', 'Noto Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
