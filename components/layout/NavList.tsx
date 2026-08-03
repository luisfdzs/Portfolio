'use client'

import Link from 'next/link'
import { cn } from '@/lib/cn'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { href, navigation } from '@/lib/i18n/routes'
import { useActiveSection } from './useActiveSection'

/**
 * Las seis entradas del menú de escritorio, con la sección que se está leyendo **resaltada
 * en amarillo** (`text-signal`, el único acento del sistema) y con su filete ya trazado.
 *
 * Es de cliente sólo por eso: saber dónde estás exige medir el scroll. La cabecera que lo
 * contiene sigue siendo de servidor, así que lo que baja al navegador son estas seis
 * entradas y no la barra entera.
 *
 * `aria-current` va sólo cuando toca —y con `location`, que es lo que significa «estás
 * aquí dentro de esta página»—: puesto siempre a `false` un lector de pantalla no lo
 * anuncia, pero el `[aria-current]` de `link-underline` sí lo vería y dejaría las seis
 * entradas subrayadas. El color no es la única señal, que es la regla de contraste: el
 * filete del subrayado marca la activa también para quien no distinga el amarillo.
 *
 * `Link` también para las anclas: Next resuelve `/es#about` haciendo scroll si ya estás en
 * la portada y navegando si vienes de una ficha de proyecto, que es justo lo que hace falta.
 */
export function NavList({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const active = useActiveSection()

  return (
    <ul className="flex items-center gap-7">
      {navigation.map((key) => {
        const current = key === active
        return (
          <li key={key}>
            <Link
              href={href(locale, key)}
              aria-current={current ? 'location' : undefined}
              className={cn(
                'link-underline text-small transition-colors',
                current ? 'text-signal' : 'text-paper-soft hover:text-paper',
              )}
            >
              {t.nav[key]}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
