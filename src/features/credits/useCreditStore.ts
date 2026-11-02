/**
 * CharacterBuilder labels and navigation around the shared consumables store.
 * Mirror of music_app's useCreditStore, minus i18n — this app is single-locale,
 * so the copy is inline English (see CLAUDE.md).
 */
import {
  useBalance,
  useConsumableProducts,
  usePurchaseCredits,
  type CreditPackage,
} from '@sudobility/consumables_client';
import type { CreditStorePageProps } from '@sudobility/consumables_pages';
import { useAuth } from '../../auth/AuthContext';
import { useSignIn } from '../../auth/SignInContext';

export type UseCreditStoreOptions = { onPurchased?: () => void };

export function useCreditStore({
  onPurchased,
}: UseCreditStoreOptions = {}): CreditStorePageProps {
  const { openSignIn } = useSignIn();
  const { user } = useAuth();
  const balanceState = useBalance();
  // An empty offering id asks the shared client for every configured offering.
  const products = useConsumableProducts('');
  const purchaseState = usePurchaseCredits();

  return {
    isAuthenticated: user !== null,
    balance: balanceState.balance,
    packages: products.packages,
    isLoading: balanceState.isLoading || products.isLoading,
    isPurchasing: purchaseState.isPurchasing,
    error:
      purchaseState.error?.message ??
      balanceState.error?.message ??
      products.error?.message ??
      null,
    onPurchase: async (packageId: string) => {
      const selected = products.packages.find(
        (pkg: CreditPackage) => pkg.packageId === packageId
      );
      if (!selected?.offeringId) {
        throw new Error('This credit package is no longer available.');
      }
      const purchased = await purchaseState.purchase(
        selected.storePackageId ?? selected.packageId,
        selected.offeringId
      );
      if (purchased) onPurchased?.();
    },
    // Over the page that asked, never a trip to the sign-in route: signing in
    // leaves the reader on the store (or the paywall), now signed in.
    onLoginClick: () => openSignIn(),
    labels: {
      title: 'Credits',
      currentBalanceLabel: 'Current balance',
      creditsUnit: 'credits',
      purchaseButton: 'Buy',
      purchasingButton: 'Purchasing…',
      noProducts: 'No credit packs are available yet.',
      errorTitle: 'Something went wrong',
      loginRequired: 'Sign in to buy credits.',
      loginButton: 'Sign in',
    },
    formatters: {
      formatCredits: (count: number) => count.toLocaleString(),
    },
  };
}
