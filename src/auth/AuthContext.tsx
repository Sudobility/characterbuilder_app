import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth';
import { AUTH_TEST_MODE } from '../config';
import { getFirebaseAuth, googleProvider } from './firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signInGoogle(): Promise<void>;
  signInDev(email: string): void;
  signOut(): Promise<void>;
  /** Bearer token for the API: a Firebase ID token, or a `dev:uid:email` token. */
  getToken(forceRefresh?: boolean): Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const DEV_KEY = 'characterbuilder.devUser';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [devUser, setDevUser] = useState<AuthUser | null>(() => {
    if (!AUTH_TEST_MODE || typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(DEV_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      // Dev mode (no Firebase): the dev user, if any, is the session.
      setUser(devUser);
      setLoading(false);
      return;
    }
    return onAuthStateChanged(auth, (u: User | null) => {
      setUser(
        u ? { uid: u.uid, email: u.email, displayName: u.displayName } : null
      );
      setLoading(false);
    });
  }, [devUser]);

  const signInGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase is not configured');
    await signInWithPopup(auth, googleProvider);
  }, []);

  const signInDev = useCallback((email: string) => {
    const u: AuthUser = {
      uid: `dev_${email.replace(/[^a-z0-9]/gi, '').slice(0, 24) || 'user'}`,
      email,
      displayName: email.split('@')[0] ?? 'Dev',
    };
    try {
      localStorage.setItem(DEV_KEY, JSON.stringify(u));
    } catch {
      /* ignore */
    }
    setDevUser(u);
  }, []);

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (auth) await fbSignOut(auth);
    try {
      localStorage.removeItem(DEV_KEY);
    } catch {
      /* ignore */
    }
    setDevUser(null);
    setUser(null);
  }, []);

  const getToken = useCallback(
    async (forceRefresh?: boolean): Promise<string | null> => {
      const auth = getFirebaseAuth();
      if (auth?.currentUser) return auth.currentUser.getIdToken(forceRefresh);
      if (devUser) return `dev:${devUser.uid}:${devUser.email ?? 'dev@local'}`;
      return null;
    },
    [devUser]
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, signInGoogle, signInDev, signOut, getToken }),
    [user, loading, signInGoogle, signInDev, signOut, getToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth: wrap the tree in <AuthProvider>');
  return c;
}
