// Stub for @sudobility/devops-components — not used by this app.
// Aliased in vite.config.ts so building_blocks' optional import resolves.
import React from 'react';

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  React.createElement(React.Fragment, null, children);

export const SystemStatusIndicator: React.FC = () => null;
