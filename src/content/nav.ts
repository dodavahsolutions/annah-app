// Shared marketing navigation. Single source for the header, footer and sitemap.

export interface NavLink {
  href: string;
  label: string;
}

export const MARKETING_NAV: readonly NavLink[] = [
  { href: '/services', label: 'Services' },
  { href: '/schemes', label: 'Schemes' },
  { href: '/calculators', label: 'Calculators' },
  { href: '/areas', label: 'Areas' },
  { href: '/faq', label: 'FAQ' },
  { href: '/about', label: 'About' },
] as const;

// Static marketing routes (excluding dynamic /areas/[slug]) for the sitemap.
export const STATIC_MARKETING_ROUTES: readonly string[] = [
  '/about',
  '/services',
  '/schemes',
  '/calculators',
  '/areas',
  '/faq',
  '/glossary',
] as const;
