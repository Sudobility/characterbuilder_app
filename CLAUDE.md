# CLAUDE.md — characterbuilder_app

Vite + React web app. Layer 5 (final) of five. Firebase auth, the sudobility
design system + component kit, the comprehensive FaceSpec editor. Modeled on
screenwriter_app (slimmed: no i18n marketing site, no Yjs).

## Shape
- `src/main.tsx` — providers: QueryClient → AuthProvider → ClientBridge →
  DraftStoreProvider → BrowserRouter → App. `installTheme()` runs first.
- `src/theme.ts` — `configureTheme(retroTheme)` + inject `generateThemeCSS` (the
  design-system token CSS the components resolve against).
- `src/auth/` — `firebase.ts` (lazy init, analytics best-effort) + `AuthContext`
  (user, loading, signInGoogle, signInDev, signOut, `getToken` → Firebase ID token
  or `dev:uid:email`).
- `src/ClientBridge.tsx` — builds one `CharacterBuilderClient` bound to `getToken`.
- `src/ui.ts` — barrel over `@sudobility/components` (Button, Card, Heading, Text,
  Input, TextArea, Select*, Badge, Spinner, Label, Checkbox, cn). Adjust names here.
- `src/components/FaceSpecForm.tsx` — renders `FEATURE_GROUPS` generically
  (enum→Select, multi→Checkboxes, text→Input/TextArea, number→Input).
- `src/components/ImageTile.tsx` — fetches authed image bytes → object URL.
- `src/pages/` — Login, Dashboard, Editor, Gallery, Credits. `App.tsx` routes;
  `Shell.tsx` is the chrome + auth gate.

## Gotchas
- `@sudobility/components` prop shapes that bit us: `TextArea` is `value:string` +
  `onChange:(v:string)=>void`; `Checkbox` is `checked` + `onChange:(b:boolean)=>void`;
  `Input` is native; `Select` is Radix (`value`/`onValueChange`, non-empty item
  values — "unset" uses the `__unset__` sentinel). The text input is `Input` (there
  is no root `TextInput`).
- Use `theme-*` utility classes (bg/text/border) so the active design theme drives color.
- Local packages resolve via vite `siblingAlias` (build/dev) and tsconfig `paths`
  (typecheck); on a fresh checkout run the `bun link` line in the README.
- Firebase is optional: with it unset, `VITE_AUTH_TEST_MODE=1` gives a dev login.
