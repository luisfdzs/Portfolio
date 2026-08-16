import type { MetadataRoute } from 'next'
import { site } from '@/content/site'
import { getProjectSlugs } from '@/lib/content'
import { buildDate } from '@/lib/format'
import { locales } from '@/lib/i18n/config'
import { projectHref, projectsHref } from '@/lib/i18n/routes'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []
  const slugs = await getProjectSlugs()
  const lastModified = buildDate()

  for (const locale of locales) {
    entries.push({
      url: `${site.url}/${locale}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 1,
    })

    entries.push({
      url: `${site.url}${projectsHref(locale)}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    })

    for (const slug of slugs) {
      entries.push({
        url: `${site.url}${projectHref(locale, slug)}`,
        lastModified,
        changeFrequency: 'yearly',
        priority: 0.6,
      })
    }
  }

  return entries
}
