import { AppSitemapPage, type AppSitemapPageProps } from '@sudobility/building_blocks';
import { APP_NAME } from '../config';
import { LANGUAGE_CONFIGS } from '../config/languages';
import { LinkWrapper } from '../components/layout/LinkWrapper';

/**
 * Public "Sitemap" page, built on `building_blocks`' `AppSitemapPage`. Lists
 * every page plus the supported languages (the site is served under a `/:lang`
 * prefix).
 */
export function SitemapPage() {
  const props: AppSitemapPageProps = {
    text: {
      title: 'Sitemap',
      subtitle: `Every page in ${APP_NAME}.`,
      languagesSectionTitle: 'Languages',
      languagesDescription: 'Available in 15 languages.',
      quickLinksTitle: 'Quick links',
    },
    languages: LANGUAGE_CONFIGS.map((l) => ({ code: l.code, name: l.name, flag: l.flag })),
    LinkComponent: LinkWrapper,
    quickLinks: [
      { path: '/characters', label: 'Open the app', variant: 'primary' },
      { path: '/resources', label: 'Resources', variant: 'outline', icon: 'document' },
    ],
    sections: [
      {
        title: 'App',
        icon: 'home',
        links: [
          { path: '/characters', label: 'Characters', description: 'Your characters and face specs' },
          { path: '/new', label: 'New character', description: 'Describe a character and generate' },
          { path: '/advanced', label: 'Advanced editor', description: 'Full trait-by-trait control' },
          { path: '/gallery', label: 'Gallery', description: 'Every image you have generated' },
          { path: '/credits', label: 'Credits', description: 'Your balance and top-ups' },
        ],
      },
      {
        title: 'Learn',
        icon: 'document',
        links: [
          { path: '/docs', label: 'Documentation', description: 'How the app works, step by step' },
          { path: '/tutorials', label: 'Tutorials', description: 'Short, guided walkthroughs' },
          { path: '/resources', label: 'Resources', description: 'Tools for AI filmmaking' },
        ],
      },
      {
        title: 'Legal',
        icon: 'document',
        links: [
          { path: '/privacy', label: 'Privacy Policy' },
          { path: '/terms', label: 'Terms of Service' },
        ],
      },
    ],
  };

  return <AppSitemapPage {...props} />;
}
