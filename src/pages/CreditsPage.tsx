import {
  useBalance,
  useCreditProducts,
} from '@sudobility/characterbuilder_client';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Heading,
  Spinner,
  Text,
} from '../ui';

const REVENUECAT_KEY = import.meta.env.VITE_REVENUECAT_API_KEY as
  | string
  | undefined;

export function CreditsPage() {
  const { data: balance } = useBalance();
  const { data: products, isLoading } = useCreditProducts();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Heading level={1} size="2xl">
          Credits
        </Heading>
        <Badge variant="primary">
          {balance ? `${balance.balance} available` : '…'}
        </Badge>
      </div>

      <Text as="p" className="text-theme-text-secondary">
        Each generated image costs 1 credit.
      </Text>

      {isLoading ? (
        <Spinner size="large" />
      ) : !products || products.length === 0 ? (
        <Card>
          <CardContent>
            <Text as="p" className="text-theme-text-secondary">
              No credit packs are configured yet (CREDIT_PRODUCTS on the server).
            </Text>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {products.map((p) => (
            <Card key={p.productId}>
              <CardHeader>
                <Heading level={3} size="lg">
                  {p.credits} credits
                </Heading>
              </CardHeader>
              <CardContent>
                <Button
                  variant="primary"
                  disabled={!REVENUECAT_KEY}
                  title={
                    REVENUECAT_KEY
                      ? undefined
                      : 'Set VITE_REVENUECAT_API_KEY to enable purchases'
                  }
                >
                  {REVENUECAT_KEY ? 'Buy' : 'Purchases not configured'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
