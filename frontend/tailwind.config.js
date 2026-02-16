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
          50: '#e6f2ed',
          100: '#cce5db',
          200: '#99cbb7',
          300: '#66b193',
          400: '#33976f',
          500: '#013220',
          600: '#012819',
          700: '#011e13',
          800: '#01140c',
          900: '#000a06',
          950: '#000503',
        },
        light: {
          bg: '#ffffff',
          card: '#f8f9fa',
          hover: '#e9ecef',
          border: '#dee2e6',
          text: '#212529',
          muted: '#6c757d',
        }
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float-up': {
          '0%': { opacity: '1', transform: 'translateX(-50%) translateY(-50%) scale(1)' },
          '50%': { opacity: '1', transform: 'translateX(-50%) translateY(-150px) scale(1.2)' },
          '100%': { opacity: '0', transform: 'translateX(-50%) translateY(-250px) scale(0.5)' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'float-up': 'float-up 1s ease-out forwards',
      }
    },
  },
  plugins: [],
}
