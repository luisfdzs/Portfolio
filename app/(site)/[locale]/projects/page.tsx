import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { notFound } from 'next/navigation'
import { getProjects } from '@/lib/content'
import { isLocale, type Locale, locales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { ProjectCard } from '@/components/sections/ProjectCard'
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
  const t = getDictionary(raw)

  return {
    title: t.projects.index.title,
    description: t.projects.index.lead,
  }
}

/**
 * Índice completo de proyectos.
 *
 * Existe por una razón concreta: **una URL que se pueda mandar suelta.** Cuando alguien
 * pregunta «¿qué has hecho?» por LinkedIn, la respuesta útil es un enlace a esto, no un
 * ancla a mitad de una página de CV que obliga a pasar por encima de la experiencia
 * laboral. Lo mismo, a más precisión, con la ficha de cada proyecto.
 *
 * En la portada están los mismos proyectos —todos—, pero en un carrusel que se hojea de uno en
 * uno. Aquí se ven a la vez, a tres columnas en pantalla grande: eso es lo que distingue a esta
 * página de aquella sección, no un catálogo más largo.
 */
export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  // Estática completa, por lo mismo que la portada: ver el comentario en `[locale]/page.tsx`.
  'use cache'
  cacheLife('max')

  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  const t = getDictionary(locale)
  const projects = await getProjects()

  return (
    <div className="page-gutter mx-auto max-w-7xl pt-28 pb-section text-center lg:pt-40">
      <header className="mb-16 border-b border-line pb-10 lg:mb-20">
        <Reveal>
          <p className="eyebrow">{t.projects.title}</p>
          <h1 className="mt-4 text-display text-paper">{t.projects.index.title}</h1>
          <p className="mt-6 mx-auto max-w-measure text-lead text-paper-soft">
            {t.projects.index.lead}
          </p>
        </Reveal>
      </header>

      <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
        {projects.map((project, index) => (
          <Reveal key={project.slug} step={index}>
            {/* `priority` sólo en las dos primeras: son las únicas que caben sobre la
                línea de flotación, y marcar más imágenes como prioritarias las hace
                competir entre sí y empeora el LCP en vez de mejorarlo. */}
            <ProjectCard locale={locale} project={project} priority={index < 2} />
          </Reveal>
        ))}
      </div>
    </div>
  )
}
