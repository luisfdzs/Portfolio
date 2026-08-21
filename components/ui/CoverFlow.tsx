'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  announceCoverFlowMove,
  armCoverFlowItem,
  COVER_FLOW_ITEM,
  COVER_FLOW_STAGE,
  placeCard,
  XMB,
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

const COPIES = 3
const HOME = 1

const STACK_TOP = 100000

const GLIDE = 1100
const SETTLE = 520
const DRAG_MIN = 4
const FLICK = 160

const HOLD_RAMP = 0.65
const HOLD_FLOOR = 190
const HOLD_RETRY = 60

const REST = 0.0008
const CAST = 4
const SWALLOW = 400
const ARM_SPEED = 2.4
const SAMPLES = 5

const FOLLOW = 22
const COAST_FRICTION = 5.5
const COAST_FLOOR = 0.04
const COAST_CAP = 520
const TRAIL = 4
const STEP_CAP = 0.05

function soften(progress: number) {
  return progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2
}

export function CoverFlow({ slides, label, previousLabel, nextLabel, action }: Props) {
  const lane = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const glide = useRef(0)
  const gliding = useRef(false)
  const holding = useRef(false)
  const recenter = useRef<(() => void) | null>(null)
  const run = useRef<{ way: -1 | 1; strides: number } | null>(null)
  const waiter = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [locked, setLocked] = useState(false)
  const [stage, setStage] = useState(false)
  const loop = slides.length > 1
  const copies = loop ? COPIES : 1

  const spot = useRef(0)
  const mark = useRef(0)
  const rate = useRef(0)
  const grip = useRef<{ way: -1 | 1; since: number } | null>(null)
  const grab = useRef<{ id: number; fromX: number; fromSpot: number; live: boolean } | null>(null)
  const samples = useRef<{ at: number; spot: number }[]>([])
  const eaten = useRef(0)
  const armed = useRef(-1)

  useEffect(() => {
    const query = window.matchMedia(COVER_FLOW_STAGE)
    const sync = () => setStage(query.matches)

    sync()
    query.addEventListener('change', sync)

    return () => query.removeEventListener('change', sync)
  }, [])

  const homes = useCallback(() => {
    const node = scroller.current
    if (!node) return []

    return [...node.querySelectorAll<HTMLElement>(':scope > ul > li:not([data-clone])')]
  }, [])

  const draw = useCallback(() => {
    const items = homes()
    const count = items.length
    const width = items[0]?.offsetWidth
    if (!count || !width) return

    items.forEach((item, index) => {
      const raw = index - spot.current
      const gap = ((((raw + count / 2) % count) + count) % count) - count / 2
      const away = Math.abs(gap)
      const edge = XMB.visible + 1
      const hidden = away > edge

      item.style.visibility = hidden ? 'hidden' : 'visible'
      if (hidden) return

      const board = item.firstElementChild as HTMLElement | null
      if (!board) return

      const place = placeCard(gap)

      board.style.transform = `translate3d(${((place.x - index) * width).toFixed(2)}px, 0, ${(place.z * width).toFixed(2)}px) rotateY(${place.turn.toFixed(2)}deg) scale(${place.scale.toFixed(4)})`
      item.style.zIndex = String(Math.round(2000 - away * 100))
      item.style.setProperty('--cover-flow-shade', place.shade.toFixed(3))
      item.style.setProperty(
        '--cover-flow-gleam',
        Math.max(0, XMB.mirror * (1 - away / edge)).toFixed(3),
      )
    })
  }, [homes])

  const focus = useCallback((items: HTMLElement[], settled: boolean) => {
    const count = items.length
    if (!count) return

    const index = ((Math.round(spot.current) % count) + count) % count
    if (index === armed.current) return
    if (!settled && Math.abs(rate.current) > ARM_SPEED) return

    armed.current = index
    const item = items[index]
    if (item) armCoverFlowItem(item)
  }, [])

  const advance = useCallback(
    (step: number, now: number) => {
      const node = scroller.current
      if (!node || grab.current?.live) return

      const items = homes()
      const held = grip.current
      const away = Math.abs(mark.current - spot.current)

      if (!held && away < REST && Math.abs(rate.current) < REST) {
        if (rate.current !== 0 || away > 0) {
          rate.current = 0
          spot.current = mark.current
          draw()
          focus(items, true)
          announceCoverFlowMove(node)
        }
        return
      }

      if (held) {
        const age = (now - held.since) / 1000 - XMB.holdDelay
        if (age > 0) {
          const ramp = Math.min(1, age / XMB.holdRamp)
          mark.current += held.way * (1 + (XMB.holdTop - 1) * ramp * ramp) * step
        }
      }

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        spot.current = mark.current
        rate.current = 0
      } else {
        const damp = 2 * Math.sqrt(XMB.pull) * XMB.settle
        rate.current += ((mark.current - spot.current) * XMB.pull - rate.current * damp) * step
        spot.current += rate.current * step
      }

      draw()
      focus(items, false)
      announceCoverFlowMove(node)
    },
    [draw, focus, homes],
  )

  const stageLand = useCallback(() => {
    const cast = Math.max(-CAST, Math.min(CAST, rate.current * XMB.flick))
    mark.current = Math.round(spot.current + cast)
  }, [])

  const stagePress = useCallback((way: -1 | 1) => {
    const running = grip.current
    if (running && running.way === way) return

    grip.current = { way, since: performance.now() }
    mark.current = Math.round(spot.current) + way
  }, [])

  const stageRelease = useCallback(() => {
    if (!grip.current) return

    grip.current = null
    stageLand()
  }, [stageLand])

  const stageStep = useCallback((way: -1 | 1) => {
    grip.current = null
    mark.current = Math.round(spot.current) + way
  }, [])

  useEffect(() => {
    const node = scroller.current
    if (!stage || !node) return

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

    const anchor = () => {
      if (node.scrollLeft !== 0) node.scrollLeft = 0
    }

    const tick = (now: number) => {
      const step = Math.min((now - prev) / 1000, STEP_CAP)
      prev = now

      if (onscreen && !document.hidden) advance(step, now)

      id = requestAnimationFrame(tick)
    }

    draw()
    id = requestAnimationFrame(tick)
    node.addEventListener('scroll', anchor)

    return () => {
      cancelAnimationFrame(id)
      watch.disconnect()
      node.removeEventListener('scroll', anchor)
      grip.current = null
      grab.current = null
      armed.current = -1

      for (const item of homes()) {
        const board = item.firstElementChild as HTMLElement | null
        const card = board?.firstElementChild as HTMLElement | null
        item.style.removeProperty('visibility')
        item.style.removeProperty('z-index')
        item.style.removeProperty('--cover-flow-shade')
        item.style.removeProperty('--cover-flow-gleam')
        if (board) board.style.removeProperty('transform')
        if (card) card.style.removeProperty('transform')
      }
    }
  }, [advance, draw, homes, stage])

  useEffect(() => {
    const node = scroller.current
    if (!stage || !node) return

    const reach = () => XMB.gap * (homes()[0]?.offsetWidth || 1)

    const down = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return

      grip.current = null
      grab.current = {
        id: event.pointerId,
        fromX: event.clientX,
        fromSpot: spot.current,
        live: false,
      }
      samples.current = [{ at: event.timeStamp, spot: spot.current }]
      eaten.current = 0
    }

    const move = (event: PointerEvent) => {
      const held = grab.current
      if (!held || held.id !== event.pointerId) return

      if (!held.live) {
        if (Math.abs(event.clientX - held.fromX) < DRAG_MIN) return
        held.live = true
        node.dataset.dragging = ''
        document.getSelection()?.removeAllRanges()
      }

      spot.current = held.fromSpot - (event.clientX - held.fromX) / reach()
      mark.current = spot.current
      rate.current = 0
      samples.current.push({ at: event.timeStamp, spot: spot.current })
      if (samples.current.length > SAMPLES) samples.current.shift()
      draw()
    }

    const up = (event: PointerEvent) => {
      const held = grab.current
      if (!held || held.id !== event.pointerId) return

      grab.current = null
      if (!held.live) return

      eaten.current = event.timeStamp
      delete node.dataset.dragging

      const first = samples.current[0]
      const last = samples.current[samples.current.length - 1]
      const span = first && last ? last.at - first.at : 0
      rate.current = first && last && span > 0 ? ((last.spot - first.spot) / span) * 1000 : 0
      stageLand()
    }

    const block = (event: MouseEvent) => {
      if (eaten.current && event.timeStamp - eaten.current < SWALLOW) {
        eaten.current = 0
        event.preventDefault()
        event.stopPropagation()
        return
      }

      const item = (event.target as Element | null)?.closest(`.${COVER_FLOW_ITEM}`)
      if (!item) return

      const items = homes()
      const index = items.indexOf(item as HTMLElement)
      if (index < 0) return

      const count = items.length
      const raw = index - spot.current
      const gap = ((((raw + count / 2) % count) + count) % count) - count / 2
      if (Math.abs(gap) < 0.5) return

      event.preventDefault()
      event.stopPropagation()
      grip.current = null
      mark.current = Math.round(spot.current + gap)
    }

    const halt = (event: Event) => {
      if (grab.current?.live) event.preventDefault()
    }

    node.addEventListener('pointerdown', down)
    document.addEventListener('pointermove', move)
    document.addEventListener('pointerup', up)
    document.addEventListener('pointercancel', up)
    node.addEventListener('click', block, true)
    node.addEventListener('dragstart', halt)

    return () => {
      node.removeEventListener('pointerdown', down)
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerup', up)
      document.removeEventListener('pointercancel', up)
      node.removeEventListener('click', block, true)
      node.removeEventListener('dragstart', halt)
    }
  }, [draw, homes, stage, stageLand])

  useEffect(() => {
    const element = scroller.current
    if (!element || !loop || stage) return

    function metrics(node: HTMLElement) {
      const items = [...node.querySelectorAll<HTMLElement>(':scope > ul > li')]
      const perSet = items.length / COPIES
      const first = items[0]
      const second = items[perSet]
      const start = items[perSet * HOME]
      if (!first || !second || !start) return null

      return {
        set: second.offsetLeft - first.offsetLeft,
        home: start.offsetLeft + start.offsetWidth / 2 - node.clientWidth / 2,
      }
    }

    function rebase() {
      const node = scroller.current
      if (!node || holding.current || gliding.current) return
      const measures = metrics(node)
      if (!measures || measures.set <= 0) return

      const drift = node.scrollLeft - measures.home
      const wrapped = ((drift % measures.set) + measures.set) % measures.set
      if (Math.abs(wrapped - drift) > 1) node.scrollLeft = measures.home + wrapped
    }

    recenter.current = rebase

    const start = metrics(element)
    if (start) element.scrollLeft = start.home

    let idle: ReturnType<typeof setTimeout> | undefined
    function schedule() {
      clearTimeout(idle)
      idle = setTimeout(rebase, 140)
    }

    element.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      clearTimeout(idle)
      recenter.current = null
      element.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [loop, stage])

  useEffect(() => {
    const element = scroller.current
    if (!element || stage) return

    let frame = 0

    function stack() {
      frame = 0
      const node = scroller.current
      if (!node) return

      const middle = node.scrollLeft + node.clientWidth / 2
      for (const item of node.querySelectorAll<HTMLElement>(':scope > ul > li')) {
        const offset = Math.abs(item.offsetLeft + item.offsetWidth / 2 - middle)
        const depth = String(Math.max(1, Math.round(STACK_TOP - offset)))
        if (item.style.zIndex !== depth) item.style.zIndex = depth
      }
    }

    function schedule() {
      if (frame) return
      frame = requestAnimationFrame(stack)
    }

    stack()
    element.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      cancelAnimationFrame(frame)
      element.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [stage])

  const slide = useCallback((to: number, span: number, done?: () => void) => {
    const element = scroller.current
    if (!element) return

    cancelAnimationFrame(glide.current)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element.style.scrollSnapType = ''
      element.scrollLeft = to
      holding.current = false
      done?.()
      return
    }

    const from = element.scrollLeft
    const reach = to - from
    const started = performance.now()
    element.style.scrollSnapType = 'none'
    gliding.current = true
    setLocked(!run.current)

    const step = (now: number) => {
      const progress = Math.min((now - started) / span, 1)
      element.scrollLeft = from + reach * soften(progress)

      if (progress < 1) {
        glide.current = requestAnimationFrame(step)
        return
      }

      element.style.scrollSnapType = ''
      gliding.current = false
      holding.current = false
      setLocked(false)
      done?.()
    }

    glide.current = requestAnimationFrame(step)
  }, [])

  const go = useCallback(
    (direction: -1 | 1, span = GLIDE, done?: () => void) => {
      if (gliding.current) return false

      const element = scroller.current
      if (!element) return false

      const items = [...element.querySelectorAll<HTMLElement>(':scope > ul > li')]
      const centre = (item: HTMLElement) => item.offsetLeft + item.offsetWidth / 2
      const middle = element.scrollLeft + element.clientWidth / 2
      const target =
        direction === 1
          ? items.find((item) => centre(item) > middle + 2)
          : items.reverse().find((item) => centre(item) < middle - 2)

      if (!target) return false

      armCoverFlowItem(target)
      slide(centre(target) - element.clientWidth / 2, span, done)
      return true
    },
    [slide],
  )

  const press = useCallback(
    (way: -1 | 1) => {
      const active = run.current
      if (active) {
        if (active.way !== way) {
          active.way = way
          active.strides = 0
        }
        return
      }

      const mine = { way, strides: 0 }

      const chain = () => {
        if (run.current !== mine) return

        if (gliding.current) {
          waiter.current = setTimeout(chain, HOLD_RETRY)
          return
        }

        const span =
          mine.strides === 0 ? GLIDE : Math.max(HOLD_FLOOR, GLIDE * HOLD_RAMP ** mine.strides)
        mine.strides += 1
        recenter.current?.()
        if (!go(mine.way, span, chain)) run.current = null
      }

      run.current = mine
      chain()
    },
    [go],
  )

  const release = useCallback(() => {
    clearTimeout(waiter.current)
    waiter.current = undefined
    run.current = null
  }, [])

  const hold = useCallback(
    (way: -1 | 1) => {
      if (stage) stagePress(way)
      else press(way)
    },
    [press, stage, stagePress],
  )

  const lift = useCallback(() => {
    if (stage) stageRelease()
    else release()
  }, [release, stage, stageRelease])

  const step = useCallback(
    (way: -1 | 1) => {
      if (stage) stageStep(way)
      else go(way)
    },
    [go, stage, stageStep],
  )

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
    window.addEventListener('blur', drop)

    return () => {
      drop()
      document.removeEventListener('keydown', key)
      document.removeEventListener('keyup', raise)
      window.removeEventListener('blur', drop)
      watch.disconnect()
    }
  }, [hold, lift, loop])

  useEffect(() => {
    const element = scroller.current
    if (!element || stage) return

    let pointer = 0
    let originX = 0
    let originScroll = 0
    let target = 0
    let current = 0
    let stamp = 0
    let frame = 0
    let velocity = 0
    let coasting = false
    let coastFrom = 0
    let dragging = false
    let swallow = false
    const trail: { x: number; at: number }[] = []

    const calm = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const nearest = (to: number) => {
      const items = [...element.querySelectorAll<HTMLElement>(':scope > ul > li')]
      const middle = to + element.clientWidth / 2
      const gap = (item: HTMLElement) => Math.abs(item.offsetLeft + item.offsetWidth / 2 - middle)

      return items.reduce<HTMLElement | null>(
        (closest, item) => (!closest || gap(item) < gap(closest) ? item : closest),
        null,
      )
    }

    const sampled = () => {
      const first = trail[0]
      const last = trail[trail.length - 1]
      if (!first || !last) return 0
      const span = last.at - first.at
      return span > 0 ? -(last.x - first.x) / span : 0
    }

    const land = () => {
      cancelAnimationFrame(frame)
      frame = 0
      coasting = false

      const item = nearest(current + velocity * FLICK)
      if (!item) {
        holding.current = false
        element.style.scrollSnapType = ''
        return
      }

      holding.current = false
      armCoverFlowItem(item)
      slide(item.offsetLeft + item.offsetWidth / 2 - element.clientWidth / 2, SETTLE)
    }

    const step = (now: number) => {
      const dt = Math.min((now - stamp) / 1000, STEP_CAP)
      stamp = now

      if (coasting) {
        target += velocity * dt * 1000
        velocity *= Math.exp(-COAST_FRICTION * dt)
      }

      current += (target - current) * (1 - Math.exp(-FOLLOW * dt))
      element.scrollLeft = current

      if (coasting && (Math.abs(velocity) < COAST_FLOOR || now - coastFrom > COAST_CAP)) {
        land()
        return
      }

      frame = requestAnimationFrame(step)
    }

    const run = () => {
      if (frame) return
      stamp = performance.now()
      frame = requestAnimationFrame(step)
    }

    const down = (event: PointerEvent) => {
      swallow = false
      if (event.pointerType !== 'mouse' || event.button !== 0) return

      cancelAnimationFrame(glide.current)
      cancelAnimationFrame(frame)
      frame = 0
      gliding.current = false
      coasting = false
      pointer = event.pointerId
      originX = event.clientX
      originScroll = element.scrollLeft
      current = element.scrollLeft
      target = element.scrollLeft
      velocity = 0
      dragging = false
      trail.length = 0
      trail.push({ x: event.clientX, at: event.timeStamp })
    }

    const move = (event: PointerEvent) => {
      if (!pointer || event.pointerId !== pointer) return

      const shift = event.clientX - originX
      if (!dragging) {
        if (Math.abs(shift) < DRAG_MIN) return
        dragging = true
        holding.current = true
        element.setPointerCapture(pointer)
        element.dataset.dragging = ''
        element.style.scrollSnapType = 'none'
        document.getSelection()?.removeAllRanges()
        originX = event.clientX
        originScroll = current
        trail.length = 0
      }

      const coalesced = event.getCoalescedEvents?.() ?? []
      const samples = coalesced.length ? coalesced : [event]
      for (const sample of samples) {
        trail.push({ x: sample.clientX, at: sample.timeStamp })
      }
      if (trail.length > TRAIL) trail.splice(0, trail.length - TRAIL)

      target = originScroll - (event.clientX - originX)

      if (calm()) {
        current = target
        element.scrollLeft = target
        return
      }

      run()
    }

    const up = (event: PointerEvent) => {
      if (!pointer || event.pointerId !== pointer) return

      pointer = 0
      if (!dragging) return

      dragging = false
      swallow = true
      delete element.dataset.dragging
      if (element.hasPointerCapture(event.pointerId)) {
        element.releasePointerCapture(event.pointerId)
      }

      velocity = sampled()

      if (calm()) {
        land()
        return
      }

      coasting = true
      coastFrom = performance.now()
      run()
    }

    const block = (event: Event) => {
      if (!swallow) return
      swallow = false
      event.preventDefault()
      event.stopPropagation()
    }

    const halt = (event: Event) => {
      if (dragging) event.preventDefault()
    }

    element.addEventListener('pointerdown', down)
    element.addEventListener('pointermove', move)
    element.addEventListener('pointerup', up)
    element.addEventListener('pointercancel', up)
    element.addEventListener('click', block, true)
    element.addEventListener('dragstart', halt)

    return () => {
      cancelAnimationFrame(frame)
      holding.current = false
      element.removeEventListener('pointerdown', down)
      element.removeEventListener('pointermove', move)
      element.removeEventListener('pointerup', up)
      element.removeEventListener('pointercancel', up)
      element.removeEventListener('click', block, true)
      element.removeEventListener('dragstart', halt)
    }
  }, [slide, stage])

  useEffect(() => {
    document.addEventListener('pointerup', lift)
    document.addEventListener('pointercancel', lift)

    return () => {
      document.removeEventListener('pointerup', lift)
      document.removeEventListener('pointercancel', lift)
    }
  }, [lift])

  useEffect(
    () => () => {
      cancelAnimationFrame(glide.current)
      clearTimeout(waiter.current)
      gliding.current = false
      run.current = null
    },
    [],
  )

  return (
    <div ref={lane} className="cover-flow-lane">
      <div
        ref={scroller}
        className="cover-flow"
        data-mode={stage ? 'stage' : 'scroll'}
        role="group"
        aria-label={label}
        tabIndex={loop ? 0 : -1}
      >
        <ul className="cover-flow-track">
          {Array.from({ length: copies }, (_, copy) =>
            slides.map((slide) => (
              <li
                key={`${copy}-${slide.key}`}
                className={COVER_FLOW_ITEM}
                data-clone={copy === HOME ? undefined : ''}
                inert={copy !== HOME}
              >
                <div className="cover-flow-stage">
                  <div className="cover-flow-card">
                    {slide.front}
                    {stage && slide.reflection && copy === HOME ? (
                      <div aria-hidden="true" inert className="cover-flow-mirror">
                        {slide.reflection}
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
            )),
          )}
        </ul>
      </div>

      {loop ? (
        <>
          <CoverFlowButton
            flow="previous"
            label={previousLabel}
            locked={stage ? false : locked}
            onHold={() => hold(-1)}
            onLift={lift}
            onStep={() => step(-1)}
          >
            <ArrowLeft className="size-5 lg:size-6" />
          </CoverFlowButton>
          <CoverFlowButton
            flow="next"
            label={nextLabel}
            locked={stage ? false : locked}
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
  locked,
  onHold,
  onLift,
  onStep,
  children,
}: {
  flow: 'previous' | 'next'
  label: string
  locked: boolean
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
      disabled={locked}
      onPointerDown={onHold}
      onPointerUp={onLift}
      onPointerLeave={onLift}
      onClick={(event) => {
        if (event.detail === 0) onStep()
      }}
      className="cover-flow-arrow flex size-11 items-center justify-center rounded-full border border-signal bg-ink text-signal shadow-[0_0_0_1px_var(--color-ink),0_10px_30px_-8px_var(--color-ink)] transition-colors duration-300 hover:bg-signal hover:text-ink disabled:cursor-default disabled:border-signal-dim disabled:bg-ink disabled:text-signal-dim lg:size-14"
    >
      {children}
    </button>
  )
}
