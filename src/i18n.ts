import i18n, { type InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  isLanguageSupported,
} from './config/languages';

// All languages — English included — are served from `public/locales/<lng>/<ns>.json`
// and loaded on demand by the HTTP backend (the sudojo_app approach). English is the
// SOURCE of truth under `public/locales/en/`; every other language is generated from
// it by `bun run localize` (johnqh/workflows `localize_batch.cjs`). Keep NAMESPACES in
// sync with the files under `public/locales/en/`.
export const NAMESPACES = ['common', 'home'];

// Detect the initial language from the URL path first (so `/fr/...` loads French
// immediately), then the stored preference, then the browser — else English.
function detectInitialLanguage(): string {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const pathLang = window.location.pathname.split('/')[1]?.toLowerCase();
  if (pathLang && isLanguageSupported(pathLang)) return pathLang;
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && isLanguageSupported(stored)) return stored;
  } catch {
    // localStorage can throw in private mode — ignore.
  }
  return DEFAULT_LANGUAGE;
}

if (!i18n.isInitialized) {
  void i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      lng: detectInitialLanguage(),
      fallbackLng: {
        zh: ['zh', 'en'],
        'zh-hant': ['zh-hant', 'zh', 'en'],
        default: ['en'],
      },
      supportedLngs: [...SUPPORTED_LANGUAGES],
      ns: NAMESPACES,
      defaultNS: 'common',
      load: 'currentOnly',
      lowerCaseLng: true,
      nonExplicitSupportedLngs: false,
      debug: false,
      interpolation: { escapeValue: false },
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      detection: {
        order: ['path', 'localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: LANGUAGE_STORAGE_KEY,
        lookupFromPathIndex: 0,
      },
      // No Suspense: components render with the fallback (English) until a requested
      // namespace finishes loading, then re-render.
      react: { useSuspense: false },
    } as InitOptions);
}

export default i18n;
