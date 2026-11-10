import { type ReactNode, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { stripLangPrefix } from '@sudobility/components';
import {
  AppPageLayout,
  type AuthMenuItem,
  type FooterConfig,
  type TopBarConfig,
} from '@sudobility/building_blocks';
import { APP_NAME, APP_VERSION, COMPANY_NAME, COPYRIGHT_YEAR } from '../../config';
import { LANGUAGE_CONFIGS } from '../../config/languages';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';
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
  const { t } = useTranslation('common');
  const { navigate, switchLanguage, currentLanguage } = useLocalizedNavigate();
  const location = useLocation();

  // Pages override the route-level layout (scrollable/maxWidth/padding) via
  // `useSetPageConfig`; we hold that state here and merge it into `page`.
  const [pageConfig, setPageConfig] = useState({});
  const pageConfigCtx = useMemo(() => ({ pageConfig, setPageConfig }), [pageConfig]);

  // Automatic breadcrumbs from the URL (hidden on home, which is just [Home]).
  const breadcrumbItems = useBreadcrumbs();

  // `/<lang>` is home; everything else gets the compact one-line footer. Strip
  // the language prefix before comparing.
  const isHome = stripLangPrefix(location.pathname) === '/';

  // Shown in the top-right avatar dropdown when signed in (AuthActionAdapter
  // maps these and appends sign-out).
  const authenticatedMenuItems: AuthMenuItem[] = [
    { id: 'dashboard', label: t('nav.dashboard'), onClick: () => navigate('/dashboard') },
    { id: 'gallery', label: t('nav.gallery'), onClick: () => navigate('/dashboard/gallery') },
    { id: 'characters', label: t('nav.characters'), onClick: () => navigate('/dashboard/characters') },
    { id: 'history', label: t('nav.history'), onClick: () => navigate('/dashboard/history') },
    { id: 'sheets', label: t('nav.sheets'), onClick: () => navigate('/sheets') },
    { id: 'credits', label: t('nav.credits'), onClick: () => navigate('/dashboard/credits') },
  ];

  const topBar: TopBarConfig = {
    variant: 'firebase',
    topBarVariant: 'app',
    sticky: true,
    // The built-in topbar language selector, wired to the `/:lang` router.
    hideLanguageSelector: false,
    languages: LANGUAGE_CONFIGS,
    currentLanguage,
    onLanguageChange: (code: string) => switchLanguage(code as typeof currentLanguage),
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
    // Gallery / History / Sheets are signed-in destinations and live in the
    // avatar dropdown (authenticatedMenuItems), not the top bar; the top bar
    // keeps only the public, site-wide links.
    menuItems: [
      { id: 'docs', label: t('nav.docs'), href: '/docs' },
      { id: 'tutorials', label: t('nav.tutorials'), href: '/tutorials' },
      { id: 'resources', label: t('nav.resources'), href: '/resources' },
    ],
  };

  const legalLinks = [
    { label: t('footer.privacy'), href: '/privacy' },
    { label: t('footer.terms'), href: '/terms' },
  ];

  const footer: FooterConfig = isHome
    ? {
        variant: 'full',
        logo: { appName: APP_NAME },
        companyName: COMPANY_NAME,
        copyrightYear: COPYRIGHT_YEAR,
        rightsText: t('footer.rights'),
        description: t('footer.description'),
        version: APP_VERSION,
        LinkComponent: LinkWrapper,
        linkSections: [
          {
            title: t('footer.create'),
            links: [
              { label: t('nav.gallery'), href: '/dashboard/gallery' },
              { label: t('nav.history'), href: '/dashboard/history' },
              { label: t('nav.sheets'), href: '/sheets' },
              { label: t('nav.credits'), href: '/dashboard/credits' },
            ],
          },
          {
            title: t('footer.learn'),
            links: [
              { label: t('nav.docs'), href: '/docs' },
              { label: t('nav.tutorials'), href: '/tutorials' },
              { label: t('nav.resources'), href: '/resources' },
            ],
          },
          {
            title: t('footer.legal'),
            links: [...legalLinks],
          },
          {
            title: t('footer.more'),
            links: [{ label: t('footer.sitemap'), href: '/sitemap' }],
          },
        ],
      }
    : {
        variant: 'compact',
        companyName: COMPANY_NAME,
        copyrightYear: COPYRIGHT_YEAR,
        rightsText: t('footer.rights'),
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
