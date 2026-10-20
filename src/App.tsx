import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { ScreenContainer } from './components/layout/ScreenContainer';
import { RequireSignIn } from './components/shell/RequireSignIn';
import { Spinner } from './ui';

// Route-level code splitting: each page is a separate chunk, fetched on first
// visit, so the landing page does not ship the editor, the credits flow, or the
// building_blocks text/sitemap pages. Named exports are mapped to `default` for
// `React.lazy`. The shared chrome (ScreenContainer) stays eager — it renders on
// every route — and only the page content inside it suspends.
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then((m) => ({ default: m.TermsPage })));
const SitemapPage = lazy(() => import('./pages/SitemapPage').then((m) => ({ default: m.SitemapPage })));
const DocsPage = lazy(() => import('./pages/DocsPage').then((m) => ({ default: m.DocsPage })));
const TutorialsPage = lazy(() => import('./pages/TutorialsPage').then((m) => ({ default: m.TutorialsPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const UserDashboardPage = lazy(() => import('./pages/UserDashboardPage').then((m) => ({ default: m.UserDashboardPage })));
const EditorPage = lazy(() => import('./pages/EditorPage').then((m) => ({ default: m.EditorPage })));
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
  if (user) return <Navigate to="/dashboard/characters" replace />;
  return <HomePage />;
}

export function App() {
  return (
    <Routes>
      <Route element={<ScreenContainerLayout />}>
        {/* Public website */}
        <Route index element={<HomeRoute />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="docs" element={<DocsPage />} />
        <Route path="tutorials" element={<TutorialsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="sitemap" element={<SitemapPage />} />

        {/* Signed-in hub: Characters / Gallery / Credits / Account live here as
            deep-linkable sections. Gated in place; signed out opens the modal. */}
        <Route path="dashboard" element={<Navigate to="/dashboard/characters" replace />} />
        <Route
          path="dashboard/:section"
          element={
            <RequireSignIn>
              <UserDashboardPage />
            </RequireSignIn>
          }
        />

        {/* The character editor is a full page outside the dashboard master/detail. */}
        <Route
          path="new"
          element={
            <RequireSignIn>
              <EditorPage />
            </RequireSignIn>
          }
        />
        <Route
          path="characters/:id"
          element={
            <RequireSignIn>
              <EditorPage />
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
        <Route path="characters" element={<Navigate to="/dashboard/characters" replace />} />
        <Route path="gallery" element={<Navigate to="/dashboard/gallery" replace />} />
        <Route path="credits" element={<Navigate to="/dashboard/credits" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
