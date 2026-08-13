import Link from 'next/link'
import type { ExperienceEntry } from '@/content/types'
import { formatDuration, formatRange } from '@/lib/format'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { sections } from '@/lib/i18n/routes'
import { Briefcase } from '@/components/ui/Icons'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TagList } from '@/components/ui/Tag'

export function Experience({
  locale,
  entries,
}: {
  locale: Locale
  entries: readonly ExperienceEntry[]
}) {
  const t = getDictionary(locale)

  const timeline = [...entries].reverse()

  return (
    <section
      id={sections.experience}
      className="page-gutter mx-auto max-w-7xl section-block text-center"
    >
      <SectionHeading
        index="02"
        title={t.experience.title}
        kicker={t.experience.kicker}
        icon={Briefcase}
        textIndent="lg:pl-72"
      />

      <ol className="exp-timeline border-l border-transparent">
        {timeline.map((entry, index) => (
          <Reveal
            as="li"
            key={entry.slug}
            step={index}
            className="relative pb-14 pl-6 last:pb-0 lg:pl-10"
          >
            <span
              aria-hidden="true"
              className={
                index === timeline.length - 1
                  ? 'absolute top-1.5 -left-[5px] size-[9px] rounded-full bg-signal'
                  : 'absolute top-1.5 -left-[5px] size-[9px] rounded-full border border-line-strong bg-ink'
              }
            />

            <div className="lg:grid lg:grid-cols-[13rem_1fr] lg:gap-10">
              <div className="lg:pt-0.5">
                <p className="figure-num text-small text-signal">
                  {formatRange(entry.range, locale, t.experience.present)}
                </p>
                <p className="figure-num mt-1 text-small text-paper-faint">
                  {formatDuration(entry.range, t.experience.units)}
                </p>
                <p className="figure-num mt-1 text-small text-paper-faint">
                  {entry.location[locale]}
                </p>
              </div>

              <div className="mt-4 lg:mt-0">
                <h3 className="text-title text-paper">{entry.role[locale]}</h3>

                <p className="mt-1.5 text-lead text-paper-soft">
                  {entry.url ? (
                    <Link
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-underline transition-colors hover:text-signal"
                    >
                      {entry.company}
                      <span className="sr-only">
                        {' '}
                        — {t.experience.visitCompany} ({t.a11y.externalLink})
                      </span>
                    </Link>
                  ) : (
                    entry.company
                  )}
                  {entry.client ? (
                    <span className="text-paper-faint">
                      {' '}
                      {t.experience.forClient} {entry.client}
                    </span>
                  ) : null}
                </p>

                <div className="mt-5 mx-auto max-w-measure space-y-3.5">
                  {entry.summary[locale].map((paragraph) => (
                    <p key={paragraph.slice(0, 40)} className="text-paper-soft">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {entry.stack && entry.stack.length > 0 ? (
                  <div className="mt-6">
                    <TagList
                      items={entry.stack}
                      label={`${t.experience.stackLabel} — ${entry.role[locale]}, ${entry.company}`}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  )
}
