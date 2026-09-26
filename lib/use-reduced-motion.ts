import { useSyncExternalStore } from 'react'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

function subscribe(callback: () => void) {
  const query = window.matchMedia(REDUCED_MOTION)
  query.addEventListener('change', callback)
  return () => query.removeEventListener('change', callback)
}

const reducedMotion = () => window.matchMedia(REDUCED_MOTION).matches

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, reducedMotion, () => false)
}
