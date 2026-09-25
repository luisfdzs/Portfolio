'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { ArrowUp } from './Icons'

export function BackToTop({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function update() {
      const hero = document.querySelector('.hero-section')
      const threshold = hero ? hero.clientHeight - 64 : 240
      setVisible(window.scrollY > threshold)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <button
      type="button"
      data-print="hide"
      inert={!visible}
      onClick={() => window.scrollTo({ top: 0 })}
      aria-label={t.a11y.backToTop}
      title={t.a11y.backToTop}
      className={cn(
        'fixed bottom-6 left-1/2 z-40 -translate-x-1/2',
        'hidden size-11 items-center justify-center rounded-full border border-line',
        'bg-ink-raised/90 text-paper-soft shadow-lg shadow-ink/60 backdrop-blur-md',
        'transition-[color,opacity,transform] duration-300 hover:text-signal',
        'lg:flex',
        visible ? 'opacity-100' : 'translate-y-2 opacity-0',
      )}
    >
      <ArrowUp className="size-5" />
    </button>
  )
}
