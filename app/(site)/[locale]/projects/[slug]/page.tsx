import type { CSSProperties, ReactNode } from 'react'
import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { projectMedia } from '@/content/project-shots'
import { getProject, getProjectNeighbours, getProjectSlugs } from '@/lib/content'
import { site } from '@/content/site'
import { defaultLocale, isLocale, type Locale, localeHtmlLang, locales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { href, projectHref, projectsHref } from '@/lib/i18n/routes'
import { ProjectMedia } from '@/components/sections/ProjectMedia'
import { ProjectShot } from '@/components/sections/ProjectShot'
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
      languages: {
        ...Object.fromEntries(
          locales.map((entry) => [localeHtmlLang[entry], projectHref(entry, slug)]),
        ),
        'x-default': projectHref(defaultLocale, slug),
      },
    },
    openGraph: {
      type: 'article',
      url: `${site.url}${projectHref(raw, slug)}`,
      siteName: site.name,
      locale: localeHtmlLang[raw],
      title: project.name,
      description: project.tagline[raw],
      ...(project.image
        ? {
            images: [
              {
                url: project.image.src,
                width: project.image.width,
                height: project.image.height,
                alt: project.image.alt[raw],
              },
            ],
          }
        : {}),
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

  const media = projectMedia(project.slug)
  const alt = project.image?.alt[locale] ?? `${project.name} — ${project.tagline[locale]}`

  const shot = media ? <ProjectShot media={media} slug={project.slug} alt={alt} priority /> : null

  const framed =
    media?.clip && shot ? (
      <ProjectMedia
        src={media.clip}
        chrome={media.chrome}
        slug={project.slug}
        label={`${project.name} — ${t.projects.title}`}
      >
        {shot}
      </ProjectMedia>
    ) : (
      shot
    )

  const heroRatio = {
    '--hero-ratio': media ? `${media.desktop.width} / ${media.desktop.height}` : '2 / 1',
  } as CSSProperties

  const pageUrl = `${site.url}${projectHref(locale, project.slug)}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CreativeWork',
        '@id': `${pageUrl}#work`,
        name: project.name,
        headline: project.tagline[locale],
        description: project.summary[locale][0] ?? project.tagline[locale],
        url: pageUrl,
        inLanguage: localeHtmlLang[locale],
        dateCreated: project.year,
        keywords: project.stack.join(', '),
        author: { '@id': `${site.url}/#person` },
        isPartOf: { '@id': `${site.url}/#website` },
        ...(project.image ? { image: `${site.url}${project.image.src}` } : {}),
        ...(project.liveUrl ? { sameAs: project.liveUrl } : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: site.name, item: `${site.url}/${locale}` },
          {
            '@type': 'ListItem',
            position: 2,
            name: t.projects.allTitle,
            item: `${site.url}${projectsHref(locale)}`,
          },
          { '@type': 'ListItem', position: 3, name: project.name, item: pageUrl },
        ],
      },
    ],
  }

  return (
    <article className="page-gutter mx-auto max-w-[112rem] pt-28 pb-section text-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Reveal as="header">
        <h1 className="text-display text-signal">{project.name}</h1>
      </Reveal>

      <div className="mt-10 grid items-center gap-10 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
        {neighbours ? (
          <NeighbourArrow
            href={projectHref(locale, neighbours.previous.slug)}
            rel="prev"
            label={`${t.projects.carouselPrevious}: ${neighbours.previous.name}`}
          >
            <ArrowLeft className="size-6" />
          </NeighbourArrow>
        ) : null}

        <Reveal step={1} className="w-full">
          <div
            style={heroRatio}
            className="mx-auto w-full max-w-5xl md:max-w-[min(64rem,calc((100svh_-_18rem_-_var(--text-display))_*_var(--hero-ratio)))]"
          >
            {framed ?? (
              <Figure
                image={project.image}
                locale={locale}
                sizes="(min-width: 1024px) 64rem, 100vw"
              />
            )}
          </div>
        </Reveal>

        {neighbours ? (
          <NeighbourArrow
            href={projectHref(locale, neighbours.next.slug)}
            rel="next"
            label={`${t.projects.carouselNext}: ${neighbours.next.name}`}
          >
            <ArrowRight className="size-6" />
          </NeighbourArrow>
        ) : null}
      </div>

      <div className="mt-16">
        {project.summary[locale].length > 0 || project.note ? (
          <div className="mx-auto flex max-w-measure flex-col gap-6">
            {project.summary[locale].map((paragraph, index) => (
              <Reveal key={paragraph.slice(0, 40)} step={index}>
                <p className={index === 0 ? 'text-lead text-paper' : 'text-paper-soft'}>
                  {paragraph}
                </p>
              </Reveal>
            ))}

            {project.note ? (
              <Reveal className="mt-5 border-t-2 border-signal-dim bg-ink-raised px-5 py-4">
                <p className="text-small text-paper-soft">{project.note[locale]}</p>
              </Reveal>
            ) : null}
          </div>
        ) : null}

        {project.liveUrl || project.repoUrl ? (
          <Reveal step={1} className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {project.liveUrl ? (
              <Action
                href={project.liveUrl}
                variant="gilded"
                external
                externalHint={t.a11y.externalLink}
              >
                {t.projects.liveSite}
              </Action>
            ) : null}
            {project.repoUrl ? (
              <Action
                href={project.repoUrl}
                variant="gilded"
                external
                externalHint={t.a11y.externalLink}
              >
                {t.projects.sourceCode}
              </Action>
            ) : null}
          </Reveal>
        ) : null}
      </div>

      {project.highlights && project.highlights.length > 0 ? (
        <section className="mx-auto mt-16 max-w-6xl">
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
        <section className="mx-auto mt-16 max-w-6xl">
          <h2 className="figure-num border-b border-line pb-3 text-small text-signal uppercase">
            {t.projects.stackLabel}
          </h2>
          <div className="mt-6">
            <TagList items={project.stack} label={`${t.projects.stackLabel} — ${project.name}`} />
          </div>
        </section>
      ) : null}

      <Reveal className="mt-16 flex justify-center">
        <Action href={href(locale, 'projects')} variant="gilded">
          <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
          {t.projects.backToProjects}
        </Action>
      </Reveal>
    </article>
  )
}

function NeighbourArrow({
  href: target,
  rel,
  label,
  children,
}: {
  href: string
  rel: 'prev' | 'next'
  label: string
  children: ReactNode
}) {
  return (
    <Link
      href={target}
      rel={rel}
      aria-label={label}
      data-print="hide"
      className="gilded-action hidden size-14 items-center justify-center rounded-full bg-ink text-paper transition-colors duration-300 hover:text-signal lg:flex"
    >
      {children}
    </Link>
  )
}
