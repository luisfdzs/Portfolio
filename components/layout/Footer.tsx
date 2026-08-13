import Link from 'next/link'
import { site } from '@/content/site'
import type { Profile } from '@/content/types'
import { buildYear } from '@/lib/format'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { GitHub, LinkedIn, Mail } from '@/components/ui/Icons'

export function Footer({ locale, profile }: { locale: Locale; profile: Profile }) {
  const t = getDictionary(locale)
  const year = buildYear()

  const links = [
    { href: `mailto:${profile.email}`, label: profile.email, Icon: Mail, external: false },
    { href: profile.linkedin, label: t.contact.linkedinLabel, Icon: LinkedIn, external: true },
    { href: profile.github, label: t.contact.githubLabel, Icon: GitHub, external: true },
  ]

  return (
    <footer className="border-t border-line bg-ink-sunken">
      <div className="page-gutter mx-auto max-w-7xl py-12 text-center lg:py-16">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-display text-xl text-paper">{profile.name}</p>
            <p className="mt-1 text-small text-paper-faint">{profile.headline[locale]}</p>
            <p className="figure-num mt-3 text-small text-paper-faint">
              {profile.location[locale]}
            </p>
          </div>

          <ul className="flex flex-col gap-3">
            {links.map(({ href: linkHref, label, Icon, external }) => (
              <li key={linkHref}>
                <Link
                  href={linkHref}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="tap group inline-flex items-center gap-2.5 text-small text-paper-soft transition-colors hover:text-signal"
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="link-underline">{label}</span>
                  {external ? <span className="sr-only">({t.a11y.externalLink})</span> : null}
                </Link>
              </li>
            ))}
          </ul>

          <div>
            <Link
              href={site.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="tap text-small text-paper-soft transition-colors hover:text-signal"
            >
              <span className="link-underline">{t.footer.sourceCode}</span>
              <span className="sr-only">({t.a11y.externalLink})</span>
            </Link>
            <p className="mt-3 mx-auto max-w-[34ch] text-small text-paper-faint">
              {t.footer.builtWith}
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-line pt-6">
          <p className="figure-num text-small text-paper-faint">
            © {year} {profile.name}. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  )
}
