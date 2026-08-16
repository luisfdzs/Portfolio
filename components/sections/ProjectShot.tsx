'use client'

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
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

const FADE = 320

const useBeforePaint = typeof window === 'undefined' ? useEffect : useLayoutEffect

export function ProjectShot({ media, slug, alt, priority = false, className }: Props) {
  const image = useRef<HTMLImageElement>(null)
  const [ready, setReady] = useState(false)
  const [gone, setGone] = useState(false)

  useBeforePaint(() => {
    const node = image.current
    if (node?.complete && node.naturalWidth > 0) {
      setReady(true)
      setGone(true)
    }
  }, [])

  useEffect(() => {
    if (!ready || gone) return

    const drop = window.setTimeout(() => setGone(true), FADE)
    return () => window.clearTimeout(drop)
  }, [ready, gone])

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
      {gone ? null : <ProjectLoader slug={slug} leaving={ready} />}

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
