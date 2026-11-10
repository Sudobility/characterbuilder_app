import { type ReactNode } from 'react';
import { LocalizedLink } from './LocalizedLink';

/**
 * Bridges `building_blocks`' `href`-based link contract (topbar, footer,
 * breadcrumbs) to a language-aware router link, so the chrome does client-side
 * navigation AND keeps the current `/:lang` prefix. (screenwriter_app/music_app
 * `LinkWrapper` pattern, made locale-aware.)
 */
export function LinkWrapper({
  href,
  className,
  children,
  onClick,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <LocalizedLink to={href} className={className} onClick={onClick}>
      {children}
    </LocalizedLink>
  );
}
