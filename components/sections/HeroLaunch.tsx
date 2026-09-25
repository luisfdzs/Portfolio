'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { cn } from '@/lib/cn'
import type { Locale } from '@/lib/i18n/config'
import { href } from '@/lib/i18n/routes'
import { IDLE_AT, type HeroClock } from '@/components/three/hero/HeroScene'
import { ArrowDown } from '@/components/ui/Icons'

const HeroScene = dynamic(
  () => import('@/components/three/hero/HeroScene').then((mod) => mod.HeroScene),
  { ssr: false },
)

const SETTLED = 8.5
const FIELD_FROM = 2
const FIELD_TO = 3.6

export type HeroLaunchCopy = {
  start: string
  hint: string
  projects: string
}

export function HeroLaunch({ copy, locale }: { copy: HeroLaunchCopy; locale: Locale }) {
  const clock = useRef<HeroClock>({ t: IDLE_AT, playing: false, hover: false })
  const [started, setStarted] = useState(false)
  const [settled, setSettled] = useState(false)
  const backdrop = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    const tick = () => {
      const progress = Math.min(
        1,
        Math.max(0, (clock.current.t - FIELD_FROM) / (FIELD_TO - FIELD_FROM)),
      )
      const eased = progress * progress * (3 - 2 * progress)
      if (backdrop.current) backdrop.current.style.opacity = String(1 - eased)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => setSettled(clock.current.t >= SETTLED), 200)
    return () => window.clearInterval(id)
  }, [])

  const play = () => {
    clock.current = { t: IDLE_AT, playing: true, hover: false }
    setStarted(true)
    setSettled(false)
  }

  const hover = (value: boolean) => {
    clock.current.hover = value
  }

  return (
    <>
      <div ref={backdrop} className="absolute inset-0 bg-[#050506]" aria-hidden="true" />
      <div className="absolute inset-0" aria-hidden="true">
        <HeroScene clock={clock} />
      </div>
      <div
        inert={started}
        className={cn(
          'absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300',
          started ? 'pointer-events-none opacity-0' : 'opacity-100',
        )}
      >
        <button
          type="button"
          onClick={play}
          onPointerEnter={() => hover(true)}
          onPointerLeave={() => hover(false)}
          onFocus={() => hover(true)}
          onBlur={() => hover(false)}
          aria-label={copy.start}
          className="h-[10vh] w-[40vh] cursor-pointer rounded-[2.5vh] outline-none focus-visible:ring-1 focus-visible:ring-signal/60 focus-visible:ring-offset-8 focus-visible:ring-offset-transparent"
        />
        <p className="absolute top-[calc(50%+13vh)] font-mono text-[0.6875rem] tracking-[0.12em] text-paper-faint uppercase">
          {copy.hint}
        </p>
      </div>
      <div
        inert={!settled}
        className={cn(
          'absolute inset-x-0 bottom-[max(4.5rem,13vh)] flex justify-center px-4 sm:bottom-[max(2rem,5vh)]',
          !settled && 'pointer-events-none',
        )}
      >
        <div
          className={cn(
            'flex items-center gap-6 font-mono text-small transition-opacity duration-1000',
            settled ? 'opacity-100 delay-100' : 'opacity-0',
          )}
        >
          <Link
            href={href(locale, 'projects')}
            className="flex flex-col items-center gap-1 text-signal transition-colors hover:text-paper"
          >
            {copy.projects}
            <ArrowDown className="size-4" />
          </Link>
        </div>
      </div>
    </>
  )
}
