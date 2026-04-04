import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF5F0',
          100: '#FFEAD9',
          200: '#FFD0AF',
          300: '#FFB080',
          400: '#FF8347',
          500: '#CC3322',   // warm Indian vermillion
          600: '#B52A1A',
          700: '#9A2214',
          800: '#7D1B10',
          900: '#62140C',
        },
        saffron: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        gold: {
          50: '#FFFDF0',
          100: '#FEF9C3',
          200: '#FEF08A',
          300: '#FDE047',
          400: '#FACC15',
          500: '#D4AF37',
          600: '#B8962E',
          700: '#9A7D26',
        },
        cream: {
          50: '#FFFEFB',
          100: '#FFF9F2',
          200: '#FFF3E5',
          300: '#FFE8CC',
          400: '#FFD8A8',
        },
      },
    },
  },
  plugins: [],
};
export default config;
