import { AppTextPage, type TextPageContent } from '@sudobility/building_blocks';
import { APP_NAME, SUPPORT_EMAIL, APP_DOMAIN } from '../config';

/**
 * Public "About" page, built on `building_blocks`' `AppTextPage` — the same
 * block the rest of the family uses for text-heavy pages, so it inherits the
 * site's type scale and spacing.
 */
export function AboutPage() {
  const text: TextPageContent = {
    title: `About ${APP_NAME}`,
    sections: [
      {
        title: 'What it is',
        content: `${APP_NAME} is a web app for designing a character's face from structured features and generating casting images from that design. Instead of wrestling a single text prompt into the look you want, you set concrete features — and get consistent, repeatable renders you can iterate on.`,
      },
      {
        title: 'How it works',
        items: [
          'Create a character and fill in its face spec: demographics, brow, eyes, nose, jaw, lips, skin and more.',
          'Choose a shot, framing and image size.',
          'Generate an image; every render is saved to your gallery.',
          'Adjust the spec and re-render to refine the same character.',
        ],
      },
      {
        title: 'Who it is for',
        content:
          'Writers, directors, game designers, illustrators and anyone building a cast who wants a face they can describe precisely and reproduce reliably.',
      },
    ],
    contact: {
      title: 'Get in touch',
      description: 'Questions, feedback or trouble with a render? We would like to hear from you.',
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
