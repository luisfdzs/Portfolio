import Link from 'next/link'
import type { EducationEntry } from '@/content/types'
import { formatRange } from '@/lib/format'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { sections } from '@/lib/i18n/routes'
import { GraduationCap } from '@/components/ui/Icons'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'

/**
 * Formación.
 *
 * Va **después** de los proyectos, y eso es deliberado: con cinco años de experiencia y
 * seis webs en producción, el título ya no es el argumento principal —lo era el primer
 * año—. Sigue estando porque el grado en Ingeniería Industrial es lo que explica el perfil
 * y porque muchas ofertas lo piden como requisito formal.
 *
 * Lo que sí es un argumento es la nota al pie de la entrada: la carrera se cursó en
 * paralelo a jornada completa de desarrollo. Eso dice más sobre cómo trabaja alguien que
 * la titulación en sí, y por eso el campo `note` existe en el modelo.
 */
export function Education({
  locale,
  entries,
}: {
  locale: Locale
  entries: readonly EducationEntry[]
}) {
  const t = getDictionary(locale)

  return (
    <section id={sections.education} className="page-gutter mx-auto max-w-7xl section-block">
      <SectionHeading
        index="04"
        title={t.education.title}
        kicker={t.education.kicker}
        icon={GraduationCap}
      />

      <ol className="space-y-10">
        {entries.map((entry, index) => (
          <Reveal as="li" key={entry.slug} step={index}>
            <div className="lg:grid lg:grid-cols-[13rem_1fr] lg:gap-10">
              <div>
                <p className="figure-num text-small text-signal">
                  {formatRange(entry.range, locale, t.education.ongoing)}
                </p>
                {entry.location ? (
                  <p className="figure-num mt-1 text-small text-paper-faint">
                    {entry.location[locale]}
                  </p>
                ) : null}
              </div>

              <div className="mt-3 lg:mt-0">
                <h3 className="text-title text-paper">{entry.title[locale]}</h3>

                <p className="mt-1.5 text-lead text-paper-soft">
                  {entry.url ? (
                    <Link
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-underline transition-colors hover:text-signal"
                    >
                      {entry.institution}
                      <span className="sr-only"> ({t.a11y.externalLink})</span>
                    </Link>
                  ) : (
                    entry.institution
                  )}
                </p>

                {entry.note ? (
                  <p className="mt-4 max-w-measure text-paper-soft">{entry.note[locale]}</p>
                ) : null}
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  )
}
