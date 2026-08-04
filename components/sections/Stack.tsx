import type { SkillGroup } from '@/content/types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { Layers } from '@/components/ui/Icons'
import { Reveal } from '@/components/ui/Reveal'
import { Tag } from '@/components/ui/Tag'

/**
 * Stack, agrupado por función. **Es una SUBSECCIÓN del perfil, no una sección propia.**
 *
 * Fue una de las seis secciones de la portada hasta el 2026-08-04, con su `<section id>`, su
 * entrada en el menú y su número de cabecera. Ahora va dentro de «Perfil», debajo de los tres
 * párrafos, por encargo — y el encargo tiene su lógica: las dos contestan la misma pregunta.
 * El perfil dice cómo trabaja alguien y el stack dice con qué; separados por un rótulo
 * numerado, la lista de tecnologías se leía como un anexo del CV en vez de como la segunda
 * mitad de la respuesta. Juntos, quien acaba de leer «me lo he aprendido por mi cuenta» tiene
 * la prueba en la línea siguiente.
 *
 * Lo que eso cambia en el código, que es más de lo que parece:
 *
 * - **No hay `<section>` ni `id`.** El contenedor lo pone `About`, que es quien tiene el ancla
 *   `#about`. `stack` salió de `sections` y de `navigation` en `lib/i18n/routes.ts`, así que el
 *   menú tiene cinco entradas y `useActiveSection` cinco secciones que medir.
 * - **La cabecera no es `SectionHeading`.** Ese componente numera («01…05») y aquí no hay
 *   número que poner: numerarlo diría que es la sexta sección justo después de decidir que no
 *   lo es. Lleva un rótulo propio, con el mismo filete y el mismo icono para que se lea como
 *   familia.
 * - **Los títulos de grupo bajan de `<h3>` a `<h4>`.** Dentro del perfil el `<h2>` es «Perfil»
 *   y el `<h3>` es «Stack»; dejar los grupos en `<h3>` los pondría al mismo nivel que el
 *   rótulo que los agrupa y rompería el esquema de encabezados de la página, que es cómo se
 *   navega con lector de pantalla.
 *
 * **La nota al pie se quitó el 2026-08-04**, por encargo. Decía «ordenado por lo que uso a
 * diario, no por lo que he tocado alguna vez» y el argumento para tenerla era bueno —una lista
 * de tecnologías sin jerarquía es igual de creíble esté lo que esté escrito—, pero dentro del
 * perfil son dos líneas de letra pequeña al final de la sección de prosa, justo antes del
 * contacto. El orden de cada grupo sigue siendo el mismo, de más a menos uso real; lo que ya no
 * se hace es explicarlo.
 */
export function Stack({ locale, groups }: { locale: Locale; groups: readonly SkillGroup[] }) {
  const t = getDictionary(locale)

  return (
    <div className="mt-16 border-t border-line pt-14 lg:mt-20">
      {/* El rótulo, calcado del de `SectionHeading` menos el número: mismo filete, mismo
          icono, mismas versalitas. Lo que cambia es la jerarquía —`<h3>`, porque el `<h2>`
          de esta sección es «Perfil»— y el tamaño del subtítulo, que aquí no compite con el
          rótulo de la sección. */}
      <Reveal>
        <div className="flex items-center justify-center gap-3 border-b border-line pb-4">
          <Layers className="size-4 text-paper-faint" />
          <h3 className="eyebrow">{t.stack.title}</h3>
        </div>
      </Reveal>

      <Reveal step={1}>
        <p className="mt-6 mx-auto max-w-measure text-lead text-paper-soft">{t.stack.kicker}</p>
      </Reveal>

      {/* SIN NOTA AL PIE, y la clave `stack.note` ya no existe: quien la reponga tiene que
          añadir las dos cosas. Ver el diccionario. */}
      <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {groups.map((group, index) => (
          <Reveal key={group.key} step={index}>
            <h4 className="figure-num border-b border-line pb-3 text-small text-signal uppercase">
              {group.title[locale]}
            </h4>
            <ul className="mt-5 flex flex-wrap justify-center gap-2">
              {group.items.map((item) => (
                <Tag key={item}>{item}</Tag>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
