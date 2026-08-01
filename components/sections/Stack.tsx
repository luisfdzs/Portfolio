import type { SkillGroup } from '@/content/types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { sections } from '@/lib/i18n/routes'
import { Layers } from '@/components/ui/Icons'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Tag } from '@/components/ui/Tag'

/**
 * Stack, agrupado por función.
 *
 * La nota al pie —«ordenado por lo que uso a diario, no por lo que he tocado alguna vez»—
 * es la parte que da valor a la sección. Una lista de tecnologías sin jerarquía es
 * exactamente igual de creíble esté lo que esté escrito, y quien la lee lo sabe; decir en
 * voz alta cuál es el criterio de orden es lo único que convierte la lista en información.
 *
 * Es la última sección antes del contacto porque es la que se consulta, no la que se lee:
 * quien busca «.NET» hace Ctrl+F y quien no, pasa de largo hacia el correo.
 */
export function Stack({ locale, groups }: { locale: Locale; groups: readonly SkillGroup[] }) {
  const t = getDictionary(locale)

  return (
    <section id={sections.stack} className="page-gutter mx-auto max-w-7xl section-block">
      <SectionHeading index="05" title={t.stack.title} kicker={t.stack.kicker} icon={Layers} />

      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {groups.map((group, index) => (
          <Reveal key={group.key} step={index}>
            <h3 className="figure-num border-b border-line pb-3 text-small text-signal uppercase">
              {group.title[locale]}
            </h3>
            <ul className="mt-5 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <Tag key={item}>{item}</Tag>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-12">
        <p className="max-w-measure text-small text-paper-faint">{t.stack.note}</p>
      </Reveal>
    </section>
  )
}
