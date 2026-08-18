'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { COVER_FLOW_ARM, COVER_FLOW_ITEM } from '@/lib/cover-flow'
import { ProjectLoader, loaderCycle } from '@/components/ui/ProjectLoader'

type ProjectClip = { desktop?: string; mobile?: string }
type ProjectFrame = { top: number; left: number; width: number; height: number }
type ProjectLayer = { src: string; frame: ProjectFrame }
type ProjectMark = {
  src: string
  rect: ProjectFrame
  box: { width: number; height: number }
  animation: string
  keyframes: string
}
type ProjectSide = { src: string; clips: ProjectLayer[]; mark?: ProjectMark }
type ProjectChrome = { desktop?: ProjectSide; mobile?: ProjectSide }

const WIDE = '(min-width: 48rem)'
const BLANK_SD = 4
const MAX_WARM = 2500
const SAMPLE = { width: 32, height: 18 }
const FADE_OUT = 700
const ARM_HOLD = 1400
const MIN_COVER = 520
const GLITCH = 'project-glitch'
const LAYER = 'project-layer'

function frameSpread(pixels: Uint8ClampedArray) {
  const light: number[] = []
  for (let i = 0; i < pixels.length; i += 4) {
    const red = pixels[i] ?? 0
    const green = pixels[i + 1] ?? 0
    const blue = pixels[i + 2] ?? 0
    light.push(red * 0.299 + green * 0.587 + blue * 0.114)
  }

  const mean = light.reduce((total, value) => total + value, 0) / light.length
  const spread = light.reduce((total, value) => total + (value - mean) ** 2, 0) / light.length
  return Math.sqrt(spread)
}

