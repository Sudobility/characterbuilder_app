import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LoginPage as LoginPageComponent } from '@sudobility/building_blocks';
import { APP_NAME } from '../config';
import { useAuth } from '../auth/AuthContext';
import { useLoginHandlers } from '../hooks/useLoginHandlers';
import { Heading, Text } from '../ui';

/**
 * The login route — where somebody comes *in order to* sign in (the top bar's
 * "Log in", the home page's call to action). It renders
 * `@sudobility/building_blocks`' own `LoginPage`, wired the way screenwriter_app
 * and music_app wire it: real Firebase email/password sign-in, sign-up, reset
 * and Google, or the dev email bypass in `VITE_AUTH_TEST_MODE`. Handlers and
 * text come from `useLoginHandlers`, shared with the `LoginModal`
 * (`SignInProvider`) that a gated page opens over itself — so the page and the
 * modal are one form and can never drift apart.
 */
export function LoginPage() {
  const { user } = useAuth();
  const { available, hasGoogle, handlers, pageText } = useLoginHandlers();
  const location = useLocation();
  const navigate = useNavigate();

  // Return the visitor where they were headed before the sign-in redirect, or to their characters.
  const from = (location.state as { from?: string } | null)?.from ?? '/characters';
  if (user) return <Navigate to={from} replace />;

  if (!available) {
    return (
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-lg border border-theme-border-primary p-6 text-center">
          <Heading level={1} size="2xl">
            {APP_NAME}
          </Heading>
          <Text as="p" size="sm" className="mt-2 text-theme-text-secondary">
            Set <code>VITE_FIREBASE_*</code> to enable sign-in, or{' '}
            <code>VITE_AUTH_TEST_MODE=1</code> for a dev login.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <LoginPageComponent
      appName={APP_NAME}
      showGoogleSignIn={hasGoogle}
      text={pageText}
      {...handlers}
      onSuccess={() => navigate(from, { replace: true })}
    />
  );
}
