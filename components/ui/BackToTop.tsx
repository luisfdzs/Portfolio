'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { ArrowUp } from './Icons'

/**
 * VOLVER ARRIBA: un botón flotante, en escritorio y en móvil, visible en cuanto se sale de
 * la primera pantalla.
 *
 * **Es el arreglo de una flecha que no funcionaba.** La que había vivía en el pie y era un
 * `<Link href="/es">`: un ancla a la ruta en la que ya estás, que en Next no navega y en el
 * navegador no mueve el scroll ni un píxel. O sea, se veía, se pulsaba y no pasaba nada. Y
 * estaba en el único sitio de la página donde ya no hace falta: quien ha llegado al pie ha
 * terminado de leer; el que necesita volver arriba es quien está a media página.
 *
 * Por eso ahora es un botón, con `window.scrollTo` y no con un ancla. **Sin `behavior`
 * explícito**, que es el detalle que conserva lo que el ancla hacía bien: sin él, el valor es
 * `auto` y el navegador aplica el `scroll-behavior` de la hoja de estilos — suave por defecto
 * e instantáneo cuando el sistema pide movimiento reducido, ya resuelto en `globals.css`.
 * Escribir `behavior: 'smooth'` aquí ignoraría esa preferencia.
 *
 * **Aparece pasada la primera pantalla**, no siempre: sobre el hero sería una flecha para
 * subir a donde ya estás, y además taparía las cifras. El umbral se mide del hero real
 * (`.hero-section`, que ocupa `100svh`) cuando la página lo tiene, y en las páginas
 * interiores —índice y fichas de proyecto, que no tienen hero— basta con haber bajado un poco.
 *
 * Se queda en el DOM cuando no toca y se apaga con `inert`: así el botón no entra ni al
 * tabulador ni al lector de pantalla mientras es invisible, pero puede desvanecerse en vez de
 * aparecer de golpe. En móvil se apoya por encima de la barra de iconos —`--spacing-nav-mobile`
 * y no un número a ojo— y en papel no se imprime.
 */
export function BackToTop({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    /**
     * El umbral se recalcula en cada comprobación en vez de guardarse una vez.
     *
     * En móvil el alto del hero cambia sin que haya `resize` —las barras del navegador se
     * recogen al bajar—, así que un valor cacheado al montar dejaría el botón apareciendo
     * unos cientos de píxeles antes o después de donde debe. Leer `clientHeight` en un
     * escuchador de scroll es una lectura de layout ya calculado; no fuerza reflow porque
     * aquí no se escribe nada del DOM.
     */
    function update() {
      const hero = document.querySelector('.hero-section')
      // Un poco antes del final del hero (4 rem): así el botón ya está a la vista cuando
      // empieza la primera sección, que es cuando puede hacer falta.
      const threshold = hero ? hero.clientHeight - 64 : 240
      setVisible(window.scrollY > threshold)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <button
      type="button"
      data-print="hide"
      inert={!visible}
      onClick={() => window.scrollTo({ top: 0 })}
      aria-label={t.a11y.backToTop}
      title={t.a11y.backToTop}
      className={cn(
        'fixed right-(--spacing-gutter) bottom-[calc(var(--spacing-nav-mobile)+0.75rem)] z-40',
        'flex size-11 items-center justify-center rounded-full border border-line',
        'bg-ink-raised/90 text-paper-soft shadow-lg shadow-ink/60 backdrop-blur-md',
        'transition-[color,opacity,transform] duration-300 hover:text-signal',
        'lg:bottom-6',
        visible ? 'opacity-100' : 'translate-y-2 opacity-0',
      )}
    >
      <ArrowUp className="size-5" />
    </button>
  )
}
