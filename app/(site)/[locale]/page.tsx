import { cacheLife } from 'next/cache'
import { notFound } from 'next/navigation'
import { site } from '@/content/site'
import {
  getCarouselProjects,
  getEducation,
  getExperience,
  getProfile,
  getSkills,
} from '@/lib/content'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { About } from '@/components/sections/About'
import { Education } from '@/components/sections/Education'
import { Experience } from '@/components/sections/Experience'
import { Hero } from '@/components/sections/Hero'
import { Projects } from '@/components/sections/Projects'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  'use cache'
  cacheLife('max')

  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  const [profile, experience, education, skills, projects] = await Promise.all([
    getProfile(),
    getExperience(),
    getEducation(),
    getSkills(),
    getCarouselProjects(),
  ])

  const currentJob = experience.find((entry) => entry.range.end === null) ?? experience[0]
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    url: `${site.url}/${locale}`,
    jobTitle: profile.headline[locale],
    email: `mailto:${profile.email}`,
    description: profile.bio[locale][0],
    sameAs: [profile.linkedin, profile.github],
    ...(currentJob ? { worksFor: { '@type': 'Organization', name: currentJob.company } } : {}),
    alumniOf: education.map((entry) => ({
      '@type': 'EducationalOrganization',
      name: entry.institution[locale],
      ...(entry.url ? { url: entry.url } : {}),
    })),
    knowsAbout: skills.flatMap((group) => group.items),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Hero locale={locale} profile={profile} />
      <Projects locale={locale} projects={projects} />
      <Experience locale={locale} entries={experience} />
      <Education locale={locale} entries={education} />
      <About locale={locale} profile={profile} />
    </>
  )
}