export function ProjectMedia({
  src,
  chrome,
  slug,
  label,
  children,
}: {
  src: ProjectClip
  chrome?: ProjectChrome
  slug: string
  label: string
  children: ReactNode
}) {
  const container = useRef<HTMLDivElement>(null)
  const stack = useRef<(HTMLVideoElement | null)[]>([])
  const badge = useRef<HTMLImageElement>(null)
  const opening = useRef(0)
  const held = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [painted, setPainted] = useState(false)
  const [covering, setCovering] = useState(false)
  const [settled, setSettled] = useState(false)
  const [overlay, setOverlay] = useState<string | null>(null)
  const [mark, setMark] = useState<ProjectMark | null>(null)
  const [band, setBand] = useState({ head: 0, foot: 0 })

  const depth = Math.max(
    1,
    chrome?.desktop?.clips.length ?? 0,
    chrome?.mobile?.clips.length ?? 0,
  )

  useEffect(() => {
    const node = container.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const wide = window.matchMedia(WIDE)
    const video = { current: null as HTMLVideoElement | null }

    function live() {
      return stack.current.filter((element): element is HTMLVideoElement => {
        if (!element) return false
        return element.style.display !== 'none'
      })
    }

    function pickSource() {
      const side = wide.matches ? chrome?.desktop : chrome?.mobile
      const plain = wide.matches ? src.desktop : src.mobile
      const layers = side?.clips ?? (plain ? [{ src: plain, frame: null }] : [])
      setOverlay(side && layers.length ? side.src : null)
      setMark(side?.mark ?? null)
      const edges = layers.map((item) => item.frame).filter((frame) => frame !== null)
      setBand({
        head: edges.length ? Math.max(0, Math.min(...edges.map((frame) => frame.top))) : 0,
        foot: edges.length
          ? Math.max(0, 100 - Math.max(...edges.map((frame) => frame.top + frame.height)))
          : 0,
      })

      stack.current.forEach((element, index) => {
        if (!element) return
        const layer = layers[index]
        if (!layer) {
          element.style.display = 'none'
          element.pause()
          return
        }

        element.style.display = ''
        if (!element.src.endsWith(layer.src)) element.src = layer.src
        if (!layer.frame) return

        element.style.top = `${layer.frame.top}%`
        element.style.left = `${layer.frame.left}%`
        element.style.width = `${layer.frame.width}%`
        element.style.height = `${layer.frame.height}%`
        element.style.right = 'auto'
        element.style.bottom = 'auto'
        element.style.objectPosition = 'center'
      })

      video.current = live()[0] ?? null
    }
    pickSource()
    wide.addEventListener('change', pickSource)

    const sampler = document.createElement('canvas')
    sampler.width = SAMPLE.width
    sampler.height = SAMPLE.height
    const paint = sampler.getContext('2d', { willReadFrequently: true })

    let look = 0
    let rewind = 0
    let warmFrom = 0
    let coveredAt = 0
    let show = 0
    let wanted = false

    let glitch = 0

    function span() {
      const found = /(\d*\.?\d+)(ms|s)/.exec(badge.current?.dataset.glitch ?? '')
      return found ? Number(found[1]) * (found[2] === 's' ? 1000 : 1) : 0
    }

    function flash() {
      const element = badge.current
      const shorthand = element?.dataset.glitch
      const box = container.current
      if (!element || !shorthand) return

      if (box) {
        box.classList.remove(GLITCH)
        void box.offsetHeight
        box.style.setProperty('--glitch-span', `${span()}ms`)
        box.classList.add(GLITCH)
      }

      element.style.animation = 'none'
      void element.offsetHeight
      element.style.animation = shorthand
    }

    function queue() {
      window.clearTimeout(glitch)

      const element = video.current
      if (!element || !span() || !Number.isFinite(element.duration)) return

      const left = (element.duration - element.currentTime) * 1000 - span()
      glitch = window.setTimeout(flash, Math.max(0, left))
    }

    function hold() {
      held.current = true
      setPainted(true)
      setSettled(true)
    }

    function reveal() {
      const now = performance.now()
      const cycle = loaderCycle(slug)
      const turns = Math.ceil((Math.max(now, coveredAt + MIN_COVER) - coveredAt) / cycle)
      const left = Math.max(0, coveredAt + turns * cycle - now)
      if (!left) return hold()
      window.clearTimeout(show)
      show = window.setTimeout(hold, left)
    }

    function sample() {
      look = 0
      const element = video.current
      if (!element || !paint) return reveal()
      if (performance.now() - warmFrom > MAX_WARM) return reveal()

      try {
        paint.drawImage(element, 0, 0, SAMPLE.width, SAMPLE.height)
        const frame = paint.getImageData(0, 0, SAMPLE.width, SAMPLE.height)
        if (frameSpread(frame.data) > BLANK_SD) {
          opening.current = element.currentTime
          return reveal()
        }
      } catch {
        return reveal()
      }

      look = window.setTimeout(sample, 80)
    }

    function start() {
      const element = video.current
      if (!element) return

      window.clearTimeout(rewind)
      rewind = 0
      wanted = true

      if (!held.current) {
        if (!coveredAt) coveredAt = performance.now()
        flushSync(() => setCovering(true))
      }

      for (const other of live()) if (other !== element) void other.play().catch(() => {})

      element.play().then(
        () => {
          setPlaying(true)
          queue()
          if (held.current) return
          warmFrom = performance.now()
          sample()
        },
        () => {
          setPlaying(false)
          setCovering(false)
        },
      )
    }

    function stop() {
      const element = video.current
      window.clearTimeout(look)
      window.clearTimeout(show)
      window.clearTimeout(glitch)
      look = 0
      coveredAt = 0
      wanted = false
      setPlaying(false)
      setCovering(false)
      if (!held.current) setPainted(false)
      if (!element) return

      for (const other of live()) other.pause()
      window.clearTimeout(rewind)
      if (held.current) return

      rewind = window.setTimeout(() => {
        for (const other of live()) other.currentTime = opening.current
      }, FADE_OUT)
    }

    function again() {
      const element = video.current
      if (!element || !wanted) return
      for (const other of live()) {
        other.currentTime = opening.current
        void other.play().catch(() => {})
      }
      queue()
    }

    const clip = video.current
    clip?.addEventListener('ended', again)

    const scroller = node.closest('.cover-flow')

    if (!scroller) {
      const element = video.current
      if (!element) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return
          if (entry.isIntersecting) start()
          else stop()
        },
        { threshold: 0.4 },
      )
      observer.observe(node)

      return () => {
        wide.removeEventListener('change', pickSource)
        observer.disconnect()
        window.clearTimeout(look)
        window.clearTimeout(show)
        window.clearTimeout(rewind)
        window.clearTimeout(glitch)
        element.removeEventListener('ended', again)
        element.pause()
      }
    }

    let frame = 0
    let active: boolean | null = null
    let armedAt = 0
    let expiry = 0

    function centred() {
      const node = container.current
      if (!node || !scroller) return false

      const card = node.getBoundingClientRect()
      const view = scroller.getBoundingClientRect()
      if (card.width === 0) return false

      const offset = Math.abs(card.left + card.width / 2 - (view.left + view.width / 2))
      return offset < card.width * 0.2 && card.bottom > 0 && card.top < window.innerHeight
    }

    function sync() {
      frame = 0
      const element = video.current
      if (!element) return

      const next = centred()
      if (next) armedAt = 0
      if (next === active) return
      if (!next && armedAt && performance.now() - armedAt < ARM_HOLD) return
      active = next

      if (next) start()
      else stop()
    }

    function schedule() {
      if (frame) return
      frame = requestAnimationFrame(sync)
    }

    function arm() {
      armedAt = performance.now()
      active = true
      start()
      window.clearTimeout(expiry)
      expiry = window.setTimeout(schedule, ARM_HOLD + 20)
    }

    const item = node.closest(`.${COVER_FLOW_ITEM}`)
    item?.addEventListener(COVER_FLOW_ARM, arm)

    sync()
    scroller.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(look)
      window.clearTimeout(show)
      window.clearTimeout(rewind)
      window.clearTimeout(expiry)
      window.clearTimeout(glitch)
      item?.removeEventListener(COVER_FLOW_ARM, arm)
      clip?.removeEventListener('ended', again)
      wide.removeEventListener('change', pickSource)
      scroller.removeEventListener('scroll', schedule)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [slug, src.desktop, src.mobile, chrome])

  useEffect(() => {
    const node = container.current
    if (!node || !mark) return

    function fit() {
      if (!node || !mark) return
      node.style.setProperty('--mark-scale', String(node.clientWidth / mark.box.width))
    }

    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(node)
    return () => observer.disconnect()
  }, [mark])

  const visible =
    settled || (playing && painted) ? 'opacity-100 duration-0' : 'opacity-0 duration-700'
  const layer = 'absolute inset-0 size-full object-cover object-top md:object-center'

  return (
    <div
      ref={container}
      style={
        { '--glitch-head': `${band.head}%`, '--glitch-foot': `${band.foot}%` } as CSSProperties
      }
      className="relative overflow-hidden"
    >
      {children}

      {Array.from({ length: depth }, (_, index) => (
        <video
          key={index}
          ref={(element) => {
            stack.current[index] = element
          }}
          aria-label={index ? undefined : label}
          aria-hidden={index ? true : undefined}
          muted
          playsInline
          preload="none"
          tabIndex={-1}
          className={`${layer} ${LAYER} transition-opacity ${visible}`}
        />
      ))}

      {overlay ? (
        <>
          <div
            className="absolute inset-0"
            style={{ clipPath: `inset(${band.head}% 0 ${band.foot}% 0)` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={overlay}
              alt=""
              aria-hidden
              loading="lazy"
              className={`${layer} ${LAYER} transition-opacity ${visible}`}
            />
          </div>

          {band.head ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={overlay}
              alt=""
              aria-hidden
              loading="lazy"
              style={{ clipPath: `inset(0 0 ${100 - band.head}% 0)` }}
              className={`${layer} transition-opacity ${visible}`}
            />
          ) : null}

          {band.foot ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={overlay}
              alt=""
              aria-hidden
              loading="lazy"
              style={{ clipPath: `inset(${100 - band.foot}% 0 0 0)` }}
              className={`${layer} transition-opacity ${visible}`}
            />
          ) : null}
        </>
      ) : null}

      {mark ? (
        <>
          <style>{mark.keyframes}</style>
          <div
            aria-hidden
            className={`${LAYER} pointer-events-none absolute inset-0 overflow-hidden transition-opacity ${visible}`}
          >
            <div
              className="relative"
              style={{
                width: mark.box.width,
                height: mark.box.height,
                transform: 'scale(var(--mark-scale, 1))',
                transformOrigin: 'top left',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={badge}
                src={mark.src}
                alt=""
                loading="lazy"
                data-glitch={mark.animation}
                className="absolute"
                style={{
                  top: mark.rect.top,
                  left: mark.rect.left,
                  width: mark.rect.width,
                  height: mark.rect.height,
                  opacity: 0,
                }}
              />
            </div>
          </div>
        </>
      ) : null}

      {covering ? (
        <ProjectLoader slug={slug} leaving={painted} className="pointer-events-none" />
      ) : null}
    </div>
  )
}
