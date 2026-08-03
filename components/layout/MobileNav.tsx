'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { href, mobileNavigation, navigation } from '@/lib/i18n/routes'
import { Briefcase, Close, Code, Mail, Menu, User } from '@/components/ui/Icons'
import { LocaleSwitch } from './LocaleSwitch'
import { useActiveSection } from './useActiveSection'

/**
 * Navegación de móvil: barra inferior fija de cinco destinos.
 *
 * Abajo y no arriba porque se maneja con el pulgar, que es lo que sujeta el teléfono. Los
 * cuatro primeros son las secciones que alguien busca a propósito; el quinto abre el menú
 * completo. Ver `mobileNavigation` en `lib/i18n/routes.ts` para el criterio.
 *
 * **El panel enseña TODAS las entradas, no sólo las que no caben en la barra**, y ocupa la
 * pantalla entera hasta el borde de la barra. Es el menú de `Swiftmet`, adoptado por
 * encargo, y el argumento es que un menú que sólo lista el sobrante obliga a mirar la barra
 * para deducir qué falta: se abre buscando el índice del sitio y aparece media lista. A
 * pantalla completa las seis entradas caben centradas y al tamaño de titular, que a 390 px
 * es la diferencia entre leerlas y buscarlas.
 *
 * Los dos idiomas van al final, **detrás de un filete horizontal**: son lo único del panel
 * que no es un destino, y sin la línea se leen como una séptima y una octava sección.
 *
 * **La sección que se está leyendo va resaltada en amarillo**, en la barra y en el panel, y
 * es lo que convierte cinco atajos en una posición: sin eso, la barra dice a dónde se puede
 * ir en una página de siete pantallas y no dice dónde estás. Lo mide `useActiveSection`.
 *
 * Es el único componente de cliente con estado del sitio, y ya no sólo por el panel: la
 * barra necesita el scroll para saber qué icono encender.
 *
 * El icono de «Perfil» es una **persona** y no la casa que había: junto a ese rótulo, un
 * icono de inicio promete volver arriba y lleva a la mitad de la página.
 */
const icons = {
  about: User,
  experience: Briefcase,
  projects: Code,
  contact: Mail,
} as const

/**
 * Identificador fijo del panel, no un `useId()`.
 *
 * Es la diana de `aria-controls` y de `npm run check:mobile`, que abre el menú en un Chrome
 * real y comprueba que el panel tiene altura de verdad. Con un `useId()` el identificador
 * cambia entre compilaciones y la comprobación tendría que adivinarlo. Sólo hay una barra de
 * móvil por página, así que no hay riesgo de colisión — que es lo único que `useId` resuelve.
 */
const PANEL_ID = 'mobile-menu'

export function MobileNav({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const [open, setOpen] = useState(false)
  const active = useActiveSection()

  /**
   * Cerrar con Escape y bloquear el scroll del fondo mientras el panel está abierto.
   *
   * El bloqueo importa más de lo que parece en móvil: sin él se hace scroll de la página
   * *detrás* del panel, y al cerrarlo apareces en un sitio distinto del que estabas sin
   * haber pulsado nada.
   */
  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <>
      {/*
       * Panel del menú: de arriba de la pantalla al borde de la barra.
       *
       * Sin cortina, y no por descuido: la que había aquí sólo tenía sentido cuando el panel
       * era una tira sobre la barra y quedaba página a la vista alrededor. Ocupando la
       * pantalla entera no hay «fuera» donde pulsar, así que cerrar es el mismo botón con el
       * que se abrió —que la barra deja siempre encima— o Escape.
       *
       * Fondo OPACO (`bg-ink-raised`): con uno translúcido se leerían las secciones por
       * debajo de las entradas del menú, que es el fallo clásico de un panel a pantalla
       * completa. `overflow-y-auto` para que, si algún día hay más entradas o alguien usa el
       * tipo del sistema muy grande, se puedan alcanzar en vez de quedar cortadas.
       */}
      <div
        id={PANEL_ID}
        hidden={!open}
        className="page-gutter fixed inset-x-0 top-0 bottom-nav-mobile z-50 overflow-y-auto bg-ink-raised lg:hidden"
      >
        {/* `min-h-full` y no `h-full`: el menú se centra en la pantalla, pero si no cabe
            crece y el `overflow-y-auto` de arriba lo deja alcanzable. */}
        <nav
          aria-label={t.a11y.menu}
          className="flex min-h-full flex-col items-center justify-center py-14"
        >
          <ul className="flex w-full flex-col items-center gap-2">
            {navigation.map((key) => (
              <li key={key}>
                <Link
                  href={href(locale, key)}
                  onClick={() => setOpen(false)}
                  aria-current={key === active ? 'location' : undefined}
                  className={cn(
                    'block px-4 py-2 text-center font-display text-title transition-colors hover:text-signal',
                    key === active ? 'text-signal' : 'text-paper',
                  )}
                >
                  {t.nav[key]}
                </Link>
              </li>
            ))}
          </ul>

          {/* El filete es el que separa los destinos de los idiomas. */}
          <div className="mt-10 flex items-center gap-4 border-t border-line pt-8">
            <span className="eyebrow">{t.a11y.changeLanguage}</span>
            <LocaleSwitch current={locale} />
          </div>
        </nav>
      </div>

      {/* La barra. */}
      <nav
        data-print="hide"
        aria-label={t.a11y.mobileNavigation}
        className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-ink/95 backdrop-blur-lg lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <ul className="flex h-16 items-stretch">
          {mobileNavigation.map((key) => {
            const Icon = icons[key]
            const current = key === active
            return (
              <li key={key} className="flex-1">
                <Link
                  href={href(locale, key)}
                  onClick={() => setOpen(false)}
                  aria-current={current ? 'location' : undefined}
                  className={cn(
                    'relative flex size-full flex-col items-center justify-center gap-1 transition-colors',
                    current ? 'text-signal' : 'text-paper-faint hover:text-signal',
                  )}
                >
                  <Icon className="size-5" />
                  <span className="text-[0.625rem] leading-none">{t.nav[key]}</span>
                  {/* El filete superior, sólo en la activa: el amarillo es la señal
                      principal y ésta es la que la acompaña, porque un icono a 20 px
                      teñido de un color no es una diferencia que todo el mundo vea. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute inset-x-3 top-0 h-0.5 rounded-full bg-signal transition-opacity',
                      current ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </Link>
              </li>
            )
          })}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls={PANEL_ID}
              className={cn(
                'flex size-full flex-col items-center justify-center gap-1 transition-colors',
                open ? 'text-signal' : 'text-paper-faint hover:text-signal',
              )}
            >
              {open ? <Close className="size-5" /> : <Menu className="size-5" />}
              {/* El rótulo no cambia al abrir: «Cerrar el menú» no cabe a 390 px sin
                  partirse en dos líneas y descuadrar la altura de la barra. El estado ya
                  lo dicen el icono y `aria-expanded`. */}
              <span className="text-[0.625rem] leading-none">{t.a11y.menu}</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  )
}
