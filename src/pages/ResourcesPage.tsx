/**
 * Public "Resources" page — now an API-driven tile list.
 *
 * The directory used to be a static `GROUPS` array compiled into the app. It is
 * now served per (app, locale) from the shared Sudobility resources catalog
 * (central `sudobility_api`, reached through characterbuilder_api's public
 * `/api/v1/resources` forwarder) and rendered by the reusable
 * `@sudobility/resources_pages` tile grid — the same component every Sudobility
 * app uses. Curation moved out of the codebase into the admin MCP/skill.
 *
 * The page keeps its Section/Heading shell; the shared component's own title is
 * suppressed with `title: ''`.
 */
import { useMemo } from 'react';
import { Heading, Section, Text } from '@sudobility/components';
import { ResourcesPageConnected } from '@sudobility/resources_pages';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import { initResourcesService } from '../features/resources/resources';

export function ResourcesPage() {
  const { currentLanguage } = useLocalizedNavigate();
  // Idempotent; runs during render so the connected component's hook finds the
  // initialized singleton on its first effect.
  useMemo(() => initResourcesService(), []);

  return (
    <Section spacing="3xl">
      <div className="flex flex-col gap-3">
        <Heading level={1} size="3xl" weight="bold">
          Resources
        </Heading>
        <Text as="p" size="lg" color="muted" className="max-w-2xl">
          A directory of tools for AI filmmaking, from script to screen. Links
          open in a new tab.
        </Text>
      </div>
      <div className="mt-8">
        <ResourcesPageConnected
          locale={currentLanguage}
          labels={{
            title: '',
            empty: 'No resources available yet.',
            errorTitle: 'Couldn’t load resources',
          }}
        />
      </div>
    </Section>
  );
}
