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
          DEFAULT: '#1C1917', // Stone 900 (Premium Black)
          dark: '#0C0A09',    // Stone 950
          soft: '#E8ECF0',    // Muted
        },
        accent: {
          DEFAULT: '#A16207', // Yellow 700 (Gold)
          dark: '#854D0E',    // Yellow 800
          soft: '#FEF08A',    // Yellow 200
        },
        surface: 'rgba(255, 255, 255, 0.7)',
        surface2: 'rgba(255, 255, 255, 0.4)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      backdropBlur: {
        xs: '2px',
        md: '8px',
        lg: '16px',
        xl: '24px',
      }
    },
  },
  plugins: [],
}
