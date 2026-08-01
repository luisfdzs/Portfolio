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
 *
 * Todo el texto va centrado en la tarjeta. La fila de estado y año es la excepción a medias:
 * sigue siendo `estado —— año` con el filete estirándose en medio, porque ahí los dos datos
 * están anclados a los bordes de la imagen a propósito y centrarlos los juntaría en un
 * amontonamiento sin significado.
 *
 * `framed` la convierte en un panel con borde y fondo propios. Lo pide el carrusel de la
 * portada: una tarjeta girada en el espacio tiene que parecer un objeto con cantos, y sin
 * fondo el giro se lee como un texto torcido. En la retícula del índice el panel sobraría —
 * ahí las tarjetas ya están separadas por el hueco de la cuadrícula.
 */
export function ProjectCard({
  locale,
  project,
  priority = false,
  framed = false,
}: {
  locale: Locale
  project: ProjectEntry
  priority?: boolean
  framed?: boolean
}) {
  const t = getDictionary(locale)
  const stack = project.stack ?? []
  const visible = stack.slice(0, STACK_LIMIT)
  const hidden = stack.length - visible.length

  return (
    <article
      className={cn(
        'group relative flex flex-col text-center',
        framed && 'h-full rounded-xl border border-line-strong bg-ink-raised p-4 sm:p-5',
      )}
    >
      <Figure
        image={project.image}
        locale={locale}
        priority={priority}
        // En el carrusel la tarjeta nunca pasa de 28rem, que es el tope de
        // `--cover-flow-card`: pedir 45vw ahí descargaría una captura del doble de lo
        // que se va a ver.
        sizes={framed ? '(min-width: 34rem) 28rem, 70vw' : '(min-width: 1024px) 45vw, 100vw'}
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
          className="mt-5 flex flex-wrap justify-center gap-2"
        >
          {visible.map((item) => (
            <Tag key={item}>{item}</Tag>
          ))}
          {hidden > 0 ? <Tag className="border-dashed text-paper-faint">{`+${hidden}`}</Tag> : null}
        </ul>
      ) : null}

      {/* Con `framed` las tarjetas están todas al mismo alto y los textos no miden lo
          mismo: `mt-auto` baja esta línea al pie de cada una para que las cuatro flechas
          queden en la misma altura y la fila no parezca descuadrada. */}
      <p
        className={cn(
          'flex items-center justify-center gap-2 text-small text-signal',
          framed ? 'mt-auto pt-5' : 'mt-5',
        )}
      >
        {t.projects.viewProject}
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
      </p>
    </article>
  )
}
