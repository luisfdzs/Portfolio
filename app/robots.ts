import type { MetadataRoute } from 'next'
import { site } from '@/content/site'
import { isIndexable } from '@/lib/site-env'

/**
 * Sólo la rama `main` se indexa. El entorno de test devuelve `disallow: /` para no competir
 * en Google con el dominio real por la búsqueda que más importa: el propio nombre.
 * El criterio vive en `lib/site-env.ts`, con el porqué explicado.
 *
 * `/admin` queda fuera en los dos casos: el panel no tiene nada que indexar y una URL de
 * administración en los resultados de búsqueda es una invitación innecesaria.
 */
export default function robots(): MetadataRoute.Robots {
  const indexable = isIndexable()

  return {
    rules: indexable
      ? { userAgent: '*', allow: '/', disallow: '/admin' }
      : { userAgent: '*', disallow: '/' },
    sitemap: indexable ? `${site.url}/sitemap.xml` : undefined,
  }
}
