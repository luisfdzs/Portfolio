'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/** Cada cuánto se mira si la sección de destino ya está en el documento. */
const POLL_INTERVAL_MS = 100

/**
 * Cuántas veces, como mucho. Se cuentan intentos y no milisegundos a propósito: en una
 * pestaña de segundo plano el navegador estira los temporizadores, y un plazo en tiempo real
 * se agotaría sin haber llegado a mirar. Al acabarse no se borra nada — la URL se queda como
 * estaba, que es lo que pasaba antes de que este componente existiera.
 */
const MAX_POLLS = 100

/** Red de seguridad por si `scrollend` no llega. Ver `waitForScrollEnd`. */
const SCROLL_TIMEOUT_MS = 1200

/** ¿Se ve algo del elemento en la pantalla? */
function isOnScreen(element: Element) {
  const { top, bottom } = element.getBoundingClientRect()
  return bottom > 0 && top < window.innerHeight
}

/**
 * LA ALMOHADILLA NUNCA LLEGA A VERSE EN LA BARRA DE DIRECCIONES
 *
 * Las secciones de la portada son anclas (`/es#experience`, ver `lib/i18n/routes.ts`) y
 * `/es/projects` es una página. Es una diferencia real —el fragmento es la única parte de la
 * URL que no llega al servidor—, pero al visitante le llega como una incoherencia: unas
 * entradas del mismo menú dejan una barra y otras una almohadilla. Aquí se quita esa
 * diferencia, y **los `href` no se tocan**: siguen llevando el ancla, así que se conserva
 * todo lo que el navegador da gratis —funciona sin JavaScript, se puede abrir en otra
 * pestaña, y un `/es#experience` viejo de LinkedIn o de las redirecciones de
 * `next.config.ts` sigue llevando a su sitio—.
 *
 * Son dos mecanismos y no uno, porque los dos casos no se parecen:
 *
 * 1. **Dentro de la misma página** (y al llegar de fuera con ancla): se deja actuar al
 *    navegador y se borra el fragmento cuando ya ha hecho su trabajo. Es lo barato, y es lo
 *    que cubre también el enlace de «saltar al contenido» (`#main`).
 * 2. **Cambiando de página** —pulsar «Contacto» desde una ficha de proyecto—: ahí el ancla
 *    no llega a escribirse. Hay que hacerlo así; el porqué está en `pushToSection`.
 *
 * Se monta en el layout y no en la portada porque el segundo caso empieza en otra página.
 *
 * Lo que se pierde a cambio, dicho en voz alta: **copiar la URL ya no comparte la sección**,
 * y «atrás» después de pulsar una entrada del menú sale de la página en vez de recorrer las
 * secciones visitadas. Es el precio de que el menú se comporte igual en sus seis entradas.
 */
