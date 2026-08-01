import Link from 'next/link'
import { getDictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/config'
import { href, navigation } from '@/lib/i18n/routes'
import { LocaleSwitch } from './LocaleSwitch'

/**
 * Cabecera de escritorio.
 *
 * Fija y con fondo difuminado, porque en una página larga la navegación tiene que estar a
 * mano en el punto en que alguien decide escribir: si para volver a «Contacto» hay que
 * subir cinco secciones, no se vuelve.
 *
 * **Oculta por debajo de `lg`**: en móvil la navegación es la barra inferior
 * (`MobileNav`), que se alcanza con el pulgar. Tener las dos sería robar 4 rem de
 * pantalla arriba y abajo en el dispositivo que menos tiene.
 *
 * `data-print="hide"` la quita al imprimir: una barra de navegación en papel no navega.
 */
export function Header({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)

  return (
    <header
      data-print="hide"
      className="fixed inset-x-0 top-0 z-40 hidden border-b border-line bg-ink/80 backdrop-blur-lg lg:block"
    >
      <div className="page-gutter mx-auto flex h-16 max-w-7xl items-center justify-between gap-8">
        <Link
          href={href(locale, 'home')}
          className="font-display text-lg text-paper transition-colors hover:text-signal"
        >
          Luis Fernández Sangil
        </Link>

        <nav aria-label={t.a11y.mainNavigation}>
          <ul className="flex items-center gap-7">
            {/* `Link` también para las anclas: Next resuelve `/es#about` haciendo scroll
                si ya estás en la portada y navegando si vienes de una ficha de proyecto,
                que es justo lo que hace falta. Y al de `projects`, que sí es una página,
                le da prefetch gratis. */}
            {navigation.map((key) => (
              <li key={key}>
                <Link
                  href={href(locale, key)}
                  className="link-underline text-small text-paper-soft transition-colors hover:text-paper"
                >
                  {t.nav[key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <LocaleSwitch current={locale} />
      </div>
    </header>
  )
}
