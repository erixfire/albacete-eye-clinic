/** @type {import('tailwindcss').Config} */
// NOTE: Tailwind v4 uses CSS-based config (@theme in styles.css).
// This file is kept only for editor tooling / IntelliSense.
// It has NO effect on the actual build.
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0891B2',
          dark:    '#0E7490',
          soft:    '#ECFEFF',
        },
        accent: {
          DEFAULT: '#16A34A',
          dark:    '#15803D',
          soft:    '#F0FDF4',
        },
        surface:    '#FFFFFF',
        surface2:   '#F0FDFA',
        background: '#F0FDFA',
        foreground: '#134E4A',
        border:     '#CCFBF1',
      },
      fontFamily: {
        heading: ['Figtree', 'system-ui', 'sans-serif'],
        sans:    ['Noto Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        sm:      '0 1px 2px 0 rgba(19,78,74,0.05)',
        DEFAULT: '0 1px 3px rgba(19,78,74,0.05), 0 4px 12px rgba(19,78,74,0.05)',
        md:      '0 10px 25px -5px rgba(19,78,74,0.1)',
      },
    },
  },
  plugins: [],
};
