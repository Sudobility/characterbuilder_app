import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DraftStoreProvider } from '@sudobility/characterbuilder_lib';
import { SEOHead, SEOHeadProvider } from '@sudobility/seo_lib';
import { App } from './App';
import { AuthProvider } from './auth/AuthContext';
import { SignInProvider } from './auth/SignInContext';
import { ClientBridge } from './ClientBridge';
import { ErrorBoundary } from './components/shell/ErrorBoundary';
import { seoHeadConfig } from './seoHead';
import { installTheme } from './theme';
import './i18n';
import './index.css';

installTheme();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {/* The one sign-in modal, opened over whatever page needs an account (RequireSignIn). */}
          <SignInProvider>
            <ClientBridge>
              <DraftStoreProvider>
                <BrowserRouter>
                  <SEOHeadProvider config={seoHeadConfig}>
                    <SEOHead title={seoHeadConfig.appName} description={seoHeadConfig.appName} />
                    <App />
                  </SEOHeadProvider>
                </BrowserRouter>
              </DraftStoreProvider>
            </ClientBridge>
          </SignInProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
