import { useMemo } from 'react';
import type { LoginModalText, LoginViewText } from '@sudobility/components';
import type { LoginPageText } from '@sudobility/building_blocks';
import { useAuth } from '../auth/AuthContext';

/**
 * Everything the sign-in form needs, once, for both places it is shown: the
 * login route's `LoginPage` (from `@sudobility/building_blocks`) and the
 * `LoginModal` opened over a page that needs an account (`SignInProvider`).
 * Deciding the handlers, the text and which ways in are offered here is what
 * keeps the page and the modal from ever drifting apart — they are the same
 * form.
 *
 * This app is single-locale (see CLAUDE.md), so the text is plain English
 * rather than `t(...)` — only the few strings worth overriding are set; the
 * components fill the rest from their English defaults.
 *
 * `VITE_AUTH_TEST_MODE=1` (local dev): the email/password form becomes the dev
 * email-only bypass — `signInDev(email)`, the password ignored — so the dev
 * login the `.env` asks to keep works through the same form. Google stays real
 * whenever Firebase is configured.
 */
export function useLoginHandlers() {
  const {
    hasGoogle,
    hasEmailPassword,
    hasDevAuth,
    signInEmail,
    signUpEmail,
    sendPasswordReset,
    signInGoogle,
    signInDev,
  } = useAuth();

  return useMemo(() => {
    const devLogin = async (email: string) => {
      signInDev(email);
    };

    const viewText: Partial<LoginViewText> = {
      emailLabel: hasDevAuth ? 'Dev login (email, no password)' : 'Email',
      signInWithGoogle: 'Continue with Google',
    };
    const pageText: Partial<LoginPageText> = { ...viewText };
    const modalText: Partial<LoginModalText> = {
      signInTitle: 'Sign in',
      signUpTitle: 'Create account',
      resetPasswordTitle: 'Reset password',
    };

    return {
      /** Whether any way to sign in is configured at all. */
      available: hasGoogle || hasEmailPassword || hasDevAuth,
      hasGoogle,
      handlers: {
        // In dev mode the email form is the dev bypass (password ignored); with
        // Firebase configured it is real email/password sign-in and sign-up.
        onEmailSignIn: hasDevAuth ? devLogin : signInEmail,
        onEmailSignUp: hasDevAuth ? devLogin : signUpEmail,
        onPasswordReset: hasDevAuth ? undefined : sendPasswordReset,
        onGoogleSignIn: hasGoogle ? signInGoogle : undefined,
      },
      viewText,
      pageText,
      modalText,
    };
  }, [
    hasGoogle,
    hasEmailPassword,
    hasDevAuth,
    signInEmail,
    signUpEmail,
    sendPasswordReset,
    signInGoogle,
    signInDev,
  ]);
}
