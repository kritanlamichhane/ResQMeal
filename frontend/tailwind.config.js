/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        uber: {
          black: '#000000',
          white: '#FFFFFF',
          green: '#06C167',
          'green-dark': '#05944F',
          'green-light': '#E8F8EE',
          gray: {
            50: '#F6F6F6',
            100: '#EEEEEE',
            200: '#E2E2E2',
            400: '#AFAFAF',
            600: '#545454',
            800: '#262626',
            900: '#141414',
          }
        },
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#06C167',
          600: '#05944F',
          700: '#047857',
          800: '#065f46',
          900: '#000000',
        },
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.03em',
        tight: '-0.02em',
      },
      borderRadius: {
        'uber': '8px',
        'uber-pill': '9999px',
      }
    },
  },
  plugins: [],
}
