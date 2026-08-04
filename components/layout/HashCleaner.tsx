'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/** Cada cuánto se mira si la sección de destino ya está en el documento. */
const POLL_INTERVAL_MS = 100

/**
 * Cuántas veces, como mucho. Se cuentan intentos y no milisegundos a propósito: en una
 * pestaña de segundo plano el navegador estira los temporizadores, y un plazo en tiempo real
 * se agotaría sin haber llegado a mirar.
 */
const MAX_POLLS = 100

/**
 * A dónde hay que desplazarse para dejar una sección arriba del todo **sin que la tape la
 * cabecera fija**. En móvil no hay cabecera —la navegación es la barra inferior— y entonces
 * el descuento es cero, que es justo lo que devuelve medir el elemento: está oculto.
 */
function scrollTargetFor(element: Element) {
  const header = document.querySelector('header')
  const offset = header ? header.getBoundingClientRect().height : 0
  return element.getBoundingClientRect().top + window.scrollY - offset
}

/**
 * Llevar el foco a la sección, además de la vista.
 *
 * Es lo que hace de más un ancla nativa y se pierde al interceptar el clic: mover el punto de
 * partida del tabulador. Sin esto, quien navega con teclado pulsa «Formación», ve la formación
 * y al tabular sigue en la cabecera. `tabindex="-1"` porque un `<section>` no es enfocable por
 * sí mismo, y `preventScroll` porque del desplazamiento ya nos hemos encargado.
 */
function focusSection(element: HTMLElement) {
  element.setAttribute('tabindex', '-1')
  element.focus({ preventScroll: true })
}

/**
 * LA ALMOHADILLA NUNCA LLEGA A VERSE EN LA BARRA DE DIRECCIONES
 *
 * Las secciones de la portada son anclas (`/es#experience`, ver `lib/i18n/routes.ts`) y
 * `/es/projects` es una página. Es una diferencia real —el fragmento es la única parte de la
 * URL que no llega al servidor—, pero al visitante le llega como una incoherencia: unas
 * entradas del mismo menú dejan una barra y otras una almohadilla.
 *
 * Se quita esa diferencia **sin tocar los `href`**: siguen llevando el ancla, y con ella todo
 * lo que el navegador da gratis —navegación sin JavaScript, «abrir en otra pestaña», y los
 * `/es#experience` viejos de LinkedIn o de las redirecciones de `next.config.ts` siguen
 * llevando a su sección—. Lo que cambia es que un clic normal no llega a escribir el ancla:
 * se desplaza a mano y la URL se queda como está.
 *
 * **La regla que lo sostiene: el ancla nunca entra en el router.** Next lleva su propia URL
 * canónica, y en cuanto tiene un fragmento dentro, cualquier arreglo por debajo la
 * desincroniza y el clic siguiente compone sobre lo que él cree que hay: `/es#education#contact`,
 * dos almohadillas y ninguna sección que corresponda. Se probó a limpiar después con
 * `history.replaceState` —se desincroniza— y con `router.replace` —no actualiza la barra—.
 * La única forma estable es no generar el fragmento.
 *
 * Queda un caso en el que el ancla sí llega: **la visita que entra con ella puesta**, de un
 * enlace viejo. Ahí no hay clic que interceptar, así que se deja actuar al navegador y se borra
 * el fragmento cuando ya ha desplazado. Como después ningún clic escribe anclas, no hay nada
 * que se pueda componer encima.
 *
 * Se monta en el layout y no en la portada porque los enlaces de sección están en todas las
 * páginas, incluido el de «saltar al contenido» (`#main`).
 *
 * Lo que se pierde a cambio, dicho en voz alta: **copiar la URL ya no comparte la sección**, y
 * «atrás» después de pulsar una entrada del menú sale de la página en vez de recorrer las
 * secciones visitadas. Es el precio de que el menú se comporte igual en sus cinco entradas.
 */
