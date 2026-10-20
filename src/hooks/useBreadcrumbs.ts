import { useMemo, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import type { BreadcrumbItem } from '@sudobility/building_blocks';
import { BreadcrumbBuilder } from '../utils/BreadcrumbBuilder';

/**
 * The breadcrumb trail for the current route, rebuilt on navigation and when a
 * dynamic title changes (e.g. the editor naming `/characters/:id`). Home is
 * dropped so the bar hides on the landing page.
 */
export function useBreadcrumbs(): BreadcrumbItem[] {
  const location = useLocation();
  const builder = BreadcrumbBuilder.getInstance();

  const version = useSyncExternalStore(
    (cb) => builder.subscribe(cb),
    () => builder.getVersion(),
    () => builder.getVersion()
  );

  return useMemo(
    () => builder.itemsFor(location.pathname),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [builder, location.pathname, version]
  );
}
