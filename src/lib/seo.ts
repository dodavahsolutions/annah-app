// Central SEO config + JSON-LD builders for the public marketing pages.
// The chat app at `/` is excluded from the marketing shell and from the sitemap.

import type { Metadata } from 'next';

export const SITE = {
  name: 'Anna',
  legalName: 'Anna Mortgages',
  tagline: 'Scotland Mortgage Advisor',
  description:
    'Anna is an AI-powered mortgage guide for Scotland — instant calculators for LBTT, affordability and repayments, plus plain-English help with Scottish home-buying schemes.',
  // CORS already relies on NEXT_PUBLIC_SITE_URL; reuse it as the canonical origin.
  // Strip any trailing slash so absoluteUrl() never produces a double slash.
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  locale: 'en_GB',
  twitter: '@annamortgages',
} as const;

/** Resolve a site-relative path to an absolute URL using the canonical origin. */
export function absoluteUrl(path = ''): string {
  if (!path) return SITE.url;
  return `${SITE.url}${path.startsWith('/') ? path : `/${path}`}`;
}

interface PageMetaInput {
  title: string;
  description: string;
  /** Site-relative path, e.g. '/schemes'. Used for the canonical URL. */
  path: string;
  /** Defaults to true; set false for thin/duplicate-risk pages. */
  index?: boolean;
}

/**
 * Build a complete Next.js Metadata object for a marketing page, including
 * canonical URL and Open Graph / Twitter cards derived from a single input.
 */
export function pageMetadata({ title, description, path, index = true }: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = `${title} | ${SITE.name} — ${SITE.tagline}`;
  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    robots: index ? undefined : { index: false, follow: true },
    openGraph: {
      type: 'website',
      siteName: SITE.name,
      locale: SITE.locale,
      title: fullTitle,
      description,
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
    },
  };
}

// ── JSON-LD builders ─────────────────────────────────────────────────────────
// Each returns a plain object serialised into a <script type="application/ld+json">.

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.legalName,
    alternateName: SITE.name,
    url: SITE.url,
    description: SITE.description,
    areaServed: { '@type': 'Country', name: 'Scotland' },
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    inLanguage: 'en-GB',
  };
}

interface FaqEntry {
  question: string;
  answer: string;
}

export function faqPageJsonLd(entries: readonly FaqEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((e) => ({
      '@type': 'Question',
      name: e.question,
      acceptedAnswer: { '@type': 'Answer', text: e.answer },
    })),
  };
}

interface ArticleJsonLdInput {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
}

export function articleJsonLd({ headline, description, path, datePublished, dateModified }: ArticleJsonLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    mainEntityOfPage: absoluteUrl(path),
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: { '@type': 'Organization', name: SITE.legalName },
    publisher: { '@type': 'Organization', name: SITE.legalName },
  };
}

interface LocalBusinessJsonLdInput {
  name: string;
  description: string;
  path: string;
  areaName: string;
}

export function localBusinessJsonLd({ name, description, path, areaName }: LocalBusinessJsonLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name,
    description,
    url: absoluteUrl(path),
    areaServed: { '@type': 'AdministrativeArea', name: areaName },
    serviceType: 'Mortgage guidance',
    provider: { '@type': 'Organization', name: SITE.legalName, url: SITE.url },
  };
}

interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(crumbs: readonly Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}
