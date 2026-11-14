import { createRequireSignIn } from '@sudobility/building_blocks';
import { useAuth } from '../../auth/AuthContext';
import { useSignIn } from '../../auth/SignInContext';

/**
 * Gates a page that needs an account without leaving it (spinner while auth
 * resolves, then the page if signed in, else a notice that opens the shared
 * sign-in modal over the page). The generic gate lives in `building_blocks`
 * (`createRequireSignIn`); this binds it to the app's `useAuth`/`useSignIn` and
 * copy.
 */
export const RequireSignIn = createRequireSignIn({
  useAuth,
  useSignIn,
  useText: () => ({
    title: 'Sign in to continue',
    body: 'You need an account to work with characters, the gallery and credits.',
    button: 'Sign in',
  }),
});
