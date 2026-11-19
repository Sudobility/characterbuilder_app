/**
 * Dashboard entity (workspace) surfaces, built from `@sudobility/entity_pages`
 * driven by the current-entity context. `WorkspacesSection` (gated by
 * SHOW_ENTITIES) lets a user list/create/switch organizations and manage
 * members + invitations; `ApiKeysSection` manages the active entity's API keys
 * (shown regardless — defaults to the personal entity). Mirrors music_app.
 */
import {
  ApiKeysPage,
  EntityListPage,
  InvitationsPage,
  MembersManagementPage,
} from '@sudobility/entity_pages';
import { useCurrentEntity } from '@sudobility/entity_client';
import { Heading, Text } from '../../ui';
import { useAuth } from '../../auth/AuthContext';
import { getEntityClient } from '../credits/consumables';

export function WorkspacesSection() {
  const client = getEntityClient();
  const { currentEntity, selectEntity } = useCurrentEntity();
  const { user } = useAuth();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Heading level={1} size="2xl">
          Workspaces
        </Heading>
        <Text as="p" size="sm" className="text-theme-text-secondary">
          Your personal workspace and any organizations you belong to. Credits
          are owned per workspace.
        </Text>
      </div>
      <EntityListPage
        client={client}
        onSelectEntity={(e) => selectEntity(e.entitySlug)}
      />
      {currentEntity && user && (
        <>
          <MembersManagementPage
            client={client}
            entity={currentEntity}
            currentUserId={user.uid}
          />
          <InvitationsPage client={client} />
        </>
      )}
    </div>
  );
}

export function ApiKeysSection() {
  const client = getEntityClient();
  const { currentEntity } = useCurrentEntity();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Heading level={1} size="2xl">
          API keys
        </Heading>
        <Text as="p" size="sm" className="text-theme-text-secondary">
          Programmatic access scoped to the active workspace.
        </Text>
      </div>
      {currentEntity ? (
        <ApiKeysPage client={client} entity={currentEntity} />
      ) : (
        <Text as="p" size="sm" className="text-theme-text-secondary">
          Loading workspace…
        </Text>
      )}
    </div>
  );
}
