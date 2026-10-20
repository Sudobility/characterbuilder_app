import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

/**
 * Bridges `building_blocks`' `href`-based link contract (topbar, footer) to
 * react-router's `to`-based `<Link>`. Without it the chrome renders plain
 * anchors and every nav/footer link does a full page reload instead of a
 * client-side navigation. (screenwriter_app/music_app `LinkWrapper` pattern.)
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
    <Link to={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
