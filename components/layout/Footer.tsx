import Link from 'next/link'
import { site } from '@/content/site'
import type { Profile } from '@/content/types'
import { buildYear } from '@/lib/format'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { SocialLinks } from '@/components/ui/SocialLinks'

export function Footer({ locale, profile }: { locale: Locale; profile: Profile }) {
  const t = getDictionary(locale)
  const year = buildYear()

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

          <SocialLinks locale={locale} profile={profile} size="large" />

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
