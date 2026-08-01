import type { MetadataRoute } from 'next'
import { site } from '@/content/site'
import { getProjectSlugs } from '@/lib/content'
import { buildDate } from '@/lib/format'
import { locales } from '@/lib/i18n/config'
import { href } from '@/lib/i18n/routes'

/**
 * Sitemap generado del contenido real: no hay lista de URLs que mantener a mano y por tanto
 * no puede quedar desactualizada.
 *
 * **Las anclas de la portada no entran.** `/es#experience` no es una URL distinta de `/es`
 * para un rastreador, y declararla lo único que consigue es diluir la portada en cinco
 * entradas que apuntan al mismo documento.
 *
 * `changeFrequency` refleja lo que de verdad cambia: la portada lleva el CV y se toca al
 * cambiar de puesto o al terminar un proyecto (`monthly`); una ficha de proyecto, casi
 * nunca (`yearly`). Es una pista para el rastreador, no una promesa.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []
  const slugs = await getProjectSlugs()
  // El mismo `lastModified` para todo: lo que se publica es una foto del CV en un momento
  // dado, y ese momento es el del despliegue. Fechas distintas por página darían a entender
  // que cada una se revisa por separado, y no es así.
  const lastModified = buildDate()

  for (const locale of locales) {
    entries.push({
      url: `${site.url}/${locale}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 1,
    })

    entries.push({
      url: `${site.url}${href(locale, 'projects')}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    })

    for (const slug of slugs) {
      entries.push({
        url: `${site.url}${href(locale, 'projects', slug)}`,
        lastModified,
        changeFrequency: 'yearly',
        priority: 0.6,
      })
    }
  }

  return entries
}
