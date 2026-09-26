'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/cn'
import type { ShowcaseSet } from '@/content/types'
import { showcaseSets } from '@/components/sections/showcases'

const AgvMorph = dynamic(
  () => import('@/components/three/agv/AgvMorph').then((mod) => mod.AgvMorph),
  { ssr: false },
)

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

function subscribe(callback: () => void) {
  const query = window.matchMedia(REDUCED_MOTION)
  query.addEventListener('change', callback)
  return () => query.removeEventListener('change', callback)
}

const reducedMotion = () => window.matchMedia(REDUCED_MOTION).matches

export function AgvShowcase({
  set,
  label,
  className,
  stageClassName,
}: {
  set: ShowcaseSet
  label: string
  className?: string
  stageClassName?: string
}) {
  const root = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  const [active, setActive] = useState(false)
  const still = useSyncExternalStore(subscribe, reducedMotion, () => false)
  const keys = showcaseSets[set]

  useEffect(() => {
    const element = root.current
    if (!element) return
    const nearby = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setNear(true)
      },
      { rootMargin: '400px 0px' },
    )
    const visible = new IntersectionObserver(([entry]) => setActive(Boolean(entry?.isIntersecting)))
    nearby.observe(element)
    visible.observe(element)
    return () => {
      nearby.disconnect()
      visible.disconnect()
    }
  }, [])

  return (
    <div
      ref={root}
      role="img"
      aria-label={label}
      className={cn('flex flex-col items-center', className)}
    >
      <div
        className={cn(
          'relative w-full [mask-image:radial-gradient(closest-side,black_86%,transparent)]',
          stageClassName,
        )}
        aria-hidden="true"
      >
        {near ? <AgvMorph keys={keys} active={active} still={still} /> : null}
      </div>
    </div>
  )
}
