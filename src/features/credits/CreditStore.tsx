/**
 * The credit store, driven entirely by the shared `CreditStorePage` from
 * `@sudobility/consumables_pages`. Data, copy and callbacks come from
 * `useCreditStore`, shared with the paywall so the two cannot drift.
 */
import { CreditStorePage } from '@sudobility/consumables_pages';
import { useCreditStore } from './useCreditStore';

export function CreditStore() {
  return <CreditStorePage {...useCreditStore()} />;
}
