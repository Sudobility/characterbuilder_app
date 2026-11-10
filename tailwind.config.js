import { createTailwindPreset } from '@sudobility/design';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [createTailwindPreset()],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './node_modules/@sudobility/components/**/*.{js,jsx,ts,tsx}',
    './node_modules/@sudobility/building_blocks/**/*.{js,jsx,ts,tsx}',
    './node_modules/@sudobility/design/**/*.{js,jsx,ts,tsx}',
    './node_modules/@sudobility/resources_pages/dist/**/*.js',
  ],
  darkMode: 'class',
  theme: { extend: {} },
  plugins: [],
};
