/** Environment-driven config. All public values come from Vite `VITE_*` vars. */

export const API_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:8039'
).replace(/\/+$/, '');

export const AUTH_TEST_MODE = import.meta.env.VITE_AUTH_TEST_MODE === '1';

export const CLIENT_TAG = `web/${import.meta.env.VITE_APP_VERSION ?? '0.1.0'}`;

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? '',
};

export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);
