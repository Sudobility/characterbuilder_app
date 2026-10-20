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
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth';
import { AUTH_TEST_MODE, firebaseConfigured } from '../config';
import { getFirebaseAuth, googleProvider } from './firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  /** Google sign-in is offered — Firebase is configured. */
  hasGoogle: boolean;
  /** Email/password sign-in, sign-up and reset are offered — Firebase is configured. */
  hasEmailPassword: boolean;
  /** The dev email-only bypass is offered — `VITE_AUTH_TEST_MODE=1`. */
  hasDevAuth: boolean;
  signInGoogle(): Promise<void>;
  signInEmail(email: string, password: string): Promise<void>;
  signUpEmail(email: string, password: string): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
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
      // A real Firebase sign-in wins; with none, fall back to the dev user if
      // one is set. This is why `VITE_AUTH_TEST_MODE=1` keeps a working dev
      // login *even when Firebase is also configured* — without this fallback
      // the dev bypass would be inert whenever Firebase is set up.
      setUser(
        u ? { uid: u.uid, email: u.email, displayName: u.displayName } : devUser
      );
      setLoading(false);
    });
  }, [devUser]);

  const signInGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase is not configured');
    await signInWithPopup(auth, googleProvider);
  }, []);

  const signInEmail = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase is not configured');
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUpEmail = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase is not configured');
    await createUserWithEmailAndPassword(auth, email, password);
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase is not configured');
    await sendPasswordResetEmail(auth, email);
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
    () => ({
      user,
      loading,
      hasGoogle: firebaseConfigured,
      hasEmailPassword: firebaseConfigured,
      hasDevAuth: AUTH_TEST_MODE,
      signInGoogle,
      signInEmail,
      signUpEmail,
      sendPasswordReset,
      signInDev,
      signOut,
      getToken,
    }),
    [
      user,
      loading,
      signInGoogle,
      signInEmail,
      signUpEmail,
      sendPasswordReset,
      signInDev,
      signOut,
      getToken,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth: wrap the tree in <AuthProvider>');
  return c;
}
