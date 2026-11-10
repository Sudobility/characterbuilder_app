import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import { MasterListItem } from '@sudobility/components';
import { MasterDetailPage } from '../components/layout/MasterDetailPage';
import { useAuth } from '../auth/AuthContext';
import { Badge, Button, Heading, Text } from '../ui';

/**
 * Public "Tutorials" page — a reusable master/detail: the walkthrough list on the
 * left, the selected tutorial (numbered steps plus a screenshot or sample image)
 * on the right. Deep-linkable at `/tutorials/:slug`. Same `MasterDetailPage` as
 * the Docs page and the signed-in dashboard.
 */
interface TutImage {
  src: string;
  alt: string;
  caption?: string;
}
interface Tutorial {
  id: string;
  title: string;
  level: string;
  minutes: string;
  summary: string;
  steps: string[];
  image?: TutImage;
  /** A small grid of example images instead of a single screenshot. */
  gallery?: TutImage[];
}

const ART = (id: string, name: string): TutImage => ({
  src: `/art-styles/${id}.png`,
  alt: `${name} sample character`,
  caption: name,
});

const TUTORIALS: Tutorial[] = [
  {
    id: 'first-character',
    title: 'Create your first character',
    level: 'Basics',
    minutes: '2 min',
    summary: 'Go from a blank screen to a set of portraits with just a description.',
    steps: [
      'Open "Create a character" (the prompt-first flow).',
      'Describe who you want — e.g. "a weathered fisherman in his 60s with a salt-and-pepper beard".',
      'Press Continue; the traits your prompt implies are read in and a few essentials appear.',
      'Confirm age, sex, ethnicity, "Look" and how many images, then choose an art style.',
      'Press Generate, then open any result to keep it as a named character.',
    ],
    image: {
      src: '/screenshots/new.png',
      alt: 'The prompt-first create screen',
      caption: 'Describe, confirm essentials, generate.',
    },
  },
  {
    id: 'lookalike-from-photo',
    title: 'Create a lookalike from a photo',
    level: 'Basics',
    minutes: '3 min',
    summary: 'Upload a headshot and generate the same person with the changes you want.',
    steps: [
      'On the create screen (or the advanced editor) press "Upload Photo".',
      'The traits visible in the photo are read into the form automatically.',
      'Tick "Create lookalike" so the photo is used as a reference, not just for traits.',
      'Describe or edit what should change — hairstyle, hair colour, age, expression.',
      'Generate: the result keeps the person\'s identity and applies only your changes.',
    ],
  },
  {
    id: 'advanced-traits',
    title: 'Fine-tune traits in the advanced editor',
    level: 'Core',
    minutes: '4 min',
    summary: 'Shape a face deliberately, region by region, without over-specifying.',
    steps: [
      'Open the advanced editor and optionally start from a description or a photo.',
      'Step through the groups — who they are, then head & face, eyes, nose, mouth, skin, hair.',
      'Fill only the fields you care about; every field is optional and blanks are cast for you.',
      'Use "Randomize missing" to fill the gaps while keeping the choices you made.',
      'Pick an art style, set shot and expression, then generate.',
    ],
    image: {
      src: '/screenshots/advanced.png',
      alt: 'The advanced trait editor',
      caption: 'Every trait, grouped and optional.',
    },
  },
  {
    id: 'pick-art-style',
    title: 'Cast a character in a new art style',
    level: 'Core',
    minutes: '2 min',
    summary: 'Keep the face, change the look — photoreal, animated, painterly and more.',
    steps: [
      'On the art-style step, browse the groups and sample cards.',
      'Pick a look — the sample shows what the style does to a face.',
      'Generate; the art style changes the render without changing the person.',
      'Re-generate with a different style to compare directions.',
    ],
    gallery: [
      ART('modern-cinematic', 'Modern Cinematic'),
      ART('ghibli-esque', 'Ghibli-esque'),
      ART('comic-book', 'Comic Book'),
      ART('oil-painting', 'Oil Painting'),
    ],
  },
  {
    id: 'variations-and-sheets',
    title: 'Variations and full-body sheets',
    level: 'Core',
    minutes: '3 min',
    summary: 'Build on a headshot you kept: age it, restyle it, or get a turnaround.',
    steps: [
      'Open a saved headshot from one of your characters.',
      'Use the variation panel to change age, hair or grooming while keeping the person.',
      'Or build a full-body character sheet — a front/side/back turnaround.',
      'Add clothing reference photos to dress the sheet.',
      'New images are saved under the same character automatically.',
    ],
  },
  {
    id: 'manage-credits',
    title: 'Manage your credits',
    level: 'Account',
    minutes: '1 min',
    summary: 'Understand what a render costs and how to top up.',
    steps: [
      'Check your balance any time from the Credits page or the account menu.',
      'Each generated image is one credit, so Count N costs N credits.',
      'A render that would exceed your balance is declined before any images are made.',
      'Top up from the Credits page, then return and generate.',
    ],
  },
];

const DEFAULT_TUT = TUTORIALS[0]!.id;

function ImageBlock({ image, small }: { image: TutImage; small?: boolean }) {
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

function TutorialDetail({ tut }: { tut: Tutorial }) {
  const { navigate } = useLocalizedNavigate();
  const { user } = useAuth();
  return (
    <article className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Heading level={1} size="2xl">
            {tut.title}
          </Heading>
          <Badge variant="default" size="sm">
            {tut.level}
          </Badge>
          <Badge variant="info" size="sm">
            {tut.minutes}
          </Badge>
        </div>
        <Text as="p" className="max-w-2xl text-theme-text-secondary">
          {tut.summary}
        </Text>
      </div>

      <ol className="flex max-w-2xl flex-col gap-3">
        {tut.steps.map((step, s) => (
          <li key={step} className="flex gap-3">
            <span
              aria-hidden
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-theme-bg-secondary text-xs font-semibold text-theme-text-secondary"
            >
              {s + 1}
            </span>
            <Text as="span" size="sm">
              {step}
            </Text>
          </li>
        ))}
      </ol>

      {tut.image && (
        <div className="max-w-3xl">
          <ImageBlock image={tut.image} />
        </div>
      )}

      {tut.gallery && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tut.gallery.map((img) => (
            <ImageBlock key={img.src} image={img} small />
          ))}
        </div>
      )}

      <div>
        <Button variant="primary" onClick={() => navigate(user ? '/new' : '/login')}>
          {user ? 'Start a character' : 'Sign in to start'}
        </Button>
      </div>
    </article>
  );
}

export function TutorialsPage() {
  const { slug } = useParams();
  const { navigate } = useLocalizedNavigate();
  const active = TUTORIALS.find((t) => t.id === slug) ?? TUTORIALS[0]!;

  const [mobileView, setMobileView] = useState<'navigation' | 'content'>('navigation');
  useEffect(() => {
    if (slug) setMobileView('content');
  }, [slug]);

  const open = (id: string) => {
    navigate(id === DEFAULT_TUT ? '/tutorials' : `/tutorials/${id}`);
    setMobileView('content');
  };

  return (
    <MasterDetailPage
      masterTitle="Tutorials"
      masterContent={
        <nav className="flex flex-col gap-1 p-2">
          {TUTORIALS.map((t) => (
            <MasterListItem
              key={t.id}
              isSelected={t.id === active.id}
              onClick={() => open(t.id)}
              label={t.title}
              description={`${t.level} · ${t.minutes}`}
            />
          ))}
        </nav>
      }
      detailContent={<TutorialDetail tut={active} />}
      mobileView={mobileView}
      onBackToNavigation={() => setMobileView('navigation')}
      contentKey={active.id}
    />
  );
}
