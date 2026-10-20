import { useEffect, type ReactNode } from 'react';
import { Button, Heading, Spinner, Text } from '../../ui';
import { useAuth } from '../../auth/AuthContext';
import { useSignIn } from '../../auth/SignInContext';

/**
 * Gates a page that needs an account (characters, editor, gallery, credits)
 * **without leaving it**: while auth resolves it shows a spinner; signed out,
 * the page's place shows a short notice and the shared sign-in modal opens over
 * it (`SignInContext`); signing in there renders the page itself, at the same
 * URL. Closing the modal without signing in leaves the notice, whose button
 * opens the modal again. No redirect to the login route and no redirect back —
 * that route is for where somebody navigates *in order to* sign in. Mirrors
 * screenwriter_app's own `RequireSignIn`.
 */
export function RequireSignIn({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }
  if (user) return <>{children}</>;
  return <SignedOutNotice />;
}

function SignedOutNotice() {
  const { openSignIn, closeSignIn } = useSignIn();

  useEffect(() => {
    openSignIn();
    // Leaving the gated page while the modal is open (Back) takes the modal with it.
    return () => closeSignIn();
  }, [openSignIn, closeSignIn]);

  return (
    <main
      className="mx-auto max-w-md px-4 py-16 text-center"
      data-testid="signed-out-notice"
    >
      <Heading level={1} size="2xl" weight="semibold">
        Sign in to continue
      </Heading>
      <Text as="p" color="muted" className="mt-3">
        You need an account to work with characters, the gallery and credits.
      </Text>
      <Button type="button" variant="primary" className="mt-6" onClick={() => openSignIn()}>
        Sign in
      </Button>
    </main>
  );
}
