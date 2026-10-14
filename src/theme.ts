import { configureTheme } from '@sudobility/design';
import { generateThemeCSS, retroTheme } from '@sudobility/design/themes';

/**
 * Activate the design-system theme: register the JS class overrides and inject the
 * semantic-token CSS custom properties (`theme-bg-*`, `theme-text-*`, …) that every
 * `@sudobility/components` widget resolves against. Same pattern as screenwriter_app.
 */
export function installTheme(): void {
  configureTheme(retroTheme);
  if (
    typeof document !== 'undefined' &&
    !document.getElementById('sudobility-design-theme')
  ) {
    const styleEl = document.createElement('style');
    styleEl.id = 'sudobility-design-theme';
    styleEl.textContent = generateThemeCSS(retroTheme);
    document.head.appendChild(styleEl);
  }
}
