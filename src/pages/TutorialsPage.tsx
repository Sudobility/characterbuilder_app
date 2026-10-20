import { Link, useNavigate } from 'react-router-dom';
import { Badge, Button, Card, Heading, Section, Text } from '@sudobility/components';
import { useAuth } from '../auth/AuthContext';

/**
 * Public "Tutorials" page — short, guided walkthroughs as numbered steps, built
 * from the `Section`/`Card`/`Heading`/`Text` vocabulary (same idiom as HomePage
 * and DocsPage). Each tutorial maps to a real task in the app; the Docs page is
 * the field-by-field reference these link back to.
 */
interface Tutorial {
  id: string;
  title: string;
  level: string;
  minutes: string;
  summary: string;
  steps: string[];
}

const TUTORIALS: Tutorial[] = [
  {
    id: 'first-character',
    title: 'Create your first character',
    level: 'Basics',
    minutes: '3 min',
    summary: 'Go from an empty list to a saved character with a first render.',
    steps: [
      'Open Characters and choose "New character".',
      'Give the character a Name and, optionally, a Role (for example, "lead").',
      'Set a few face-spec fields that matter most — say age, hair and eyes — and leave the rest blank.',
      'In the generate panel, press Generate to render one image, then watch Results.',
      'Press "Save as character" to keep the name, role and spec.',
    ],
  },
  {
    id: 'refine-spec',
    title: 'Refine a face spec',
    level: 'Basics',
    minutes: '4 min',
    summary: 'Shape a face deliberately, region by region, without over-specifying.',
    steps: [
      'Work top-down through the groups: Who they are, then Head & face structure, Eyes, Nose, Mouth & lips, and so on.',
      'Fill only the fields you care about — every field is optional, and blanks are left to the caster.',
      'Use "Randomize missing" to fill the gaps while keeping the choices you made.',
      'Watch the Prompt preview update as you edit, so you can see what will be sent.',
      'Use Undo and Redo to compare two directions quickly.',
    ],
  },
  {
    id: 'generate-casting',
    title: 'Generate casting images',
    level: 'Core',
    minutes: '3 min',
    summary: 'Turn a finished spec into a set of consistent images.',
    steps: [
      'Pick a Shot (headshot, bust, three-quarter, full-length) and an Expression.',
      'Choose a Size (square, portrait, landscape) to fit where the image is going.',
      'Set Count to render several variations at once — each image costs one credit.',
      'Press Generate and wait for the job to move from Queued to Rendering to done.',
      'Open the Gallery to see every image this character has produced.',
    ],
  },
  {
    id: 're-cast',
    title: 'Re-cast the same character',
    level: 'Core',
    minutes: '2 min',
    summary: 'Keep the face, change the framing — the point of a structured spec.',
    steps: [
      'Open a saved character from Characters.',
      'Leave the face spec untouched.',
      'Change only Shot, Expression or Size in the generate panel.',
      'Optionally add a Health or Sub-population hint to nudge the look.',
      'Generate again — the character stays recognizable in the new shot.',
    ],
  },
  {
    id: 'manage-credits',
    title: 'Manage your credits',
    level: 'Account',
    minutes: '2 min',
    summary: 'Understand what a render costs and how to top up.',
    steps: [
      'Check your balance any time from the Credits page or the account menu.',
      'Remember each generated image is one credit, so Count N costs N credits.',
      'If a render would exceed your balance it is declined before any images are made.',
      'Top up from the Credits page, then return to the editor and generate.',
    ],
  },
];

export function TutorialsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Section spacing="3xl">
      <div className="flex flex-col gap-3">
        <Heading level={1} size="3xl" weight="bold">
          Tutorials
        </Heading>
        <Text as="p" size="lg" color="muted" className="max-w-2xl">
          Short, guided walkthroughs for the things you will do most. For the
          field-by-field reference, see the{' '}
          <Link to="/docs" className="font-medium text-theme-text-primary hover:underline">
            documentation
          </Link>
          .
        </Text>
        <div>
          <Button
            type="button"
            variant="primary"
            className="mt-2"
            onClick={() => navigate(user ? '/new' : '/login')}
          >
            {user ? 'Start a character' : 'Sign in to start'}
          </Button>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-6">
        {TUTORIALS.map((tut, i) => (
          <Card key={tut.id} variant="elevated" padding="lg">
            <div className="flex flex-wrap items-center gap-3">
              <Heading level={2} size="xl" weight="semibold">
                {i + 1}. {tut.title}
              </Heading>
              <Badge variant="default" size="sm">
                {tut.level}
              </Badge>
              <Badge variant="info" size="sm">
                {tut.minutes}
              </Badge>
            </div>
            <Text as="p" color="muted" className="mt-2 max-w-2xl">
              {tut.summary}
            </Text>
            <ol className="mt-4 flex max-w-2xl flex-col gap-3">
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
          </Card>
        ))}
      </div>
    </Section>
  );
}
