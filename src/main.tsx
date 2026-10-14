import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DraftStoreProvider } from '@sudobility/characterbuilder_lib';
import { App } from './App';
import { AuthProvider } from './auth/AuthContext';
import { ClientBridge } from './ClientBridge';
import { installTheme } from './theme';
import './index.css';

installTheme();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ClientBridge>
          <DraftStoreProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </DraftStoreProvider>
        </ClientBridge>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
