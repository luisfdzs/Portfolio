import type { Profile } from '@/content/types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { sections } from '@/lib/i18n/routes'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { User } from '@/components/ui/Icons'
import { Contact } from '@/components/sections/Contact'
import { SwarmAnchor } from '@/components/sections/SwarmAnchor'

export function About({ locale, profile }: { locale: Locale; profile: Profile }) {
  const t = getDictionary(locale)
  const [lead, ...rest] = profile.bio[locale]

  return (
    <section
      id={sections.about}
      className="page-gutter mx-auto max-w-7xl section-block text-center"
    >
      <SectionHeading index="04" title={t.about.title} kicker={t.about.kicker} icon={User} />

      <div className="grid items-center gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-x-16 lg:text-left">
        <SwarmAnchor
          set="setup"
          label={t.showcase.sets.setup}
          stageClassName="mx-auto h-80 max-w-xl sm:h-96 lg:h-[32rem] lg:max-w-none"
        />

        <div className="space-y-6">
          {lead ? (
            <Reveal>
              <p className="mx-auto max-w-measure text-lead text-paper lg:mx-0">{lead}</p>
            </Reveal>
          ) : null}

          {rest.map((paragraph, index) => (
            <Reveal key={paragraph.slice(0, 40)} step={index + 1}>
              <p className="mx-auto max-w-measure text-paper-soft lg:mx-0">{paragraph}</p>
            </Reveal>
          ))}
        </div>
      </div>

      <Contact locale={locale} profile={profile} />
    </section>
  )
}
