'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { href, mobileNavigation, navigation } from '@/lib/i18n/routes'
import { Briefcase, Chat, Close, Code, Menu, User } from '@/components/ui/Icons'
import { useChatDock } from '@/components/chat/ChatDock'
import { LocaleSwitch } from './LocaleSwitch'
import { useActiveSection } from './useActiveSection'

const icons = {
  about: User,
  experience: Briefcase,
  projects: Code,
} as const

const PANEL_ID = 'mobile-menu'

const slotClass =
  'relative flex flex-1 items-center justify-center text-signal transition-opacity duration-500'

const markClass = 'flex size-11 items-center justify-center rounded-full transition-colors duration-500'

export function MobileNav({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const [open, setOpen] = useState(false)
  const active = useActiveSection()
  const chat = useChatDock()

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
        inert={!open}
        className={cn(
          'page-gutter fixed inset-0 z-50 overflow-y-auto bg-ink-raised pb-nav-mobile',
          'transition-opacity duration-300 ease-out-soft lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
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
        className={cn(
          'fixed inset-x-nav-mobile-air z-50 flex h-nav-mobile-bar items-stretch',
          'bottom-[calc(var(--spacing-nav-mobile-air)+env(safe-area-inset-bottom))]',
          'rounded-full border border-line-strong bg-ink/95 shadow-lg shadow-ink/70',
          'backdrop-blur-lg lg:hidden',
        )}
      >
        {mobileNavigation.map((key) => {
          const Icon = icons[key]
          const current = key === active && !open && !chat.open
          return (
            <Link
              key={key}
              href={href(locale, key)}
              onClick={() => {
                setOpen(false)
                chat.close()
              }}
              aria-label={t.nav[key]}
              aria-current={current ? 'location' : undefined}
              className={cn(slotClass, current ? 'opacity-100' : 'opacity-55 hover:opacity-80')}
            >
              <span className={cn(markClass, current && 'bg-signal/12')}>
                <Icon className="size-5" />
              </span>
            </Link>
          )
        })}

        <button
          type="button"
          onClick={() => {
            setOpen(false)
            chat.toggle()
          }}
          aria-expanded={chat.open}
          aria-label={chat.open ? t.chat.close : t.chat.open}
          className={cn(slotClass, chat.open ? 'opacity-100' : 'opacity-55 hover:opacity-80')}
        >
          <span className={cn(markClass, chat.open && 'bg-signal/12')}>
            {chat.open ? <Close className="size-5" /> : <Chat className="size-5" />}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            chat.close()
            setOpen((value) => !value)
          }}
          aria-expanded={open}
          aria-controls={PANEL_ID}
          aria-label={open ? t.a11y.closeMenu : t.a11y.menu}
          className={cn(slotClass, open ? 'opacity-100' : 'opacity-55 hover:opacity-80')}
        >
          <span className={cn(markClass, open && 'bg-signal/12')}>
            {open ? <Close className="size-5" /> : <Menu className="size-5" />}
          </span>
        </button>
      </nav>
    </>
  )
}
