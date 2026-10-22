import { type ReactNode, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppPageLayout,
  type AuthMenuItem,
  type FooterConfig,
  type TopBarConfig,
} from '@sudobility/building_blocks';
import { useAuth } from '../../auth/AuthContext';
import { APP_NAME, APP_VERSION, COMPANY_NAME, COPYRIGHT_YEAR } from '../../config';
import { PageConfigContext } from '../../context/pageConfigContextDef';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import { AuthActionAdapter } from './AuthActionAdapter';
import { LinkWrapper } from './LinkWrapper';

/**
 * The one site-wide shell: `building_blocks`' `AppPageLayout` supplies the top
 * bar and footer for both the public marketing pages and the signed-in app, so
 * the chrome never disagrees with itself across the site. Mounted once as a
 * layout route in `App.tsx` (`<ScreenContainer><Outlet/></ScreenContainer>`),
 * mirroring music_app/screenwriter_app's own `ScreenContainer`.
 *
 * No i18n (this app is deliberately single-locale — see CLAUDE.md), so the
 * topbar/footer configs are built inline from plain strings rather than from
 * `useTopBarConfig`/`useFooterConfig` translation hooks.
 */
export function ScreenContainer({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Pages override the route-level layout (scrollable/maxWidth/padding) via
  // `useSetPageConfig`; we hold that state here and merge it into `page`.
  const [pageConfig, setPageConfig] = useState({});
  const pageConfigCtx = useMemo(() => ({ pageConfig, setPageConfig }), [pageConfig]);

  // Automatic breadcrumbs from the URL (hidden on home, which is just [Home]).
  const breadcrumbItems = useBreadcrumbs();

  // `/` is home; everything else gets the compact one-line footer.
  const isHome = location.pathname === '/';

  // Shown in the top-right avatar dropdown when signed in (AuthActionAdapter
  // maps these and appends sign-out).
  const authenticatedMenuItems: AuthMenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', onClick: () => navigate('/dashboard') },
    { id: 'history', label: 'Job history', onClick: () => navigate('/dashboard/history') },
    { id: 'credits', label: 'Credits', onClick: () => navigate('/dashboard/credits') },
  ];

  const topBar: TopBarConfig = {
    variant: 'firebase',
    topBarVariant: 'app',
    sticky: true,
    hideLanguageSelector: true,
    LinkComponent: LinkWrapper,
    AuthActionComponent: AuthActionAdapter,
    authenticatedMenuItems,
    onLoginClick: () => navigate('/login'),
    logo: {
      // Small optimized mark derived from logo.png (the full 1024×1536 file is
      // far too heavy for a ~30px topbar slot); transparent, matches the favicon.
      src: '/logo-96.png',
      alt: APP_NAME,
      appName: APP_NAME,
      onClick: () => navigate('/'),
    },
    menuItems: [
      { id: 'characters', label: 'Characters', href: '/dashboard/characters', show: !!user },
      { id: 'gallery', label: 'Gallery', href: '/dashboard/gallery', show: !!user },
      { id: 'history', label: 'History', href: '/dashboard/history', show: !!user },
      { id: 'sheets', label: 'Sheets', href: '/sheets', show: !!user },
      { id: 'docs', label: 'Docs', href: '/docs' },
      { id: 'tutorials', label: 'Tutorials', href: '/tutorials' },
      { id: 'about', label: 'About', href: '/about' },
      { id: 'contact', label: 'Contact', href: '/contact' },
    ],
  };

  const legalLinks = [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ];

  const footer: FooterConfig = isHome
    ? {
        variant: 'full',
        logo: { appName: APP_NAME },
        companyName: COMPANY_NAME,
        copyrightYear: COPYRIGHT_YEAR,
        rightsText: 'All rights reserved',
        description: 'Design a face from structured features, then cast it with AI.',
        version: APP_VERSION,
        LinkComponent: LinkWrapper,
        linkSections: [
          {
            title: 'Create',
            links: [
              { label: 'Characters', href: '/dashboard/characters' },
              { label: 'Gallery', href: '/dashboard/gallery' },
              { label: 'Sheets', href: '/sheets' },
              { label: 'Credits', href: '/dashboard/credits' },
            ],
          },
          {
            title: 'Learn',
            links: [
              { label: 'Docs', href: '/docs' },
              { label: 'Tutorials', href: '/tutorials' },
            ],
          },
          {
            title: 'Company',
            links: [
              { label: 'About', href: '/about' },
              { label: 'Contact', href: '/contact' },
              ...legalLinks,
            ],
          },
          {
            title: 'More',
            links: [{ label: 'Sitemap', href: '/sitemap' }],
          },
        ],
      }
    : {
        variant: 'compact',
        companyName: COMPANY_NAME,
        copyrightYear: COPYRIGHT_YEAR,
        rightsText: 'All rights reserved',
        version: APP_VERSION,
        links: legalLinks,
        LinkComponent: LinkWrapper,
      };

  return (
    <PageConfigContext.Provider value={pageConfigCtx}>
      <AppPageLayout
        topBar={topBar}
        // Automatic, URL-derived breadcrumbs on every page except home (where the
        // trail is just [Home]); `AppPageLayout` renders the bar only when given.
        breadcrumbs={
          breadcrumbItems.length > 1
            ? { items: breadcrumbItems, LinkComponent: LinkWrapper }
            : undefined
        }
        footer={footer}
        // `layoutMode: 'full'` so the chrome spans the browser while `maxWidth`
        // caps body content at a readable column; `Section` bleeds its bands back
        // out for full-width heroes. A page may override any of this via
        // `useSetPageConfig` (e.g. the master/detail dashboard), spread last.
        page={{
          layoutMode: 'full',
          maxWidth: '5xl',
          contentClassName: 'w-full min-w-0',
          ...pageConfig,
        }}
      >
        {children}
      </AppPageLayout>
    </PageConfigContext.Provider>
  );
}
