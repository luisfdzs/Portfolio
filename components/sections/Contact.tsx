import Link from 'next/link'
import type { Profile } from '@/content/types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { sections } from '@/lib/i18n/routes'
import { Mail } from '@/components/ui/Icons'
import { Reveal } from '@/components/ui/Reveal'
import { SocialCard } from '@/components/ui/SocialCard'

export function Contact({ locale, profile }: { locale: Locale; profile: Profile }) {
  const t = getDictionary(locale)

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

      <div className="mt-12 flex justify-center border-t border-line pt-12">
        <SocialCard locale={locale} profile={profile} />
      </div>
    </div>
  )
}
