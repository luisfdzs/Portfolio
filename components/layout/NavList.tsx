'use client'

import Link from 'next/link'
import { cn } from '@/lib/cn'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { href, navigation } from '@/lib/i18n/routes'
import { useActiveSection } from './useActiveSection'

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
