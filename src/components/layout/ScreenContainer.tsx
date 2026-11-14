import { type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { stripLangPrefix } from '@sudobility/components';
import {
  AppShell,
  createAuthAction,
  type AuthMenuItem,
  type FooterConfig,
  type TopBarConfig,
} from '@sudobility/building_blocks';
import {
  LANGUAGE_CONFIGS,
  LinkWrapper,
  useBreadcrumbs,
  useLocalizedNavigate,
} from '@sudobility/characterbuilder_ui';
import { APP_NAME, APP_VERSION, COMPANY_NAME, COPYRIGHT_YEAR } from '../../config';
import { useAuth } from '../../auth/AuthContext';

/**
 * The topbar auth action, bound once to this app's `useAuth` and its i18n
 * labels. `createAuthAction` lives in `building_blocks`; the per-app adapter
 * (the former `AuthActionAdapter`) is gone.
 */
const AuthActionComponent = createAuthAction({
  useAuth,
  useLabels: () => {
    const { t } = useTranslation('common');
    return { signOut: t('nav.signOut'), account: t('nav.account') };
  },
});

/**
 * The one site-wide shell: `building_blocks`' `AppShell` (over `AppPageLayout`)
 * supplies the top bar and footer for both the public marketing pages and the
 * signed-in app, and owns the page-config context. Mounted once as a layout
 * route in `App.tsx`. This component only builds the app-specific topbar/footer
 * content and hands it to `AppShell`.
 */
export function ScreenContainer({ children }: { children: ReactNode }) {
  const { t } = useTranslation('common');
  const { navigate, switchLanguage, currentLanguage } = useLocalizedNavigate();
  const location = useLocation();

  // Automatic breadcrumbs from the URL (hidden on home, which is just [Home]).
  const breadcrumbItems = useBreadcrumbs();

  // `/<lang>` is home; everything else gets the compact one-line footer.
  const isHome = stripLangPrefix(location.pathname) === '/';

  // Shown in the top-right avatar dropdown when signed in.
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
    AuthActionComponent,
    authenticatedMenuItems,
    onLoginClick: () => navigate('/login'),
    loginButtonText: t('nav.logIn'),
    logo: {
      src: '/logo-96.png',
      alt: APP_NAME,
      appName: APP_NAME,
      onClick: () => navigate('/'),
    },
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
    <AppShell
      topBar={topBar}
      // Automatic, URL-derived breadcrumbs on every page except home.
      breadcrumbs={
        breadcrumbItems.length > 1
          ? { items: breadcrumbItems, LinkComponent: LinkWrapper }
          : undefined
      }
      footer={footer}
      // `layoutMode: 'full'` so the chrome spans the browser while `maxWidth`
      // caps body content; a page overrides any of this via `useSetPageConfig`.
      pageDefaults={{
        layoutMode: 'full',
        maxWidth: '5xl',
        contentClassName: 'w-full min-w-0',
      }}
    >
      {children}
    </AppShell>
  );
}
