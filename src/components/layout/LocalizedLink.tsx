/**
 * A `<Link>` that automatically prefixes `to` with the current `/:lang`. Thin
 * wrapper over the shared `LocalizedLink`, pre-wired with this app's
 * supported-language check. Use it (or `LinkWrapper`) instead of react-router's
 * `Link` for any in-app navigation.
 */
import { LocalizedLink as SharedLocalizedLink } from '@sudobility/components';
import type { LocalizedLinkProps as SharedLocalizedLinkProps } from '@sudobility/components';
import { isLanguageSupported, DEFAULT_LANGUAGE } from '../../config/languages';

type LocalizedLinkProps = Omit<
  SharedLocalizedLinkProps,
  'isLanguageSupported' | 'defaultLanguage'
>;

export function LocalizedLink(props: LocalizedLinkProps) {
  return (
    <SharedLocalizedLink
      {...props}
      isLanguageSupported={isLanguageSupported}
      defaultLanguage={DEFAULT_LANGUAGE}
    />
  );
}
