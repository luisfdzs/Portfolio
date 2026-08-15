import Link from 'next/link'
import { projectClip } from '@/content/project-clips'
import type { ProjectEntry } from '@/content/types'
import { cn } from '@/lib/cn'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { projectHref } from '@/lib/i18n/routes'
import { Figure } from '@/components/ui/Figure'
import { ProjectMedia } from './ProjectMedia'

const statusStyles: Record<ProjectEntry['status'], string> = {
  live: 'text-signal',
  prototype: 'text-paper-faint',
  archived: 'text-paper-faint',
}

export function ProjectCard({ locale, project }: { locale: Locale; project: ProjectEntry }) {
  const t = getDictionary(locale)
  const clip = projectClip(project.slug)

  const figure = (
    <Figure
      image={project.image}
      locale={locale}
      ratio="fluid"
      sizes="(min-width: 64rem) 36rem, (min-width: 48rem) 26rem, 72vw"
      className="cover-flow-figure transition-opacity duration-500 group-hover:opacity-85"
    />
  )

  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-line-strong bg-ink-raised p-3 text-center sm:p-4">
      {clip ? (
        <ProjectMedia src={clip} label={`${project.name} — ${t.projects.title}`}>
          {figure}
        </ProjectMedia>
      ) : (
        figure
      )}

      <div className="mt-4 flex items-center gap-3">
        <span className={cn('eyebrow', statusStyles[project.status])}>
          {t.projects.status[project.status]}
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
        <span className="figure-num text-small text-paper-faint">{project.year}</span>
      </div>

      <h3 className="mt-2 text-title text-paper">
        <Link
          href={projectHref(locale, project.slug)}
          className="transition-colors group-hover:text-signal"
        >
          <span className="absolute inset-0 z-10" />
          {project.name}
        </Link>
      </h3>

      <p className="mt-1 pb-1 text-small text-paper-soft">{project.tagline[locale]}</p>
    </article>
  )
}
