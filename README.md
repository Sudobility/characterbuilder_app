# characterbuilder_app

The **CharacterBuilder** web app — a Vite + React 19 single-page app for
generating and managing AI character portraits. It pairs a public marketing
site with a signed-in product: a FaceSpec trait editor, a prompt-first quick
generator, a gallery/job history, character sheets, and credits.

It is the front-end (final layer) of the CharacterBuilder stack and talks to
`characterbuilder_api` through the `@sudobility/characterbuilder_client` SDK.

## What it does

- **Public site** — home, docs, tutorials, about, contact, privacy, terms,
  sitemap. Server-side SEO snapshot injection runs at the edge
  (`functions/_middleware.js`, `@sudobility/seo_lib`).
- **Auth** — Firebase (Google popup + email/password) when configured, plus a
  dev bypass (`VITE_AUTH_TEST_MODE=1`) that signs in by email only and sends a
  `Bearer dev:<uid>:<email>` token. Firebase analytics is best-effort.
- **Dashboard hub** (`/dashboard/:section`) — a master/detail page with
  deep-linkable sections: Characters, Gallery, Job history, Credits, Account.
- **Generators** — `/new` is the simplified, prompt-first flow (traits hidden);
  `/advanced` is the full FaceSpec editor rendering every `FEATURE_GROUPS` dial
  from `@sudobility/characterbuilder_lib` (enum→Select, multi→Checkboxes,
  text→Input/TextArea, number→Input), with live prompt preview, generate (spends
  credits), randomize-missing, and save.
- **Character detail** (`/characters/:id`) and **portrait** (`/portrait/:imageId`)
  pages, and a **sheet studio** (`/sheets`, `/sheets/:characterId`).
- **Credits** — balance + credit-pack catalog via the shared
  `@sudobility/consumables_*` stack (RevenueCat Web billing when
  `VITE_REVENUECAT_API_KEY_WEB` is set; otherwise the store shows its empty
  state and purchasing is stubbed). A `PaywallDialog` opens whenever a job is
  refused for want of credits.

## Stack

React 19 · react-router 7 · @tanstack/react-query 5 · Firebase 12 · i18next ·
zustand draft store (from `characterbuilder_lib`) · Tailwind 3 with the
`@sudobility/design` preset and the `@sudobility/components` UI kit · Vite 7 ·
TypeScript 6. Package manager is **bun**. The API client comes from
`@sudobility/characterbuilder_client`, bound to the auth token in
`src/ClientBridge.tsx`.

## Prerequisites

- **bun** and Node 20+.
- **GitHub Packages auth**: `.npmrc` points the `@sudobility` scope at
  `npm.pkg.github.com`, so `bun install` needs a GitHub token with
  `read:packages` (in your `~/.npmrc` or `NODE_AUTH_TOKEN`).
- A running **`characterbuilder_api`** for the signed-in features (default
  `http://localhost:8039` — see `VITE_API_URL`).

### Local sibling packages (optional)

`vite.config.ts` and `tsconfig.json` alias `@sudobility/characterbuilder_lib`,
`…_client`, and `…_types` to sibling source checkouts
(`../characterbuilder_lib/src/index.ts`, etc.) when those repos exist next to
this one. The Vite alias falls through to the published `node_modules` copies if
a sibling is absent; the `tsconfig` `paths` for typecheck, however, expect the
sibling source to be present.

## Develop

```bash
bun install
cp .env.example .env          # set VITE_API_URL; keep VITE_AUTH_TEST_MODE=1 for dev login
bun run dev                   # http://localhost:5145
```

## Build & verify

```bash
bun run build       # tsc --noEmit -p tsconfig.build.json, then vite build → dist/
bun run preview     # serve the production build
bun run typecheck   # tsc --noEmit (strict)
```

There is **no test suite** and **no `lint` npm script**. ESLint is configured
(`eslint.config.js`, flat config with Prettier) and can be run ad hoc with
`bunx eslint .`, but it is not wired into a script.

## SEO / prerender (deploy prep)

The `generate` script and its parts (`process:static`, `generate:sitemap`,
`prerender:install`, `prerender`) fetch tooling from the `johnqh/workflows` repo
and use Playwright/Chromium to prerender static snapshots into `public/`. The
app deploys to **Cloudflare Pages**.

## Environment variables

See `.env.example`. Key vars: `VITE_API_URL`, the `VITE_FIREBASE_*` keys (unset
→ dev-login only), `VITE_AUTH_TEST_MODE`, and `VITE_REVENUECAT_API_KEY` /
`VITE_REVENUECAT_API_KEY_WEB`. Brand/identity overrides (`VITE_APP_NAME`,
`VITE_APP_DOMAIN`, `VITE_COMPANY_NAME`, `VITE_APP_VERSION`) are read in
`src/config/index.ts`.
