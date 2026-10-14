import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { firebaseConfig, firebaseConfigured } from '../config';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

/** The Firebase Auth instance, or null when Firebase is not configured (dev mode). */
export function getFirebaseAuth(): Auth | null {
  if (!firebaseConfigured) return null;
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    // Analytics is best-effort and must never break the app.
    void isSupported()
      .then((ok) => {
        if (ok && app) getAnalytics(app);
      })
      .catch(() => {});
  }
  return auth;
}

export const googleProvider = new GoogleAuthProvider();
