import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AUTH_TEST_MODE, firebaseConfigured } from '../config';
import { useAuth } from '../auth/AuthContext';
import { Button, Card, CardContent, CardHeader, Heading, Input, Text } from '../ui';

export function LoginPage() {
  const { user, signInGoogle, signInDev } = useAuth();
  const [email, setEmail] = useState('dev@local.test');
  const [error, setError] = useState<string | null>(null);

  if (user) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-theme-bg-primary px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Heading level={1} size="2xl">
            CharacterBuilder
          </Heading>
          <Text as="p" size="sm" className="text-theme-text-secondary">
            Design a face from structured features and generate casting images.
          </Text>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {firebaseConfigured && (
              <Button
                variant="primary"
                onClick={() => {
                  setError(null);
                  signInGoogle().catch((e) => setError(String(e)));
                }}
              >
                Continue with Google
              </Button>
            )}
            {AUTH_TEST_MODE && (
              <div className="flex flex-col gap-2 rounded-lg border border-theme-border-primary p-3">
                <Text as="span" size="sm" className="text-theme-text-secondary">
                  Dev sign-in (AUTH_TEST_MODE)
                </Text>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
                <Button variant="secondary" onClick={() => signInDev(email)}>
                  Sign in as dev user
                </Button>
              </div>
            )}
            {!firebaseConfigured && !AUTH_TEST_MODE && (
              <Text as="p" size="sm" className="text-theme-text-secondary">
                Set VITE_FIREBASE_* to enable Google sign-in, or VITE_AUTH_TEST_MODE=1
                for a dev login.
              </Text>
            )}
            {error && (
              <Text as="p" size="sm" className="text-red-500">
                {error}
              </Text>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
