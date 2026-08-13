import type { Profile, SkillGroup } from '@/content/types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { sections } from '@/lib/i18n/routes'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { User } from '@/components/ui/Icons'
import { Stack } from '@/components/sections/Stack'

export function About({
  locale,
  profile,
  skills,
}: {
  locale: Locale
  profile: Profile
  skills: readonly SkillGroup[]
}) {
  const t = getDictionary(locale)
  const [lead, ...rest] = profile.bio[locale]

  return (
    <section
      id={sections.about}
      className="page-gutter mx-auto max-w-7xl section-block text-center"
    >
      <SectionHeading index="04" title={t.about.title} kicker={t.about.kicker} icon={User} />

      {lead ? (
        <Reveal>
          <p className="mx-auto max-w-measure text-lead text-paper">{lead}</p>
        </Reveal>
      ) : null}

      {rest.length > 0 ? (
        <div
          className={
            rest.length > 1
              ? 'mt-10 grid gap-x-14 gap-y-6 lg:grid-cols-2'
              : 'mt-10 mx-auto max-w-measure'
          }
        >
          {rest.map((paragraph, index) => (
            <Reveal key={paragraph.slice(0, 40)} step={index + 1}>
              <p className="text-paper-soft">{paragraph}</p>
            </Reveal>
          ))}
        </div>
      ) : null}

      <Stack locale={locale} groups={skills} />
    </section>
  )
}
