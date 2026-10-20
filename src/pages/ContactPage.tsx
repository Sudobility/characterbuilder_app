import { AppTextPage, type TextPageContent } from '@sudobility/building_blocks';
import { APP_NAME, SUPPORT_EMAIL, APP_DOMAIN } from '../config';

/** Public "Contact" page, built on `building_blocks`' `AppTextPage`. */
export function ContactPage() {
  const text: TextPageContent = {
    title: 'Contact',
    sections: [
      {
        title: 'Support',
        content: `The fastest way to reach the ${APP_NAME} team is by email. We read every message and aim to reply within a couple of business days.`,
      },
      {
        title: 'Before you write',
        description: 'A few details help us help you faster:',
        items: [
          'What you were trying to do, and what happened instead.',
          'The character or generation involved, if any.',
          'Your browser and operating system.',
        ],
      },
    ],
    contact: {
      title: 'Reach us',
      description: 'We would love to hear what you are building.',
      info: {
        emailLabel: 'Email:',
        email: SUPPORT_EMAIL,
        websiteLabel: 'Website:',
        websiteUrl: `https://${APP_DOMAIN}`,
      },
    },
  };

  return <AppTextPage text={text} />;
}
