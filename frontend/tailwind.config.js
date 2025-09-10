// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F5F9FA',
          100: '#E6F0F2',
          200: '#C2DCE1',
          // ... and so on
          600: '#348B96',
          700: '#2A6F78',
          800: '#1F535B',
          900: '#14383D',
        },
      },
    },
  },
  plugins: [],
};