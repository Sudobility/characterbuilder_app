import { useNavigate } from 'react-router-dom';
import { Button, Card, Grid, Heading, Section, Text } from '@sudobility/components';
import { APP_NAME } from '../config';
import { useAuth } from '../auth/AuthContext';

/**
 * Public landing page. Signed-out visitors land here (App's HomeRoute redirects
 * signed-in visitors straight to their characters). Built from the shared
 * `@sudobility/components` primitives — Section / Grid / Card / Heading / Text /
 * Button — matching music_app's own HomePage: the topbar/footer chrome comes
 * from `ScreenContainer`, so this page owns only the hero and the feature grid.
 */
const FEATURES = [
  {
    key: 'structured',
    title: 'Structured faces, not vague prompts',
    body: 'Describe a character from dozens of concrete facial features — brow, jaw, eyes, nose, lips, skin — instead of hoping a sentence lands.',
  },
  {
    key: 'casting',
    title: 'AI casting images',
    body: 'Turn a face spec into consistent, repeatable casting images, ready to drop into a lookbook or pitch.',
  },
  {
    key: 'demographics',
    title: 'Demographics & expression',
    body: 'Dial in age, build, expression and health state, then re-render the same character in a new shot or framing.',
  },
  {
    key: 'shots',
    title: 'Shots & sizes',
    body: 'Choose the shot and image size that fit where the render is going — a headshot, a full figure, a wide plate.',
  },
  {
    key: 'gallery',
    title: 'Everything in one gallery',
    body: 'Every generation is saved and browsable, so you can compare takes and come back to the one that worked.',
  },
  {
    key: 'credits',
    title: 'Pay only for what you render',
    body: 'Start with free credits and top up as you go. No subscription to design a character.',
  },
] as const;

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      <Section spacing="5xl" variant="hero">
        <div className="text-center">
          <Heading level={1} size="4xl" weight="bold" align="center">
            {APP_NAME}
          </Heading>
          <Text as="p" size="lg" color="muted" align="center" className="mx-auto mt-4 max-w-2xl">
            Design a character&apos;s face from structured features, then cast it with AI —
            consistent, repeatable, and yours to iterate on.
          </Text>
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="mt-8 shadow"
            onClick={() => navigate(user ? '/characters' : '/login')}
          >
            {user ? 'Go to your characters' : 'Get started'}
          </Button>
        </div>
      </Section>

      <Section spacing="3xl">
        <Grid cols={{ sm: 2, lg: 3 }} gap="xl">
          {FEATURES.map((feature) => (
            <Card key={feature.key} variant="elevated" padding="lg">
              <Heading level={2} size="lg" weight="semibold">
                {feature.title}
              </Heading>
              <Text as="p" size="sm" color="muted" className="mt-2">
                {feature.body}
              </Text>
            </Card>
          ))}
        </Grid>
      </Section>
    </>
  );
}
