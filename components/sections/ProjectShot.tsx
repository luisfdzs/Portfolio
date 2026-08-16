'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { ProjectMediaSet } from '@/content/project-shots'
import { cn } from '@/lib/cn'
import { ProjectLoader } from '@/components/ui/ProjectLoader'

type Props = {
  media: ProjectMediaSet
  slug: string
  alt: string
  priority?: boolean
  className?: string
}

export function ProjectShot({ media, slug, alt, priority = false, className }: Props) {
  const image = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (image.current?.complete) setLoaded(true)
  }, [])

  const ratios = {
    '--shot-mobile': `${media.mobile.width} / ${media.mobile.height}`,
    '--shot-desktop': `${media.desktop.width} / ${media.desktop.height}`,
  } as CSSProperties

  return (
    <div
      style={ratios}
      className={cn(
        'project-shot relative w-full overflow-hidden rounded-lg border border-line bg-ink-raised',
        className,
      )}
    >
      {/* Sin onLoad no se retira: si la captura falla, se queda el loader y no un hueco vacío. */}
      {loaded ? null : <ProjectLoader slug={slug} />}

      <picture className="relative block size-full">
        <source media="(min-width: 48rem)" srcSet={media.desktop.src} />
        <img
          ref={image}
          src={media.mobile.src}
          alt={alt}
          width={media.mobile.width}
          height={media.mobile.height}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          className="size-full object-cover object-top"
        />
      </picture>
    </div>
  )
}
