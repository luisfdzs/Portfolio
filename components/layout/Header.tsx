import Link from 'next/link'
import { getDictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/config'
import { href } from '@/lib/i18n/routes'
import { LocaleSwitch } from './LocaleSwitch'
import { NavList } from './NavList'

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
          <NavList locale={locale} />
        </nav>

        <LocaleSwitch current={locale} />
      </div>
    </header>
  )
}
