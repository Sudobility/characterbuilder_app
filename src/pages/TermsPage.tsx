import { AppTextPage, type TextPageContent } from '@sudobility/building_blocks';
import { APP_NAME, SUPPORT_EMAIL, APP_DOMAIN } from '../config';

/**
 * Public "Terms" page, built on `building_blocks`' `AppTextPage`. Reasonable
 * placeholder content, not reviewed by counsel.
 */
export function TermsPage() {
  const text: TextPageContent = {
    title: 'Terms of Service',
    lastUpdated: new Date().toLocaleDateString(),
    sections: [
      {
        title: 'Acceptance',
        content: `By accessing or using ${APP_NAME}, you agree to these terms. If you do not agree, do not use the service.`,
      },
      {
        title: 'Your account',
        items: [
          'You are responsible for activity under your account.',
          'You must provide accurate sign-in information and keep your access secure.',
          'You must be old enough to form a binding contract in your jurisdiction.',
        ],
      },
      {
        title: 'Acceptable use',
        description: 'You agree not to use the service to:',
        items: [
          'Generate content that is unlawful, infringing, or that depicts real people without their consent.',
          'Attempt to disrupt, overload, or reverse-engineer the service.',
          'Resell or redistribute access to the service without permission.',
        ],
      },
      {
        title: 'Credits and payment',
        content:
          'Image generation consumes credits. Credits may be granted for free or purchased. Except where required by law, purchased credits are non-refundable once consumed.',
      },
      {
        title: 'Your content',
        content:
          'You retain the rights you hold in the characters and specs you create. You are responsible for ensuring you have the rights to any inputs you provide and for how you use the images you generate.',
      },
      {
        title: 'Disclaimer',
        content:
          'The service is provided "as is" without warranties of any kind. We do not guarantee that generated images will meet your expectations or be error-free.',
      },
      {
        title: 'Limitation of liability',
        content:
          'To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the service.',
      },
      {
        title: 'Changes',
        content: 'We may update these terms from time to time; continued use after changes constitutes acceptance.',
      },
    ],
    contact: {
      title: 'Contact',
      description: 'Questions about these terms?',
      info: {
        emailLabel: 'Email:',
        email: SUPPORT_EMAIL,
        websiteLabel: 'Website:',
        websiteUrl: `https://${APP_DOMAIN}`,
      },
    },
  };

  return <AppTextPage text={text} lastUpdatedDate={new Date().toLocaleDateString()} />;
}
