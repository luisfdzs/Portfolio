import Link from 'next/link'
import type { ProjectEntry } from '@/content/types'
import { cn } from '@/lib/cn'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { href } from '@/lib/i18n/routes'
import { Figure } from '@/components/ui/Figure'
import { ArrowRight } from '@/components/ui/Icons'
import { Tag } from '@/components/ui/Tag'

/** Cuántas tecnologías caben en una tarjeta antes de que la lista deje de leerse. */
const STACK_LIMIT = 5

const statusStyles: Record<ProjectEntry['status'], string> = {
  live: 'text-signal',
  prototype: 'text-paper-faint',
  archived: 'text-paper-faint',
}

/**
 * Tarjeta de proyecto, la misma en la portada y en el índice de `/projects`.
 *
 * **Toda la tarjeta es el enlace**, no un «Ver más» al final: en móvil el área pulsable es
 * el dedo entero y obligar a acertar en un enlace de texto de 13 px es hostil. El truco es
 * un `<Link>` con `absolute inset-0` sobre el bloque —así el `<h3>` sigue siendo el texto
 * accesible del enlace— y `relative` en el contenedor.
 *
 * Las **etiquetas de stack se cortan a cinco** con un «+n»: Swiftmet declara siete y la
 * fila se comía la tarjeta. La lista completa está en la ficha, que es donde alguien que
 * ha llegado hasta ahí quiere el detalle.
 */
export function ProjectCard({
  locale,
  project,
  priority = false,
}: {
  locale: Locale
  project: ProjectEntry
  priority?: boolean
}) {
  const t = getDictionary(locale)
  const stack = project.stack ?? []
  const visible = stack.slice(0, STACK_LIMIT)
  const hidden = stack.length - visible.length

  return (
    <article className="group relative flex flex-col">
      <Figure
        image={project.image}
        locale={locale}
        priority={priority}
        sizes="(min-width: 1024px) 45vw, 100vw"
        className="transition-opacity duration-500 group-hover:opacity-85"
      />

      <div className="mt-5 flex items-center gap-3">
        <span className={cn('eyebrow', statusStyles[project.status])}>
          {t.projects.status[project.status]}
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
        <span className="figure-num text-small text-paper-faint">{project.year}</span>
      </div>

      <h3 className="mt-3 text-title text-paper">
        <Link
          href={href(locale, 'projects', project.slug)}
          className="transition-colors group-hover:text-signal"
        >
          {/* La capa que hace pulsable la tarjeta entera. `z-10` para quedar por encima
              de la imagen y del texto, pero por debajo de nada más: dentro de la tarjeta
              no hay otros enlaces, justamente para que esto no atrape ninguno. */}
          <span className="absolute inset-0 z-10" />
          {project.name}
        </Link>
      </h3>

      <p className="mt-2 text-paper-soft">{project.tagline[locale]}</p>

      {visible.length > 0 ? (
        <ul
          aria-label={`${t.projects.stackLabel} — ${project.name}`}
          className="mt-5 flex flex-wrap gap-2"
        >
          {visible.map((item) => (
            <Tag key={item}>{item}</Tag>
          ))}
          {hidden > 0 ? <Tag className="border-dashed text-paper-faint">{`+${hidden}`}</Tag> : null}
        </ul>
      ) : null}

      <p className="mt-5 inline-flex items-center gap-2 text-small text-signal">
        {t.projects.viewProject}
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
      </p>
    </article>
  )
}
