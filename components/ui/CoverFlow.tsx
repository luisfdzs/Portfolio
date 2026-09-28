'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  COVER_FLOW_ITEM,
  COVER_FLOW_ROOMY,
  COVER_FLOW_STILL,
  frontCoverFlowItem,
  placeCard,
  wrapGap,
  XMB,
  XMB_SNUG,
} from '@/lib/cover-flow'
import { ArrowLeft, ArrowRight } from './Icons'

type Slide = {
  key: string
  front: ReactNode
  reflection?: ReactNode
}

type Props = {
  slides: readonly Slide[]
  label: string
  previousLabel: string
  nextLabel: string
  action?: ReactNode
}

type Grab = {
  id: number
  fromX: number
  fromSpot: number
  slop: number
  live: boolean
}

const MOUSE_SLOP = 4
const TOUCH_SLOP = 12
const REST = 0.0008
const CAST = 4
const SWALLOW = 400
const SAMPLES = 5
const STIR = 0.3
const CALM = 0.1
const STEP_CAP = 0.05

export function CoverFlow({ slides, label, previousLabel, nextLabel, action }: Props) {
  const lane = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const [roomy, setRoomy] = useState(false)
  const loop = slides.length > 1
  const tune = roomy ? XMB : XMB_SNUG

  const spot = useRef(0)
  const mark = useRef(0)
  const rate = useRef(0)
  const still = useRef(false)
  const resting = useRef(false)
  const moving = useRef(false)
  const front = useRef(-1)
  const grip = useRef<{ way: -1 | 1; since: number } | null>(null)
  const grab = useRef<Grab | null>(null)
  const samples = useRef<{ at: number; spot: number }[]>([])
  const eaten = useRef(0)

  useEffect(() => {
    const wide = window.matchMedia(COVER_FLOW_ROOMY)
    const calm = window.matchMedia(COVER_FLOW_STILL)

    const sync = () => {
      setRoomy(wide.matches)
      still.current = calm.matches
    }

    sync()
    wide.addEventListener('change', sync)
    calm.addEventListener('change', sync)

    return () => {
      wide.removeEventListener('change', sync)
      calm.removeEventListener('change', sync)
    }
  }, [])

  const items = useCallback(() => {
    const node = scroller.current
    return node ? [...node.querySelectorAll<HTMLElement>(`:scope > ul > .${COVER_FLOW_ITEM}`)] : []
  }, [])

  const draw = useCallback(() => {
    const cards = items()
    const count = cards.length
    const width = cards[0]?.offsetWidth
    if (!count || !width) return

    const edge = tune.visible + 1

    cards.forEach((item, index) => {
      const gap = wrapGap(index - spot.current, count)
      const away = Math.abs(gap)
      const hidden = away > edge

      item.style.visibility = hidden ? 'hidden' : 'visible'
      if (hidden) return

      const board = item.firstElementChild as HTMLElement | null
      if (!board) return

      const place = placeCard(gap, tune)

      board.style.transform = `translate3d(${((place.x - index) * width).toFixed(2)}px, 0, ${(place.z * width).toFixed(2)}px) rotateY(${place.turn.toFixed(2)}deg) scale(${place.scale.toFixed(4)})`
      item.style.zIndex = String(Math.round(2000 - away * 100))
      item.style.setProperty('--cover-flow-shade', place.shade.toFixed(3))
      item.style.setProperty(
        '--cover-flow-gleam',
        Math.max(0, tune.mirror * (1 - away / edge)).toFixed(3),
      )
    })
  }, [items, tune])

  const aim = useCallback(
    (index: number) => {
      if (index === front.current) return

      const cards = items()
      const previous = cards[front.current]
      const next = cards[index]
      front.current = index
      if (previous) frontCoverFlowItem(previous, false)
      if (next) frontCoverFlowItem(next, true)
    },
    [items],
  )

  const focus = useCallback(
    (settled: boolean) => {
      const count = items().length
      if (!count || (!settled && moving.current)) return

      aim(((Math.round(spot.current) % count) + count) % count)
    },
    [aim, items],
  )

  const stir = useCallback(
    (node: HTMLElement, stirred: boolean) => {
      if (stirred === moving.current) return

      moving.current = stirred
      if (stirred) {
        node.dataset.moving = ''
        aim(-1)
      } else {
        delete node.dataset.moving
      }
    },
    [aim],
  )

  const advance = useCallback(
    (step: number, now: number) => {
      const node = scroller.current
      if (!node || grab.current?.live) return

      const held = grip.current

      if (!held && Math.abs(mark.current - spot.current) < REST && Math.abs(rate.current) < REST) {
        if (resting.current) return
        resting.current = true
        rate.current = 0
        spot.current = mark.current
        stir(node, false)
        draw()
        focus(true)
        return
      }

      resting.current = false

      if (held) {
        const age = (now - held.since) / 1000 - tune.holdDelay
        if (age > 0) {
          const ramp = Math.min(1, age / tune.holdRamp)
          mark.current += held.way * (1 + (tune.holdTop - 1) * ramp * ramp) * step
        }
      }

      if (still.current) {
        spot.current = mark.current
        rate.current = 0
      } else {
        const damp = 2 * Math.sqrt(tune.pull) * tune.settle
        rate.current += ((mark.current - spot.current) * tune.pull - rate.current * damp) * step
        spot.current += rate.current * step
      }

      const pace = Math.abs(rate.current)
      stir(node, moving.current ? pace > CALM : pace > STIR)
      draw()
      focus(false)
    },
    [draw, focus, stir, tune],
  )

  const land = useCallback(() => {
    const cast = Math.max(-CAST, Math.min(CAST, rate.current * tune.flick))
    mark.current = Math.round(spot.current + cast)
  }, [tune])

  const hold = useCallback((way: -1 | 1) => {
    if (grip.current?.way === way) return

    grip.current = { way, since: performance.now() }
    mark.current = Math.round(spot.current) + way
  }, [])

  const lift = useCallback(() => {
    const held = grip.current
    if (!held) return

    grip.current = null
    mark.current = held.way > 0 ? Math.ceil(mark.current) : Math.floor(mark.current)
  }, [])

  const step = useCallback((way: -1 | 1) => {
    grip.current = null
    mark.current = Math.round(spot.current) + way
  }, [])

  useEffect(() => {
    const node = scroller.current
    if (!node) return

    let id = 0
    let prev = performance.now()
    let onscreen = true

    const watch = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1)
        if (entry) onscreen = entry.isIntersecting
      },
      { rootMargin: '240px' },
    )
    watch.observe(node)

    const tick = (now: number) => {
      const step = Math.min((now - prev) / 1000, STEP_CAP)
      prev = now

      if (onscreen && !document.hidden) advance(step, now)

      id = requestAnimationFrame(tick)
    }

    draw()
    id = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(id)
      watch.disconnect()
    }
  }, [advance, draw])

  useEffect(() => {
    const node = scroller.current
    if (!node) return

    const reach = () => tune.gap * (items()[0]?.offsetWidth || 1)

    const offset = (target: EventTarget | null) => {
      const item = (target as Element | null)?.closest(`.${COVER_FLOW_ITEM}`)
      const cards = items()
      const index = item ? cards.indexOf(item as HTMLElement) : -1
      return index < 0 ? null : wrapGap(index - spot.current, cards.length)
    }

    const down = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return

      grip.current = null
      mark.current = spot.current
      rate.current = 0
      eaten.current = 0
      grab.current = {
        id: event.pointerId,
        fromX: event.clientX,
        fromSpot: spot.current,
        slop: event.pointerType === 'mouse' ? MOUSE_SLOP : TOUCH_SLOP,
        live: false,
      }
      samples.current = [{ at: event.timeStamp, spot: spot.current }]
    }

    const move = (event: PointerEvent) => {
      const held = grab.current
      if (!held || held.id !== event.pointerId) return

      if (!held.live) {
        if (Math.abs(event.clientX - held.fromX) < held.slop) return
        held.live = true
        node.dataset.dragging = ''
        stir(node, true)
        document.getSelection()?.removeAllRanges()
      }

      spot.current = held.fromSpot - (event.clientX - held.fromX) / reach()
      mark.current = spot.current
      samples.current.push({ at: event.timeStamp, spot: spot.current })
      if (samples.current.length > SAMPLES) samples.current.shift()
      draw()
    }

    const up = (event: PointerEvent) => {
      const held = grab.current
      if (!held || held.id !== event.pointerId) return

      grab.current = null

      if (!held.live) {
        mark.current = Math.round(spot.current)
        return
      }

      delete node.dataset.dragging
      eaten.current = event.timeStamp

      const first = samples.current[0]
      const last = samples.current.at(-1)
      const span = first && last ? last.at - first.at : 0
      rate.current = first && last && span > 0 ? ((last.spot - first.spot) / span) * 1000 : 0
      land()
    }

    const click = (event: MouseEvent) => {
      if (eaten.current && event.timeStamp - eaten.current < SWALLOW) {
        eaten.current = 0
        event.preventDefault()
        event.stopPropagation()
        return
      }

      const gap = offset(event.target)
      if (gap === null || Math.abs(gap) < 0.5) return

      event.preventDefault()
      event.stopPropagation()
      mark.current = Math.round(spot.current + gap)
    }

    const enter = (event: FocusEvent) => {
      if (grab.current) return
      const gap = offset(event.target)
      if (gap !== null && Math.abs(gap) >= 0.5) mark.current = Math.round(spot.current + gap)
    }

    const halt = (event: Event) => event.preventDefault()

    node.addEventListener('pointerdown', down)
    document.addEventListener('pointermove', move)
    document.addEventListener('pointerup', up)
    document.addEventListener('pointercancel', up)
    node.addEventListener('click', click, true)
    node.addEventListener('focusin', enter)
    node.addEventListener('dragstart', halt)

    return () => {
      node.removeEventListener('pointerdown', down)
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerup', up)
      document.removeEventListener('pointercancel', up)
      node.removeEventListener('click', click, true)
      node.removeEventListener('focusin', enter)
      node.removeEventListener('dragstart', halt)
    }
  }, [draw, items, land, stir, tune])

  useEffect(() => {
    const region = lane.current
    if (!region || !loop) return

    const held = new Set<string>()
    let onscreen = false
    const watch = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1)
        if (entry) onscreen = entry.isIntersecting
      },
      { rootMargin: '-25% 0px -25% 0px' },
    )
    watch.observe(region)

    const key = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return

      const active = document.activeElement
      if (!region.contains(active)) {
        if (!onscreen) return
        if (active?.closest('input, textarea, select, [contenteditable]')) return
      }

      event.preventDefault()
      if (event.repeat) return

      held.add(event.key)
      hold(event.key === 'ArrowRight' ? 1 : -1)
    }

    const raise = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return

      held.delete(event.key)
      const rest = [...held].at(-1)
      if (rest) {
        hold(rest === 'ArrowRight' ? 1 : -1)
        return
      }

      lift()
    }

    const drop = () => {
      held.clear()
      lift()
    }

    document.addEventListener('keydown', key)
    document.addEventListener('keyup', raise)
    document.addEventListener('pointerup', lift)
    document.addEventListener('pointercancel', lift)
    window.addEventListener('blur', drop)

    return () => {
      drop()
      document.removeEventListener('keydown', key)
      document.removeEventListener('keyup', raise)
      document.removeEventListener('pointerup', lift)
      document.removeEventListener('pointercancel', lift)
      window.removeEventListener('blur', drop)
      watch.disconnect()
    }
  }, [hold, lift, loop])

  return (
    <div ref={lane} className="cover-flow-lane">
      <div
        ref={scroller}
        className="cover-flow"
        role="group"
        aria-label={label}
        tabIndex={loop ? 0 : -1}
      >
        <ul className="cover-flow-track">
          {slides.map((slide) => (
            <li key={slide.key} className={COVER_FLOW_ITEM}>
              <div className="cover-flow-stage">
                <div className="cover-flow-card">
                  {slide.front}
                  {slide.reflection ? (
                    <div aria-hidden="true" inert className="cover-flow-mirror">
                      {slide.reflection}
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {loop ? (
        <>
          <CoverFlowButton
            flow="previous"
            label={previousLabel}
            onHold={() => hold(-1)}
            onLift={lift}
            onStep={() => step(-1)}
          >
            <ArrowLeft className="size-5 lg:size-6" />
          </CoverFlowButton>
          <CoverFlowButton
            flow="next"
            label={nextLabel}
            onHold={() => hold(1)}
            onLift={lift}
            onStep={() => step(1)}
          >
            <ArrowRight className="size-5 lg:size-6" />
          </CoverFlowButton>
        </>
      ) : null}

      {action ? <div className="cover-flow-action">{action}</div> : null}
    </div>
  )
}

function CoverFlowButton({
  flow,
  label,
  onHold,
  onLift,
  onStep,
  children,
}: {
  flow: 'previous' | 'next'
  label: string
  onHold: () => void
  onLift: () => void
  onStep: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      data-flow={flow}
      data-print="hide"
      aria-label={label}
      onPointerDown={onHold}
      onPointerUp={onLift}
      onPointerLeave={onLift}
      onClick={(event) => {
        if (event.detail === 0) onStep()
      }}
      className="gilded-action cover-flow-arrow flex size-11 items-center justify-center rounded-full bg-ink text-paper transition-colors duration-300 hover:text-signal lg:size-14"
    >
      {children}
    </button>
  )
}
