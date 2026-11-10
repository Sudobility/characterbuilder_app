/**
 * Language configuration for the app's i18n.
 *
 * The 15 supported languages match the other sudobility apps (sudojo_app et al.)
 * and building_blocks' `DEFAULT_LANGUAGES` (code + native name + flag), which the
 * topbar's built-in language selector renders. Keep `SUPPORTED_LANGUAGES` in sync
 * with the translation directories under `public/locales/` and `src/locales/en/`.
 */
import { DEFAULT_LANGUAGES } from '@sudobility/building_blocks';

/** Supported language codes, in display order (matches `DEFAULT_LANGUAGES`). */
export const SUPPORTED_LANGUAGES = [
  'en',
  'de',
  'es',
  'fr',
  'it',
  'ja',
  'ko',
  'pt',
  'ru',
  'sv',
  'th',
  'uk',
  'vi',
  'zh',
  'zh-hant',
] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

/** localStorage key for the persisted language preference. */
export const LANGUAGE_STORAGE_KEY = 'characterbuilder.language';

/** The {code, name, flag} list for the topbar/sitemap selectors. */
export const LANGUAGE_CONFIGS = DEFAULT_LANGUAGES;

/** Each language's name in itself (e.g. `Deutsch`, `日本語`). */
export const LANGUAGE_NAMES = Object.fromEntries(
  DEFAULT_LANGUAGES.map((l) => [l.code, l.name])
) as Record<string, string>;

/** Type guard: is `lang` one of the supported codes? */
export function isLanguageSupported(lang: string): lang is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lang);
}
