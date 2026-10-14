import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useBalance } from '@sudobility/characterbuilder_client';
import { useAuth } from '../auth/AuthContext';
import { Badge, Button, Spinner, Text } from '../ui';

function CreditPill() {
  const { data } = useBalance();
  return (
    <Link to="/credits">
      <Badge variant="primary">{data ? `${data.balance} credits` : '…'}</Badge>
    </Link>
  );
}

/** App chrome + auth gate. Signed out → redirect to /login (preserving intent). */
export function Shell() {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="min-h-screen bg-theme-bg-primary text-theme-text-primary">
      <header className="flex items-center justify-between border-b border-theme-border-primary px-4 py-3">
        <nav className="flex items-center gap-4">
          <Link to="/" className="font-semibold">
            CharacterBuilder
          </Link>
          <Link to="/" className="text-sm text-theme-text-secondary">
            Characters
          </Link>
          <Link to="/gallery" className="text-sm text-theme-text-secondary">
            Gallery
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <CreditPill />
          <Text as="span" size="sm" className="text-theme-text-secondary">
            {user.email ?? user.displayName ?? 'Account'}
          </Text>
          <Button variant="outline" size="sm" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
