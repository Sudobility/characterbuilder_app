import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import { MasterListItem } from '@sudobility/components';
import { MasterDetailPage } from '../components/layout/MasterDetailPage';
import { Heading, Text } from '../ui';

/**
 * Public "Docs" page — a reusable master/detail: the topic list on the left, the
 * selected topic (with screenshots and sample character images) on the right.
 * Topics are deep-linkable at `/docs/:topicId`. Built on the same
 * `MasterDetailPage` the signed-in dashboard uses, so the chrome is consistent.
 */
interface DocImage {
  src: string;
  alt: string;
  caption?: string;
}
interface DocTopic {
  id: string;
  label: string;
  blurb: string;
  title: string;
  body: string[];
  bullets?: string[];
  images?: DocImage[];
  /** A grid of small sample images (e.g. art-style examples). */
  gallery?: DocImage[];
}

const ART = (id: string, name: string): DocImage => ({
  src: `/art-styles/${id}.png`,
  alt: `${name} sample character`,
  caption: name,
});

const TOPICS: DocTopic[] = [
  {
    id: 'overview',
    label: 'Overview',
    blurb: 'What CharacterBuilder is',
    title: 'What CharacterBuilder is',
    body: [
      'CharacterBuilder turns a description — or a photo — into consistent, reusable character portraits. You describe who you want in plain words, answer a couple of essentials, and generate; everything else about the face is filled in for you.',
      'Every image you keep becomes a named character you can come back to: generate more headshots of the same person, make variations, or build a full-body character sheet.',
    ],
    gallery: [
      ART('naturalistic', 'Naturalistic'),
      ART('modern-cinematic', 'Modern Cinematic'),
      ART('ghibli-esque', 'Ghibli-esque'),
      ART('comic-book', 'Comic Book'),
      ART('3d-pixar-dreamworks', '3D Animation'),
      ART('oil-painting', 'Oil Painting'),
    ],
  },
  {
    id: 'quick-start',
    label: 'Quick start',
    blurb: 'Create a character from a prompt',
    title: 'Create a character from a prompt',
    body: [
      'The fastest way in is the prompt-first flow. Describe the character in your own words, and CharacterBuilder reads the traits your description implies, asks a few essentials, lets you pick an art style, and generates.',
      'You do not need to set any of the detailed facial traits — they are cast behind the scenes to match your description. Your own wording is also sent to the image model, so the result stays close to what you asked for.',
    ],
    bullets: [
      'Describe your character — a sentence or two is plenty.',
      'Confirm a few essentials: age, sex, ethnicity, "Look" and how many images.',
      'Choose an art style from the sample grid.',
      'Generate — each image costs one credit.',
    ],
    images: [
      {
        src: '/screenshots/new.png',
        alt: 'The prompt-first create screen',
        caption: 'Describe who you want, then generate.',
      },
    ],
  },
  {
    id: 'from-photo',
    label: 'From a photo',
    blurb: 'Read traits & create lookalikes',
    title: 'Start from a photo',
    body: [
      'Both the prompt-first flow and the advanced editor can read a face from an uploaded headshot. Use "Upload Photo" and the traits visible in the photo are read in for you.',
      'When a photo is uploaded, a "Create lookalike" option appears. Leave it off and the photo is only used to read traits — a brand-new face is generated. Turn it on and the generated images keep that person\'s identity, changing only the traits you edit or describe.',
    ],
    bullets: [
      'Upload Photo reads the visible traits into the form.',
      'Create lookalike off → the photo seeds traits for a new face.',
      'Create lookalike on → same person, with your changes applied.',
    ],
  },
  {
    id: 'advanced',
    label: 'Advanced editor',
    blurb: 'Full trait-by-trait control',
    title: 'The advanced editor',
    body: [
      'When you want precise control, the advanced editor exposes the full face spec: structured fields grouped by region of the face, stepped through as a short wizard. Every field is optional — fill only what matters and leave the rest for the caster to decide.',
      'You can still start from a description or a photo here, then fine-tune individual traits, choose an art style, set the shot and expression, and generate.',
    ],
    bullets: [
      'Describe the character — or upload a photo — to pre-fill traits.',
      'Step through the groups: who they are, head & face, eyes, nose, mouth, skin, hair and more.',
      '"Randomize missing" fills only the blanks, keeping your choices.',
      'Pick an art style, then set shot, expression, size and count before generating.',
    ],
    images: [
      {
        src: '/screenshots/advanced.png',
        alt: 'The advanced trait editor',
        caption: 'Every facial trait, optional and grouped.',
      },
    ],
  },
  {
    id: 'art-styles',
    label: 'Art styles',
    blurb: 'Choose the visual look',
    title: 'Art styles',
    body: [
      'An art style sets the visual look of the render without touching the face. The same character can be cast photoreal, cinematic, illustrated, animated, painterly or stylized — pick from the sample grid and the examples show what each look does.',
    ],
    gallery: [
      ART('high-key', 'High Key'),
      ART('low-key-chiaroscuro', 'Low Key'),
      ART('impressionist', 'Impressionist'),
      ART('charcoal', 'Charcoal'),
      ART('cel-shaded-3d-spider-verse', 'Cel-shaded 3D'),
      ART('watercolor', 'Watercolor'),
      ART('graphic-novel-ink', 'Graphic Novel'),
      ART('gouache', 'Gouache'),
    ],
  },
  {
    id: 'generating',
    label: 'Generating',
    blurb: 'Jobs, results and shots',
    title: 'Generating images',
    body: [
      'Generation is an asynchronous job. Once enqueued it moves from Queued to Rendering, and the images appear under Results when it finishes. A render can take a while.',
      'A few options shape each render without changing the face, so you can re-cast the same character in a new framing.',
    ],
    bullets: [
      'Shot — headshot, bust, three-quarter or full-length.',
      'Expression — neutral, smiling, serious, thoughtful and more.',
      'Size — square, portrait or landscape.',
      'Count — how many images to render (1–10); each image is one credit.',
    ],
  },
  {
    id: 'characters',
    label: 'Characters & gallery',
    blurb: 'Keep, name and revisit',
    title: 'Characters, gallery and sheets',
    body: [
      'Generating does not commit you to anything up front. When you see an image you like, open it and give it a name to keep it as a character. A character owns many headshots, so you can keep adding to it.',
      'From a saved headshot you can generate variations (change age, hair, grooming while keeping the person) or a full-body character sheet. Everything you generate is saved to the Gallery, and the History view shows every job and its status.',
    ],
    bullets: [
      'Characters — faces you have named.',
      'Gallery — every image you have generated.',
      'History — each generation job and whether it succeeded.',
      'Sheets — full-body turnarounds built from a headshot.',
    ],
    images: [
      {
        src: '/screenshots/dashboard.png',
        alt: 'The signed-in dashboard',
        caption: 'Characters, gallery, history and credits in one hub.',
      },
    ],
  },
  {
    id: 'credits',
    label: 'Credits',
    blurb: 'What a render costs',
    title: 'Credits',
    body: [
      'Each generated image costs one credit, so a render of Count N costs N credits. New accounts start with free credits; top up any time from the Credits page.',
      'If a render would exceed your balance it is declined before any images are made, and the app tells you how many credits you need.',
    ],
  },
  {
    id: 'account',
    label: 'Account',
    blurb: 'Sign-in and your data',
    title: 'Account & sign-in',
    body: [
      'Sign in to keep your characters, images and balance tied to your account across devices. Your characters, generations and balance live on our servers; drafts may be cached in your browser so you do not lose in-progress work.',
    ],
  },
];

