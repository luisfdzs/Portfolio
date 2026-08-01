import type { ProjectEntry } from '@/content/types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary, interpolate } from '@/lib/i18n/dictionaries'
import { href } from '@/lib/i18n/routes'
import { Action } from '@/components/ui/Action'
import { Code } from '@/components/ui/Icons'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ProjectCard } from './ProjectCard'

/**
 * Proyectos en la portada: sólo los destacados, a dos columnas.
 *
 * No están todos a propósito. El índice de `/projects` existe para quien quiera el
 * catálogo completo; la portada tiene que enseñar los cuatro que mejor representan el
 * trabajo y dejar paso a la siguiente sección. Seis tarjetas aquí serían dos pantallas de
 * scroll antes de llegar a la formación.
 *
 * El id de la sección es `projects` igual que la ruta `/projects`. No colisionan —uno es
 * un ancla y el otro un segmento de URL— y compartir nombre es lo que permite que el menú
 * apunte a la página y la barra de móvil a esta sección sin dos claves distintas.
 */
export function Projects({
  locale,
  featured,
  total,
}: {
  locale: Locale
  featured: readonly ProjectEntry[]
  total: number
}) {
  const t = getDictionary(locale)

  return (
    // El id es una cadena literal y no una clave de `sections`: «proyectos» no es un
    // ancla del sistema de navegación —el menú y la barra de móvil llevan a la página
    // `/projects`— pero conviene poder enlazar el bloque de la portada directamente.
    <section id="projects" className="page-gutter mx-auto max-w-7xl section-block text-center">
      <SectionHeading index="03" title={t.projects.title} kicker={t.projects.kicker} icon={Code}>
        <p>{t.projects.intro}</p>
      </SectionHeading>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-16">
        {featured.map((project, index) => (
          <Reveal key={project.slug} step={index}>
            <ProjectCard locale={locale} project={project} />
          </Reveal>
        ))}
      </div>

      {/* El enlace al índice sólo aparece si de verdad hay más que enseñar. */}
      {total > featured.length ? (
        <Reveal className="mt-14 border-t border-line pt-8">
          <Action href={href(locale, 'projects')} variant="secondary">
            {interpolate(t.projects.viewAll, { count: total })}
          </Action>
        </Reveal>
      ) : null}
    </section>
  )
}
