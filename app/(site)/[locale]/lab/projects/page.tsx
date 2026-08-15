import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCarouselProjects } from '@/lib/content'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { ProjectsLab } from '@/components/lab/ProjectsLab'
import { Projects } from '@/components/sections/Projects'

export const metadata: Metadata = {
  title: 'Lab · Proyectos',
  robots: { index: false, follow: false },
}

export default async function ProjectsLabPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  const projects = await getCarouselProjects()

  return (
    <ProjectsLab>
      <Projects locale={locale} projects={projects} />
    </ProjectsLab>
  )
}
