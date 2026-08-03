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
import { totalYearsOfExperience } from '@/lib/format'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { About } from '@/components/sections/About'
import { Contact } from '@/components/sections/Contact'
import { Education } from '@/components/sections/Education'
import { Experience } from '@/components/sections/Experience'
import { Hero } from '@/components/sections/Hero'
import { Projects } from '@/components/sections/Projects'
import { Stack } from '@/components/sections/Stack'

/**
 * PORTADA — el CV completo en una página.
 *
 * Todo el contenido se lee aquí y baja a las secciones por props: ninguna sección consulta
 * nada. Es lo que permite que las siete se puedan mover de orden, reutilizar o quitar sin
 * tocar la capa de datos, y lo que hace que en este fichero se vea de un golpe **de qué
 * está hecha la página**.
 *
 * Las cinco consultas van en paralelo con `Promise.all`. En la práctica son lecturas de
 * memoria (el contenido vive en `content/`) o consultas cacheadas a Sanity, así que la
 * diferencia es pequeña; se hace igual porque encadenarlas con cinco `await` seguidos sería
 * una cascada gratuita en cuanto el panel esté conectado.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  /**
   * `use cache` marca la página entera como cacheable, y es lo que la convierte en HTML
   * completamente estático en vez de un prerrender parcial con un hueco dinámico.
   *
   * Aquí no hay nada dinámico que justificara ese hueco —ni cookies, ni cabeceras, ni
   * parámetros de búsqueda—, así que sin esta directiva Next reservaría capacidad de
   * streaming en servidor para un contenido que nunca cambia entre visitas. Con ella, la
   * portada se sirve del CDN y sólo se regenera cuando el webhook de Sanity invalida
   * `CONTENT_TAG` (ver `lib/content.ts`).
   */
  'use cache'
  // 'max': no caduca por tiempo. La única cosa que debe regenerar el CV es publicar en el
  // panel, y de eso se encarga el webhook invalidando `CONTENT_TAG`. Sin esto se aplicaría
  // el perfil por defecto (15 minutos), que revalidaría la página cada cuarto de hora para
  // volver a leer un contenido que no ha cambiado.
  cacheLife('max')

  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  const t = getDictionary(locale)

  // `getCarouselProjects` y no `getProjects`: son los mismos proyectos —todos— y sólo cambia
  // el orden, con los destacados delante. La cifra de webs en producción del hero se cuenta
  // de esta misma lista, que para contar da igual cómo esté ordenada.
  const [profile, experience, education, skills, projects] = await Promise.all([
    getProfile(),
    getExperience(),
    getEducation(),
    getSkills(),
    getCarouselProjects(),
  ])

  /**
   * Las cuatro cifras del hero, **calculadas del contenido**. Ninguna está escrita a mano,
   * que es lo que impide que el titular envejezca: el portfolio anterior decía «+4 años»
   * cuando ya eran cinco, porque la cifra era una cadena de texto.
   *
   * `technologies` se cuenta con un `Set` sobre los cuatro grupos del stack: sin él,
   * `React` aparece en frontend y en la experiencia y se contaría dos veces.
   */
  const years = totalYearsOfExperience(experience.map((entry) => entry.range))
  const technologies = new Set(skills.flatMap((group) => group.items)).size

  const stats = [
    { value: `${years}`, label: t.stats.experience },
    {
      value: `${projects.filter((project) => project.status === 'live').length}`,
      label: t.stats.projects,
    },
    // Cada puesto suma su empresa, y los de consultoría suman también el cliente final:
    // es lo que de verdad ha tocado, y es comprobable en la lista de abajo.
    {
      value: `${new Set(experience.flatMap((entry) => [entry.company, ...(entry.client ? entry.client.split(' · ') : [])])).size}`,
      label: t.stats.clients,
    },
    { value: `${technologies}`, label: t.stats.technologies },
  ]

  /**
   * Datos estructurados `Person`.
   *
   * Es lo que hace que, al buscar «Luis Fernández Sangil», Google entienda que esta página
   * es *sobre una persona* con un puesto, unos estudios y unos perfiles, en vez de un
   * documento con palabras dentro. Se construye del mismo contenido que la página, así que
   * no puede contradecirla — que es el fallo típico de los JSON-LD escritos a mano.
   */
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
      {/* `JSON.stringify` y no una plantilla: si un texto del CV llevara `</script>`
          dentro, una plantilla cerraría la etiqueta antes de tiempo. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/*
       * EL ORDEN DE LAS SECCIONES, y por qué éste.
       *
       * Los proyectos van primero, justo detrás del hero: es la única sección con prueba
       * visual —capturas de webs en producción— y quien dedica treinta segundos al CV los
       * gasta mirando, no leyendo. Después la trayectoria comprobable (experiencia,
       * formación, stack), y el perfil —tres párrafos de prosa, la sección más lenta— al
       * final, ya para quien ha decidido seguir leyendo. Contacto cierra siempre.
       *
       * Cambiar este orden obliga a tocar dos cosas más: la numeración de las cabeceras
       * (`index` de `SectionHeading`, que es el índice implícito de la página) y el orden
       * de `navigation` en `lib/i18n/routes.ts`, que es el del menú.
       */}
      <Hero locale={locale} profile={profile} stats={stats} />
      <Projects locale={locale} projects={projects} />
      <Experience locale={locale} entries={experience} />
      <Education locale={locale} entries={education} />
      <Stack locale={locale} groups={skills} />
      <About locale={locale} profile={profile} />
      <Contact locale={locale} profile={profile} />
    </>
  )
}
