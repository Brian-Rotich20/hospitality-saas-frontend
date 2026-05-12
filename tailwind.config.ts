import type { Config } from 'tailwindcss';

const config: Config = {
  // In Tailwind v4, all theme tokens live in globals.css @theme {}
  // This file only needs content paths and any plugins
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    './layouts/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [],
};

export default config;