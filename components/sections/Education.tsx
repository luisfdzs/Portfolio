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
 * **Es la sección más desnuda del sitio, y a propósito**: no tiene frase debajo del rótulo, no
 * enseña fechas y no enseña la ubicación. Las tres cosas se han ido quitando por encargo y
 * todas por la misma razón: en una sección de una sola entrada, cada dato de más invita a
 * hacer cuentas —cuánto se tardó, qué edad tiene, dónde estudió— en vez de a leer lo único que
 * importa aquí, que es qué base deja una ingeniería. Los datos siguen en el contenido y en el
 * panel; lo que cambia es que esto no los pinta.
 *
 * Lo que sí es un argumento es la nota al pie de la entrada, y por eso el campo `note`
 * existe en el modelo. **Habla de la base, no del calendario**: qué forma de pensar deja una
 * ingeniería cuando el trabajo ya no es de ingeniero. Antes contaba que la carrera se cursó
 * en paralelo a jornada completa de desarrollo, y se cambió por lo mismo que hizo caer las
 * fechas de aquí: cuánto se tardó y cuánto se solapó son datos que invitan a la cuenta de los
 * años, no a valorar a quién se está leyendo.
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
      {/*
       * SIN FRASE DEBAJO DEL RÓTULO, y es un encargo, no un olvido. Decía «De la ingeniería
       * industrial al desarrollo web», que es un resumen de la trayectoria y no de esta
       * sección: lo que cuenta el cambio de rumbo es la experiencia, con las fechas al lado, y
       * aquí se leía como el titular de una sección que sólo tiene una entrada. Sin ella el
       * rótulo pasa a ser el `<h2>` (ver `SectionHeading`).
       */}
      <SectionHeading index="03" title={t.education.title} icon={GraduationCap} />

      <ol className="space-y-10">
        {entries.map((entry, index) => (
          <Reveal as="li" key={entry.slug} step={index}>
            {/*
             * NI FECHAS NI UBICACIÓN, y las dos ausencias son decisiones.
             *
             * La columna de la izquierda enseñaba «sept. 2020 — jun. 2025» y después «Vigo,
             * Galicia»; las dos se han quitado por encargo, en ese orden. Las fechas, porque en
             * formación sólo pueden restar: con cinco años de experiencia encima, un título
             * acabado hace poco invita a la cuenta de la edad y a la de cuánto se tardó, y
             * ninguna de las dos dice nada sobre cómo trabaja alguien. La ubicación, porque ya
             * está donde importa —el hero dice «Vigo, Galicia, en remoto» y la experiencia la
             * repite en cada puesto—, y dónde se estudió no decide nada.
             *
             * **Y con eso se cae la retícula.** Había tres columnas en escritorio, la tercera
             * vacía, para devolver lo que empujaba a la derecha la columna de la izquierda;
             * vacía la primera, mantenerla sería estrechar el contenido a cambio de nada. El
             * bloque vuelve a ocupar la sección entera y se centra solo.
             *
             * `entry.range` y `entry.location` **no se borran del contenido**: son datos
             * verdaderos del CV y el modelo los mantiene (el panel los sigue pidiendo). Lo que
             * cambia es que esta sección no los pinta. En experiencia las fechas siguen
             * estando, y ahí sí son el argumento: lo que un recruiter comprueba primero es que
             * no haya huecos.
             */}
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
          </Reveal>
        ))}
      </ol>
    </section>
  )
}
