import type { MetadataRoute } from 'next'
import { site } from '@/content/site'
import { isIndexable } from '@/lib/site-env'

export default function robots(): MetadataRoute.Robots {
  const indexable = isIndexable()

  return {
    rules: indexable
      ? { userAgent: '*', allow: '/', disallow: '/admin' }
      : { userAgent: '*', disallow: '/' },
    sitemap: indexable ? `${site.url}/sitemap.xml` : undefined,
  }
}
