import { configureTheme } from '@sudobility/design';
import {
  generateThemeCSS,
  radiographTheme,
  type ThemeDefinition,
} from '@sudobility/design/themes';

const activeTheme = radiographTheme;

/**
 * Activate the design-system theme: register the JS class overrides and inject the
 * semantic-token CSS custom properties (`theme-bg-*`, `theme-text-*`, …) that every
 * `@sudobility/components` widget resolves against. Same pattern as screenwriter_app.
 *
 * It also toggles the `dark` class on `<html>` when the active theme's base is
 * dark (RadioGraph is a dark-only theme). The design-system tokens already carry
 * the right colours via the generated CSS, but `@sudobility/building_blocks` and
 * `@sudobility/components` also use literal, class-based Tailwind `dark:` variants
 * (e.g. the page wrapper's `bg-gray-50 dark:bg-gray-900`). Without the `dark`
 * class those stay in light mode and fight a dark theme — which is why the page
 * surface looked light under RadioGraph. Keying the class off the theme keeps a
 * future light theme working with no further change.
 */
export function installTheme(): void {
  configureTheme(activeTheme);
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', isDarkTheme(activeTheme));
    if (!document.getElementById('sudobility-design-theme')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'sudobility-design-theme';
      styleEl.textContent = generateThemeCSS(activeTheme);
      document.head.appendChild(styleEl);
    }
  }
}

/** A theme is "dark" when its base (`light`) background token is low-lightness. */
function isDarkTheme(theme: ThemeDefinition): boolean {
  // Tokens are HSL channels, e.g. "210 38.5% 5.1%"; the third is lightness.
  const lightness = parseFloat(theme.light.background.trim().split(/\s+/)[2] ?? '');
  return Number.isFinite(lightness) && lightness < 50;
}
