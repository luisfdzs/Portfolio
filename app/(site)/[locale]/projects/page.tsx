import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { site } from '@/content/site'
import { getCarouselProjects } from '@/lib/content'
import { isLocale, type Locale, localeHtmlLang, locales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { href, projectsHref } from '@/lib/i18n/routes'
import { ProjectCard } from '@/components/sections/ProjectCard'
import { ArrowLeft } from '@/components/ui/Icons'
import { Reveal } from '@/components/ui/Reveal'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  const t = getDictionary(locale)

  return {
    title: t.projects.allTitle,
    description: t.projects.allDescription,
    alternates: {
      canonical: projectsHref(locale),
      languages: {
        ...Object.fromEntries(locales.map((entry) => [localeHtmlLang[entry], projectsHref(entry)])),
        'x-default': projectsHref('es'),
      },
    },
    openGraph: {
      type: 'website',
      url: `${site.url}${projectsHref(locale)}`,
      title: t.projects.allTitle,
      description: t.projects.allDescription,
    },
  }
}

export default async function ProjectsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  'use cache'
  cacheLife('max')

  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  const t = getDictionary(locale)
  const projects = await getCarouselProjects()

  return (
    <div className="page-gutter mx-auto max-w-7xl pt-28 pb-section lg:pt-40">
      <Reveal>
        <Link
          href={href(locale, 'home')}
          className="group inline-flex items-center gap-2 text-small text-paper-faint transition-colors hover:text-signal"
        >
          <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
          {t.projects.backHome}
        </Link>
      </Reveal>

      <header className="mt-8 text-center">
        <Reveal>
          <h1 className="text-display text-paper">{t.projects.allTitle}</h1>
        </Reveal>
        <Reveal step={1}>
          <p className="mt-5 mx-auto max-w-measure font-display text-title text-signal">
            {t.projects.allKicker}
          </p>
        </Reveal>
        <Reveal step={2}>
          <p className="mt-5 mx-auto max-w-measure text-paper-soft">{t.projects.allIntro}</p>
        </Reveal>
      </header>

      <ul className="mt-14 grid grid-cols-2 gap-3 sm:gap-6 lg:mt-20 lg:grid-cols-3">
        {projects.map((project, index) => (
          <Reveal as="li" key={project.slug} step={index % 3} className="grid">
            <ProjectCard locale={locale} project={project} animate={false} />
          </Reveal>
        ))}
      </ul>
    </div>
  )
}
