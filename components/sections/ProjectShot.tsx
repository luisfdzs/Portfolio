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

// La captura suele venir de caché o del disco del propio servidor, así que llegaba en el
// mismo fotograma en el que se montaba el loader y no se veía nunca. Se le da un mínimo de
// tiempo en pantalla y una salida en fundido, que es lo que hace que la marca se lea.
//
// El mínimo cuenta desde que la tarjeta entra en pantalla, no desde que se monta: la mitad
// del carrusel nace muy por debajo del pliegue y, contando desde el montaje, para cuando
// bajabas hasta ella el loader ya se había ido. Como el loader no se retira hasta entonces,
// nunca llega a taparse una captura que ya estuviera puesta.
const MIN_VISIBLE = 620
const FADE = 320

export function ProjectShot({ media, slug, alt, priority = false, className }: Props) {
  const frame = useRef<HTMLDivElement>(null)
  const image = useRef<HTMLImageElement>(null)
  const [ready, setReady] = useState(false)
  const [seenAt, setSeenAt] = useState<number | null>(null)
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const node = image.current
    // Una captura de caché ya está completa antes de que React llegue a enterarse del onLoad.
    if (node?.complete && node.naturalWidth > 0) setReady(true)
  }, [])

  useEffect(() => {
    const node = frame.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setSeenAt((current) => current ?? performance.now())
        observer.disconnect()
      },
      { threshold: 0.15 },
    )
    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!ready || seenAt === null) return

    const left = Math.max(0, MIN_VISIBLE - (performance.now() - seenAt))
    const fade = window.setTimeout(() => setLeaving(true), left)
    const drop = window.setTimeout(() => setGone(true), left + FADE)

    return () => {
      window.clearTimeout(fade)
      window.clearTimeout(drop)
    }
  }, [ready, seenAt])

  const ratios = {
    '--shot-mobile': `${media.mobile.width} / ${media.mobile.height}`,
    '--shot-desktop': `${media.desktop.width} / ${media.desktop.height}`,
  } as CSSProperties

  return (
    <div
      ref={frame}
      style={ratios}
      className={cn(
        'project-shot relative w-full overflow-hidden rounded-lg border border-line bg-ink-raised',
        className,
      )}
    >
      {/* Sin onError no se retira: si la captura falla, se queda el loader y no un hueco vacío. */}
      {gone ? null : <ProjectLoader slug={slug} leaving={leaving} />}

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
          onLoad={() => setReady(true)}
          className="size-full object-cover object-top"
        />
      </picture>
    </div>
  )
}
