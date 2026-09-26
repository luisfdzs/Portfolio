import type { MetadataRoute } from 'next'
import { site } from '@/content/site'
import { defaultLocale } from '@/lib/i18n/config'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.shortName,
    start_url: `/${defaultLocale}`,
    display: 'standalone',
    background_color: '#08090b',
    theme_color: '#08090b',
    icons: [
      { src: '/icon', sizes: '192x192', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
      { src: '/favicon.ico', sizes: '48x48 32x32 16x16', type: 'image/x-icon' },
    ],
  }
}
