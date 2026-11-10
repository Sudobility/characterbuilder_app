/**
 * Language-aware navigation: a thin wrapper over the shared
 * `useLocalizedNavigate` from `@sudobility/components`, pre-wired with this app's
 * supported-language check, default language and storage key. Use this instead
 * of react-router's `useNavigate` so every `navigate('/x')` keeps the current
 * `/:lang` prefix (and `switchLanguage` changes it).
 */
import { useLocalizedNavigate as useSharedLocalizedNavigate } from '@sudobility/components';
import {
  isLanguageSupported,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  type SupportedLanguage,
} from '../config/languages';

export function useLocalizedNavigate() {
  const result = useSharedLocalizedNavigate({
    isLanguageSupported,
    defaultLanguage: DEFAULT_LANGUAGE,
    storageKey: LANGUAGE_STORAGE_KEY,
  });
  return {
    navigate: result.navigate,
    switchLanguage: result.switchLanguage as (
      newLanguage: SupportedLanguage,
      currentPath?: string
    ) => void,
    currentLanguage: result.currentLanguage as SupportedLanguage,
  };
}
