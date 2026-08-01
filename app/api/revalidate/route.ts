import { revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'
import { parseBody } from 'next-sanity/webhook'
import { CONTENT_TAG } from '@/lib/content'

/**
 * WEBHOOK DE PUBLICACIÓN
 *
 * Sanity llama a esta ruta cada vez que se publica algo en el panel. La web sigue siendo
 * estática —se sirve desde el CDN, igual de rápida— pero al recibir este aviso Next descarta
 * la copia cacheada del contenido y la regenera. En la práctica: se añade un proyecto nuevo
 * al portfolio, se pulsa «Publish» y aparece en segundos, **sin desplegar nada y sin tocar
 * el repositorio**.
 *
 * La petición viene firmada: sin el secreto correcto no se revalida nada, para que nadie
 * pueda forzar regeneraciones desde fuera.
 *
 * Configuración (una vez, en sanity.io/manage › API › Webhooks):
 *   URL      https://luisfernandezsangil.vercel.app/api/revalidate   (y la de test)
 *   Dataset  production · Trigger on: create, update, delete
 *   Secret   el mismo valor que la variable SANITY_REVALIDATE_SECRET
 *
 * ⚠️ Al crear el webhook por API hay que hacer después un PATCH con
 * `rule: {on: ["create","update","delete"]}`: el POST no acepta `rule` y sin ese PATCH el
 * webhook queda aparentemente correcto pero **no se dispara jamás**. Pasó en el proyecto
 * Swiftmet y sólo se detectó comparando con uno que sí funcionaba.
 */
const SIGNATURE_HEADER = 'sanity-webhook-signature'
/** Ventana de validez de la firma: cinco minutos de margen para relojes desajustados. */
const MAX_AGE_MS = 5 * 60 * 1000

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) {
    return new Response('SANITY_REVALIDATE_SECRET is missing from the environment', { status: 500 })
  }

  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(request, secret)

    if (!isValidSignature) {
      return new Response('Invalid signature', { status: 401 })
    }

    // La verificación de firma no comprueba la antigüedad, así que una petición capturada
    // seguiría siendo válida indefinidamente. El daño posible es pequeño (forzar
    // regeneraciones de caché), pero descartar lo viejo sale gratis.
    const timestamp = Number(/t=(\d+)/.exec(request.headers.get(SIGNATURE_HEADER) ?? '')?.[1])
    if (Number.isFinite(timestamp) && Math.abs(Date.now() - timestamp) > MAX_AGE_MS) {
      return new Response('Expired signature', { status: 401 })
    }

    // Una sola etiqueta para todo el contenido: son pocas páginas y regenerarlas es barato,
    // así que no merece la pena afinar por tipo de documento.
    revalidateTag(CONTENT_TAG, 'max')

    return Response.json({
      revalidated: true,
      tag: CONTENT_TAG,
      type: body?._type ?? null,
    })
  } catch (error) {
    console.error('[revalidate] Error processing the Sanity webhook', error)
    return new Response('Could not process the webhook', { status: 400 })
  }
}
