import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const p = (rel: string) => fileURLToPath(new URL(rel, import.meta.url));

// Point Vite at the sibling source when checked out locally; otherwise fall through
// to the (bun link'd) node_modules copy. Keep in sync with tsconfig `paths`.
const siblingAlias = (name: string, rel: string) =>
  existsSync(p(rel))
    ? [{ find: new RegExp(`^@sudobility/${name}$`), replacement: p(rel) }]
    : [];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      ...siblingAlias('characterbuilder_lib', '../characterbuilder_lib/src/index.ts'),
      ...siblingAlias('characterbuilder_client', '../characterbuilder_client/src/index.ts'),
      ...siblingAlias('characterbuilder_types', '../characterbuilder_types/src/index.ts'),
    ],
    dedupe: ['react', 'react-dom', '@tanstack/react-query', 'zustand'],
  },
  server: { port: 5145 },
});
