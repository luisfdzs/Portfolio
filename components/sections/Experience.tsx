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
 *
 * **Y en escritorio la lista entera va corrida a la derecha**, que es lo que hace que el
 * conjunto —filete, fechas y puesto— quede centrado en la sección en vez de pegado al margen
 * izquierdo con un hueco de 18rem a la derecha. La cuenta está donde se aplica, en el `ol`.
 *
 * El texto va centrado en cada una de las dos columnas —fechas y puesto—, y el filete y los
 * puntos siguen a la izquierda: son la línea del tiempo, no texto, y moverlos al centro
 * partiría cada entrada en dos mitades. La columna de fechas mantiene `tabular-nums`, así
 * que las tres líneas de cada entrada siguen midiendo lo mismo y se leen como un bloque.
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
    <section
      id={sections.experience}
      className="page-gutter mx-auto max-w-7xl section-block text-center"
    >
      <SectionHeading
        index="02"
        title={t.experience.title}
        kicker={t.experience.kicker}
        icon={Briefcase}
      />

      {/*
       * EL MARGEN DE 9REM EN ESCRITORIO ES LO QUE CENTRA LA SECCIÓN, y sin él la lista se ve
       * corrida a la izquierda por mucho que cada texto esté centrado en su columna.
       *
       * La cuenta, que es toda la explicación: lo que se ve de cada entrada va desde el filete
       * de la línea temporal hasta el borde derecho de la columna del puesto, y a la derecha de
       * eso queda una columna vacía —la que existe para que el titular del puesto caiga en el
       * mismo eje que el rótulo de la sección—. Con la columna vacía entera a la derecha, ese
       * bloque visible acababa 18rem antes del borde y no empezaba hasta el borde mismo: el ojo
       * lee un bloque descentrado, porque lo está. Los 18rem se reparten ahora a medias, 9 y 9,
       * y el conjunto queda centrado en la sección; el resto lo absorbe la columna del puesto,
       * que es `1fr`.
       *
       * `ml` y no `pl`: el filete es el borde izquierdo de esta lista y los puntos se colocan
       * respecto a él. Con relleno, el filete se quedaría clavado en el margen de la página y
       * las fechas se irían solas a la derecha.
       *
       * **Quien cambie el margen tiene que cambiar la tercera columna, y al revés**: la suma de
       * los dos más el hueco de la retícula es constante, y descuadrar uno mueve el bloque
       * entero sin que nada avise. Es la misma aritmética a mano que ya había en la retícula.
       */}
      <ol className="border-l border-line lg:ml-36">
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

            {/* TRES columnas en escritorio y la tercera va vacía, a propósito.
                Con dos, el texto quedaba centrado en su columna pero la columna no
                estaba centrada en la sección: la de fechas (13rem), su hueco (2,5rem)
                y el sangrado de la línea temporal (2,5rem) empujan el contenido
                18rem a la derecha, así que su centro caía 9rem por delante del centro
                del rótulo. Se veía como un desfase entre la cabecera y las entradas.
                La columna vacía es lo que devuelve eso, y **mide 6,5rem porque los
                otros 9rem los pone ya el margen de la lista**: 6,5 + 2,5 de hueco
                son los 9 que faltan hasta los 18. Sin elemento de más: la pista
                existe por la plantilla. Quien toque `lg:pl-10`, la columna de fechas,
                el `gap` o el `lg:ml-36` de la lista tiene que recalcular este valor
                —los dos ajustes son la misma cuenta y se descuadran juntos—. */}
            <div className="lg:grid lg:grid-cols-[13rem_1fr_6.5rem] lg:gap-10">
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
