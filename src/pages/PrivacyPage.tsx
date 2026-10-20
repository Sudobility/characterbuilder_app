import { AppTextPage, type TextPageContent } from '@sudobility/building_blocks';
import { APP_NAME, SUPPORT_EMAIL, APP_DOMAIN } from '../config';

/**
 * Public "Privacy" page, built on `building_blocks`' `AppTextPage`. Content is
 * adapted to what this app actually does — Firebase Google sign-in (plus the
 * dev-only email bypass), AI image generation from a face spec, a credit
 * balance, and locally stored drafts. Reasonable placeholder content, not
 * reviewed by counsel.
 */
export function PrivacyPage() {
  const text: TextPageContent = {
    title: 'Privacy Policy',
    lastUpdated: new Date().toLocaleDateString(),
    sections: [
      {
        title: 'Introduction',
        content: `This policy explains what ${APP_NAME} collects, why, and the choices you have. By using the app you agree to the handling of information described here.`,
      },
      {
        title: 'Information we collect',
        subsections: [
          {
            title: 'Information you provide',
            items: [
              'Account information from your sign-in provider (Google): your email address and display name.',
              'Characters and face specs you create.',
              'Generation requests you submit.',
            ],
          },
          {
            title: 'Information collected automatically',
            items: [
              'Basic usage and diagnostic data needed to operate the service.',
              'Analytics events (best-effort; disabled when analytics is unavailable).',
            ],
          },
        ],
      },
      {
        title: 'How we use information',
        description: 'We use the information above to:',
        items: [
          'Authenticate you and keep your characters associated with your account.',
          'Generate images from the face specs you submit.',
          'Maintain your credit balance and gallery.',
          'Operate, secure and improve the service.',
        ],
      },
      {
        title: 'AI image generation',
        content:
          'Face specs you submit for generation are sent to our image-generation provider solely to produce the requested images. They are not used to train third-party models.',
      },
      {
        title: 'Storage',
        content:
          'Drafts may be cached locally in your browser so you do not lose work. Characters, generations and your balance are stored on our servers tied to your account.',
      },
      {
        title: 'Your rights',
        description: 'Depending on where you live, you may have the right to:',
        items: [
          'Access the information associated with your account.',
          'Correct or delete your characters and generations.',
          'Request deletion of your account.',
        ],
      },
      {
        title: 'Children',
        content: 'The service is not directed to children under 13, and we do not knowingly collect their information.',
      },
      {
        title: 'Changes',
        content: 'We may update this policy from time to time; material changes will be reflected by the date above.',
      },
    ],
    contact: {
      title: 'Contact',
      description: 'Questions about this policy or your data?',
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
