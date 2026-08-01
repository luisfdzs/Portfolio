'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { href, mobileNavigation, navigation } from '@/lib/i18n/routes'
import { Briefcase, Close, Code, Home, Mail, Menu } from '@/components/ui/Icons'
import { LocaleSwitch } from './LocaleSwitch'

/**
 * Navegación de móvil: barra inferior fija de cinco destinos.
 *
 * Abajo y no arriba porque se maneja con el pulgar, que es lo que sujeta el teléfono. Los
 * cuatro primeros son las secciones que alguien busca a propósito; el quinto abre el menú
 * completo con las dos que no caben (`education` y `stack`) y el selector de idioma. Ver
 * `mobileNavigation` en `lib/i18n/routes.ts` para el criterio.
 *
 * Es el único componente de cliente con estado del sitio, y sólo por el panel: la barra en
 * sí no necesitaría JavaScript.
 */
const icons = {
  about: Home,
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

  /** Las secciones que no caben en la barra: el menú completo menos lo que ya está. */
  const overflowKeys = navigation.filter(
    (key) => !(mobileNavigation as readonly string[]).includes(key),
  )

  return (
    <>
      {/* Cortina. Cierra al pulsar fuera; es un `<button>` y no un `<div>` con onClick
          para que se pueda cerrar también con el teclado. */}
      {open ? (
        <button
          type="button"
          aria-label={t.a11y.closeMenu}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-ink/70 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      {/* Panel del menú completo, justo encima de la barra. */}
      <div
        id={PANEL_ID}
        hidden={!open}
        className="page-gutter fixed inset-x-0 bottom-nav-mobile z-50 border-t border-line bg-ink-raised pt-6 pb-6 lg:hidden"
      >
        <nav aria-label={t.a11y.menu}>
          <ul className="flex flex-col gap-1">
            {overflowKeys.map((key) => (
              <li key={key}>
                <Link
                  href={href(locale, key)}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-3 text-center text-paper transition-colors hover:bg-ink hover:text-signal"
                >
                  {t.nav[key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-5 flex items-center justify-between border-t border-line pt-5">
          <span className="eyebrow">{t.a11y.changeLanguage}</span>
          <LocaleSwitch current={locale} />
        </div>
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
            return (
              <li key={key} className="flex-1">
                <Link
                  href={href(locale, key)}
                  onClick={() => setOpen(false)}
                  className="flex size-full flex-col items-center justify-center gap-1 text-paper-faint transition-colors hover:text-signal"
                >
                  <Icon className="size-5" />
                  <span className="text-[0.625rem] leading-none">{t.nav[key]}</span>
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
