import { Navigate, useParams } from 'react-router-dom';
import { DEFAULT_LANGUAGE } from '../../config/languages';

/**
 * A `<Navigate>` that keeps the current `/:lang` prefix — used for the in-app
 * route redirects (e.g. `/dashboard` → `/<lang>/dashboard/characters`). The
 * `to` is an app path WITHOUT a language prefix; the current `lang` route param
 * is prepended.
 */
export function LocalizedNavigate({ to, replace }: { to: string; replace?: boolean }) {
  const { lang } = useParams();
  const prefix = lang ?? DEFAULT_LANGUAGE;
  const path = to.startsWith('/') ? to : `/${to}`;
  return <Navigate to={`/${prefix}${path === '/' ? '' : path}`} replace={replace} />;
}
