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

/**
 * Experiencia laboral, en línea temporal.
 *
 * Cuatro decisiones que la hacen legible en treinta segundos, que es lo que se le dedica:
 *
 * - **Las fechas van en monoespaciada y en su propia columna** a la izquierda en
 *   escritorio. Así se leen en vertical como una tabla y se ve de un vistazo que no hay
 *   huecos entre puestos — que es exactamente lo que un recruiter comprueba primero.
 * - **La duración, entre paréntesis y calculada**, nunca escrita a mano: se saca de las
 *   fechas, así que el puesto actual no puede quedarse diciendo «6 meses» dos años después.
 * - **La empresa y el cliente final, separados.** «Altia · para Banco Santander Portugal»
 *   es la verdad completa; cualquiera de las dos mitades sola engaña en una dirección.
 * - **El filete vertical y el punto** dan continuidad visual sin bordes de tarjeta: cuatro
 *   tarjetas serían cuatro bloques sueltos, y esto es una trayectoria.
 */
export function Experience({
  locale,
  entries,
}: {
  locale: Locale
  entries: readonly ExperienceEntry[]
}) {
  const t = getDictionary(locale)

  return (
    <section id={sections.experience} className="page-gutter mx-auto max-w-7xl section-block">
      <SectionHeading
        index="02"
        title={t.experience.title}
        kicker={t.experience.kicker}
        icon={Briefcase}
      />

      <ol className="border-l border-line">
        {entries.map((entry, index) => (
          <Reveal
            as="li"
            key={entry.slug}
            step={index}
            className="relative pb-14 pl-6 last:pb-0 lg:pl-10"
          >
            {/* El punto de la línea temporal. El primero —el puesto actual— va en cobre y
                relleno; los pasados, huecos. Es la única jerarquía que hace falta. */}
            <span
              aria-hidden="true"
              className={
                index === 0
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
                      // Sin icono de enlace externo, y no por descuido: el `ArrowUpRight`
                      // que había aquí en `opacity-0` seguía ocupando su hueco en la línea,
                      // así que metía un espacio de más entre «Altia» y el «·» del cliente.
                      // El subrayado al pasar por encima ya dice que es un enlace, y el
                      // aviso para lectores de pantalla sigue estando.
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
                      {' · '}
                      {t.experience.forClient} {entry.client}
                    </span>
                  ) : null}
                </p>

                <div className="mt-5 max-w-measure space-y-3.5">
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
