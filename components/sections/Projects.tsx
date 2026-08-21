import type { ProjectEntry } from '@/content/types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { projectsHref, sections } from '@/lib/i18n/routes'
import { Action } from '@/components/ui/Action'
import { CoverFlow } from '@/components/ui/CoverFlow'
import { Code } from '@/components/ui/Icons'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ProjectCard } from './ProjectCard'
import { ProjectMediaHints } from './ProjectMediaHints'

export function Projects({
  locale,
  projects,
}: {
  locale: Locale
  projects: readonly ProjectEntry[]
}) {
  const t = getDictionary(locale)

  return (
    <section id={sections.projects} className="section-block text-center">
      <ProjectMediaHints projects={projects} />
      <div className="page-gutter mx-auto max-w-7xl">
        <SectionHeading index="01" title={t.projects.title} kicker={t.projects.kicker} icon={Code}>
          <p>{t.projects.intro}</p>
        </SectionHeading>
      </div>

      <Reveal>
        <CoverFlow
          label={t.projects.carousel}
          previousLabel={t.projects.carouselPrevious}
          nextLabel={t.projects.carouselNext}
          action={
            <Action href={projectsHref(locale)} variant="beacon">
              {t.projects.seeAll}
            </Action>
          }
          slides={projects.map((project, index) => ({
            key: project.slug,
            front: <ProjectCard locale={locale} project={project} priority={index === 0} />,
            reflection: <ProjectCard locale={locale} project={project} animate={false} />,
          }))}
        />
      </Reveal>
    </section>
  )
}
