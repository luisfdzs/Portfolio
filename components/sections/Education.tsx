import Link from 'next/link'
import type { EducationEntry } from '@/content/types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { sections } from '@/lib/i18n/routes'
import { GraduationCap } from '@/components/ui/Icons'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'

export function Education({
  locale,
  entries,
}: {
  locale: Locale
  entries: readonly EducationEntry[]
}) {
  const t = getDictionary(locale)

  return (
    <section
      id={sections.education}
      className="page-gutter mx-auto max-w-7xl section-block text-center"
    >
      <SectionHeading index="03" title={t.education.title} icon={GraduationCap} />

      <ol className="space-y-10">
        {entries.map((entry, index) => (
          <Reveal as="li" key={entry.slug} step={index}>
            <h3 className="text-title text-paper">{entry.title[locale]}</h3>

            <p className="mt-1.5 text-lead text-paper-soft">
              {entry.url ? (
                <Link
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline transition-colors hover:text-signal"
                >
                  {entry.institution[locale]}
                  <span className="sr-only"> ({t.a11y.externalLink})</span>
                </Link>
              ) : (
                entry.institution[locale]
              )}
            </p>

            {entry.note && entry.note[locale].length > 0 ? (
              <div className="mt-4 mx-auto max-w-measure space-y-3.5">
                {entry.note[locale].map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="text-paper-soft">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}
          </Reveal>
        ))}
      </ol>
    </section>
  )
}
