'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Profile } from '@/content/types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { cvHref } from '@/lib/i18n/routes'
import { cn } from '@/lib/cn'
import { ArrowDown } from '@/components/ui/Icons'
import { socialLinks } from '@/components/ui/SocialLinks'
import { SwarmMark } from '@/components/sections/SwarmAnchor'
import { IGNITE, swarmLink } from '@/components/three/swarm/registry'
import { sampleSocial } from '@/components/three/swarm/social'

const PATIENCE = 4000

function focusOn(key: number) {
  swarmLink.social.focus = key
}

function release(key: number) {
  if (swarmLink.social.focus === key) swarmLink.social.focus = -1
}

function press(key: number) {
  swarmLink.social.pressed = key
  swarmLink.social.presses++
}

export function SocialCard({ locale, profile }: { locale: Locale; profile: Profile }) {
  const t = getDictionary(locale)
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const [lit, setLit] = useState(false)

  useEffect(() => {
    const node = frame.current
    if (!node) return
    let stale = false
    const sample = () => {
      void sampleSocial(node).then((points) => {
        if (stale || !points) return
        swarmLink.social.points = points
        swarmLink.social.version++
      })
    }
    const observer = new ResizeObserver(sample)
    observer.observe(node)
    return () => {
      stale = true
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const node = ref.current
    if (!node) return
    let wait = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        observer.disconnect()
        const since = performance.now()
        const check = () => {
          const ready =
            !swarmLink.social.live ||
            swarmLink.social.formed ||
            performance.now() - since > PATIENCE
          if (ready) setLit(true)
          else wait = requestAnimationFrame(check)
        }
        check()
      },
      { threshold: 0.6 },
    )
    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(wait)
      swarmLink.social.focus = -1
    }
  }, [])

  const keys = [
    ...socialLinks(locale, profile).map(({ href, label, ariaLabel, attrs, Icon }) => ({
      href,
      label,
      ariaLabel,
      attrs,
      wide: false,
      body: <Icon className="swarm-key__icon" />,
    })),
    {
      href: cvHref(locale),
      label: t.contact.downloadCv,
      ariaLabel: t.contact.downloadCv,
      attrs: { download: true },
      wide: true,
      body: (
        <>
          <ArrowDown className="swarm-key__arrow" />
          <span data-glyph className="swarm-key__label">
            {t.contact.cvKey}
          </span>
          <span data-glyph className="swarm-key__tag">
            {t.contact.cvFormat}
          </span>
        </>
      ),
    },
  ]

  return (
    <div ref={frame} className="relative px-10 py-8">
      <SwarmMark kind="social" />
      <div ref={ref} className="social-card" data-print="hide" data-lit={lit || undefined}>
        <ul
          className="social-card__grid"
          style={
            {
              '--ignite-at': `${IGNITE.at}s`,
              '--ignite-stagger': `${IGNITE.stagger}s`,
            } as CSSProperties
          }
        >
          {keys.map(({ href, label, ariaLabel, attrs, wide, body }, index) => (
            <li key={href} className={cn('social-card__slot', wide && 'social-card__slot--wide')}>
              <a
                href={href}
                {...attrs}
                aria-label={ariaLabel}
                title={label}
                className={cn('swarm-key', wide && 'swarm-key--wide')}
                style={{ '--key-index': index } as CSSProperties}
                onPointerEnter={() => focusOn(index)}
                onPointerLeave={() => release(index)}
                onFocus={() => focusOn(index)}
                onBlur={() => release(index)}
                onClick={() => press(index)}
              >
                {body}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
