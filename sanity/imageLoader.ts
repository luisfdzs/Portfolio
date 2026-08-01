/**
 * CARGADOR DE IMÁGENES DE SANITY (para `next/image`)
 *
 * Cada `<Image>` pide a la CDN de Sanity exactamente el ancho que necesita, y Sanity
 * devuelve la variante ya redimensionada y en el mejor formato que acepte el navegador
 * (`auto=format` → AVIF o WebP). Es lo que hace que una captura de 4 MB subida desde el
 * panel llegue al visitante ligera, sin que nadie la prepare antes.
 *
 * Se declara en `next.config.ts` (`images.loaderFile`) y sustituye al optimizador de
 * Vercel para todas las imágenes: así el trabajo lo hace la CDN de Sanity —que ya tiene
 * el original— y no se consume cuota de optimización de Vercel.
 */
export default function sanityImageLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}): string {
  // Las imágenes locales (retrato, capturas del repositorio, iconos) no pasan por Sanity
  // y se devuelven tal cual: ya vienen optimizadas en el repositorio.
  if (!src.startsWith('https://cdn.sanity.io/')) return src

  const url = new URL(src)
  url.searchParams.set('w', String(width))
  url.searchParams.set('q', String(quality ?? 75))
  url.searchParams.set('auto', 'format')
  // `max` nunca amplía por encima del original ni deforma.
  url.searchParams.set('fit', 'max')
  return url.toString()
}
