'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ProjectLoader } from '@/components/ui/ProjectLoader'

type ProjectClip = { desktop: string; mobile: string }

// Por debajo de este ancho la tarjeta es vertical y toca la toma de móvil.
const WIDE = '(min-width: 48rem)'

// El clip se grabó arrancando la grabación antes de navegar, así que empieza por la página
// en blanco del navegador y por la carga de la web: entre medio y un segundo de blanco puro
// según el proyecto. Ese blanco es lo que se colaba al llegar a la tarjeta centrada.
//
// No se puede saber por metadatos dónde acaba, así que se mira el propio fotograma: mientras
// sea un plano liso es que seguimos en el hueco de carga de la web, y ahí es donde va el
// loader del proyecto en lugar del blanco.
const BLANK_SD = 4
const MAX_WARM = 2500
const SAMPLE = { width: 32, height: 18 }

// Lo que tarda el clip en desvanecerse (la duration-700 de su clase). Rebobinar antes de
// que termine devolvía el vídeo a su primer fotograma —el blanco— con el clip todavía a la
// vista: al salir de una tarjeta, el blanco entraba por ahí.
const FADE_OUT = 700

// Desviación típica de la luminancia del fotograma. Un plano liso —el blanco de la carga—
// da casi cero; en cuanto la web pinta algo, se dispara. No vale mirar sólo el brillo: hay
// webs, como la del estudio, que son blancas de por sí y nunca saldrían del hueco.
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

// Reproduce el hero animado del proyecto sólo cuando su tarjeta es la centrada en el
// carrusel: el resto del tiempo se ve el póster, que es el mismo <Figure> del servidor.
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
  // Segundo en el que la web del clip empieza a estar pintada. Se aprende en la primera
  // pasada y a partir de ahí el bucle vuelve ahí, no al cero: dar la vuelta al cero era
  // volver a meter el blanco cada vez, ya con la tarjeta bien puesta y a plena vista.
  const opening = useRef(0)
  const [playing, setPlaying] = useState(false)
  // El clip ya enseña algo suyo, no el blanco con el que arranca.
  const [painted, setPainted] = useState(false)

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
    // Si el clip se acaba justo cuando la tarjeta deja de ser la puesta, no toca redarlo.
    let wanted = false

    function sample() {
      look = 0
      const element = video.current
      if (!element || !paint) return setPainted(true)
      if (performance.now() - warmFrom > MAX_WARM) return setPainted(true)

      try {
        paint.drawImage(element, 0, 0, SAMPLE.width, SAMPLE.height)
        const frame = paint.getImageData(0, 0, SAMPLE.width, SAMPLE.height)
        if (frameSpread(frame.data) > BLANK_SD) {
          opening.current = element.currentTime
          return setPainted(true)
        }
      } catch {
        // Un clip de otro origen ensuciaría el lienzo y no se dejaría leer. Los de aquí son
        // del mismo sitio, pero si alguna vez deja de serlo se pasa de largo y se enseña.
        return setPainted(true)
      }

      look = window.setTimeout(sample, 80)
    }

    function start() {
      const element = video.current
      if (!element) return

      window.clearTimeout(rewind)
      rewind = 0
      wanted = true

      element.play().then(
        () => {
          setPlaying(true)
          warmFrom = performance.now()
          sample()
        },
        () => setPlaying(false),
      )
    }

    function stop() {
      const element = video.current
      window.clearTimeout(look)
      look = 0
      wanted = false
      setPlaying(false)
      setPainted(false)
      if (!element) return

      element.pause()
      // El rebobinado espera a que el clip se haya ido del todo. Si no, se le veía volver
      // al blanco del arranque mientras aún estaba a la vista.
      window.clearTimeout(rewind)
      rewind = window.setTimeout(() => {
        const node = video.current
        if (node) node.currentTime = opening.current
      }, FADE_OUT)
    }

    // Sin `loop`: el bucle se da a mano para volver al principio de lo pintado y no al
    // blanco de la grabación.
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
        window.clearTimeout(rewind)
        element.removeEventListener('ended', again)
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

      if (next) start()
      else stop()
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
      window.clearTimeout(look)
      window.clearTimeout(rewind)
      clip?.removeEventListener('ended', again)
      wide.removeEventListener('change', pickSource)
      scroller.removeEventListener('scroll', schedule)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [src.desktop, src.mobile])

  return (
    <div ref={container} className="relative">
      {children}

      {/* El clip no se enseña hasta que pinta algo suyo: si no, lo que se veía era el blanco
          con el que arranca la grabación. */}
      <video
        ref={video}
        aria-label={label}
        muted
        playsInline
        preload="none"
        tabIndex={-1}
        className={`absolute inset-0 size-full rounded-lg object-cover object-top transition-opacity duration-700 md:object-center ${
          playing && painted ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Y ese hueco lo llena el loader del proyecto, que es lo que iba en lugar del blanco. */}
      {playing ? (
        <ProjectLoader slug={slug} leaving={painted} className="pointer-events-none rounded-lg" />
      ) : null}
    </div>
  )
}
