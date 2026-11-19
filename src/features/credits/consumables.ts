/**
 * Shared consumable-credits stack for CharacterBuilder.
 *
 * Mirrors music_app/src/config/initialize.ts: a `ConsumablesApiClient` backed by
 * an authenticated `NetworkClient`, plus `initializeConsumables` with the
 * RevenueCat web adapter (or a stubbed "unconfigured" adapter when no key is
 * set, so a fresh clone does not report a handled failure as a broken one).
 *
 * The balance itself comes from the API, not RevenueCat; only purchasing needs
 * the key.
 *
 * This is the sole credit system: it replaced CharacterBuilder's former native
 * stack (`@sudobility/characterbuilder_client`'s credit hooks), and
 * characterbuilder_api now serves the shared `/api/v1/consumables/*` routes
 * (balance, offerings, purchases, usages, purchase). To enable *purchasing*,
 * set `VITE_REVENUECAT_API_KEY_WEB` and configure the RevenueCat offering whose
 * packages match the server's `CREDIT_PRODUCTS`; reading the balance and the
 * ledger needs no key.
 */
import {
  ConsumablesApiClient,
  initializeConsumables,
  isConsumablesInitialized,
  type ConsumablesAdapter,
} from '@sudobility/consumables_client';
import { EntityClient } from '@sudobility/entity_client';
import {
  configureConsumablesWebAdapter,
  createConsumablesWebAdapter,
} from '@sudobility/consumables_pages';
import type {
  NetworkClient,
  NetworkRequestOptions,
  NetworkResponse,
} from '@sudobility/types';
import { API_URL } from '../../config';

/** RevenueCat web billing key. TODO(product): set in the environment to enable purchasing. */
const REVENUECAT_WEB_KEY = import.meta.env.VITE_REVENUECAT_API_KEY_WEB as
  | string
  | undefined;

/** Plain `fetch`-based `NetworkClient` (adds no auth of its own). */
export class FetchNetworkClient implements NetworkClient {
  async request<T = unknown>(
    url: string,
    options?: NetworkRequestOptions | null
  ): Promise<NetworkResponse<T>> {
    const response = await fetch(url, {
      method: options?.method ?? 'GET',
      headers: options?.headers ?? undefined,
      body: (options?.body as BodyInit | undefined) ?? undefined,
      signal: options?.signal ?? undefined,
    });
    let data: T | undefined;
    try {
      data = (await response.json()) as T;
    } catch {
      data = undefined;
    }
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers,
      data,
      success: response.ok,
    } as NetworkResponse<T>;
  }

  get<T = unknown>(
    url: string,
    options?: Omit<NetworkRequestOptions, 'method' | 'body'> | null
  ) {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  post<T = unknown>(
    url: string,
    body?: unknown,
    options?: Omit<NetworkRequestOptions, 'method'> | null
  ) {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put<T = unknown>(
    url: string,
    body?: unknown,
    options?: Omit<NetworkRequestOptions, 'method'> | null
  ) {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete<T = unknown>(
    url: string,
    options?: Omit<NetworkRequestOptions, 'method' | 'body'> | null
  ) {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }
}

/**
 * A `NetworkClient` that attaches the current bearer token to every request.
 * `ConsumablesApiClient` has no token of its own and expects its client to be
 * authenticated already. The token is read per request, never captured.
 */
class AuthenticatedNetworkClient implements NetworkClient {
  constructor(
    private readonly inner: NetworkClient,
    private readonly getToken: () => Promise<string | null>
  ) {}

  private async withAuth(
    options?: NetworkRequestOptions | null
  ): Promise<NetworkRequestOptions> {
    const token = await this.getToken();
    // X-Entity-Id selects the active workspace server-side; absent it, the API
    // falls back to the user's personal entity.
    const entityId = getActiveEntityId();
    return {
      ...options,
      headers: {
        ...(options?.headers ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(entityId ? { 'X-Entity-Id': entityId } : {}),
      },
    };
  }

  async request<T = unknown>(
    url: string,
    options?: NetworkRequestOptions | null
  ) {
    return this.inner.request<T>(url, await this.withAuth(options));
  }

  async get<T = unknown>(
    url: string,
    options?: Omit<NetworkRequestOptions, 'method' | 'body'> | null
  ) {
    return this.inner.get<T>(url, await this.withAuth(options));
  }

  async post<T = unknown>(
    url: string,
    body?: unknown,
    options?: Omit<NetworkRequestOptions, 'method'> | null
  ) {
    return this.inner.post<T>(url, body, await this.withAuth(options));
  }

  async put<T = unknown>(
    url: string,
    body?: unknown,
    options?: Omit<NetworkRequestOptions, 'method'> | null
  ) {
    return this.inner.put<T>(url, body, await this.withAuth(options));
  }

  async delete<T = unknown>(
    url: string,
    options?: Omit<NetworkRequestOptions, 'method' | 'body'> | null
  ) {
    return this.inner.delete<T>(url, await this.withAuth(options));
  }
}

/**
 * Empty-state purchasing: with no RevenueCat key there is nothing to sell, so
 * `getOfferings` returns an empty set (the store renders its empty state) and
 * `purchase` throws rather than silently resolving.
 */
function unconfiguredPurchasing(): ConsumablesAdapter {
  return {
    getOfferings: async () => ({ all: {} }),
    purchase: async () => {
      throw new Error('Purchasing is not configured in this build.');
    },
  };
}

let apiClient: ConsumablesApiClient | null = null;
let entityClient: EntityClient | null = null;

/**
 * The currently-selected entity (workspace). Injected as `X-Entity-Id` on every
 * authenticated request; null falls back to the personal entity server-side.
 * Kept in a module var (not React state) so the network client can read it per
 * request. `EntitySelectionBridge` keeps it in sync with the entity_client
 * context.
 */
let activeEntityId: string | null = null;
export function setActiveEntityId(id: string | null): void {
  activeEntityId = id;
}
export function getActiveEntityId(): string | null {
  return activeEntityId;
}

/** The shared API client, available to coupon UIs. Call after initialization. */
export function getConsumablesApiClient(): ConsumablesApiClient {
  if (!apiClient) {
    throw new Error('Consumables not initialized — mount <ConsumablesBridge>.');
  }
  return apiClient;
}

/** The shared entity (workspace) client. Call after initialization. */
export function getEntityClient(): EntityClient {
  if (!entityClient) {
    throw new Error('Entities not initialized — mount <ConsumablesBridge>.');
  }
  return entityClient;
}

/** Initialize the consumables + entity singletons once, bound to the auth token. */
export function initConsumables(getToken: () => Promise<string | null>): void {
  if (isConsumablesInitialized()) return;
  const networkClient = new AuthenticatedNetworkClient(
    new FetchNetworkClient(),
    getToken
  );
  apiClient = new ConsumablesApiClient({ baseUrl: API_URL, networkClient });
  // Routes are served under /api/v1; the consumables client prefixes its own
  // paths, the entity client is given the full base.
  entityClient = new EntityClient({ baseUrl: `${API_URL}/api/v1`, networkClient });
  if (REVENUECAT_WEB_KEY) configureConsumablesWebAdapter(REVENUECAT_WEB_KEY);
  initializeConsumables({
    adapter: REVENUECAT_WEB_KEY
      ? createConsumablesWebAdapter()
      : unconfiguredPurchasing(),
    apiClient,
  });
}
