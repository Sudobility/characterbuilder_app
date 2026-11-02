/**
 * What a user sees when a job is refused for want of credits. Presentation is
 * `CreditPaywallDialog` from `@sudobility/consumables_pages`; this file supplies
 * the copy, the payment data (shared `useCreditStore`) and the open/close
 * wiring (a tiny store), so a refusal anywhere in the tree can raise it.
 *
 * TODO(product): call `usePaywall()` from the generation flow when the API
 * refuses a job for want of credits (402), instead of surfacing a raw error.
 */
import { create } from 'zustand';
import { CreditPaywallDialog } from '@sudobility/consumables_pages';
import { useCreditStore } from './useCreditStore';

interface PaywallState {
  open: boolean;
  show: () => void;
  hide: () => void;
}

const usePaywallStore = create<PaywallState>((set) => ({
  open: false,
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
}));

/** Opens the paywall from anywhere (e.g. on a 402 from the generation API). */
export function usePaywall(): () => void {
  return usePaywallStore((s) => s.show);
}

/** Mounted once, above the routes. */
export function PaywallDialog() {
  const open = usePaywallStore((s) => s.open);
  const hide = usePaywallStore((s) => s.hide);
  const storeProps = useCreditStore({ onPurchased: hide });

  return (
    <CreditPaywallDialog
      {...storeProps}
      isOpen={open}
      onClose={hide}
      labels={{
        ...storeProps.labels,
        paywallTitle: 'Out of credits',
        paywallMessage: 'Top up to keep generating.',
        closeLabel: 'Close',
      }}
    />
  );
}
