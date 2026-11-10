/**
 * Resources catalog configuration (public, read-only).
 *
 * The catalog is served per (app, locale) from the shared Sudobility catalog,
 * reached through characterbuilder_api's public `/api/v1/resources` forwarder,
 * and rendered by `@sudobility/resources_pages`. It needs no auth, so it uses a
 * plain fetch network client. Idempotent.
 */
import { initializeResources, ResourcesApiClient } from '@sudobility/resources_client';
import { FetchNetworkClient } from '../credits/consumables';
import { API_URL } from '../../config';

let initialized = false;

export function initResourcesService(): void {
  if (initialized) return;
  initializeResources({
    apiClient: new ResourcesApiClient({
      // baseUrl carries /api/v1; resources_client appends `/resources`.
      baseUrl: `${API_URL}/api/v1`,
      networkClient: new FetchNetworkClient(),
    }),
  });
  initialized = true;
}
