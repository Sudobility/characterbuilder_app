import { useMemo, type ReactNode } from 'react';
import {
  CharacterBuilderClient,
  CharacterBuilderClientProvider,
  createFetchNetworkClient,
} from '@sudobility/characterbuilder_client';
import { API_URL, CLIENT_TAG } from './config';
import { useAuth } from './auth/AuthContext';

/** Build one client bound to the current auth token and provide it to the hooks. */
export function ClientBridge({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();
  const client = useMemo(
    () =>
      new CharacterBuilderClient({
        network: createFetchNetworkClient(),
        baseUrl: API_URL,
        getToken,
        clientTag: CLIENT_TAG,
      }),
    [getToken]
  );
  return (
    <CharacterBuilderClientProvider client={client}>
      {children}
    </CharacterBuilderClientProvider>
  );
}
