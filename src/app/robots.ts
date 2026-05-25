import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Auth and API surfaces carry no SEO value and may expose dynamic state.
      disallow: ['/api/', '/login', '/signup', '/auth/'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl(),
  };
}
