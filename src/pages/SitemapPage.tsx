import { AppSitemapPage, type AppSitemapPageProps } from '@sudobility/building_blocks';
import { APP_NAME } from '../config';
import { LinkWrapper } from '../components/layout/LinkWrapper';

/**
 * Public "Sitemap" page, built on `building_blocks`' `AppSitemapPage`. This app
 * is single-locale, so no language options are offered.
 */
export function SitemapPage() {
  const props: AppSitemapPageProps = {
    text: {
      title: 'Sitemap',
      subtitle: `Every page in ${APP_NAME}.`,
      languagesSectionTitle: 'Languages',
      languagesDescription: '',
      quickLinksTitle: 'Quick links',
    },
    languages: [],
    LinkComponent: LinkWrapper,
    quickLinks: [
      { path: '/characters', label: 'Open the app', variant: 'primary' },
      { path: '/contact', label: 'Contact', variant: 'outline', icon: 'envelope' },
    ],
    sections: [
      {
        title: 'App',
        icon: 'home',
        links: [
          { path: '/characters', label: 'Characters', description: 'Your characters and face specs' },
          { path: '/new', label: 'New character', description: 'Start a new face spec' },
          { path: '/gallery', label: 'Gallery', description: 'Every image you have generated' },
          { path: '/credits', label: 'Credits', description: 'Your balance and top-ups' },
        ],
      },
      {
        title: 'Learn',
        icon: 'document',
        links: [
          { path: '/docs', label: 'Documentation', description: 'How the app works, field by field' },
          { path: '/tutorials', label: 'Tutorials', description: 'Short, guided walkthroughs' },
        ],
      },
      {
        title: 'Company',
        icon: 'document',
        links: [
          { path: '/about', label: 'About', description: `What ${APP_NAME} is and who it is for` },
          { path: '/contact', label: 'Contact', description: 'Reach the team' },
          { path: '/privacy', label: 'Privacy Policy' },
          { path: '/terms', label: 'Terms of Service' },
        ],
      },
    ],
  };

  return <AppSitemapPage {...props} />;
}
