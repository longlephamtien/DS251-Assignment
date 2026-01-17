/** @type {import('tailwindcss').Config} */
const projectTheme = require('./src/styles/theme');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    // import semantic breakpoints and tokens from a single source
    screens: projectTheme.screens,
    extend: {
      colors: projectTheme.colors,
      fontFamily: {
        sans: projectTheme.fontFamily.sans,
      },
      boxShadow: projectTheme.boxShadow,
    },
  },
  plugins: [],
};

