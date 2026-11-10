import { lazy, Suspense } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import { LanguageRedirect, LanguageValidator } from '@sudobility/components';
import { useAuth } from './auth/AuthContext';
import { ScreenContainer } from './components/layout/ScreenContainer';
import { RequireSignIn } from './components/shell/RequireSignIn';
import { LocalizedNavigate } from './components/routing/LocalizedNavigate';
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, isLanguageSupported } from './config/languages';
import { Spinner } from './ui';

// Route-level code splitting: each page is a separate chunk, fetched on first
// visit, so the landing page does not ship the editor, the credits flow, or the
// building_blocks text/sitemap pages. Named exports are mapped to `default` for
// `React.lazy`. The shared chrome (ScreenContainer) stays eager — it renders on
// every route — and only the page content inside it suspends.
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage').then((m) => ({ default: m.ResourcesPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then((m) => ({ default: m.TermsPage })));
const SitemapPage = lazy(() => import('./pages/SitemapPage').then((m) => ({ default: m.SitemapPage })));
const DocsPage = lazy(() => import('./pages/DocsPage').then((m) => ({ default: m.DocsPage })));
const TutorialsPage = lazy(() => import('./pages/TutorialsPage').then((m) => ({ default: m.TutorialsPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const UserDashboardPage = lazy(() => import('./pages/UserDashboardPage').then((m) => ({ default: m.UserDashboardPage })));
const EditorPage = lazy(() => import('./pages/EditorPage').then((m) => ({ default: m.EditorPage })));
const SimpleGeneratePage = lazy(() => import('./pages/SimpleGeneratePage').then((m) => ({ default: m.SimpleGeneratePage })));
const PortraitPage = lazy(() => import('./pages/PortraitPage').then((m) => ({ default: m.PortraitPage })));
const CharacterDetailPage = lazy(() => import('./pages/CharacterDetailPage').then((m) => ({ default: m.CharacterDetailPage })));
const SheetStudioPage = lazy(() => import('./pages/SheetStudioPage').then((m) => ({ default: m.SheetStudioPage })));

/** Fallback while a route chunk loads. */
function PageFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner size="large" />
    </div>
  );
}

/** Adapts `ScreenContainer`'s children API to a layout-route element; the content area suspends per route. */
function ScreenContainerLayout() {
  return (
    <ScreenContainer>
      <Suspense fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
    </ScreenContainer>
  );
}

/** Index route: a returning signed-in visitor skips the marketing page and lands on their dashboard. */
function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <LocalizedNavigate to="/dashboard/characters" replace />;
  return <HomePage />;
}

/** Shared props for the shared i18n routing guards. */
const langGuard = {
  isLanguageSupported,
  defaultLanguage: DEFAULT_LANGUAGE,
  storageKey: LANGUAGE_STORAGE_KEY,
};

export function App() {
  return (
    <Routes>
      {/* Every page lives under a `/:lang` prefix. `LanguageValidator` checks the
          code, syncs i18next, and redirects an unknown/absent locale to the
          user's detected language (preserving the deep path). */}
      <Route path="/:lang" element={<LanguageValidator {...langGuard} />}>
        <Route element={<ScreenContainerLayout />}>
          {/* Public website */}
          <Route index element={<HomeRoute />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="docs" element={<DocsPage />} />
          <Route path="docs/:topicId" element={<DocsPage />} />
          <Route path="tutorials" element={<TutorialsPage />} />
          <Route path="tutorials/:slug" element={<TutorialsPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="sitemap" element={<SitemapPage />} />

          {/* Signed-in hub: Gallery / History / Credits / Account live here as
              deep-linkable sections. Gated in place; signed out opens the modal. */}
          <Route path="dashboard" element={<LocalizedNavigate to="/dashboard/characters" replace />} />
        <Route
          path="dashboard/:section"
          element={
            <RequireSignIn>
              <UserDashboardPage />
            </RequireSignIn>
          }
        />

        {/* The simplified, prompt-first flow: type a description, answer a few
            essentials, generate. The 100+ traits stay hidden (cast behind the
            scenes). The full-control editor lives at /advanced. */}
        <Route
          path="new"
          element={
            <RequireSignIn>
              <SimpleGeneratePage />
            </RequireSignIn>
          }
        />
        {/* The full trait-by-trait editor (the former /new flow). */}
        <Route
          path="advanced"
          element={
            <RequireSignIn>
              <EditorPage />
            </RequireSignIn>
          }
        />
        {/* A character is an object owning many headshots — its hub (rename,
            delete, headshots grid). Full-trait creation lives at /advanced. */}
        <Route
          path="characters/:id"
          element={
            <RequireSignIn>
              <CharacterDetailPage />
            </RequireSignIn>
          }
        />
        {/* The full-image screen for a generated image: name it (keep it as a
            character), or rename/delete it once named. */}
        <Route
          path="portrait/:imageId"
          element={
            <RequireSignIn>
              <PortraitPage />
            </RequireSignIn>
          }
        />
        <Route
          path="sheets"
          element={
            <RequireSignIn>
              <SheetStudioPage />
            </RequireSignIn>
          }
        />
        <Route
          path="sheets/:characterId"
          element={
            <RequireSignIn>
              <SheetStudioPage />
            </RequireSignIn>
          }
        />

          {/* Legacy/top-level entry points now redirect into the dashboard. */}
          <Route path="characters" element={<LocalizedNavigate to="/dashboard/characters" replace />} />
          <Route path="gallery" element={<LocalizedNavigate to="/dashboard/gallery" replace />} />
          <Route path="credits" element={<LocalizedNavigate to="/dashboard/credits" replace />} />
          {/* About/Contact were folded away; point old links at Resources. */}
          <Route path="about" element={<LocalizedNavigate to="/resources" replace />} />
          <Route path="contact" element={<LocalizedNavigate to="/resources" replace />} />
          {/* Unknown in-language path → that language's home. */}
          <Route path="*" element={<LocalizedNavigate to="/" replace />} />
        </Route>
      </Route>
      {/* Bare `/` and any non-prefixed path → redirect to the detected language,
          keeping the path (`/docs` → `/en/docs`). */}
      <Route path="/" element={<LanguageRedirect {...langGuard} />} />
      <Route path="*" element={<LanguageRedirect {...langGuard} />} />
    </Routes>
  );
}
