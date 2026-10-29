import { Link } from 'react-router-dom';
import { Heading, Section, Text } from '@sudobility/components';

/**
 * Public "Docs" page — one scrollable reference page with an in-page topic nav
 * (anchor links), the screenwriter_app DocsPage pattern (single page rather than
 * a route-per-topic master/detail, since this app has few topics). Built from
 * the `Section`/`Heading`/`Text` vocabulary, same idiom as HomePage. Content is
 * drawn from what the app actually does, not generic filler.
 */
interface Topic {
  id: string;
  title: string;
  body: string;
  bullets?: string[];
}

const TOPICS: Topic[] = [
  {
    id: 'getting-started',
    title: 'Getting started',
    body: 'A character is a saved face spec you can generate images from and come back to. From your Characters list, choose "New character", give it a name and an optional role, then describe the face and generate.',
    bullets: [
      'Characters — your saved characters; open one or start a new one.',
      'Editor — the face spec on the left, the generate panel on the right.',
      'Gallery — every image you have generated, across all characters.',
      'Credits — your balance and top-ups; each generated image costs one credit.',
    ],
  },
  {
    id: 'face-spec',
    title: 'The face spec',
    body: 'The left side of the editor is the face spec: structured fields grouped by region of the face. Every field is optional — fill only what matters and leave the rest for the caster to decide. Use dropdowns for shapes, checkboxes for sets, and sliders for measurable lip dimensions in millimeters. Leave a slider on Any to let casting choose its value.',
    bullets: [
      'Who they are',
      'Head & face structure',
      'Eyes · Eyebrows · Nose · Mouth & lips',
      'Cheeks & midface · Ears · Jaw, chin & neck · Teeth',
      'Skin · Hair · Individuating detail',
    ],
  },
  {
    id: 'editing-tools',
    title: 'Editing tools',
    body: 'Three helpers sit above the form. "Randomize missing" fills only the fields you have left blank, so your deliberate choices are kept. "Undo" and "Redo" step through your edits.',
  },
  {
    id: 'generating',
    title: 'Generating images',
    body: 'The generate panel composes your spec and the options below into a prompt (shown live in the "Prompt preview") and renders it. Generation is an asynchronous job: once enqueued it moves from Queued to Rendering, and the images appear under Results when it finishes. A render can take a while.',
  },
  {
    id: 'options',
    title: 'Shot, expression & size',
    body: 'Four options shape each render without touching the face spec, so you can re-cast the same character in a new framing:',
    bullets: [
      'Shot — headshot, bust, three-quarter, full-length.',
      'Expression — neutral, slight-smile, smile, serious, surprised, thoughtful.',
      'Size — square, portrait, landscape.',
      'Count — how many images to render (1–10); each image costs one credit.',
    ],
  },
  {
    id: 'demographics',
    title: 'Health & sub-population',
    body: 'Two optional demographic hints refine the look. "Health" ranges from auto (let the caster decide) through states like healthy, robust and frail. "Sub-population" is a free-text hint for ancestry or regional features (for example, "Korean" or "Yoruba"). Leave either on auto/blank to let the caster choose.',
  },
  {
    id: 'saving',
    title: 'Saving & the gallery',
    body: 'Generating does not save the character — use "Save as character" (or "Save" on an existing one) to keep the name, role, notes and spec. Generated images are always saved and appear in the Gallery, grouped by the character that produced them.',
  },
  {
    id: 'credits',
    title: 'Credits',
    body: 'Each generated image costs one credit, so a render of Count N costs N credits. New accounts start with free credits; top up from the Credits page. If a render would exceed your balance it is declined before any images are made, and the editor tells you how many credits you need.',
  },
  {
    id: 'account',
    title: 'Account & sign-in',
    body: 'Sign in with Google to keep your characters and balance tied to your account across devices. Your characters, generations and balance live on our servers; drafts may be cached in your browser so you do not lose in-progress work.',
  },
];

export function DocsPage() {
  return (
    <Section spacing="3xl">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[220px_1fr]">
        <nav
          aria-label="Documentation topics"
          className="flex flex-row flex-wrap gap-3 md:sticky md:top-24 md:flex-col md:self-start"
        >
          {TOPICS.map((topic) => (
            <a
              key={topic.id}
              href={`#${topic.id}`}
              className="text-sm font-medium text-theme-text-secondary hover:text-theme-text-primary hover:underline"
            >
              {topic.title}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-12">
          <div>
            <Heading level={1} size="3xl" weight="bold">
              Documentation
            </Heading>
            <Text as="p" size="lg" color="muted" className="mt-3 max-w-2xl">
              How CharacterBuilder works, field by field. New here? Start with
              the{' '}
              <Link
                to="/tutorials"
                className="font-medium text-theme-text-primary hover:underline"
              >
                tutorials
              </Link>
              .
            </Text>
          </div>

          {TOPICS.map((topic) => (
            <div key={topic.id} id={topic.id} className="scroll-mt-24">
              <Heading level={2} size="xl" weight="semibold">
                {topic.title}
              </Heading>
              <Text as="p" color="muted" className="mt-3 max-w-2xl">
                {topic.body}
              </Text>
              {topic.bullets && (
                <ul className="mt-4 flex max-w-2xl flex-col gap-2">
                  {topic.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span aria-hidden className="text-theme-text-secondary">
                        •
                      </span>
                      <Text as="span" size="sm" color="muted">
                        {b}
                      </Text>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
