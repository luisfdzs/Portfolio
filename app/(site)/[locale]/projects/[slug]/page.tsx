import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProject, getProjectNeighbours, getProjectSlugs } from '@/lib/content'
import { isLocale, type Locale, locales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { href, projectHref } from '@/lib/i18n/routes'
import { Action } from '@/components/ui/Action'
import { Figure } from '@/components/ui/Figure'
import { ArrowLeft, ArrowRight } from '@/components/ui/Icons'
import { Reveal } from '@/components/ui/Reveal'
import { TagList } from '@/components/ui/Tag'

export async function generateStaticParams() {
  const slugs = await getProjectSlugs()
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale: raw, slug } = await params
  if (!isLocale(raw)) notFound()

  const project = await getProject(slug)
  if (!project) return {}

  return {
    title: project.name,
    description: project.tagline[raw],
    alternates: {
      canonical: projectHref(raw, slug),
      languages: Object.fromEntries(locales.map((entry) => [entry, projectHref(entry, slug)])),
    },
    openGraph: {
      type: 'article',
      title: project.name,
      description: project.tagline[raw],
    },
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  'use cache'
  cacheLife('max')

  const { locale: raw, slug } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  const t = getDictionary(locale)
  const project = await getProject(slug)
  if (!project) notFound()

  const neighbours = await getProjectNeighbours(slug)

  const facts = [
    { label: t.projects.role, value: project.role[locale] },
    { label: t.projects.year, value: project.year },
    { label: t.projects.statusLabel, value: t.projects.status[project.status] },
  ]

  return (
    <article className="page-gutter mx-auto max-w-5xl pt-28 pb-section text-center lg:pt-40">
      <Reveal>
        <Link
          href={href(locale, 'projects')}
          className="group inline-flex items-center gap-2 text-small text-paper-faint transition-colors hover:text-signal"
        >
          <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
          {t.projects.backToProjects}
        </Link>
      </Reveal>

      <header className="mt-8">
        <Reveal>
          <h1 className="text-display text-paper">{project.name}</h1>
          <p className="mt-5 mx-auto max-w-measure font-display text-title text-signal">
            {project.tagline[locale]}
          </p>
        </Reveal>

        <Reveal step={1} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {project.liveUrl ? (
            <Action
              href={project.liveUrl}
              variant="primary"
              external
              externalHint={t.a11y.externalLink}
            >
              {t.projects.liveSite}
            </Action>
          ) : null}
          {project.repoUrl ? (
            <Action
              href={project.repoUrl}
              variant="secondary"
              external
              externalHint={t.a11y.externalLink}
            >
              {t.projects.sourceCode}
            </Action>
          ) : null}
        </Reveal>
      </header>

      <Reveal step={2} className="mt-14">
        <Figure image={project.image} locale={locale} sizes="(min-width: 1024px) 64rem, 100vw" />
      </Reveal>

      <dl className="mt-12 grid gap-8 border-y border-line py-8 sm:grid-cols-3">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt className="eyebrow">{fact.label}</dt>
            <dd className="mt-2 text-small text-paper">{fact.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-14 mx-auto max-w-measure space-y-5">
        {project.summary[locale].map((paragraph, index) => (
          <Reveal key={paragraph.slice(0, 40)} step={index}>
            <p className={index === 0 ? 'text-lead text-paper' : 'text-paper-soft'}>{paragraph}</p>
          </Reveal>
        ))}
      </div>

      {project.note ? (
        <Reveal className="mt-10 mx-auto max-w-measure border-t-2 border-signal-dim bg-ink-raised px-5 py-4">
          <p className="text-small text-paper-soft">{project.note[locale]}</p>
        </Reveal>
      ) : null}

      {project.highlights && project.highlights.length > 0 ? (
        <section className="mt-16">
          <h2 className="figure-num border-b border-line pb-3 text-small text-signal uppercase">
            {t.projects.highlights}
          </h2>
          <ol className="mt-8 space-y-7">
            {project.highlights.map((highlight, index) => (
              <Reveal as="li" key={highlight[locale].slice(0, 40)} step={index}>
                <div className="flex flex-col items-center gap-2">
                  <span className="figure-num text-small text-paper-faint" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="mx-auto max-w-measure text-paper-soft">{highlight[locale]}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </section>
      ) : null}

      {project.stack && project.stack.length > 0 ? (
        <section className="mt-16">
          <h2 className="figure-num border-b border-line pb-3 text-small text-signal uppercase">
            {t.projects.stackLabel}
          </h2>
          <div className="mt-6">
            <TagList items={project.stack} label={`${t.projects.stackLabel} — ${project.name}`} />
          </div>
        </section>
      ) : null}

      {neighbours ? (
        <nav
          aria-label={t.projects.title}
          className="mt-20 grid gap-6 border-t border-line pt-10 sm:grid-cols-2"
        >
          <Link
            href={projectHref(locale, neighbours.previous.slug)}
            className="group flex flex-col items-center gap-1"
          >
            <span className="eyebrow inline-flex items-center gap-2">
              <ArrowLeft className="size-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
              {t.projects.previous}
            </span>
            <span className="font-display text-lead text-paper transition-colors group-hover:text-signal">
              {neighbours.previous.name}
            </span>
          </Link>

          <Link
            href={projectHref(locale, neighbours.next.slug)}
            className="group flex flex-col items-center gap-1"
          >
            <span className="eyebrow inline-flex items-center gap-2">
              {t.projects.next}
              <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
            <span className="font-display text-lead text-paper transition-colors group-hover:text-signal">
              {neighbours.next.name}
            </span>
          </Link>
        </nav>
      ) : null}
    </article>
  )
}
