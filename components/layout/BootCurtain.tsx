'use client'

import { useEffect, useLayoutEffect, useState } from 'react'
import { ProjectLoader } from '@/components/ui/ProjectLoader'

const MIN_HOLD = 450
const MAX_HOLD = 4000
const FADE = 420

const useBeforePaint = typeof window === 'undefined' ? useEffect : useLayoutEffect

const NO_SCRIPT = [
  "html[data-boot='hold']{overflow:visible}",
  '.boot-curtain{display:none}',
  "html[data-boot='hold'] .hero-name,html[data-boot='hold'] .typed__char{animation-play-state:running}",
].join('')

function paintedAbove() {
  const limit = window.innerHeight

  return Array.from(document.images)
    .filter((image) => {
      if (image.complete || image.loading === 'lazy') return false
      const box = image.getBoundingClientRect()
      return box.bottom > 0 && box.top < limit
    })
    .map(
      (image) =>
        new Promise<void>((done) => {
          image.addEventListener('load', () => done(), { once: true })
          image.addEventListener('error', () => done(), { once: true })
        }),
    )
}

export function BootCurtain() {
  const [ready, setReady] = useState(false)
  const [gone, setGone] = useState(false)

  useBeforePaint(() => {
    if (document.documentElement.dataset.boot === 'hold') return
    setReady(true)
    setGone(true)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (root.dataset.boot !== 'hold') return

    const started = performance.now()

    let live = true
    let hold = 0
    let cap = 0

    function open() {
      if (!live) return
      live = false
      window.clearTimeout(hold)
      window.clearTimeout(cap)
      root.dataset.boot = 'ready'
      setReady(true)
    }

    function settle() {
      if (!live) return
      hold = window.setTimeout(open, Math.max(0, MIN_HOLD - (performance.now() - started)))
    }

    cap = window.setTimeout(open, MAX_HOLD)

    const fonts = document.fonts ? document.fonts.ready : Promise.resolve()

    Promise.all([fonts.catch(() => undefined), ...paintedAbove()]).then(() => {
      if (!live) return
      if (document.hidden) return settle()
      requestAnimationFrame(() => requestAnimationFrame(settle))
    })

    return () => {
      live = false
      window.clearTimeout(hold)
      window.clearTimeout(cap)
    }
  }, [])

  useEffect(() => {
    if (!ready || gone) return

    const drop = window.setTimeout(() => setGone(true), FADE)
    return () => window.clearTimeout(drop)
  }, [ready, gone])

  if (gone) return null

  return (
    <>
      <noscript>
        <style>{NO_SCRIPT}</style>
      </noscript>

      <div className="boot-curtain" data-print="hide" data-leaving={ready || undefined}>
        <ProjectLoader slug="site" className="boot-curtain__loader" />
      </div>
    </>
  )
}
