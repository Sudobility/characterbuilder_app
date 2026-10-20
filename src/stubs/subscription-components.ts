// Stub for @sudobility/subscription-components — this app has no subscriptions.
// Aliased in vite.config.ts so building_blocks' optional import resolves.
import React from 'react';

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  React.createElement(React.Fragment, null, children);

export const useSubscriptionContext = () => ({
  subscription: null,
  loading: false,
  error: null,
});

export const useSubscription = () => ({
  subscription: null,
  loading: false,
  error: null,
});

export const PricingCard: React.FC = () => null;
export const SubscriptionStatus: React.FC = () => null;
export const SubscriptionLayout: React.FC = () => null;
export const SubscriptionTile: React.FC = () => null;
export const SegmentedControl: React.FC = () => null;
