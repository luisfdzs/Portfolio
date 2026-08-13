import type { CSSProperties } from 'react'
import type { Profile } from '@/content/types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { href } from '@/lib/i18n/routes'
import { Action } from '@/components/ui/Action'
import { Figure } from '@/components/ui/Figure'
import { ArrowDown, GitHub, LinkedIn, Mail, MapPin } from '@/components/ui/Icons'
import { Typed } from '@/components/ui/Typed'
import { HeroStage } from '@/components/sections/HeroStage'

type Stat = { value: string; label: string }

type Props = {
  locale: Locale
  profile: Profile
  stats: readonly Stat[]
}

export function Hero({ locale, profile, stats }: Props) {
  const t = getDictionary(locale)

  const greeting = t.hero.greeting
  const headline = profile.headline[locale]
  const location = profile.location[locale]

  const socials = [
    { href: profile.linkedin, label: t.contact.linkedinLabel, Icon: LinkedIn },
    { href: profile.github, label: t.contact.githubLabel, Icon: GitHub },
    { href: `mailto:${profile.email}`, label: t.contact.emailLabel, Icon: Mail, internal: true },
  ]

  return (
    <section
      aria-labelledby="hero-name"
      className="hero-section relative isolate flex min-h-svh flex-col justify-end overflow-hidden"
    >
      <HeroStage />

      <div className="hero-shell page-gutter relative z-10 mx-auto w-full max-w-7xl pt-28 pb-[calc(var(--spacing-nav-mobile)+1.5rem)] text-center lg:pb-14">
        <div className="hero-portrait mx-auto w-20 lg:w-24">
          <Figure
            image={profile.photo}
            locale={locale}
            ratio="square"
            priority
            sizes="6rem"
            className="hero-portrait__frame"
          />
        </div>

        <div className="hero-copy flex flex-col items-center">
          <p className="hero-chip eyebrow mt-6">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-signal shadow-[0_0_0_3px] shadow-signal/20"
            />
            {t.hero.availability}
          </p>

          <p className="mt-7 font-display text-lead text-paper-soft">{greeting}</p>

          <h1 id="hero-name" className="mt-1 text-display text-paper" lang="es">
            <span className="hero-name">{profile.name}</span>
          </h1>

          <p className="mx-auto mt-5 max-w-[30ch] font-display text-title text-signal">
            <Typed
              className="hero-headline"
              text={headline}
              start="var(--hero-headline-start)"
              step="var(--hero-step-headline)"
            />
          </p>

          <p className="figure-num mt-5 flex items-center justify-center gap-2 text-small text-paper-faint">
            <MapPin className="size-4" />
            {location}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Action href={href(locale, 'projects')} variant="primary">
              {t.hero.primaryCta}
            </Action>
            <Action href={href(locale, 'contact')} variant="secondary">
              {t.hero.secondaryCta}
            </Action>

            <ul className="ml-1 flex items-center gap-1" data-print="hide">
              {socials.map(({ href: linkHref, label, Icon, internal }) => (
                <li key={linkHref}>
                  <a
                    href={linkHref}
                    {...(internal ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                    aria-label={label}
                    className="flex size-10 items-center justify-center rounded-full text-paper-faint transition-colors hover:text-signal"
                  >
                    <Icon className="size-5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <dl className="mt-10 grid w-full grid-cols-4 gap-x-2 gap-y-7 border-t border-line pt-8 text-center lg:mt-12 lg:gap-x-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dd className="figure-num text-figure text-paper">{stat.value}</dd>
                <dt className="mt-2 font-mono text-[0.5625rem] leading-[1.4] tracking-[0.07em] text-paper-faint uppercase lg:text-[0.6875rem] lg:tracking-[0.14em]">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>

          <p
            data-print="hide"
            className="mt-12 hidden items-center justify-center gap-2 text-small text-paper-faint lg:flex"
          >
            {t.hero.scrollHint}
            <ArrowDown className="hero-hint__arrow size-4" />
          </p>
        </div>
      </div>
    </section>
  )
}
