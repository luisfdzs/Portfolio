import type { Profile, SkillGroup } from '@/content/types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { sections } from '@/lib/i18n/routes'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { User } from '@/components/ui/Icons'
import { Stack } from '@/components/sections/Stack'

/**
 * Perfil: los párrafos que explican quién eres y cómo trabajas — **y el stack debajo**.
 *
 * **Las dos eran secciones distintas hasta el 2026-08-04 y ahora son una.** El encargo era
 * juntarlas, y la razón por la que funciona es que contestan la misma pregunta por sus dos
 * mitades: el perfil dice cómo trabaja alguien y el stack dice con qué. Con un rótulo numerado
 * en medio, la lista de tecnologías se leía como un anexo; pegada a los párrafos, es la prueba
 * de lo que acaban de decir. `Stack` es ahora una subsección sin `<section>` ni ancla propia
 * —ver su propio comentario, que es donde está lo que eso arrastró—.
 *
 * Es la única sección de prosa larga del sitio, y por eso va **al final**, justo antes de
 * contacto. Estuvo primera, con el argumento de que explica por qué un ingeniero industrial
 * acabó escribiendo software antes de que nadie lea la lista de puestos. El orden nuevo lo
 * invierte a propósito: tres párrafos de prosa en la segunda pantalla son un peaje para
 * quien todavía no sabe si le interesas, y las capturas de los proyectos y las fechas de la
 * experiencia contestan la misma pregunta enseñando en vez de contando. Quien llega hasta
 * aquí ya ha decidido seguir leyendo, y es exactamente a quien va dirigido este texto.
 *
 * El primer párrafo lleva un tamaño mayor —de entradilla— porque en una sección de prosa que
 * nadie va a leer entera, el primero es el que tiene que aguantar solo.
 *
 * **El resto va a dos columnas en escritorio, pero sólo si hay dos párrafos**, y las dos mitades
 * de esa frase son decisiones. Las columnas no son adorno: es la única sección del sitio que es
 * prosa y nada más, y con una sola columna de medida de lectura, a 1400 px quedaba la mitad
 * derecha en blanco; a dos, cada una mide unos 45 caracteres —dentro del rango cómodo— y el
 * bloque ocupa el ancho que le corresponde. Pero desde que detrás de la entradilla hay un único
 * párrafo, la retícula producía exactamente el vacío que existía para evitar, así que ahora se
 * monta según cuántos párrafos haya (ver el comentario de la retícula, más abajo). La entradilla
 * nunca se parte: obligaría a subir y bajar la vista para leer las primeras frases, que son las
 * que más importan.
 *
 * Con el texto centrado, las dos columnas siguen siendo la maquetación correcta cuando hay
 * párrafos para llenarlas: cada uno se centra en la columna que ocupa.
 */
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
  // Desestructurar en vez de indexar: con `noUncheckedIndexedAccess`, `paragraphs[0]` es
  // `string | undefined` y habría que comprobarlo de todas formas. Así el tipo lo dice solo,
  // y el esquema ya garantiza que hay al menos un párrafo (ver `localizedParagraphs`).
  const [lead, ...rest] = profile.bio[locale]

  return (
    <section
      id={sections.about}
      className="page-gutter mx-auto max-w-7xl section-block text-center"
    >
      {/* «04» y no «05»: al fundirse con el stack, la portada pasa de seis secciones
          numeradas a cinco. La numeración está escrita a mano en cada cabecera y nada
          avisa si se olvida una — ver el protocolo en `CLAUDE.md`. */}
      <SectionHeading index="04" title={t.about.title} kicker={t.about.kicker} icon={User} />

      {lead ? (
        <Reveal>
          <p className="mx-auto max-w-measure text-lead text-paper">{lead}</p>
        </Reveal>
      ) : null}

      {/*
       * DOS COLUMNAS SÓLO SI HAY DOS PÁRRAFOS QUE PONER EN ELLAS.
       *
       * La retícula era fija, y con las podas del 2026-08-04 quedó un único párrafo detrás de la
       * entradilla: en escritorio se pintaba en la columna izquierda y la mitad derecha de la
       * sección se quedaba en blanco. Ese hueco no se lee como una elección, se lee como que
       * falta un texto — y encima en el bloque más personal de la página, que es el que menos
       * puede permitirse parecer a medias.
       *
       * Con un solo párrafo la maquetación correcta es la de la entradilla: una columna de
       * medida de lectura centrada. Con dos o más vuelve la retícula, que sigue siendo lo que
       * evita la media página vacía cuando hay prosa para llenarla. La condición cambia el
       * contenedor entero y no una clase suelta, porque lo que sobra con un párrafo es la
       * retícula, no una de sus columnas.
       */}
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
