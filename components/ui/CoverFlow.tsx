'use client'

import { Children, useCallback, useEffect, useRef, type ReactNode } from 'react'
import { armCoverFlowItem, COVER_FLOW_ITEM } from '@/lib/cover-flow'
import { ArrowLeft, ArrowRight } from './Icons'

type Props = {
  children: ReactNode
  label: string
  previousLabel: string
  nextLabel: string
}

const COPIES = 3
const HOME = 1

const STACK_TOP = 100000

export function CoverFlow({ children, label, previousLabel, nextLabel }: Props) {
  const scroller = useRef<HTMLDivElement>(null)
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

  const go = useCallback((direction: -1 | 1) => {
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

    element.scrollTo({
      left: centre(target) - element.clientWidth / 2,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }, [])

  return (
    <div>
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
        <div data-print="hide" className="mt-6 flex justify-center gap-2 lg:mt-8">
          <CoverFlowButton label={previousLabel} onClick={() => go(-1)}>
            <ArrowLeft className="size-4" />
          </CoverFlowButton>
          <CoverFlowButton label={nextLabel} onClick={() => go(1)}>
            <ArrowRight className="size-4" />
          </CoverFlowButton>
        </div>
      ) : null}
    </div>
  )
}

function CoverFlowButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-10 items-center justify-center rounded-full border border-line-strong text-paper transition-colors duration-300 hover:border-signal hover:text-signal"
    >
      {children}
    </button>
  )
}
