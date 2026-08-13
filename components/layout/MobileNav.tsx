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

const icons = {
  about: User,
  experience: Briefcase,
  projects: Code,
  contact: Mail,
} as const

const PANEL_ID = 'mobile-menu'

export function MobileNav({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const [open, setOpen] = useState(false)
  const active = useActiveSection()

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
      <div
        id={PANEL_ID}
        hidden={!open}
        className="page-gutter fixed inset-x-0 top-0 bottom-nav-mobile z-50 overflow-y-auto bg-ink-raised lg:hidden"
      >
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

          <div className="mt-10 flex items-center justify-center border-t border-line pt-8">
            <LocaleSwitch current={locale} />
          </div>
        </nav>
      </div>

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
              <span className="text-[0.625rem] leading-none">{t.a11y.menu}</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  )
}
