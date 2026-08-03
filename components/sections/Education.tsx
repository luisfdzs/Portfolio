import Link from 'next/link'
import type { EducationEntry } from '@/content/types'
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
    <section
      id={sections.education}
      className="page-gutter mx-auto max-w-7xl section-block text-center"
    >
      <SectionHeading
        index="03"
        title={t.education.title}
        kicker={t.education.kicker}
        icon={GraduationCap}
      />

      <ol className="space-y-10">
        {entries.map((entry, index) => (
          <Reveal as="li" key={entry.slug} step={index}>
            <div className="lg:grid lg:grid-cols-[13rem_1fr] lg:gap-10">
              {/*
               * SIN FECHAS, y es una decisión, no un olvido.
               *
               * La columna enseñaba «sept. 2020 — jun. 2025» y se ha quitado por encargo. El
               * argumento es que en formación las fechas sólo pueden restar: con cinco años de
               * experiencia encima, un título acabado hace poco invita a la cuenta de la edad y
               * a la de cuánto se tardó, y ninguna de las dos dice nada sobre cómo trabaja
               * alguien. Lo que sí lo dice está en la nota de abajo —la carrera cursada en
               * paralelo a jornada completa—, y ahí sigue.
               *
               * `entry.range` **no se borra del contenido**: es un dato verdadero del CV y el
               * modelo lo mantiene (el panel lo sigue pidiendo). Lo que cambia es que esta
               * sección no lo pinta. En experiencia las fechas siguen estando, y ahí sí son el
               * argumento: lo que un recruiter comprueba primero es que no haya huecos.
               */}
              {entry.location ? (
                <div>
                  <p className="figure-num text-small text-paper-faint">{entry.location[locale]}</p>
                </div>
              ) : (
                <div />
              )}

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
                      {entry.institution[locale]}
                      <span className="sr-only"> ({t.a11y.externalLink})</span>
                    </Link>
                  ) : (
                    entry.institution[locale]
                  )}
                </p>

                {entry.note ? (
                  <p className="mt-4 mx-auto max-w-measure text-paper-soft">{entry.note[locale]}</p>
                ) : null}
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  )
}
