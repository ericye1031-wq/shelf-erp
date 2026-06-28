import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#005591',
          light: '#2271B3',
          dark: '#003D6B',
          contrastText: '#FFFFFF',
        },
        accent: {
          main: '#F44611',
          light: '#FF6B3D',
          dark: '#C93600',
          contrastText: '#FFFFFF',
        },
        background: {
          default: '#F5F5F5',
          paper: '#FFFFFF',
        },
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};

export default config;
