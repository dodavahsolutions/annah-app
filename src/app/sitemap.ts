import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';
import { STATIC_MARKETING_ROUTES } from '@/content/nav';
import { COUNCIL_AREAS } from '@/content/areas';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const home = {
    url: absoluteUrl('/'),
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 1,
  };

  const staticPages = STATIC_MARKETING_ROUTES.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: path === '/schemes' || path === '/calculators' ? 0.8 : 0.6,
  }));

  const areaPages = COUNCIL_AREAS.map((area) => ({
    url: absoluteUrl(`/areas/${area.slug}`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [home, ...staticPages, ...areaPages];
}
