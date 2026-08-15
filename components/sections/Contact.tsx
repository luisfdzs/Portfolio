import Link from 'next/link'
import type { Profile } from '@/content/types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { sections } from '@/lib/i18n/routes'
import { Action } from '@/components/ui/Action'
import { GitHub, LinkedIn, Mail, MapPin } from '@/components/ui/Icons'
import { Reveal } from '@/components/ui/Reveal'

// Vive dentro de «Perfil»: quién soy y cómo se me escribe son la misma conversación.
// Mantiene su propio id para que el menú y los enlaces a #contact sigan valiendo.
export function Contact({ locale, profile }: { locale: Locale; profile: Profile }) {
  const t = getDictionary(locale)

  const channels = [
    {
      label: t.contact.linkedinLabel,
      value: 'in/luisfernandezsangil',
      href: profile.linkedin,
      Icon: LinkedIn,
      external: true,
    },
    {
      label: t.contact.githubLabel,
      value: 'luisfdzs',
      href: profile.github,
      Icon: GitHub,
      external: true,
    },
  ]

  return (
    <div id={sections.contact} className="mt-16 border-t border-line pt-14 lg:mt-20">
      <Reveal>
        <div className="flex items-center justify-center gap-3 border-b border-line pb-4">
          <Mail className="size-4 text-paper-faint" />
          <span className="eyebrow">{t.contact.title}</span>
        </div>
      </Reveal>

      <Reveal step={1}>
        <h3 className="mt-6 mx-auto max-w-[24ch] text-title text-paper lg:mt-8 lg:max-w-[52ch]">
          {t.contact.kicker}
        </h3>
        <p className="mt-5 mx-auto max-w-measure text-paper-soft">{t.contact.lead}</p>
      </Reveal>

      <Reveal step={2} className="mt-10">
        <Link
          href={`mailto:${profile.email}`}
          className="figure-num group inline-flex max-w-full items-center gap-3 text-title break-all text-paper transition-colors hover:text-signal"
        >
          <Mail className="hidden size-7 shrink-0 text-signal sm:block" />
          <span className="link-underline">{profile.email}</span>
        </Link>
      </Reveal>

      <div className="mt-12 grid gap-8 border-t border-line pt-10 sm:grid-cols-3">
        {channels.map(({ label, value, href: channelHref, Icon, external }, index) => (
          <Reveal key={label} step={index}>
            <p className="eyebrow">{label}</p>
            <Link
              href={channelHref}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="tap mt-2 inline-flex items-center gap-2 text-paper transition-colors hover:text-signal"
            >
              <Icon className="size-4 shrink-0" />
              <span className="link-underline figure-num text-small">{value}</span>
              {external ? <span className="sr-only">({t.a11y.externalLink})</span> : null}
            </Link>
          </Reveal>
        ))}

        <Reveal step={2}>
          <p className="eyebrow">{t.contact.locationLabel}</p>
          <p className="mt-2 inline-flex items-center gap-2 text-paper">
            <MapPin className="size-4 shrink-0 text-paper-faint" />
            <span className="figure-num text-small">{profile.location[locale]}</span>
          </p>
        </Reveal>
      </div>

      <Reveal className="mt-14">
        <Action href={`mailto:${profile.email}`} variant="primary">
          {t.hero.secondaryCta}
        </Action>
      </Reveal>
    </div>
  )
}
