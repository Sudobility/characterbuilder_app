# CLAUDE.md — characterbuilder_app

Vite + React 19 SPA: the CharacterBuilder front-end (final layer of the stack).
Public marketing site + signed-in product (FaceSpec editor, prompt-first
generator, gallery/history, character sheets, credits). Talks to
`characterbuilder_api` via `@sudobility/characterbuilder_client`. Modeled on the
sibling `screenwriter_app`/`music_app`. Package manager is **bun**.

## Commands (verified)

- `bun run dev` — Vite dev server on **port 5145** (not 5173).
- `bun run build` — `tsc --noEmit -p tsconfig.build.json` then `vite build` → `dist/`.
- `bun run typecheck` — `tsc --noEmit` (strict; passes clean).
- `bun run preview` — serve the built bundle.
- No test suite. No `lint` script — ESLint is configured (flat config +
  Prettier) and runs via `bunx eslint .`, but it flags existing code and is not
  wired in. Don't claim tests/lint exist.

## Install gotchas

- `.npmrc` scopes `@sudobility` to `npm.pkg.github.com`, so `bun install` needs
  a GitHub token with `read:packages` (`~/.npmrc` / `NODE_AUTH_TOKEN`).
- Local sibling packages resolve two different ways, keep both in sync:
  - `vite.config.ts` `siblingAlias` — **conditional** (`existsSync`): aliases
    `characterbuilder_{lib,client,types}` to `../<pkg>/src/index.ts` when the
    sibling repo exists, else falls through to the `node_modules` copy.
  - `tsconfig.json` `paths` — **unconditional** sibling paths, so `typecheck`
    expects the sibling source to exist on disk.
  - `tsconfig.build.json` resets `paths: {}`, so the **build** typechecks
    against the published `node_modules` packages, not siblings.
- `@sudobility/building_blocks` pulls optional peers (devops-components,
  subscription-components, subscription_lib) this app doesn't use; they are
  aliased to no-op stubs in `src/stubs/` (the sudobility "stubs system").

## Provider tree (`src/main.tsx`)

`installTheme()` runs first, then:
ErrorBoundary → QueryClientProvider → AuthProvider → ConsumablesBridge (credits
stack, follows the user) → SignInProvider (the one sign-in modal) → ClientBridge
→ DraftStoreProvider → BrowserRouter → SEOHeadProvider → `<App/>` + `<PaywallDialog/>`.

## Routing (`src/App.tsx`)

All routes are lazy-loaded chunks under one `ScreenContainerLayout` (the app
chrome — **there is no `Shell.tsx`**). Index route: signed-in users redirect to
`/dashboard/characters`, else the marketing `HomePage`.

- Public: `/`, `/login`, `/docs`, `/tutorials`, `/about`, `/contact`,
  `/privacy`, `/terms`, `/sitemap`.
- `/dashboard/:section` (gated by `RequireSignIn`) → `UserDashboardPage`, a
  master/detail hub. Sections: `characters`, `gallery`, `history`, `credits`,
  `account`. `/dashboard` → `/dashboard/characters`.
- `/new` → `SimpleGeneratePage` (prompt-first, traits hidden).
- `/advanced` → `EditorPage` (full FaceSpec trait editor; the former `/new`).
- `/characters/:id` → `CharacterDetailPage`; `/portrait/:imageId` → `PortraitPage`.
- `/sheets`, `/sheets/:characterId` → `SheetStudioPage`.
- Legacy `/characters`, `/gallery`, `/credits` redirect into `/dashboard/*`;
  `*` → `/`.
- `RequireSignIn` gates in place and opens the `SignInProvider` modal when signed
  out (it does not redirect to `/login`).

## Auth (`src/auth/`)

- `AuthContext` exposes Google popup, email/password sign-in/up/reset
  (`hasGoogle`/`hasEmailPassword` = Firebase configured), and a dev bypass
  (`hasDevAuth` = `VITE_AUTH_TEST_MODE=1`, sign in by email only).
- `getToken()` → Firebase ID token if signed in, else `dev:<uid>:<email>`, else
  null. A real Firebase sign-in wins; with none, the dev user is the session —
  so the dev bypass still works even when Firebase is also configured.
- `firebase.ts` — lazy init, analytics best-effort. Firebase is optional.

## Config & theme

- `src/config/index.ts` — all env via `VITE_*`. `API_URL` default
  `http://localhost:8039` (trailing slashes stripped). Brand overrides:
  `VITE_APP_NAME`/`APP_DOMAIN`/`COMPANY_NAME`/`APP_VERSION`.
- `src/theme.ts` — `installTheme()` runs `configureTheme(neoBrutalismTheme)` and
  injects `generateThemeCSS` as a `<style>` (the semantic tokens components
  resolve against). It also toggles the `dark` class on `<html>` for dark themes,
  because building_blocks/components use literal Tailwind `dark:` variants.
  Active theme is `neoBrutalismTheme` (from `@sudobility/design/themes`).

## Key modules

- `src/ClientBridge.tsx` — one `CharacterBuilderClient` bound to `getToken` +
  `API_URL`, provided to the hooks.
- `src/ui.ts` — barrel over `@sudobility/components`. Adjust re-export names here
  if the kit's API changes.
- `src/components/FaceSpecForm.tsx` — renders `FEATURE_GROUPS` generically.
- `src/components/ImageTile.tsx` — fetches authed image bytes → object URL.
- `src/features/credits/` — consumables bridge, credit store, paywall, history.
- `functions/_middleware.js` — Cloudflare Pages SEO middleware
  (`@sudobility/seo_lib/middleware`). Deploy target is Cloudflare Pages.

## Conventions / component prop gotchas

- `@sudobility/components` shapes: `TextArea` is `value:string` +
  `onChange:(v:string)=>void`; `Checkbox` is `checked` + `onChange:(b:boolean)=>void`;
  `Input` is native (there is no root `TextInput`); `Select` is Radix
  (`value`/`onValueChange`, non-empty item values — "unset" uses a `__unset__`
  sentinel).
- Use `theme-*` utility classes (bg/text/border) so the active theme drives color.
- Route-level code splitting: pages are `React.lazy` chunks; keep `ScreenContainer`
  chrome eager and only page content suspends.
