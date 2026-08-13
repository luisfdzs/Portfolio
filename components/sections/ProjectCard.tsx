import Link from 'next/link'
import type { ProjectEntry } from '@/content/types'
import { cn } from '@/lib/cn'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { projectHref } from '@/lib/i18n/routes'
import { Figure } from '@/components/ui/Figure'
import { ArrowRight } from '@/components/ui/Icons'
import { Tag } from '@/components/ui/Tag'

const STACK_LIMIT = 5

const statusStyles: Record<ProjectEntry['status'], string> = {
  live: 'text-signal',
  prototype: 'text-paper-faint',
  archived: 'text-paper-faint',
}

export function ProjectCard({ locale, project }: { locale: Locale; project: ProjectEntry }) {
  const t = getDictionary(locale)
  const stack = project.stack ?? []
  const visible = stack.slice(0, STACK_LIMIT)
  const hidden = stack.length - visible.length

  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-line-strong bg-ink-raised p-4 text-center sm:p-5">
      <Figure
        image={project.image}
        locale={locale}
        sizes="(min-width: 34rem) 28rem, 70vw"
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
          href={projectHref(locale, project.slug)}
          className="transition-colors group-hover:text-signal"
        >
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

      <p className="mt-auto flex items-center justify-center gap-2 pt-5 text-small text-signal">
        {t.projects.viewProject}
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
      </p>
    </article>
  )
}
