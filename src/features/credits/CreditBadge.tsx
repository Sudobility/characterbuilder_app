/**
 * The credit balance as an inline badge, linking to the credits section.
 * Its own subscriber of `useBalance` so reading it does not re-render the
 * surrounding chrome.
 */
import { LocalizedLink as Link } from '../../components/layout/LocalizedLink';
import { useBalance } from '@sudobility/consumables_client';
import { CreditBalanceBadge } from '@sudobility/consumables_pages';

export function CreditBadge() {
  const { balance } = useBalance();

  // Nothing rather than a placeholder: a badge showing "0" before the balance
  // arrives reads as "out of credits", which is false. Signed out, there is no
  // balance to show at all.
  if (balance === null) return null;

  return (
    <Link
      to="/dashboard/credits"
      aria-label={`${balance} credits remaining`}
      className="inline-flex items-center"
    >
      <CreditBalanceBadge balance={balance} isLoading={false} />
    </Link>
  );
}
