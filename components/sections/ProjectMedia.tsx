'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { COVER_FLOW_ARM, COVER_FLOW_ITEM } from '@/lib/cover-flow'
import { ProjectLoader, loaderCycle } from '@/components/ui/ProjectLoader'

type ProjectClip = { desktop: string; mobile: string }

const WIDE = '(min-width: 48rem)'
const BLANK_SD = 4
const MAX_WARM = 2500
const SAMPLE = { width: 32, height: 18 }
const FADE_OUT = 700
const ARM_HOLD = 1400
const MIN_COVER = 520

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
  slug,
  label,
  children,
}: {
  src: ProjectClip
  slug: string
  label: string
  children: ReactNode
}) {
  const container = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const opening = useRef(0)
  const [playing, setPlaying] = useState(false)
  const [painted, setPainted] = useState(false)
  const [covering, setCovering] = useState(false)

  useEffect(() => {
    const node = container.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const wide = window.matchMedia(WIDE)
    function pickSource() {
      const element = video.current
      if (!element) return
      const next = wide.matches ? src.desktop : src.mobile
      if (!element.src.endsWith(next)) element.src = next
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

    function reveal() {
      const now = performance.now()
      const cycle = loaderCycle(slug)
      const turns = Math.ceil((Math.max(now, coveredAt + MIN_COVER) - coveredAt) / cycle)
      const left = Math.max(0, coveredAt + turns * cycle - now)
      if (!left) return setPainted(true)
      window.clearTimeout(show)
      show = window.setTimeout(() => setPainted(true), left)
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
      if (!coveredAt) coveredAt = performance.now()
      setCovering(true)

      element.play().then(
        () => {
          setPlaying(true)
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
      look = 0
      coveredAt = 0
      wanted = false
      setPlaying(false)
      setPainted(false)
      setCovering(false)
      if (!element) return

      element.pause()
      window.clearTimeout(rewind)
      rewind = window.setTimeout(() => {
        const node = video.current
        if (node) node.currentTime = opening.current
      }, FADE_OUT)
    }

    function again() {
      const element = video.current
      if (!element || !wanted) return
      element.currentTime = opening.current
      void element.play()
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
      item?.removeEventListener(COVER_FLOW_ARM, arm)
      clip?.removeEventListener('ended', again)
      wide.removeEventListener('change', pickSource)
      scroller.removeEventListener('scroll', schedule)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [slug, src.desktop, src.mobile])

  return (
    <div ref={container} className="relative">
      {children}

      <video
        ref={video}
        aria-label={label}
        muted
        playsInline
        preload="none"
        tabIndex={-1}
        className={`absolute inset-0 size-full rounded-lg object-cover object-top transition-opacity md:object-center ${
          playing && painted ? 'opacity-100 duration-0' : 'opacity-0 duration-700'
        }`}
      />

      {covering ? (
        <ProjectLoader slug={slug} leaving={painted} className="pointer-events-none rounded-lg" />
      ) : null}
    </div>
  )
}