const DEFAULT_TOPIC = TOPICS[0]!.id;

function ImageBlock({ image, small }: { image: DocImage; small?: boolean }) {
  return (
    <figure className="flex flex-col gap-2">
      <img
        src={image.src}
        alt={image.alt}
        loading="lazy"
        className={`w-full rounded-lg border border-theme-border object-cover ${small ? 'aspect-[4/5]' : ''}`}
      />
      {image.caption && (
        <figcaption>
          <Text as="span" size="xs" className="text-theme-text-secondary">
            {image.caption}
          </Text>
        </figcaption>
      )}
    </figure>
  );
}

function TopicDetail({ topic }: { topic: DocTopic }) {
  return (
    <article className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Heading level={1} size="2xl">
          {topic.title}
        </Heading>
        {topic.body.map((p, i) => (
          <Text key={i} as="p" className="max-w-2xl text-theme-text-secondary">
            {p}
          </Text>
        ))}
      </div>

      {topic.bullets && (
        <ul className="flex max-w-2xl flex-col gap-2">
          {topic.bullets.map((b) => (
            <li key={b} className="flex gap-2">
              <span aria-hidden className="text-theme-text-secondary">
                •
              </span>
              <Text as="span" size="sm">
                {b}
              </Text>
            </li>
          ))}
        </ul>
      )}

      {topic.images?.map((img) => (
        <div key={img.src} className="max-w-3xl">
          <ImageBlock image={img} />
        </div>
      ))}

      {topic.gallery && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {topic.gallery.map((img) => (
            <ImageBlock key={img.src} image={img} small />
          ))}
        </div>
      )}
    </article>
  );
}

export function DocsPage() {
  const { topicId } = useParams();
  const { navigate } = useLocalizedNavigate();
  const active = TOPICS.find((t) => t.id === topicId) ?? TOPICS[0]!;

  const [mobileView, setMobileView] = useState<'navigation' | 'content'>('navigation');
  useEffect(() => {
    if (topicId) setMobileView('content');
  }, [topicId]);

  const open = (id: string) => {
    navigate(id === DEFAULT_TOPIC ? '/docs' : `/docs/${id}`);
    setMobileView('content');
  };

  return (
    <MasterDetailPage
      masterTitle="Documentation"
      masterContent={
        <nav className="flex flex-col gap-1 p-2">
          {TOPICS.map((t) => (
            <MasterListItem
              key={t.id}
              isSelected={t.id === active.id}
              onClick={() => open(t.id)}
              label={t.label}
              description={t.blurb}
            />
          ))}
        </nav>
      }
      detailContent={<TopicDetail topic={active} />}
      mobileView={mobileView}
      onBackToNavigation={() => setMobileView('navigation')}
      contentKey={active.id}
    />
  );
}
