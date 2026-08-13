import { createClient, type SanityClient } from 'next-sanity'
import { apiVersion, dataset, isSanityConfigured, projectId } from './env'

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
