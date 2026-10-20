import type { BreadcrumbItem } from '@sudobility/building_blocks';

/**
 * Builds the breadcrumb trail for a path automatically from its URL segments
 * (the sudojo_app approach, simplified for this single-locale app — no i18n, no
 * language prefix). A static label map names the known segments; anything else
 * (e.g. a character id) is title-cased, unless a dynamic title has been set for
 * that exact path (the editor sets the character's name for `/characters/:id`).
 *
 * A singleton with a `useSyncExternalStore` subscription so a dynamic-title
 * change re-renders the breadcrumbs without threading state through the tree.
 */
export class BreadcrumbBuilder {
  private static instance: BreadcrumbBuilder;
  private dynamicTitles = new Map<string, string>();
  private listeners = new Set<() => void>();
  private version = 0;

  static getInstance(): BreadcrumbBuilder {
    if (!BreadcrumbBuilder.instance) {
      BreadcrumbBuilder.instance = new BreadcrumbBuilder();
    }
    return BreadcrumbBuilder.instance;
  }

  getVersion(): number {
    return this.version;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Name a specific path (e.g. `/characters/chr_123` → "Ada Lovelace"). */
  setDynamicTitle(path: string, title: string): void {
    const key = this.normalize(path);
    if (this.dynamicTitles.get(key) === title) return;
    this.dynamicTitles.set(key, title);
    this.bump();
  }

  clearDynamicTitle(path: string): void {
    if (this.dynamicTitles.delete(this.normalize(path))) this.bump();
  }

  /** The full `Home › … › current` trail as `BreadcrumbItem[]`. */
  itemsFor(path: string | undefined): BreadcrumbItem[] {
    if (!path) return [];
    const clean = path !== '/' ? path.replace(/\/+$/, '') : path;
    const segments = clean.split('/').filter(Boolean);
    if (segments.length === 0) return [{ label: 'Home', href: '/', current: true }];

    const items: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
    let current = '';
    segments.forEach((segment, i) => {
      current += `/${segment}`;
      const isLast = i === segments.length - 1;
      items.push({
        label: this.labelFor(current, segment),
        href: isLast ? undefined : current,
        current: isLast || undefined,
      });
    });
    return items;
  }

  private labelFor(path: string, segment: string): string {
    const dynamic = this.dynamicTitles.get(this.normalize(path));
    if (dynamic) return dynamic;
    const known = LABELS[segment];
    if (known) return known;
    return segment
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  private normalize(path: string): string {
    const p = path !== '/' ? path.replace(/\/+$/, '') : path;
    return p.toLowerCase();
  }

  private bump(): void {
    this.version++;
    this.listeners.forEach((l) => l());
  }
}

/** Known path segment → human label. Unknown segments are title-cased. */
const LABELS: Record<string, string> = {
  characters: 'Characters',
  new: 'New character',
  gallery: 'Gallery',
  credits: 'Credits',
  account: 'Account',
  dashboard: 'Dashboard',
  sheets: 'Character sheets',
  docs: 'Docs',
  tutorials: 'Tutorials',
  about: 'About',
  contact: 'Contact',
  privacy: 'Privacy',
  terms: 'Terms',
  sitemap: 'Sitemap',
  login: 'Log in',
};
