import Link from 'next/link'
import type { Profile } from '@/content/types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { sections } from '@/lib/i18n/routes'
import { Action } from '@/components/ui/Action'
import { GitHub, LinkedIn, Mail, MapPin } from '@/components/ui/Icons'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'

/**
 * Contacto.
 *
 * **No hay formulario, y es una decisión.** Un formulario en un portfolio añade un
 * backend, una dependencia de un servicio de correo, un captcha —o spam— y una pantalla de
 * «gracias», y a cambio le pide a quien escribe que confíe en que el mensaje ha salido de
 * verdad. Un `mailto:` con la dirección visible deja el mensaje en su propia bandeja de
 * enviados, que es donde quiere tenerlo alguien que escribe por trabajo. Y la dirección
 * escrita entera permite copiarla a mano, que es lo que hace la mitad de la gente.
 *
 * El correo va en monoespaciada por la misma razón que las cifras: se lee carácter a
 * carácter cuando alguien lo teclea, y en una sans un `l` y un `1` se confunden.
 */
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
    <section
      id={sections.contact}
      className="page-gutter mx-auto max-w-7xl section-block text-center"
    >
      <SectionHeading index="06" title={t.contact.title} kicker={t.contact.kicker} icon={Mail}>
        <p>{t.contact.lead}</p>
      </SectionHeading>

      <Reveal>
        {/* El correo, al tamaño de titular: es la conversión de toda la página. */}
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
    </section>
  )
}
