'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { cn } from '@/lib/cn'
import type { AgvModelKey } from '@/components/three/agv/models'

const AgvMorph = dynamic(
  () => import('@/components/three/agv/AgvMorph').then((mod) => mod.AgvMorph),
  { ssr: false },
)

export type AgvShowcaseItem = { key: AgvModelKey; title: string; href: string }

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

function subscribe(callback: () => void) {
  const query = window.matchMedia(REDUCED_MOTION)
  query.addEventListener('change', callback)
  return () => query.removeEventListener('change', callback)
}

const reducedMotion = () => window.matchMedia(REDUCED_MOTION).matches

export function AgvShowcase({
  items,
  label,
  openLabel,
  className,
  stageClassName,
}: {
  items: AgvShowcaseItem[]
  label: string
  openLabel: string
  className?: string
  stageClassName?: string
}) {
  const root = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  const [active, setActive] = useState(false)
  const [current, setCurrent] = useState<AgvModelKey | null>(null)
  const still = useSyncExternalStore(subscribe, reducedMotion, () => false)
  const [keys] = useState(() => items.map((item) => item.key))

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

  const onShow = useCallback((key: AgvModelKey) => setCurrent(key), [])
  const shown = items.find((item) => item.key === current)

  return (
    <figure ref={root} className={cn('flex flex-col items-center', className)}>
      <div
        className={cn(
          'relative w-full [mask-image:radial-gradient(closest-side,black_86%,transparent)]',
          stageClassName,
        )}
        aria-hidden="true"
      >
        {near ? <AgvMorph keys={keys} active={active} still={still} onShow={onShow} /> : null}
      </div>
      <figcaption className="mt-2 min-h-5 text-center font-mono text-micro text-paper-faint">
        <span className="sr-only">{label}: </span>
        {shown ? (
          <Link href={shown.href} className="transition-colors hover:text-signal">
            {shown.title}
            <span className="sr-only"> — {openLabel}</span>
            <span aria-hidden="true"> ↗</span>
          </Link>
        ) : null}
      </figcaption>
    </figure>
  )
}
