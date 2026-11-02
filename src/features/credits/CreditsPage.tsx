/**
 * The credits section of the dashboard: what a credit is, the store, and the
 * money ledger — all built from `@sudobility/consumables_pages`.
 *
 * The sole credit system now: it replaced the former native CreditsPage that
 * read the app's own `characterbuilder_client` balance. See consumables.ts.
 */
import { Card, CardContent, Heading, Text } from '../../ui';
import { CreditStore } from './CreditStore';
import { CreditsHistory } from './CreditsHistory';

export function CreditsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Card>
        <CardContent>
          <div className="flex flex-col gap-1">
            <Heading level={2} size="lg">
              What is a credit?
            </Heading>
            <Text as="p" size="sm" className="text-theme-text-secondary">
              Credits pay for generations. Each generated image costs one
              credit; sheets cost one per rendered image.
            </Text>
          </div>
        </CardContent>
      </Card>

      <CreditStore />

      <CreditsHistory />
    </div>
  );
}
