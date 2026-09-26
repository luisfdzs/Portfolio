import type { ShowcaseModelKey } from '@/components/three/agv/models'

export type SwarmMarkKind = 'hero' | 'frame' | 'social'

export type SwarmSource =
  | { kind: 'hero' }
  | { kind: 'frame' }
  | { kind: 'social' }
  | { kind: 'models'; keys: readonly ShowcaseModelKey[] }

export type SwarmAnchor = { element: HTMLElement; source: SwarmSource }

export type HeroPose = 'button' | 'name'

const anchors = new Set<SwarmAnchor>()
const listeners = new Set<() => void>()
let version = 0

function notify() {
  version++
  for (const listener of listeners) listener()
}

export function registerAnchor(anchor: SwarmAnchor) {
  anchors.add(anchor)
  notify()
  return () => {
    anchors.delete(anchor)
    notify()
  }
}

export function subscribeAnchors(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const listAnchors = () => anchors

export const anchorsVersion = () => version

export const swarmLink: {
  handoff: number
  hero: {
    pose: HeroPose
    button: Float32Array | null
    name: Float32Array | null
    version: number
  }
  social: {
    points: Float32Array | null
    version: number
    live: boolean
    formed: boolean
  }
} = {
  handoff: 0,
  hero: { pose: 'button', button: null, name: null, version: 0 },
  social: { points: null, version: 0, live: false, formed: false },
}
