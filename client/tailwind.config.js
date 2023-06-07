/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './src/components/*.jsx',
  ],
  theme: {
    extend: {colors: {
        dark: '#F5F5F9',
        light: '#FFFFFF',
        accent: '#696cff',
        accentHover: '#E7E7FE',
        grey: '#5A697D',
      }},
  },
  plugins: [],
}

