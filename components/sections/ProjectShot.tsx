import type { CSSProperties } from 'react'
import type { ProjectMediaSet } from '@/content/project-shots'
import { cn } from '@/lib/cn'

type Props = {
  media: ProjectMediaSet
  alt: string
  className?: string
}

// La tarjeta enseña la primera pantalla de la web a la proporción del aparato desde el
// que se mira: el pantallazo del móvil en el móvil y el del portátil a partir de 48rem.
// Va con <picture> y no con next/image porque así el navegador se descarga una sola de
// las dos capturas, y las proporciones salen del propio índice, no de un número a mano.
export function ProjectShot({ media, alt, className }: Props) {
  const ratios = {
    '--shot-mobile': `${media.mobile.width} / ${media.mobile.height}`,
    '--shot-desktop': `${media.desktop.width} / ${media.desktop.height}`,
  } as CSSProperties

  return (
    <div
      style={ratios}
      className={cn(
        'project-shot w-full overflow-hidden rounded-lg border border-line bg-ink-raised',
        className,
      )}
    >
      <picture className="block size-full">
        <source media="(min-width: 48rem)" srcSet={media.desktop.src} />
        <img
          src={media.mobile.src}
          alt={alt}
          width={media.mobile.width}
          height={media.mobile.height}
          loading="lazy"
          decoding="async"
          className="size-full object-cover object-top"
        />
      </picture>
    </div>
  )
}
