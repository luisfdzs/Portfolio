'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'
import { type Locale, localeLabels, localeNames, locales } from '@/lib/i18n/config'

/**
 * Selector de idioma.
 *
 * Es cliente por una sola razón: necesita `usePathname()`. Sin él, el conmutador tendría
 * que llevar siempre a la portada del otro idioma, y quien esté leyendo la ficha de
 * Swiftmet en castellano y pulse «EN» merece acabar en la ficha de Swiftmet en inglés, no
 * en el inicio. Sustituir el primer segmento de la ruta es todo lo que hace falta porque
 * los slugs son neutros en los dos idiomas (ver `lib/i18n/routes.ts`).
 *
 * `scroll={false}` mantiene la posición vertical: cambiar de idioma a media página no
 * debería devolverte arriba.
 */
export function LocaleSwitch({ current }: { current: Locale }) {
  const pathname = usePathname()

  function pathFor(locale: Locale): string {
    const segments = pathname.split('/')
    // segments[0] es la cadena vacía anterior a la primera barra; el idioma es el [1].
    segments[1] = locale
    return segments.join('/') || `/${locale}`
  }

  return (
    <div
      className="figure-num flex items-center gap-1 text-small"
      role="group"
      aria-label={localeLabels[current]}
    >
      {locales.map((locale, index) => (
        <span key={locale} className="flex items-center gap-1">
          {index > 0 ? (
            <span aria-hidden="true" className="text-line-strong">
              /
            </span>
          ) : null}
          {locale === current ? (
            // El idioma activo no es un enlace: pulsarlo no haría nada y `aria-current`
            // ya se lo dice a quien navega con lector de pantalla.
            <span aria-current="true" className="text-signal">
              {localeNames[locale]}
            </span>
          ) : (
            <Link
              href={pathFor(locale)}
              hrefLang={locale}
              lang={locale}
              scroll={false}
              className={cn('tap text-paper-faint transition-colors hover:text-paper')}
            >
              {localeNames[locale]}
              <span className="sr-only"> — {localeLabels[locale]}</span>
            </Link>
          )}
        </span>
      ))}
    </div>
  )
}
