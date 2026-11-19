/**
 * Mounts the entity (workspace) context and keeps the selected entity in sync
 * with the network client's `X-Entity-Id` header + the consumables balance
 * cache. Mirrors music_app's AuthContext entity wiring. Mount inside
 * <ConsumablesBridge> (so the entity client is initialized) and <AuthProvider>.
 */
import { useEffect, type ReactNode } from 'react';
import {
  CurrentEntityProvider,
  useCurrentEntityOptional,
} from '@sudobility/entity_client';
import { refreshConsumablesBalance } from '@sudobility/consumables_client';
import { useAuth } from '../../auth/AuthContext';
import { getEntityClient, setActiveEntityId } from '../credits/consumables';

/** Bridges the entity_client selection to the module-level active entity id. */
function EntitySelectionBridge({ children }: { children: ReactNode }) {
  const ctx = useCurrentEntityOptional();
  const entityId = ctx?.currentEntityId ?? null;
  useEffect(() => {
    setActiveEntityId(entityId);
    if (entityId) {
      // The active workspace changed — the cached balance is the old entity's.
      void refreshConsumablesBalance().catch(() => {});
    }
    return () => setActiveEntityId(null);
  }, [entityId]);
  return <>{children}</>;
}

export function EntityBridge({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  // Entity context only exists for a signed-in user; the dashboard/entities UI
  // that consumes it is gated behind RequireSignIn.
  if (!user) return <>{children}</>;
  return (
    <CurrentEntityProvider
      client={getEntityClient()}
      user={{ uid: user.uid, email: user.email }}
    >
      <EntitySelectionBridge>{children}</EntitySelectionBridge>
    </CurrentEntityProvider>
  );
}
