'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { isProjectPath, sections, type SectionKey } from '@/lib/i18n/routes'

/**
 * Las claves en el orden en que se leen. `sections` ya está declarado en el orden de la
 * portada, así que basta con recorrerlo: la primera que cruza la línea de lectura es la
 * buena, y no hace falta ordenar nada por posición en cada scroll.
 */
const keys = Object.keys(sections) as SectionKey[]

/**
 * QUÉ SECCIÓN SE ESTÁ LEYENDO, para que el menú la deje resaltada.
 *
 * Sin esto el menú es una lista de seis enlaces idénticos en una página de siete pantallas:
 * dice a dónde se puede ir y no dice dónde estás, que en un documento largo es justo la
 * mitad que falta. Devuelve la clave activa o `null` cuando no hay ninguna (el hero).
 *
 * ## Por qué una línea de lectura y no `IntersectionObserver`
 *
 * Lo evidente sería observar las secciones y quedarse con la más visible. En una página con
 * secciones de alturas muy distintas —el carrusel ocupa media pantalla y la experiencia
 * cuatro— eso resalta la más alta durante casi todo el scroll, y en los solapes cambia dos
 * veces por gesto. Aquí se hace al contrario: se traza **una línea horizontal fija** un
 * cuarto de pantalla por debajo de la cabecera y gana la sección que la cruza. Es una sola
 * respuesta en todo momento, cambia exactamente al pasar de una sección a la siguiente y
 * coincide con lo que hace el clic del menú, que deja el borde de la sección justo bajo la
 * cabecera.
 *
 * Las medidas se leen en cada comprobación y no se guardan al montar: el alto de la cabecera
 * es cero en móvil —está oculta— y el del hero cambia sin `resize` cuando el navegador del
 * teléfono recoge sus barras. Leer `getBoundingClientRect` en un escuchador de scroll es
 * consultar layout ya calculado; no fuerza reflow porque aquí no se escribe nada del DOM.
 *
 * El trabajo se agrupa con `requestAnimationFrame`: el scroll dispara decenas de eventos por
 * segundo y sólo hay un repintado por fotograma que aprovecharlos.
 *
 * ## Las dos páginas sin secciones
 *
 * En una ficha de proyecto no existe ninguno de los `id`, así que la medición no encuentra
 * nada y devolvería `null`: el menú se quedaría sin ninguna entrada marcada precisamente
 * donde más ayuda saber de dónde has venido. Por eso ahí manda la ruta y se marca
 * `projects`.
 *
 * Eso se decide **durante el render** y no dentro del efecto: la ruta ya la sabe React, así
 * que meterla en el estado sería copiar en un `useState` algo que se puede calcular, con el
 * render de más que eso cuesta —y con el aviso de ESLint que lo dice—. El efecto sólo
 * sincroniza lo que React no sabe: el scroll.
 */
export function useActiveSection(): SectionKey | null {
  const pathname = usePathname()
  const onProjectPage = isProjectPath(pathname)
  const [measured, setMeasured] = useState<SectionKey | null>(null)

  useEffect(() => {
    // En una ficha no hay nada que medir: manda la ruta y de eso se encarga el retorno.
    if (onProjectPage) return

    let frame = 0

    function measure() {
      frame = 0

      // La cabecera mide 0 en móvil (está oculta), y ahí la línea queda a un cuarto de
      // pantalla del borde superior, que es donde cae la vista al parar de bajar.
      const header = document.querySelector('header')
      const line = (header?.getBoundingClientRect().height ?? 0) + window.innerHeight * 0.25

      let current: SectionKey | null = null
      for (const key of keys) {
        const element = document.getElementById(sections[key])
        if (!element) continue
        const { top, bottom } = element.getBoundingClientRect()
        if (top <= line && bottom > line) {
          current = key
          break
        }
      }

      setMeasured(current)
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [onProjectPage, pathname])

  return onProjectPage ? 'projects' : measured
}
