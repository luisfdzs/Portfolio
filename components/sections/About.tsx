import type { Profile } from '@/content/types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { sections } from '@/lib/i18n/routes'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Home } from '@/components/ui/Icons'

/**
 * Perfil: los tres párrafos que explican de dónde sales y cómo trabajas.
 *
 * Es la única sección de prosa larga del sitio, y va **antes** de la experiencia a
 * propósito: la lista de puestos dice qué has hecho, pero no por qué un ingeniero
 * industrial acabó escribiendo software, que es justo la pregunta que se hace quien lee tu
 * CV y la que decide si sigue leyendo.
 *
 * El primer párrafo lleva un tamaño mayor —de entradilla— porque en una sección de tres
 * párrafos que nadie va a leer entera, el primero es el que tiene que aguantar solo.
 *
 * **El resto va a dos columnas en escritorio**, y no por adorno. Es la única sección del
 * sitio que es prosa y nada más: con una sola columna de medida de lectura, a 1400 px quedaba
 * la mitad derecha en blanco, y ese vacío se lee como un error de maquetación justo en el
 * bloque más personal de la página. A dos columnas cada una mide unos 45 caracteres —dentro
 * del rango cómodo— y el bloque ocupa el ancho que le corresponde. Sólo se parten los
 * párrafos que van después de la entradilla: partir también la entradilla obligaría a subir y
 * bajar la vista para leer las tres primeras frases, que son las que más importan.
 */
export function About({ locale, profile }: { locale: Locale; profile: Profile }) {
  const t = getDictionary(locale)
  // Desestructurar en vez de indexar: con `noUncheckedIndexedAccess`, `paragraphs[0]` es
  // `string | undefined` y habría que comprobarlo de todas formas. Así el tipo lo dice solo,
  // y el esquema ya garantiza que hay al menos un párrafo (ver `localizedParagraphs`).
  const [lead, ...rest] = profile.bio[locale]

  return (
    <section id={sections.about} className="page-gutter mx-auto max-w-7xl section-block">
      <SectionHeading index="01" title={t.about.title} kicker={t.about.kicker} icon={Home} />

      {lead ? (
        <Reveal>
          <p className="max-w-measure text-lead text-paper">{lead}</p>
        </Reveal>
      ) : null}

      {rest.length > 0 ? (
        <div className="mt-10 grid gap-x-14 gap-y-6 lg:grid-cols-2">
          {rest.map((paragraph, index) => (
            <Reveal key={paragraph.slice(0, 40)} step={index + 1}>
              <p className="text-paper-soft">{paragraph}</p>
            </Reveal>
          ))}
        </div>
      ) : null}
    </section>
  )
}
