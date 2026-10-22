// The design kit ships a searchable `Combobox` at runtime, but its type is not
// re-exported from the package barrel. Augment the module so we can import it
// type-safely. (Shape mirrors dist/ui/combobox.d.ts.)
import type { FC } from 'react';

declare module '@sudobility/components' {
  export interface ComboboxOption {
    value: string;
    label: string;
    disabled?: boolean;
  }
  export interface ComboboxProps {
    options: ComboboxOption[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    disabled?: boolean;
    className?: string;
  }
  export const Combobox: FC<ComboboxProps>;
}
