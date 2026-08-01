'use client'

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
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
 * Carrusel «cover flow»: la tarjeta centrada de frente y las demás giradas.
 *
 * **El efecto es CSS, no este componente.** El giro, el solape y la profundidad los hacen
 * las animaciones dirigidas por scroll de `globals.css` (bloque «COVER FLOW»), donde está
 * explicada la geometría. Aquí sólo hay tres cosas:
 *
 * 1. El envoltorio de cada tarjeta —`li` → escenario → tarjeta—, que son las tres capas
 *    que el efecto necesita: una para el sitio en la fila, una para la perspectiva y el
 *    desplazamiento lateral, y una para el giro. Se pone aquí y no en quien lo usa para
 *    que la estructura no se pueda escribir mal desde fuera.
 * 2. **Los dos botones**, que es lo único que justifica que esto sea un componente de
 *    cliente. Con el dedo se arrastra y con el tabulador el navegador trae al foco cada
 *    tarjeta, pero una rueda de ratón no hace scroll horizontal y la barra está oculta: sin
 *    los botones, quien mira esto en un portátil con ratón no puede pasar de la primera.
 * 3. Que los botones se apaguen en los extremos, para que no haya un control que no hace
 *    nada.
 *
 * No hay puntos indicadores. Serían enlaces a un ancla, y el navegador, al llevar el foco a
 * un ancla dentro de un contenedor con scroll, desplaza también la página: pulsar un punto
 * daría un salto vertical que nadie ha pedido.
 */
export function CoverFlow({ children, label, previousLabel, nextLabel }: Props) {
  const scroller = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  useEffect(() => {
    const element = scroller.current
    if (!element) return

    function measure() {
      const node = scroller.current
      if (!node) return
      // Dos píxeles de tolerancia: el scroll se redondea a subpíxeles y sin margen los
      // botones se apagan y se encienden solos al llegar al extremo.
      setAtStart(node.scrollLeft <= 2)
      setAtEnd(node.scrollLeft >= node.scrollWidth - node.clientWidth - 2)
    }

    measure()
    element.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)

    return () => {
      element.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [])

  /**
   * Centra la tarjeta anterior o la siguiente.
   *
   * Se miden con `offsetLeft`, que **no cuenta las transformaciones**: las tarjetas están
   * giradas y desplazadas por la animación, así que su rectángulo en pantalla no dice dónde
   * está su sitio en la fila. Con `getBoundingClientRect` el botón se pasaría de largo
   * justo lo que la animación haya movido la tarjeta.
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
          {Children.map(children, (child) => (
            <li className="cover-flow-item">
              <div className="cover-flow-stage">
                <div className="cover-flow-card">{child}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* En papel no hay carrusel que recorrer (ver el bloque @media print). */}
      <div data-print="hide" className="mt-6 flex justify-center gap-2 lg:mt-8">
        <CoverFlowButton label={previousLabel} disabled={atStart} onClick={() => go(-1)}>
          <ArrowLeft className="size-4" />
        </CoverFlowButton>
        <CoverFlowButton label={nextLabel} disabled={atEnd} onClick={() => go(1)}>
          <ArrowRight className="size-4" />
        </CoverFlowButton>
      </div>
    </div>
  )
}

/**
 * Los botones son 40×40 y no el tamaño del icono: `npm run check:mobile` exige 24×24 en
 * todo lo pulsable (WCAG 2.2) y un control que se usa con el dedo agradece el resto.
 */
function CoverFlowButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex size-10 items-center justify-center rounded-full border transition-colors duration-300',
        disabled
          ? 'border-line text-paper-faint/40'
          : 'border-line-strong text-paper hover:border-signal hover:text-signal',
      )}
    >
      {children}
    </button>
  )
}
