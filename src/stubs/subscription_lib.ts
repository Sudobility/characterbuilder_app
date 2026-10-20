// Stub for @sudobility/subscription_lib — this app has no subscriptions.
// Aliased in vite.config.ts so building_blocks' optional import resolves.
export const setRevenueCatUser = async () => {};
export const clearRevenueCatUser = async () => {};
export const refreshSubscription = async () => {};

export const useSubscriptionService = () => ({ subscription: null, loading: false, error: null });
export const useSubscriptionPeriods = () => ({ periods: [], loading: false, error: null });
export const useSubscriptionForPeriod = () => ({ subscription: null, loading: false, error: null });
export const useSubscribable = () => ({ subscribable: null, loading: false, error: null });
export const useUserSubscription = () => ({ subscription: null, loading: false, error: null });

export const SubscriptionService = class {
  async getSubscription() {
    return null;
  }
  async subscribe() {
    return null;
  }
  async unsubscribe() {
    return null;
  }
};
