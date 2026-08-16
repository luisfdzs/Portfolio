'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type ProjectClip = { desktop: string; mobile: string }

// Por debajo de este ancho la tarjeta es vertical y toca la toma de móvil.
const WIDE = '(min-width: 48rem)'

// Reproduce el hero animado del proyecto sólo cuando su tarjeta es la centrada en el
// carrusel: el resto del tiempo se ve el póster, que es el mismo <Figure> del servidor.
export function ProjectMedia({
  src,
  label,
  children,
}: {
  src: ProjectClip
  label: string
  children: ReactNode
}) {
  const container = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

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

    const scroller = node.closest('.cover-flow')

    if (!scroller) {
      const element = video.current
      if (!element) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return
          if (entry.isIntersecting) {
            element.play().then(
              () => setPlaying(true),
              () => setPlaying(false),
            )
          } else {
            element.pause()
            element.currentTime = 0
            setPlaying(false)
          }
        },
        { threshold: 0.4 },
      )
      observer.observe(node)

      return () => {
        wide.removeEventListener('change', pickSource)
        observer.disconnect()
        element.pause()
      }
    }

    let frame = 0
    let active: boolean | null = null

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
      if (next === active) return
      active = next

      if (next) {
        element.play().then(
          () => setPlaying(true),
          () => setPlaying(false),
        )
      } else {
        element.pause()
        element.currentTime = 0
        setPlaying(false)
      }
    }

    function schedule() {
      if (frame) return
      frame = requestAnimationFrame(sync)
    }

    sync()
    scroller.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      cancelAnimationFrame(frame)
      wide.removeEventListener('change', pickSource)
      scroller.removeEventListener('scroll', schedule)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [src.desktop, src.mobile])

  return (
    <div ref={container} className="relative">
      {children}

      <video
        ref={video}
        aria-label={label}
        muted
        loop
        playsInline
        preload="none"
        tabIndex={-1}
        className={`absolute inset-0 size-full rounded-lg object-cover object-top transition-opacity duration-700 md:object-center ${
          playing ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}
