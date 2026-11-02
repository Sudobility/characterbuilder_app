/**
 * Credit purchase + usage history, via the shared `CreditHistoryPage`. Distinct
 * from the app's native generation "Job history" — this is the money ledger.
 */
import { CreditHistoryPage } from '@sudobility/consumables_pages';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime()) ? dateStr : date.toLocaleDateString();
}

export function CreditsHistory({
  onPurchaseCredits,
}: { onPurchaseCredits?: () => void } = {}) {
  return (
    <CreditHistoryPage
      pageSize={25}
      onPurchaseCredits={onPurchaseCredits}
      purchaseButtonLabel="Buy credits"
      purchaseLabels={{
        title: 'Purchases',
        columnDate: 'Date',
        columnCredits: 'Credits',
        columnSource: 'Source',
        columnProduct: 'Package',
        columnAmount: 'Amount',
        noRecords: 'No purchases yet.',
        loadMore: 'Load more',
      }}
      purchaseFormatters={{
        formatDate,
        formatAmount: (cents, currency) =>
          new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency,
          }).format(cents / 100),
        formatSource: (source) =>
          (
            ({
              web: 'Web',
              apple: 'Apple',
              google: 'Google',
              free: 'Free',
            }) as Record<string, string>
          )[source] ?? source,
      }}
      usageLabels={{
        title: 'Usage',
        columnDate: 'Date',
        columnFilename: 'Generation',
        columnCredits: 'Credits',
        noRecords: 'No usage yet.',
        loadMore: 'Load more',
      }}
      usageFormatters={{ formatDate }}
      className="flex flex-col gap-6"
    />
  );
}
