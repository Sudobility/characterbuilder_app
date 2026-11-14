import { createTailwindPreset } from '@sudobility/design';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [createTailwindPreset()],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    // Scope to each package's compiled `dist` (not `**`): the sudobility UI
    // libs are bun-linked to sibling checkouts during local dev, and a bare
    // `**` would follow the symlink into the sibling's own node_modules and
    // scan tens of thousands of files. `dist` holds the compiled class strings
    // for both published and linked copies.
    './node_modules/@sudobility/components/dist/**/*.{js,jsx}',
    './node_modules/@sudobility/building_blocks/dist/**/*.{js,jsx}',
    './node_modules/@sudobility/characterbuilder_ui/dist/**/*.{js,jsx}',
    './node_modules/@sudobility/design/dist/**/*.{js,jsx}',
    './node_modules/@sudobility/resources_pages/dist/**/*.js',
  ],
  darkMode: 'class',
  theme: { extend: {} },
  plugins: [],
};