export function HashCleaner() {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    let pollTimer: ReturnType<typeof setTimeout> | undefined

    /**
     * Desplazarse a la sección sin tocar la URL.
     *
     * No se pasa `behavior`: así hereda el `scroll-behavior` de `app/globals.css`, que es
     * suave y pasa a instantáneo con `prefers-reduced-motion`. Escribir `'smooth'` aquí se lo
     * impondría también a quien ha pedido que no se mueva nada.
     */
    function goTo(target: HTMLElement) {
      window.scrollTo({ top: scrollTargetFor(target) })
      focusSection(target)
    }

    /**
     * Cambiar de página y buscar la sección al llegar. El nombre de la sección viaja en una
     * variable, no en la URL — que es de lo que va todo esto.
     */
    function pollForSection(id: string, remaining: number) {
      if (cancelled) return

      const target = document.getElementById(id)
      if (!target) {
        if (remaining > 0) {
          pollTimer = setTimeout(() => pollForSection(id, remaining - 1), POLL_INTERVAL_MS)
        }
        return
      }

      // Instantáneo y no suave: se acaba de aterrizar en otra página, y recorrer seis mil
      // píxeles en animación delante de alguien que acaba de pulsar no es llegar, es viajar.
      window.scrollTo({ top: scrollTargetFor(target), behavior: 'instant' })
      focusSection(target)
    }

    /**
     * El clic se escucha en el documento y no en cada enlace porque el ancla la ponen tres
     * sitios —cabecera, barra de móvil y el enlace de salto del layout— y ninguno debería
     * tener que saber que esto existe. En fase de captura, para verlo antes que `next/link`.
     *
     * `next/link` comprueba `defaultPrevented` **después** de llamar al `onClick` del enlace,
     * así que el panel de la barra de móvil se sigue cerrando solo al pulsar.
     *
     * Se dejan pasar los clics que no son «abrir aquí» —botón central, `ctrl`/`cmd`, `shift`,
     * `target="_blank"`— para no robarle a nadie el «abrir en otra pestaña», donde el ancla es
     * justo lo que hace falta.
     */
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const from = event.target
      if (!(from instanceof Element)) return

      const link = from.closest('a[href*="#"]')
      if (!(link instanceof HTMLAnchorElement)) return
      if (link.origin !== window.location.origin || link.target === '_blank') return

      const id = link.hash.slice(1)
      if (!id) return

      event.preventDefault()
      clearTimeout(pollTimer)

      const target = document.getElementById(id)
      if (link.pathname === window.location.pathname && target instanceof HTMLElement) {
        goTo(target)
        return
      }

      router.push(link.pathname + link.search)
      pollForSection(id, MAX_POLLS)
    }

    /**
     * El único camino que sí trae un ancla: entrar con ella puesta.
     *
     * Aquí el orden importa y no es el evidente. Borrar el fragmento antes de tiempo no deja la
     * URL «un poco desincronizada»: **cancela el salto**. El navegador lo guarda pendiente hasta
     * que la sección aparece —la portada llega por streaming, así que el layout hidrata antes— y
     * si para entonces el ancla ya no está, se queda arriba del todo. Un enlace profundo roto en
     * silencio, que es exactamente lo que este componente no debe provocar.
     *
     * Por eso se espera a que la sección exista, se comprueba que el navegador la haya traído a
     * la pantalla —y si no, se corrige— y sólo entonces se borra.
     */
    function cleanInboundHash(remaining: number) {
      if (cancelled || !window.location.hash) return

      const id = window.location.hash.slice(1)
      const target = document.getElementById(id)
      if (!target) {
        if (remaining > 0) {
          pollTimer = setTimeout(() => cleanInboundHash(remaining - 1), POLL_INTERVAL_MS)
        }
        return
      }

      const { top, bottom } = target.getBoundingClientRect()
      const arrived = bottom > 0 && top < window.innerHeight
      if (!arrived) window.scrollTo({ top: scrollTargetFor(target), behavior: 'instant' })

      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }

    function onInbound() {
      if (!window.location.hash) return
      clearTimeout(pollTimer)
      cleanInboundHash(MAX_POLLS)
    }

    document.addEventListener('click', onClick, { capture: true })
    // Escribir el fragmento a mano en la barra, o volver con «atrás» a una entrada que lo
    // tuviera: no hay clic que interceptar.
    window.addEventListener('hashchange', onInbound)
    window.addEventListener('popstate', onInbound)

    onInbound()

    return () => {
      cancelled = true
      clearTimeout(pollTimer)
      document.removeEventListener('click', onClick, { capture: true })
      window.removeEventListener('hashchange', onInbound)
      window.removeEventListener('popstate', onInbound)
    }
  }, [router])

  return null
}
