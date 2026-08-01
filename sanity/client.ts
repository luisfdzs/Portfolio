import { createClient, type SanityClient } from 'next-sanity'
import { apiVersion, dataset, isSanityConfigured, projectId } from './env'

/**
 * Cliente de lectura, creado **a demanda**.
 *
 * No es un `export const client = createClient(...)` como en los proyectos de cliente
 * porque aquí el proyecto de Sanity es opcional: `createClient` con `projectId` vacío
 * lanza al importar el módulo, y eso reventaría el build de una web que no necesita
 * Sanity para funcionar. Con una función, el cliente sólo se construye cuando alguien
 * va a consultar de verdad, y `lib/content.ts` ya ha comprobado antes que hay con qué.
 *
 * **`useCdn: false` a propósito.** La CDN de Sanity puede devolver datos de hace unos
 * segundos, y eso rompe la regeneración: al publicar, el webhook invalida la caché, la
 * página se regenera al instante y —si lee de la CDN— puede volver a guardar el dato
 * viejo *como si fuera fresco*, quedándose así indefinidamente.
 *
 * El coste es nulo para quien visita la web: estas consultas sólo ocurren al construir
 * o al regenerar una página, nunca en la petición del visitante, que recibe HTML
 * estático desde el CDN de Vercel.
 */
let cached: SanityClient | null = null

export function getClient(): SanityClient {
  if (!isSanityConfigured) {
    throw new Error(
      '[sanity] No hay proyecto configurado: falta NEXT_PUBLIC_SANITY_PROJECT_ID. ' +
        'Esto no debería ocurrir — lib/content.ts comprueba `isSanityConfigured` antes ' +
        'de consultar y cae al contenido de content/.',
    )
  }

  cached ??= createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    perspective: 'published',
  })

  return cached
}
