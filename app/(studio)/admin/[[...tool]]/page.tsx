import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity.config'
import { isSanityConfigured } from '@/sanity/env'
import { ConnectionNotice } from '../ConnectionNotice'

/**
 * EL PANEL, DENTRO DE LA WEB
 *
 * La ruta atrapa todo lo que venga después de `/admin` (`[[...tool]]`, opcional y variádica)
 * porque el panel de Sanity maneja su propia navegación interna: `/admin/structure/project`,
 * `/admin/vision`, etc. Sin el catch-all, cualquier clic dentro del panel daría un 404 de
 * Next.
 *
 * **Nada de `export const dynamic`**: con `cacheComponents` activo (ver `next.config.ts`)
 * Next rechaza la configuración por segmento y falla el build. Tampoco hace falta — esta
 * página no lee datos en servidor: todo lo que hace es montar la aplicación de Sanity en el
 * navegador, que a partir de ahí habla directamente con la API de Sanity. Sin acceso a datos
 * dinámicos, se prerrenderiza estática por sí sola.
 */
export default function StudioPage() {
  // Sin proyecto configurado, `NextStudio` lanzaría al montarse. Se comprueba antes y se
  // explica qué falta: ver `ConnectionNotice`.
  if (!isSanityConfigured) return <ConnectionNotice />

  return <NextStudio config={config} />
}
