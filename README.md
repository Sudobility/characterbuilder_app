# characterbuilder_app

The CharacterBuilder web app — Vite + React, Firebase auth, the sudobility
design system, and the comprehensive FaceSpec editor.

## What it does
- **Login** — Google (Firebase) or a dev sign-in (`VITE_AUTH_TEST_MODE=1`, sends
  `Bearer dev:<uid>:<email>`). Firebase analytics initialized when configured.
- **Dashboard** — your saved Characters (create / open / delete).
- **Editor** — the full comprehensive form (every FaceSpec dial, grouped
  head-to-chin, from `characterbuilder_lib`'s `FEATURE_GROUPS`), shot/expression/
  size/count params, a **live prompt preview**, **Generate** (spends credits →
  images via the API/ShapeShyft), **Randomize missing**, undo/redo, and save.
- **Gallery** — generation history with served images.
- **Credits** — balance + credit-pack catalog (purchase via RevenueCat when
  `VITE_REVENUECAT_API_KEY` is set).

## Stack
React 19 · react-router · @tanstack/react-query · Firebase · Tailwind with the
`@sudobility/design` preset · `@sudobility/components` UI kit · `zustand` draft
store (from `characterbuilder_lib`). The API client comes from
`characterbuilder_client`, bound to the Firebase token in `ClientBridge`.

## Run
```bash
bun install
# link the local workspace packages (see root SETUP / each CLAUDE.md):
bun link @sudobility/characterbuilder_types @sudobility/characterbuilder_client @sudobility/characterbuilder_lib
cp .env.example .env.local   # set VITE_API_URL; VITE_AUTH_TEST_MODE=1 for dev login
bun run dev                  # http://localhost:5173
bun run build                # tsc + vite build
```
Start `characterbuilder_api` first (port 8040). The design theme is installed in
`src/theme.ts` (configureTheme + injected token CSS), same pattern as screenwriter_app.
