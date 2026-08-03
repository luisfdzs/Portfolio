'use client'

import { Children, useCallback, useEffect, useRef, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight } from './Icons'

type Props = {
  /** Una tarjeta por hijo. El envoltorio de cada una lo pone este componente. */
  children: ReactNode
  /** Nombre accesible de la lista. */
  label: string
  previousLabel: string
  nextLabel: string
}

/**
 * Cuántas veces se repite la lista en el DOM, y en cuál de las copias vive quien mira.
 *
 * Tres, y la del medio: el bucle se hace desplazando el scroll una lista entera hacia atrás
 * cuando se pasa de largo, y para poder hacerlo **en los dos sentidos** hace falta una copia
 * de sobra a cada lado. Con dos copias, tirar hacia la izquierda desde la primera tarjeta se
 * come el borde del contenedor antes de que haya sitio donde recolocarse.
 */
const COPIES = 3
const HOME = 1

/**
 * Carrusel «cover flow» **infinito**: la tarjeta centrada de frente, las demás giradas, y
 * después de la última vuelve la primera.
 *
 * **El efecto es CSS, no este componente.** El giro, el solape y la profundidad los hacen
 * las animaciones dirigidas por scroll de `globals.css` (bloque «COVER FLOW»), donde está
 * explicada la geometría. Aquí hay tres cosas:
 *
 * 1. El envoltorio de cada tarjeta —`li` → escenario → tarjeta—, que son las tres capas
 *    que el efecto necesita: una para el sitio en la fila, una para la perspectiva y el
 *    desplazamiento lateral, y una para el giro. Se pone aquí y no en quien lo usa para
 *    que la estructura no se pueda escribir mal desde fuera.
 * 2. **Los dos botones**, que con el bucle ya no se apagan nunca: no hay extremos. Con el
 *    dedo se arrastra y con el tabulador el navegador trae al foco cada tarjeta, pero una
 *    rueda de ratón no hace scroll horizontal y la barra está oculta: sin los botones, quien
 *    mira esto en un portátil con ratón no puede pasar de la primera.
 * 3. **El bucle**, que es lo de abajo.
 *
 * ## Cómo se hace infinito, y por qué así
 *
 * La lista se pinta **tres veces** y quien mira vive en la copia del medio. Cuando el scroll
 * se ha ido una lista entera hacia un lado, se le resta o se le suma esa lista de golpe:
 * la tarjeta que estaba centrada y la que la sustituye son **la misma tarjeta**, en el mismo
 * sitio de la pantalla, así que el salto no se ve. Es una cinta de correr, no una animación.
 *
 * Dos decisiones que evitan que se note:
 *
 * - **El salto se hace con el scroll quieto**, 140 ms después del último evento. Recolocar en
 *   marcha aborta el desplazamiento suave del navegador y mata la inercia del dedo, que es
 *   exactamente la sensación de carrusel roto. Esperar se puede permitir porque hay una lista
 *   entera de margen a cada lado: nadie llega al borde de verdad mientras el gesto dura.
 * - **La cuenta se hace con el resto de la división** y no con un `if` por sentido, así que un
 *   arrastre muy largo —varias listas de una pasada— se recoloca igual de bien.
 *
 * Las copias van `inert`: fuera del tabulador y fuera del árbol de accesibilidad. Es lo que
 * hace `inert` y es lo que hay que usar aquí; `aria-hidden` a secas dejaría veinticuatro
 * enlaces alcanzables con el teclado anunciando ocho proyectos.
 *
 * No hay puntos indicadores. Serían enlaces a un ancla, y el navegador, al llevar el foco a
 * un ancla dentro de un contenedor con scroll, desplaza también la página: pulsar un punto
 * daría un salto vertical que nadie ha pedido. Con el bucle, además, no hay una cuenta de
 * posiciones que enseñar.
 */
export function CoverFlow({ children, label, previousLabel, nextLabel }: Props) {
  const scroller = useRef<HTMLDivElement>(null)
  const cards = Children.toArray(children)
  /** Con una tarjeta no hay bucle que montar ni botones que enseñar. */
  const loop = cards.length > 1
  const copies = loop ? COPIES : 1

  /**
   * La cinta de correr.
   *
   * `set` es lo que mide una lista entera y `home` el scroll que centra la primera tarjeta de
   * la copia del medio. Se miden del DOM en cada corrección —y no una vez al montar— porque
   * el ancho de la tarjeta es un `clamp()` en `vw`: cambian con la ventana.
   */
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

    /** Devuelve el scroll a la copia del medio sin mover lo que se ve. */
    function rebase() {
      const node = scroller.current
      if (!node) return
      const measures = metrics(node)
      if (!measures || measures.set <= 0) return

      const drift = node.scrollLeft - measures.home
      // Resto de la división, corregido para que un desvío negativo no dé negativo.
      const wrapped = ((drift % measures.set) + measures.set) % measures.set
      // Un píxel de tolerancia: el scroll se redondea a subpíxeles y sin margen esto
      // se corregiría a sí mismo en bucle.
      if (Math.abs(wrapped - drift) > 1) node.scrollLeft = measures.home + wrapped
    }

    // La posición de partida. Es la única corrección que se ve —y no se ve— porque en el
    // scroll a cero la centrada es la primera tarjeta de la primera copia, que es la misma
    // primera tarjeta: la pantalla no cambia, sólo el número que hay en `scrollLeft`.
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

  /**
   * Centra la tarjeta anterior o la siguiente.
   *
   * Se miden con `offsetLeft`, que **no cuenta las transformaciones**: las tarjetas están
   * giradas y desplazadas por la animación, así que su rectángulo en pantalla no dice dónde
   * está su sitio en la fila. Con `getBoundingClientRect` el botón se pasaría de largo
   * justo lo que la animación haya movido la tarjeta.
   *
   * No hace falta que sepa nada del bucle: al vivir en la copia del medio siempre hay
   * tarjetas de sobra a los dos lados, y de volver a sitio se encarga la cinta.
   */
  const go = useCallback((direction: -1 | 1) => {
    const element = scroller.current
    if (!element) return

    const centres = [...element.querySelectorAll<HTMLElement>(':scope > ul > li')].map(
      (item) => item.offsetLeft + item.offsetWidth / 2,
    )
    const middle = element.scrollLeft + element.clientWidth / 2
    const target =
      direction === 1
        ? centres.find((centre) => centre > middle + 2)
        : centres.reverse().find((centre) => centre < middle - 2)

    if (target === undefined) return

    element.scrollTo({
      left: target - element.clientWidth / 2,
      // El `scroll-behavior: smooth` del sistema de diseño no llega hasta aquí: un
      // `scrollTo` programático manda sobre el CSS, así que la preferencia se consulta.
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
                className="cover-flow-item"
                // El atributo va sólo en las copias, y de él tiran el `@media print`
                // —donde ocho tarjetas ya ocupan dos hojas— y cualquiera que se pregunte
                // por qué hay veinticuatro `li` para ocho proyectos.
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

      {/* En papel no hay carrusel que recorrer (ver el bloque @media print). */}
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

/**
 * Los botones son 40×40 y no el tamaño del icono: `npm run check:mobile` exige 24×24 en
 * todo lo pulsable (WCAG 2.2) y un control que se usa con el dedo agradece el resto.
 *
 * Ya no tienen estado apagado: en un carrusel infinito no hay principio ni final, así que
 * ninguno de los dos puede quedarse sin nada que hacer.
 */
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
