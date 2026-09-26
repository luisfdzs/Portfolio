'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'
import type { ShowcaseSet } from '@/content/types'
import { showcaseSets } from '@/components/sections/showcases'
import { registerAnchor, type SwarmMarkKind } from '@/components/three/swarm/registry'

export function SwarmAnchor({
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
  const stage = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = stage.current
    if (!element) return
    return registerAnchor({ element, source: { kind: 'models', keys: showcaseSets[set] } })
  }, [set])

  return (
    <div role="img" aria-label={label} className={cn('flex flex-col items-center', className)}>
      <div ref={stage} className={cn('relative w-full', stageClassName)} aria-hidden="true" />
    </div>
  )
}

export function SwarmMark({ kind }: { kind: SwarmMarkKind }) {
  const mark = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = mark.current
    if (!element) return
    return registerAnchor({ element, source: { kind } })
  }, [kind])

  return <div ref={mark} aria-hidden="true" className="pointer-events-none absolute inset-0" />
}
