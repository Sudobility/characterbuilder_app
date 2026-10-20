/** Environment-driven config. All public values come from Vite `VITE_*` vars. */

export const API_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:8039'
).replace(/\/+$/, '');

/** Brand / site identity. Used by the public website chrome (topbar, footer, text pages). */
export const APP_NAME: string =
  (import.meta.env.VITE_APP_NAME as string | undefined) || 'CharacterBuilder';
export const APP_DOMAIN: string =
  (import.meta.env.VITE_APP_DOMAIN as string | undefined) || 'characterbuilder.app';
export const COMPANY_NAME: string =
  (import.meta.env.VITE_COMPANY_NAME as string | undefined) || 'Sudobility Inc.';
export const SUPPORT_EMAIL: string = `support@${APP_DOMAIN}`;
export const COPYRIGHT_YEAR = '2025-2026';

export const AUTH_TEST_MODE = import.meta.env.VITE_AUTH_TEST_MODE === '1';

export const APP_VERSION = (import.meta.env.VITE_APP_VERSION as string | undefined) ?? '0.1.0';

export const CLIENT_TAG = `web/${APP_VERSION}`;

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