export function HashCleaner() {
  const router = useRouter()

  useEffect(() => {
    /**
     * EL ORDEN ES TODO EL COMPONENTE
     *
     * Borrar el ancla antes de tiempo no la deja «un poco desincronizada»: **cancela el
     * salto**. El caso que lo destapó es el que más importa, el enlace que llega de fuera.
     * El navegador guarda el salto pendiente hasta que la sección aparece —la portada llega
     * por streaming, así que no está en el documento desde el primer instante—, y si para
     * entonces el fragmento ya no está en la URL, se queda arriba del todo: un enlace
     * profundo roto en silencio.
     *
     * De ahí que no se borre nada hasta comprobar las dos cosas: que el fragmento esté
     * puesto —al pulsar una entrada del menú lo escribe Next un momento después del clic— y
     * que su sección exista de verdad en el documento.
     *
     */
    let cancelled = false
    let pollTimer: ReturnType<typeof setTimeout> | undefined
    let scrollTimer: ReturnType<typeof setTimeout> | undefined

    function clean() {
      if (!window.location.hash) return
      /**
       * `replaceState` y no `pushState`: sustituir la entrada en vez de añadir otra. Con
       * `push`, cada sección dejaría dos entradas —la del ancla y la limpia— y «atrás»
       * habría que pulsarlo dos veces para salir de la página.
       *
       * Se escribe en el historial por debajo del router a sabiendas. Es seguro **sólo**
       * mientras el router no tenga a su vez un ancla en su URL canónica, que es justo lo que
       * garantiza `pushToSection`.
       */
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }

    /**
     * Segunda espera: el desplazamiento suave de `app/globals.css` tarda en llegar, y aunque
     * quitar el fragmento a mitad de camino no lo detiene, sí impide que el navegador corrija
     * la posición si el contenido se mueve mientras tanto.
     *
     * El temporizador cubre los tres casos en que `scrollend` no llega nunca: los navegadores
     * que aún no lo implementan, pulsar la sección en la que ya se está —sin scroll no hay
     * final de scroll— y una pestaña en segundo plano, donde no se anima nada.
     */
    function waitForScrollEnd() {
      function finish() {
        clearTimeout(scrollTimer)
        document.removeEventListener('scrollend', finish)
        if (!cancelled) clean()
      }

      document.addEventListener('scrollend', finish, { once: true })
      scrollTimer = setTimeout(finish, SCROLL_TIMEOUT_MS)
    }

    /**
     * Primera espera: hasta que haya fragmento y exista su sección.
     *
     * Se sondea en vez de observar el DOM porque lo que hay que ver no es una mutación
     * concreta sino un estado —fragmento puesto y sección presente— al que se llega por tres
     * caminos distintos: el clic, la hidratación de una visita que ya traía ancla, y la
     * navegación de Next desde otra página.
     */
    function poll(remaining: number, anchor: boolean) {
      if (cancelled) return

      const id = window.location.hash.slice(1)
      const target = id ? document.getElementById(id) : null

      if (!target) {
        if (remaining > 0) {
          pollTimer = setTimeout(() => poll(remaining - 1, anchor), POLL_INTERVAL_MS)
        }
        return
      }

      /**
       * El rescate, y sólo eso.
       *
       * Si la sección ya se ve, el navegador ha hecho su trabajo y no se le toca: la coloca
       * mejor que nosotros, porque descuenta la cabecera fija. Sólo se interviene cuando el
       * salto no ha ocurrido —hay fragmento y la sección está fuera de pantalla—, que es lo
       * que pasa cuando la portada tarda en montarse y el borrado llegaría antes que el
       * salto.
       *
       * `instant` porque es un aterrizaje, no un recorrido: heredar el `scroll-behavior:
       * smooth` de `app/globals.css` haría desfilar seis mil píxeles delante de alguien que
       * acaba de abrir el enlace, y dejaría la posición final a merced de una animación que
       * el navegador puede decidir no ejecutar.
       *
       * Tras un clic no se toca el scroll: de eso ya se encarga `next/link`, y ahí el
       * desplazamiento suave sí es el que se quiere.
       */
      if (anchor && !isOnScreen(target)) target.scrollIntoView({ behavior: 'instant' })
      waitForScrollEnd()
    }

    function start(anchor: boolean) {
      clearTimeout(pollTimer)
      poll(MAX_POLLS, anchor)
    }

    /**
     * El otro sondeo: esperar a que una sección concreta aparezca tras cambiar de página, sin
     * que su nombre pase nunca por la URL. Es la mitad de `pushToSection`.
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

      target.scrollIntoView({ behavior: 'instant' })
      /**
       * Lo que se pierde al no dejar navegar al ancla: el navegador, además de desplazar,
       * mueve el punto de partida del tabulador a la sección de destino. Sin esto, alguien
       * que navega con teclado pulsa «Formación», ve la formación y al tabular sigue en la
       * cabecera. `tabindex="-1"` porque un `<section>` no es enfocable por sí mismo, y
       * `preventScroll` porque el desplazamiento ya está hecho.
       */
      target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
    }

    /**
     * Ir a una sección **de otra página** sin escribir el ancla en la URL.
     *
     * Es el caso que obliga a intervenir en vez de limpiar después. Si se deja navegar al
     * enlace, Next se queda con `/es#contact` como URL canónica suya, y a partir de ahí
     * cualquier borrado por debajo la desincroniza: el clic siguiente compone sobre lo que él
     * cree que hay y sale `/es#contact#about`. Así que aquí no se genera el ancla siquiera —
     * se navega a la página limpia y se busca la sección al llegar.
     */
    function pushToSection(link: HTMLAnchorElement, event: MouseEvent) {
      const id = link.hash.slice(1)
      if (!id) return

      event.preventDefault()
      clearTimeout(pollTimer)
      // `next/link` comprueba `defaultPrevented` **después** de llamar al `onClick` del
      // enlace, así que la barra de móvil sigue cerrándose sola al pulsar.
      router.push(link.pathname + link.search)
      pollForSection(id, MAX_POLLS)
    }

    /**
     * El clic se escucha en el documento y no en cada enlace porque el ancla la ponen tres
     * sitios —cabecera, barra de móvil y el enlace de salto del layout— y ninguno debería
     * tener que saber que esto existe. En fase de captura, para verlo antes de que
     * `next/link` se lleve la navegación.
     *
     * Los dos caminos son distintos porque el problema es distinto. Dentro de la misma
     * página, dejar hacer y limpiar después funciona y es lo más barato: el fragmento
     * todavía no está en la URL al pulsar, y de esperarlo se ocupa el sondeo. Cambiando de
     * página no vale, y el porqué está en `pushToSection`.
     *
     * Se ignoran los clics que no son «abrir aquí» —botón central, `ctrl`/`cmd`, `shift`—
     * para no robarle al visitante el «abrir en otra pestaña», donde el ancla es justo lo
     * que hace falta.
     */
    function onClick(event: MouseEvent) {
      const target = event.target
      if (!(target instanceof Element)) return

      const link = target.closest('a[href*="#"]')
      if (!(link instanceof HTMLAnchorElement)) return

      if (link.pathname === window.location.pathname) {
        start(false)
        return
      }

      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }
      if (link.origin !== window.location.origin || link.target === '_blank') return

      pushToSection(link, event)
    }

    /**
     * Al llegar con el fragmento ya puesto. La comprobación no es cosmética: sin ella, cada
     * borrado propio arrancaría un sondeo entero buscando el ancla que se acaba de quitar,
     * porque Next avisa del cambio de historial.
     */
    function onHashPresent() {
      if (window.location.hash) start(true)
    }

    document.addEventListener('click', onClick, { capture: true })
    // Un salto de ancla que no pasa por `next/link` —el enlace de «saltar al contenido», o
    // escribir el fragmento a mano en la barra— no dispara el clic de arriba.
    window.addEventListener('hashchange', onHashPresent)
    window.addEventListener('popstate', onHashPresent)

    // Al montar: se ha llegado de fuera con ancla, que es el caso delicado explicado arriba.
    onHashPresent()

    return () => {
      cancelled = true
      clearTimeout(pollTimer)
      clearTimeout(scrollTimer)
      document.removeEventListener('click', onClick, { capture: true })
      window.removeEventListener('hashchange', onHashPresent)
      window.removeEventListener('popstate', onHashPresent)
    }
  }, [router])

  return null
}
