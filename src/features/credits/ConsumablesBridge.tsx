import { useEffect, useRef, type ReactNode } from 'react';
import { setConsumablesUserId } from '@sudobility/consumables_client';
import { useAuth } from '../../auth/AuthContext';
import { initConsumables } from './consumables';

/**
 * Initializes the shared consumables stack once and keeps its cached balance
 * following the signed-in user (mirrors music_app's AuthContext wiring).
 * Mount inside <AuthProvider>.
 */
export function ConsumablesBridge({ children }: { children: ReactNode }) {
  const { getToken, user } = useAuth();
  const started = useRef(false);
  if (!started.current) {
    initConsumables(getToken);
    started.current = true;
  }

  useEffect(() => {
    // Fire-and-forget, but never unhandled: credits failing to follow a
    // sign-in must not break signing in.
    setConsumablesUserId(user?.uid, user?.email ?? undefined).catch(
      (err: unknown) => {
        console.error('[credits] could not follow the signed-in user', err);
      }
    );
  }, [user?.uid, user?.email]);

  return <>{children}</>;
}
