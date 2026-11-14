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

// `@sudobility/building_blocks` imports optional peers (auth, subscriptions, devops
// status) that this app does not use. They are not installed, so they are aliased to
// local no-op stubs — the sudobility "stubs system" (matches music_app's vite.config).
const stub = (name: string) => p(`./src/stubs/${name}.ts`);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      ...siblingAlias('characterbuilder_lib', '../characterbuilder_lib/src/index.ts'),
      ...siblingAlias('characterbuilder_client', '../characterbuilder_client/src/index.ts'),
      ...siblingAlias('characterbuilder_types', '../characterbuilder_types/src/index.ts'),
      ...siblingAlias('characterbuilder_ui', '../characterbuilder_ui/src/index.ts'),
      { find: /^@sudobility\/devops-components$/, replacement: stub('devops-components') },
      { find: /^@sudobility\/subscription-components$/, replacement: stub('subscription-components') },
      { find: /^@sudobility\/subscription_lib$/, replacement: stub('subscription_lib') },
    ],
    // Dedupe the shared design-system stack to one copy. `characterbuilder_ui`
    // carries its own node_modules copy of `building_blocks`/`components`;
    // without this, Vite resolves the sibling's copy (which lacks this app's
    // optional `di_web` peer) and the bundle breaks. Route every import to the
    // app's copy (the bun-linked sibling, alongside this app's full deps).
    dedupe: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      'zustand',
      '@sudobility/building_blocks',
      '@sudobility/components',
      // `building_blocks` is a symlink in local dev, so its own imports of these
      // resolve into the SIBLING's node_modules — a second copy whose optimized
      // hash never matches what the app serves (a persistent 504 on the dep).
      // Pin them to the app's single copy.
      '@sudobility/di_web',
      '@sudobility/di',
      '@sudobility/types',
    ],
  },
  build: {
    rollupOptions: {
      output: {
        // Split the large, rarely-changing vendor libraries into their own
        // long-cacheable chunks so a page edit doesn't bust the whole bundle,
        // and so the landing page isn't blocked on, e.g., firebase. Everything
        // not matched here stays with the route/app code that imports it, and
        // unused exports are still tree-shaken out of each chunk.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('/firebase/') || id.includes('/@firebase/')) return 'firebase';
          if (id.includes('/@tanstack/')) return 'react-query';
          if (id.includes('/zod/')) return 'zod';
          // The sudobility design-system stack is one coupled unit: building_blocks
          // imports components, and the two share many third-party deps (radix,
          // clsx, i18next). Splitting them into separate chunks makes Rollup put a
          // shared dep in one chunk and reference it from the other, which closes a
          // chunk-level cycle (there is none at the module level). Keeping the whole
          // stack — components, building_blocks and i18next — in one chunk is both
          // acyclic and how the sibling apps ship it.
          if (
            id.includes('/@sudobility/building_blocks/') ||
            id.includes('/@sudobility/components/') ||
            id.includes('i18next') ||
            id.includes('react-i18next')
          ) {
            return 'sudobility-ui';
          }
          if (
            id.includes('/react-router') ||
            id.includes('/react-dom/') ||
            id.includes('/scheduler/') ||
            /\/react\/[^/]*$/.test(id) ||
            id.includes('/react/')
          ) {
            return 'react-vendor';
          }
          return undefined;
        },
      },
    },
  },
  // `@sudobility/building_blocks` is bun-linked (a symlink) in local dev, so
  // Vite does not crawl it during cold-start dep optimization and only
  // discovers `@sudobility/di_web` (imported by its `SudobilityApp`) on the
  // first page load — a late discovery that churns the optimized-dep version
  // hash and leaves the browser requesting a stale, 504-ing chunk. Pinning it
  // here optimizes it up front with a stable hash. (When building_blocks is the
  // published package rather than a link, Vite finds it via the normal crawl.)
  optimizeDeps: {
    // Prebundle the whole building_blocks graph at cold start. It is a symlink
    // in local dev, so Vite doesn't crawl it during the initial scan and only
    // meets its deps (`@sudobility/di_web` → firebase) on the first page load —
    // a late discovery that bumps the optimized-dep version after the symlinked
    // module was already served with the old one, leaving a permanently
    // 504-ing dep. Including building_blocks bakes di_web/firebase into one
    // consistent prebundle up front.
    include: ['@sudobility/building_blocks', '@sudobility/di_web'],
  },
  server: { port: 5145 },
});
