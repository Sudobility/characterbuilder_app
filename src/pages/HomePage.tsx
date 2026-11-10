import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import { Button, Card, Grid, Heading, Section, Text } from '@sudobility/components';
import { APP_NAME } from '../config';
import { useAuth } from '../auth/AuthContext';

/**
 * Public landing page. Signed-out visitors land here (App's HomeRoute redirects
 * signed-in visitors straight to their characters). Built from the shared
 * `@sudobility/components` primitives — Section / Grid / Card / Heading / Text /
 * Button. Copy comes from the `home` i18n namespace; the chrome from
 * `ScreenContainer`, so this page owns only the hero and the feature grid.
 */
const FEATURE_KEYS = [
  'structured',
  'casting',
  'demographics',
  'shots',
  'gallery',
  'credits',
] as const;

export function HomePage() {
  const { t } = useTranslation('home');
  const { navigate } = useLocalizedNavigate();
  const { user } = useAuth();

  return (
    <>
      <Section spacing="5xl" variant="hero">
        <div className="text-center">
          <Heading level={1} size="4xl" weight="bold" align="center">
            {APP_NAME}
          </Heading>
          <Text as="p" size="lg" color="muted" align="center" className="mx-auto mt-4 max-w-2xl">
            {t('hero.tagline')}
          </Text>
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="mt-8 shadow"
            onClick={() => navigate(user ? '/characters' : '/login')}
          >
            {user ? t('hero.ctaSignedIn') : t('hero.ctaSignedOut')}
          </Button>
        </div>
      </Section>

      <Section spacing="3xl">
        <Grid cols={{ sm: 2, lg: 3 }} gap="xl">
          {FEATURE_KEYS.map((key) => (
            <Card key={key} variant="elevated" padding="lg">
              <Heading level={2} size="lg" weight="semibold">
                {t(`features.${key}.title`)}
              </Heading>
              <Text as="p" size="sm" color="muted" className="mt-2">
                {t(`features.${key}.body`)}
              </Text>
            </Card>
          ))}
        </Grid>
      </Section>
    </>
  );
}
