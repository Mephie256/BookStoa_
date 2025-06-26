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
          background: '#f9fafb',
          text: '#1f2937',
        },
        sidebar: {
          background: '#ffffff',
        },
        content: {
          background: '#ffffff',
        },
        text: {
          primary: '#1f2937',
          secondary: '#6b7280',
        },
        accent: {
          green: '#11b53f',
          'green-hover': '#0f9e37',
          'green-light': '#16c946',
          'green-dark': '#0d8a2f',
        },
        border: {
          light: '#e5e7eb',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '29': '116px',
        '35': '140px',
        '70': '280px',
      },
      width: {
        '29': '116px',
        '35': '140px',
        '70': '280px',
      },
      height: {
        '30': '120px',
        '40': '160px',
      },
      borderRadius: {
        'small': '6px',
        'medium': '8px',
        'large': '12px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'exclusives': '0 4px 12px rgba(0, 0, 0, 0.05)',
      },
      gridTemplateColumns: {
        'books': 'repeat(5, 140px)',
        'books-tablet': 'repeat(4, 140px)',
        'books-mobile': 'repeat(2, 140px)',
      },
      transitionProperty: {
        'all': 'all',
      },
      transitionDuration: {
        '200': '0.2s',
      },
      transitionTimingFunction: {
        'ease-in-out': 'ease-in-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
