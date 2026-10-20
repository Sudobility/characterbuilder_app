import type { AuthActionProps } from '@sudobility/building_blocks';
import { Avatar, Button, Dropdown } from '../../ui';
import { useAuth } from '../../auth/AuthContext';

/**
 * A `Dropdown` item. Note the component treats `separator: true` as a *bare
 * divider line* (label and onClick are ignored), so a divider is its own entry
 * — not a flag on a real item.
 */
interface DropdownMenuItem {
  id: string;
  label: string;
  onClick: () => void;
  separator?: boolean;
}

const divider = (id: string): DropdownMenuItem => ({
  id,
  label: '',
  onClick: () => {},
  separator: true,
});

/**
 * Fed to `building_blocks`' firebase topbar as its `AuthActionComponent` — the
 * library injects the auth UI as a prop so it stays provider-agnostic. This app
 * has its own `useAuth()` (not `@sudobility/auth-components`' Firebase provider),
 * so this adapter bridges the two: a "Log in" button when signed out, else the
 * top-right avatar + dropdown.
 *
 * The dropdown is **config-driven** (music_app pattern): the topbar passes its
 * `authenticatedMenuItems` down as `menuItems`, and this adapter only maps them
 * and appends sign-out — it does not hard-code the entries, so the menu is
 * edited in one place (`ScreenContainer`'s `topBar` config).
 */
export function AuthActionAdapter({
  onLoginClick,
  menuItems = [],
  avatarSize = 32,
  dropdownAlign = 'right',
}: AuthActionProps) {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <Button
        type="button"
        variant="primary"
        onClick={() => onLoginClick?.()}
        data-testid="log-in-button"
      >
        Log in
      </Button>
    );
  }

  const name = user.displayName ?? user.email ?? 'Account';

  // Each config item becomes a real entry; `dividerAfter` becomes its own
  // divider entry. A divider then sign-out close the menu.
  const items: DropdownMenuItem[] = [];
  for (const m of menuItems) {
    items.push({ id: m.id, label: m.label, onClick: m.onClick ?? (() => {}) });
    if (m.dividerAfter) items.push(divider(`${m.id}-divider`));
  }
  if (items.length > 0 && !items[items.length - 1].separator) {
    items.push(divider('sign-out-divider'));
  }
  items.push({ id: 'sign-out', label: 'Sign out', onClick: () => void signOut() });

  return (
    <Dropdown
      align={dropdownAlign}
      trigger={
        <span data-testid="account-menu">
          <Avatar name={name} size={avatarSizeToken(avatarSize)} />
        </span>
      }
      items={items}
    />
  );
}

/** The topbar passes a pixel avatar size; our `Avatar` takes a size token. */
function avatarSizeToken(px: number): 'sm' | 'md' | 'lg' {
  if (px <= 28) return 'sm';
  if (px >= 44) return 'lg';
  return 'md';
}
