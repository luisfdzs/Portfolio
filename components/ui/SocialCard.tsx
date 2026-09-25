'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Profile } from '@/content/types'
import type { Locale } from '@/lib/i18n/config'
import { socialLinks } from '@/components/ui/SocialLinks'

export function SocialCard({ locale, profile }: { locale: Locale; profile: Profile }) {
  const ref = useRef<HTMLDivElement>(null)
  const [popped, setPopped] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setPopped(true)
        observer.disconnect()
      },
      { threshold: 0.6 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="social-card" data-print="hide" data-popped={popped || undefined}>
      <div className="social-card__float">
        <ul className="social-card__slab">
          {socialLinks(locale, profile).map(({ href, label, ariaLabel, attrs, Icon }, index) => (
            <li
              key={href}
              className="social-card__slot"
              style={{ '--pop-index': index } as CSSProperties}
            >
              <a href={href} {...attrs} aria-label={ariaLabel} title={label} className="social-key">
                <span className="social-key__face">
                  <Icon className="social-key__icon" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
