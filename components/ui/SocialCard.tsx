'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Profile } from '@/content/types'
import type { Locale } from '@/lib/i18n/config'
import { socialLinks } from '@/components/ui/SocialLinks'
import { SwarmMark } from '@/components/sections/SwarmAnchor'
import { swarmLink } from '@/components/three/swarm/registry'
import { sampleSocial } from '@/components/three/swarm/social'

const PATIENCE = 4000

export function SocialCard({ locale, profile }: { locale: Locale; profile: Profile }) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const [popped, setPopped] = useState(false)

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
          if (ready) setPopped(true)
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
    }
  }, [])

  return (
    <div ref={frame} className="relative">
      <SwarmMark kind="social" />
      <div ref={ref} className="social-card" data-print="hide" data-popped={popped || undefined}>
        <div className="social-card__float">
          <ul className="social-card__slab">
            {socialLinks(locale, profile).map(({ href, label, ariaLabel, attrs, Icon }, index) => (
              <li
                key={href}
                className="social-card__slot"
                style={{ '--pop-index': index } as CSSProperties}
              >
                <a
                  href={href}
                  {...attrs}
                  aria-label={ariaLabel}
                  title={label}
                  className="social-key"
                >
                  <span className="social-key__face">
                    <Icon className="social-key__icon" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
