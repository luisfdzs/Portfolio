'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/cn'
import type { Locale } from '@/lib/i18n/config'
import { interpolate } from '@/lib/i18n/dictionaries'
import {
  AGV_CYCLE,
  AGV_FORMED_AT,
  agvPhase,
  type AgvClock,
  type AgvPhase,
} from '@/components/three/agv/AgvScene'
import type { AgvModelKey } from '@/components/three/agv/models'

const AgvScene = dynamic(
  () => import('@/components/three/agv/AgvScene').then((mod) => mod.AgvScene),
  { ssr: false },
)

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

function subscribe(callback: () => void) {
  const query = window.matchMedia(REDUCED_MOTION)
  query.addEventListener('change', callback)
  return () => query.removeEventListener('change', callback)
}

const reducedMotion = () => window.matchMedia(REDUCED_MOTION).matches

const PHASES: AgvPhase[] = ['core', 'explode', 'assemble', 'drive']

export type AgvExperimentCopy = {
  title: string
  lead: string
  phases: Record<AgvPhase, string>
  replay: string
  pause: string
  play: string
  scrub: string
  particles: string
}

export function AgvExperiment({
  model,
  copy,
  locale,
}: {
  model: AgvModelKey
  copy: AgvExperimentCopy
  locale: Locale
}) {
  const clock = useRef<AgvClock>({ t: 0, playing: true, scrubbing: false })
  const still = useSyncExternalStore(subscribe, reducedMotion, () => false)
  const [playing, setPlaying] = useState(true)
  const [phase, setPhase] = useState<AgvPhase>('core')
  const [count, setCount] = useState<number | null>(null)
  const scrub = useRef<HTMLInputElement>(null)
  const time = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (still) clock.current = { t: AGV_FORMED_AT, playing: false, scrubbing: false }
  }, [still])

  useEffect(() => {
    let frame = 0
    const tick = () => {
      const { t, scrubbing } = clock.current
      if (scrub.current && !scrubbing)
        scrub.current.value = String(Math.round((t / AGV_CYCLE) * 1000))
      if (time.current) time.current.textContent = `${t.toFixed(1)} s`
      setPhase(agvPhase(t))
      setPlaying(clock.current.playing)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  const onReady = useCallback((value: number) => setCount(value), [])

  const replay = () => {
    clock.current = { t: 0, playing: true, scrubbing: false }
  }

  const toggle = () => {
    clock.current.playing = !clock.current.playing
  }

  return (
    <section className="relative h-svh min-h-[32rem] overflow-hidden bg-[#050506]">
      <div className="absolute inset-0">
        <AgvScene model={model} clock={clock} still={still} onReady={onReady} />
      </div>

      <div className="page-gutter pointer-events-none absolute inset-x-0 top-24 flex flex-wrap items-start justify-between gap-x-8 gap-y-4 lg:top-28">
        <div>
          <h1 className="text-title text-paper">{copy.title}</h1>
          <p className="mt-2 max-w-measure text-small text-paper-soft">{copy.lead}</p>
          {count !== null && (
            <p className="mt-3 font-mono text-micro text-paper-faint">
              {interpolate(copy.particles, { count: count.toLocaleString(locale) })}
            </p>
          )}
        </div>
        <ol className="flex flex-wrap gap-1.5">
          {PHASES.map((key) => (
            <li
              key={key}
              className={cn(
                'rounded-sm border px-2.5 py-1.5 font-mono text-micro uppercase transition-colors duration-300',
                key === phase
                  ? 'border-signal bg-signal text-ink'
                  : 'border-line-strong text-paper-faint',
              )}
            >
              {copy.phases[key]}
            </li>
          ))}
        </ol>
      </div>

      <div className="page-gutter absolute inset-x-0 bottom-24 flex flex-wrap items-center gap-x-6 gap-y-3 md:bottom-8">
        <div className="flex w-full max-w-3xl min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={replay}
            className="rounded-sm border border-line-strong bg-ink/60 px-3 py-2 font-mono text-micro uppercase text-paper transition-colors hover:border-signal-dim hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            {copy.replay}
          </button>
          <button
            type="button"
            onClick={toggle}
            className="rounded-sm border border-line-strong bg-ink/60 px-3 py-2 font-mono text-micro uppercase text-paper transition-colors hover:border-signal-dim hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            {playing ? copy.pause : copy.play}
          </button>
          <input
            ref={scrub}
            type="range"
            min={0}
            max={1000}
            defaultValue={0}
            aria-label={copy.scrub}
            onInput={(event) => {
              clock.current.scrubbing = true
              clock.current.t = (Number(event.currentTarget.value) / 1000) * AGV_CYCLE
            }}
            onPointerUp={() => {
              clock.current.scrubbing = false
            }}
            onKeyUp={() => {
              clock.current.scrubbing = false
            }}
            className="min-w-0 flex-1 accent-signal"
          />
          <span
            ref={time}
            className="w-14 shrink-0 whitespace-nowrap text-right font-mono text-micro text-paper-faint tabular-nums"
          >
            0.0 s
          </span>
        </div>
      </div>
    </section>
  )
}
