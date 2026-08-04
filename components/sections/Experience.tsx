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
 * - **La empresa y el cliente final, separados.** «Altia → INDRA & Kids&Us» es la verdad
 *   completa; cualquiera de las dos mitades sola engaña en una dirección.
 * - **El filete vertical y el punto** dan continuidad visual sin bordes de tarjeta: cuatro
 *   tarjetas serían cuatro bloques sueltos, y esto es una trayectoria.
 *
 * **Y en escritorio es la CABECERA la que se corre**, no la lista: el carril de fechas empuja
 * el texto 18rem a la derecha, así que un rótulo centrado en la sección nunca coincide con el
 * titular del puesto que encabeza. Se le pasa el mismo sangrado (`textIndent`) y los dos
 * quedan en el mismo eje. La lista, en consecuencia, ocupa el ancho entero y no compensa nada.
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

  /*
   * DE ANTIGUO A RECIENTE, AL REVÉS QUE EL CONTENIDO, y sólo aquí: `entries` llega en el
   * orden del CV —lo último primero— y así se queda en el contenido, en el panel y en el
   * JSON-LD. Lo que se invierte es la lectura de esta sección, porque desde que la línea
   * temporal marca el progreso de scroll tiene que **avanzar** al bajar: con el puesto de hoy
   * arriba, la barra iba encendiéndose hacia atrás en el tiempo, que es lo contrario de lo
   * que dibuja.
   *
   * `[...entries]` porque `reverse()` muta, y `entries` es un `readonly` que viene del
   * contenido: invertirlo en el sitio afectaría a quien lo lea después en el mismo render.
   *
   * Consecuencia que hay que llevar de la mano: **el puesto actual ya no es el índice 0**,
   * es el último. Es lo que decide qué punto va relleno.
   */
  const timeline = [...entries].reverse()

  return (
    <section
      id={sections.experience}
      className="page-gutter mx-auto max-w-7xl section-block text-center"
    >
      {/*
       * LA CABECERA SE CENTRA SOBRE LA COLUMNA DEL PUESTO, no sobre la sección, y los 18rem
       * son la única cuenta que queda en esta sección: el sangrado de la línea temporal
       * (`lg:pl-10`, 2,5rem) + el carril de fechas (13rem) + el hueco de la retícula (2,5rem).
       * Eso es lo que separa el borde izquierdo de la sección del borde izquierdo del texto,
       * así que rellenar la cabecera con lo mismo pone el rótulo y el titular de cada puesto
       * en el mismo eje. Es relleno y no margen para que el filete siga cruzando la sección
       * entera; el detalle está en `SectionHeading`.
       *
       * Quien toque el carril, el hueco o el sangrado tiene que traer aquí la nueva suma —y
       * nada avisa si se olvida—, pero ahora es UN número y no dos que se descuadran juntos.
       */}
      <SectionHeading
        index="02"
        title={t.experience.title}
        kicker={t.experience.kicker}
        icon={Briefcase}
        textIndent="lg:pl-72"
      />

      {/*
       * SIN MARGEN NI COLUMNA VACÍA DE COMPENSACIÓN, y las dos cosas se fueron juntas. Existían
       * para lo contrario de lo que hay ahora: empujaban la lista y recortaban su ancho para
       * que el bloque visible quedara centrado en la sección, con la cabecera en el eje de la
       * sección. Pero lo que se lee no es el bloque, es el texto — y el texto seguía escorado
       * respecto al rótulo. Centrada la cabecera sobre la columna del puesto, la lista puede
       * ocupar el ancho entero, que es lo que era antes de la aritmética.
       */}
      {/* `exp-timeline`: el filete cobre y la barra de progreso de lectura. El `border-l`
          sigue puesto y va transparente — es él quien reserva el píxel del que cuelgan el
          sangrado de los `li` y los puntos; el color lo pintan dos pseudoelementos encima,
          que es lo único que se puede degradar y animar. Bloque «La línea temporal de
          experiencia» de `globals.css`.

          **`border-transparent` va aquí y no en la hoja**, aunque el bloque de `globals.css`
          lo explique: `border-line` es una utilidad de Tailwind y una regla de
          `@layer components` pierde contra ella por muy específica que sea —entre capas manda
          el orden de las capas—. Dejarlo en la hoja no quitaba el gris: pintaba el cobre a su
          lado y la línea salía de dos píxeles. Es la misma trampa que documenta
          `.hero-portrait__frame`. */}
      <ol className="exp-timeline border-l border-transparent">
        {timeline.map((entry, index) => (
          <Reveal
            as="li"
            key={entry.slug}
            step={index}
            className="relative pb-14 pl-6 last:pb-0 lg:pl-10"
          >
            {/* El punto de la línea temporal. El del puesto actual va en cobre y relleno;
                los pasados, huecos. Es la única jerarquía que hace falta.
                **El actual es el ÚLTIMO**, no el primero, desde que la lista se lee de
                antiguo a reciente. */}
            <span
              aria-hidden="true"
              className={
                index === timeline.length - 1
                  ? 'absolute top-1.5 -left-[5px] size-[9px] rounded-full bg-signal'
                  : 'absolute top-1.5 -left-[5px] size-[9px] rounded-full border border-line-strong bg-ink'
              }
            />

            {/* DOS columnas: el carril de fechas y el puesto, que se queda con el resto.
                Hubo una tercera vacía a la derecha para centrar la columna del puesto en
                la sección; sobra desde que es la cabecera la que se centra sobre ella. Los
                13rem del carril y el hueco de 2,5rem son dos de los tres sumandos del
                `textIndent` de la cabecera: cambiar uno obliga a recalcularlo. */}
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
                  {/* SIN « · » DELANTE, y no es un descuido: desde el 2026-08-04 el enlace de
                      la unión es una flecha («Altia → INDRA & Kids&Us») en vez de la palabra
                      «para», y una flecha ya separa. Con el punto medio delante quedaban dos
                      separadores seguidos, « · → », que se lee como un error de plantilla. */}
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
