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
import { buildDate } from '@/lib/format'
import { isLocale, localeHtmlLang, locales, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { About } from '@/components/sections/About'
import { Education } from '@/components/sections/Education'
import { Experience } from '@/components/sections/Experience'
import { Hero } from '@/components/sections/Hero'
import { Projects } from '@/components/sections/Projects'
import { Swarm } from '@/components/sections/Swarm'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  'use cache'
  cacheLife('max')

  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw
  const t = getDictionary(locale)

  const [profile, experience, education, skills, projects] = await Promise.all([
    getProfile(),
    getExperience(),
    getEducation(),
    getSkills(),
    getCarouselProjects(),
  ])

  const currentJob = experience.find((entry) => entry.range.end === null) ?? experience[0]
  const personId = `${site.url}/#person`
  const websiteId = `${site.url}/#website`
  const pageUrl = `${site.url}/${locale}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId,
        name: profile.name,
        givenName: 'Luis',
        familyName: 'Fernández Sangil',
        alternateName: site.alternateNames,
        url: site.url,
        image: `${site.url}${profile.photo.src}`,
        jobTitle: profile.headline[locale],
        email: `mailto:${profile.email}`,
        description: profile.bio[locale][0],
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Vigo',
          addressRegion: 'Galicia',
          addressCountry: 'ES',
        },
        knowsLanguage: ['es', 'en'],
        sameAs: [profile.linkedin, profile.github],
        ...(currentJob ? { worksFor: { '@type': 'Organization', name: currentJob.company } } : {}),
        alumniOf: education.map((entry) => ({
          '@type': 'EducationalOrganization',
          name: entry.institution[locale],
          ...(entry.url ? { url: entry.url } : {}),
        })),
        knowsAbout: skills.flatMap((group) => group.items),
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        name: site.name,
        alternateName: site.alternateNames,
        url: site.url,
        inLanguage: locales.map((entry) => localeHtmlLang[entry]),
        publisher: { '@id': personId },
      },
      {
        '@type': 'ProfilePage',
        '@id': `${pageUrl}#page`,
        url: pageUrl,
        name: t.meta.title,
        inLanguage: localeHtmlLang[locale],
        isPartOf: { '@id': websiteId },
        mainEntity: { '@id': personId },
        dateModified: buildDate().toISOString(),
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Swarm />
      <Hero locale={locale} profile={profile} />
      <Projects locale={locale} projects={projects} />
      <Experience locale={locale} entries={experience} />
      <Education locale={locale} entries={education} />
      <About locale={locale} profile={profile} />
    </>
  )
}
