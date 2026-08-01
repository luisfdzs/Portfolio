import Image from 'next/image'
import type { DescribedImage } from '@/content/types'
import { cn } from '@/lib/cn'
import type { Locale } from '@/lib/i18n/config'

type Props = {
  image: DescribedImage | null | undefined
  locale: Locale
  /**
   * Proporción del hueco. `wide` es **2:1**, que es la proporción a la que
   * `scripts/build-project-shots.mjs` recorta las capturas: ahí está explicado por qué no es
   * 16:10 — con el alto que da el viewport, 16:10 obligaría a recortar 225 px por lado y se
   * perdería parte de la interfaz de las webs capturadas. El retrato es cuadrado.
   */
  ratio?: 'wide' | 'square'
  /** `true` sólo en la primera imagen visible de la página (LCP). */
  priority?: boolean
  sizes?: string
  className?: string
}

/**
 * Imagen con su hueco reservado, o el hueco solo si todavía no hay imagen.
 *
 * Reservar el hueco pase lo que pase es lo que impide el salto de maquetación: sin él, la
 * lista de proyectos se recoloca cuando cargan las capturas y quien estaba leyendo pierde
 * la línea. Y cuando falta una captura se ve **la trama**, no un gris que la disimule: un
 * hueco declarado es información —«esto está pendiente»— y un hueco camuflado es un
 * descuido que parece intencionado.
 */
export function Figure({
  image,
  locale,
  ratio = 'wide',
  priority = false,
  sizes = '(min-width: 1024px) 50vw, 100vw',
  className,
}: Props) {
  const shape = ratio === 'square' ? 'aspect-square' : 'aspect-[2/1]'

  if (!image) {
    return (
      <div
        className={cn('placeholder-grid w-full overflow-hidden rounded-lg', shape, className)}
        // Decorativo: no hay nada que anunciar, y un `alt` describiendo «hueco sin
        // imagen» sería ruido para quien navega con lector de pantalla.
        aria-hidden="true"
      />
    )
  }

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-lg border border-line bg-ink-raised',
        shape,
        className,
      )}
    >
      <Image
        src={image.src}
        alt={image.alt[locale]}
        width={image.width}
        height={image.height}
        sizes={sizes}
        priority={priority}
        quality={85}
        className="size-full object-cover"
      />
    </div>
  )
}
