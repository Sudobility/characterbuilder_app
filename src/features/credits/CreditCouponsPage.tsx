/**
 * Coupon redemption, built from the shared `@sudobility/consumables_pages`
 * `RedeemCreditCouponPage`. The redeem request is owned by the consumables
 * client and hits `/api/v1/consumables/redeem-coupon`, which credits the user's
 * entity (resolved server-side). CharacterBuilder has no team UI, so the entity
 * is simply "your account".
 */
import { refreshConsumablesBalance } from '@sudobility/consumables_client';
import { RedeemCreditCouponPage } from '@sudobility/consumables_pages';
import { getConsumablesApiClient } from './consumables';

export function CreditCouponsPage() {
  return (
    <RedeemCreditCouponPage
      client={getConsumablesApiClient()}
      entityName="your account"
      onRedeemed={() => refreshConsumablesBalance()}
    />
  );
}
