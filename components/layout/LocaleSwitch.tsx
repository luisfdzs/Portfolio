'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'
import { type Locale, localeLabels, localeNames, locales } from '@/lib/i18n/config'

export function LocaleSwitch({ current }: { current: Locale }) {
  const pathname = usePathname()

  function pathFor(locale: Locale): string {
    const segments = pathname.split('/')
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
