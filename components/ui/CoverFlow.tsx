'use client'

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { armCoverFlowItem, COVER_FLOW_ITEM } from '@/lib/cover-flow'
import { ArrowLeft, ArrowRight } from './Icons'

type Props = {
  children: ReactNode
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

function soften(progress: number) {
  return progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2
}

export function CoverFlow({ children, label, previousLabel, nextLabel, action }: Props) {
  const scroller = useRef<HTMLDivElement>(null)
  const glide = useRef(0)
  const gliding = useRef(false)
  const [locked, setLocked] = useState(false)
  const cards = Children.toArray(children)
  const loop = cards.length > 1
  const copies = loop ? COPIES : 1

  useEffect(() => {
    const element = scroller.current
    if (!element || !loop) return

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
      if (!node) return
      const measures = metrics(node)
      if (!measures || measures.set <= 0) return

      const drift = node.scrollLeft - measures.home
      const wrapped = ((drift % measures.set) + measures.set) % measures.set
      if (Math.abs(wrapped - drift) > 1) node.scrollLeft = measures.home + wrapped
    }

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
      element.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [loop])

  useEffect(() => {
    const element = scroller.current
    if (!element) return

    let frame = 0

    function stack() {
      frame = 0
      const node = scroller.current
      if (!node) return

      const middle = node.scrollLeft + node.clientWidth / 2
      for (const item of node.querySelectorAll<HTMLElement>(':scope > ul > li')) {
        const offset = Math.abs(item.offsetLeft + item.offsetWidth / 2 - middle)
        item.style.zIndex = String(Math.max(1, Math.round(STACK_TOP - offset)))
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
  }, [])

  const slide = useCallback((to: number, span: number) => {
    const element = scroller.current
    if (!element) return

    cancelAnimationFrame(glide.current)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element.style.scrollSnapType = ''
      element.scrollLeft = to
      return
    }

    const from = element.scrollLeft
    const reach = to - from
    const started = performance.now()
    element.style.scrollSnapType = 'none'
    gliding.current = true
    setLocked(true)

    const step = (now: number) => {
      const progress = Math.min((now - started) / span, 1)
      element.scrollLeft = from + reach * soften(progress)

      if (progress < 1) {
        glide.current = requestAnimationFrame(step)
        return
      }

      element.style.scrollSnapType = ''
      gliding.current = false
      setLocked(false)
    }

    glide.current = requestAnimationFrame(step)
  }, [])

  const go = useCallback(
    (direction: -1 | 1) => {
      if (gliding.current) return

      const element = scroller.current
      if (!element) return

      const items = [...element.querySelectorAll<HTMLElement>(':scope > ul > li')]
      const centre = (item: HTMLElement) => item.offsetLeft + item.offsetWidth / 2
      const middle = element.scrollLeft + element.clientWidth / 2
      const target =
        direction === 1
          ? items.find((item) => centre(item) > middle + 2)
          : items.reverse().find((item) => centre(item) < middle - 2)

      if (!target) return

      armCoverFlowItem(target)
      slide(centre(target) - element.clientWidth / 2, GLIDE)
    },
    [slide],
  )

  useEffect(() => {
    const element = scroller.current
    if (!element) return

    let pointer = 0
    let originX = 0
    let originScroll = 0
    let lastX = 0
    let lastAt = 0
    let speed = 0
    let dragging = false
    let swallow = false

    const nearest = (to: number) => {
      const items = [...element.querySelectorAll<HTMLElement>(':scope > ul > li')]
      const middle = to + element.clientWidth / 2
      const gap = (item: HTMLElement) => Math.abs(item.offsetLeft + item.offsetWidth / 2 - middle)

      return items.reduce<HTMLElement | null>(
        (closest, item) => (!closest || gap(item) < gap(closest) ? item : closest),
        null,
      )
    }

    const down = (event: PointerEvent) => {
      swallow = false
      if (event.pointerType !== 'mouse' || event.button !== 0) return

      cancelAnimationFrame(glide.current)
      gliding.current = false
      pointer = event.pointerId
      originX = event.clientX
      originScroll = element.scrollLeft
      lastX = event.clientX
      lastAt = event.timeStamp
      speed = 0
      dragging = false
    }

    const move = (event: PointerEvent) => {
      if (!pointer || event.pointerId !== pointer) return

      const shift = event.clientX - originX
      if (!dragging) {
        if (Math.abs(shift) < DRAG_MIN) return
        dragging = true
        element.setPointerCapture(pointer)
        element.dataset.dragging = ''
        element.style.scrollSnapType = 'none'
        document.getSelection()?.removeAllRanges()
      }

      const gap = event.timeStamp - lastAt
      if (gap > 0) speed = (event.clientX - lastX) / gap
      lastX = event.clientX
      lastAt = event.timeStamp
      element.scrollLeft = originScroll - shift
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

      const target = nearest(element.scrollLeft - speed * FLICK)
      if (!target) {
        element.style.scrollSnapType = ''
        return
      }

      armCoverFlowItem(target)
      slide(target.offsetLeft + target.offsetWidth / 2 - element.clientWidth / 2, SETTLE)
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
      element.removeEventListener('pointerdown', down)
      element.removeEventListener('pointermove', move)
      element.removeEventListener('pointerup', up)
      element.removeEventListener('pointercancel', up)
      element.removeEventListener('click', block, true)
      element.removeEventListener('dragstart', halt)
    }
  }, [slide])

  useEffect(
    () => () => {
      cancelAnimationFrame(glide.current)
      gliding.current = false
    },
    [],
  )

  return (
    <div className="cover-flow-lane">
      <div ref={scroller} className="cover-flow">
        <ul aria-label={label} className="cover-flow-track">
          {Array.from({ length: copies }, (_, copy) =>
            cards.map((card, index) => (
              <li
                key={`${copy}-${index}`}
                className={COVER_FLOW_ITEM}
                data-clone={copy === HOME ? undefined : ''}
                inert={copy !== HOME}
              >
                <div className="cover-flow-stage">
                  <div className="cover-flow-card">{card}</div>
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
            locked={locked}
            onClick={() => go(-1)}
          >
            <ArrowLeft className="size-5 lg:size-6" />
          </CoverFlowButton>
          <CoverFlowButton flow="next" label={nextLabel} locked={locked} onClick={() => go(1)}>
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
  onClick,
  children,
}: {
  flow: 'previous' | 'next'
  label: string
  locked: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      data-flow={flow}
      data-print="hide"
      aria-label={label}
      disabled={locked}
      onClick={onClick}
      className="cover-flow-arrow flex size-11 items-center justify-center rounded-full border border-signal bg-ink text-signal shadow-[0_0_0_1px_var(--color-ink),0_10px_30px_-8px_var(--color-ink)] transition-colors duration-300 hover:bg-signal hover:text-ink disabled:cursor-default disabled:border-signal-dim disabled:bg-ink disabled:text-signal-dim lg:size-14"
    >
      {children}
    </button>
  )
}
