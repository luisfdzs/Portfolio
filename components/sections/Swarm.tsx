'use client'

import dynamic from 'next/dynamic'
import { useReducedMotion } from '@/lib/use-reduced-motion'

const SwarmScene = dynamic(
  () => import('@/components/three/swarm/SwarmScene').then((mod) => mod.SwarmScene),
  { ssr: false },
)

export function Swarm() {
  const calm = useReducedMotion()

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <SwarmScene calm={calm} />
    </div>
  )
}
