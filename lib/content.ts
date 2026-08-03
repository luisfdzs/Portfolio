import { cacheLife, cacheTag } from 'next/cache'
import { z } from 'zod'
import {
  education as localEducation,
  experience as localExperience,
  portrait,
  profile as localProfile,
  skills as localSkills,
} from '@/content/profile'
import { projects as localProjects } from '@/content/projects'
import type {
  EducationEntry,
  ExperienceEntry,
  Profile,
  ProjectEntry,
  SkillGroup,
} from '@/content/types'
import { getClient } from '@/sanity/client'
import { isSanityConfigured } from '@/sanity/env'
import {
  EDUCATION_QUERY,
  EXPERIENCE_QUERY,
  PROFILE_QUERY,
  PROJECTS_QUERY,
  SKILLS_QUERY,
} from '@/sanity/queries'
import type { Localized } from '@/lib/i18n/config'

/**
 * ÚNICA PUERTA DE ACCESO AL CONTENIDO
 *
 * Ninguna página consulta Sanity ni importa `content/` directamente: todas pasan por
 * aquí. Es lo que permite cambiar de dónde sale el contenido sin tocar una sola vista.
 *
 * ## La regla, que es la decisión de diseño de todo el proyecto
 *
 * **El panel manda cuando tiene contenido; el repositorio es el suelo.**
 *
 *   1. Sin proyecto de Sanity configurado → se sirve `content/`.
 *   2. Con Sanity configurado pero sin documentos de un tipo → se sirve `content/` para
 *      ese tipo, y sólo para ese.
 *   3. Con documentos → mandan los del panel.
 *
 * Por qué así, y no como en los proyectos de cliente (donde Sanity es la única fuente y
 * su ausencia es un error): un portfolio es el sitio donde uno NO quiere depender de un
 * servicio externo para existir. Este repositorio se clona y se despliega sin
 * credenciales de nada, y el CV sale completo. Enchufar el panel después es una mejora
 * —editar desde el móvil sin desplegar— y no un requisito.
 *
 * El punto 2 es el que evita el fallo más probable: crear el proyecto de Sanity, no
 * haber importado todavía el contenido, y que la web se quede en blanco justo el día que
 * alguien la mira. Un dataset vacío no es una instrucción de borrar el CV.
 *
 * ## La excepción: el retrato
 *
 * Los tres puntos de arriba funcionan **por documento**, y hay un caso en el que eso no
 * alcanza: el campo del retrato en el «Perfil». Un perfil sin foto elegida es un documento
 * válido —no dispara ningún respaldo— y dejaría el hero con el hueco de trama de `Figure`.
 * Así que el retrato tiene respaldo **por campo**: si el panel no trae ninguno, se sirve el de
 * `content/profile.ts`. Es la única excepción; ver `getProfile`.
 *
 * ## Documentos a medias
 *
 * Se valida cada documento por separado y se descarta el que no cumple, con un aviso en
 * el log del build. Nunca se tumba la web entera: un puesto sin descripción no puede
 * hacer desaparecer los otros tres.
 */

/** Etiqueta de caché: el webhook de Sanity la invalida al publicar. */
export const CONTENT_TAG = 'sanity-content'

/* ========================================================================== *
 * Esquemas
 * ========================================================================== */

/**
 * Un texto traducido, con el castellano como única obligación.
 *
 * El `transform` es la pieza importante: rellena el inglés con el castellano cuando
 * falta. Sin esto habría que decidir en cada vista qué hacer con un hueco —¿cadena
 * vacía?, ¿ocultar el bloque?— y acabaríamos con dos criterios distintos y con huecos
 * visibles. Con esto la regla es una y está aquí: **si no está traducido, se lee en
 * castellano.**
 *
 * Es el compromiso menos malo, no el ideal. Un párrafo del CV en castellano dentro de la
 * versión inglesa se ve raro; en blanco se ve roto, y quien lo lee es alguien decidiendo
 * si te llama.
 */
const localizedString = z
  .object({
    es: z.string().min(1),
    en: z.string().nullish(),
  })
  .transform((value): Localized => ({
    es: value.es,
    en: value.en || value.es,
  }))

const localizedParagraphs = z
  .object({
    es: z.array(z.string().min(1)).min(1),
    en: z.array(z.string().min(1)).nullish(),
  })
  .transform((value): Localized<string[]> => ({
    es: value.es,
    en: value.en?.length ? value.en : value.es,
  }))

const imageSchema = z.object({
  src: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: localizedString,
})

/** `YYYY-MM`. Ver `lib/format.ts` para por qué no es un `Date`. */
const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'debe tener el formato YYYY-MM')

/**
 * Un intervalo del CV. Se valida que el fin no sea anterior al principio: es el error de
 * tecleo más fácil de cometer en el panel y el más vergonzoso de publicar, porque la web
 * escribiría una duración negativa junto al puesto.
 */
const dateRange = z
  .object({ start: yearMonth, end: yearMonth.nullish() })
  .transform((value) => ({ start: value.start, end: value.end ?? null }))
  .refine((value) => !value.end || value.end >= value.start, {
    message: 'la fecha de fin es anterior a la de inicio',
  })

/**
 * El `transform` final normaliza `stack` a un array vacío.
 *
 * Es lo que permite que las vistas escriban `entry.stack.length` sin comprobar nada: un
 * campo que el panel deja sin rellenar llega como `undefined`, y si eso se propagara habría
 * que poner un `?? []` en cada sitio donde se usa —y olvidarse en uno—. La normalización va
 * aquí, en la frontera, que es el único punto por el que pasa todo el contenido.
 */
const experienceSchema = z
  .object({
    slug: z.string().min(1),
    role: localizedString,
    company: z.string().min(1),
    client: z.string().nullish(),
    range: dateRange,
    location: localizedString,
    remote: z.boolean().nullish().transform(Boolean),
    summary: localizedParagraphs,
    stack: z.array(z.string().min(1)).nullish(),
    url: z.url().nullish(),
  })
  .transform((value) => ({ ...value, stack: value.stack ?? [] }))

const educationSchema = z.object({
  slug: z.string().min(1),
  title: localizedString,
  institution: z.string().min(1),
  range: dateRange,
  location: localizedString.nullish(),
  note: localizedString.nullish(),
  url: z.url().nullish(),
})

const skillGroupSchema = z.object({
  key: z.string().min(1),
  title: localizedString,
  items: z.array(z.string().min(1)).min(1),
})

/** Mismo criterio que en `experienceSchema`: las listas opcionales se normalizan aquí. */
const projectSchema = z
  .object({
    slug: z.string().min(1),
    name: z.string().min(1),
    tagline: localizedString,
    year: z.string().regex(/^\d{4}$/, 'debe ser un año de cuatro cifras'),
    status: z.enum(['live', 'prototype', 'archived']),
    role: localizedString,
    summary: localizedParagraphs,
    highlights: z.array(localizedString).nullish(),
    stack: z.array(z.string().min(1)).nullish(),
    liveUrl: z.url().nullish(),
    repoUrl: z.url().nullish(),
    note: localizedString.nullish(),
    image: imageSchema.nullish(),
    featured: z.boolean().nullish(),
  })
  .transform((value) => ({
    ...value,
    highlights: value.highlights ?? [],
    stack: value.stack ?? [],
    // `Boolean` y no `?? false`: el panel manda `null` cuando el interruptor nunca se ha
    // tocado, y `null` no lo absorbe el operador de coalescencia hacia un booleano.
    featured: Boolean(value.featured),
  }))

const profileSchema = z.object({
  name: z.string().min(1),
  headline: localizedString,
  location: localizedString,
  email: z.email(),
  linkedin: z.url(),
  github: z.url(),
  bio: localizedParagraphs,
  // Opcional aquí y obligatorio en el tipo `Profile`: el hueco lo rellena `getProfile` con
  // el retrato del repositorio. Es la única normalización de esta frontera que trae un valor
  // de `content/` en vez de limitarse a poner un array vacío.
  photo: imageSchema.nullish(),
})

/* ========================================================================== *
 * Lectura
 * ========================================================================== */

/**
 * Lee de Sanity y **cachea con etiqueta**: la web se sirve estática hasta que alguien
 * publica, y entonces el webhook invalida esta etiqueta y se regenera.
 *
 * La forma correcta en Next 16 es la directiva `use cache` con `cacheTag`. Pasar
 * `{ next: { tags } }` como tercer argumento de `client.fetch` **no funciona**:
 * `@sanity/client` ignora esa opción porque no usa el `fetch` de Next con sus
 * extensiones. El resultado es un fallo silencioso —los datos quedan horneados en el
 * build sin etiqueta, el webhook responde 200 y la web no se actualiza nunca—.
 */
async function fetchContent<T>(query: string): Promise<T> {
  'use cache'
  cacheTag(CONTENT_TAG)
  // 'max': se sirve de caché indefinidamente y sólo cambia cuando se publica algo.
  cacheLife('max')
  return getClient().fetch<T>(query)
}

/**
 * Valida cada elemento por separado y descarta los que no cumplen. El aviso queda en el
 * log del build, que es donde alguien lo va a leer.
 */
function keepValid<T>(items: unknown[], schema: z.ZodType<T>, label: string): T[] {
  const valid: T[] = []
  for (const item of items) {
    const result = schema.safeParse(item)
    if (result.success) {
      valid.push(result.data)
    } else {
      const record = item as { name?: string; slug?: string; company?: string } | null
      const name = record?.name ?? record?.company ?? record?.slug ?? '(sin nombre)'
      console.warn(
        `[contenido] Se omite ${label} «${name}»: ${result.error.issues
          .map((issue) => `${issue.path.join('.')} ${issue.message}`)
          .join('; ')}`,
      )
    }
  }
  return valid
}

/**
 * El patrón que implementa la regla de arriba, en un solo sitio para las cinco
 * colecciones: si no hay Sanity o la consulta no devuelve nada válido, se sirve el
 * respaldo del repositorio.
 */
async function collection<T>(
  query: string,
  schema: z.ZodType<T>,
  label: string,
  fallback: T[],
): Promise<T[]> {
  if (!isSanityConfigured) return fallback

  const raw = await fetchContent<unknown[]>(query)
  const valid = keepValid(Array.isArray(raw) ? raw : [], schema, label)

  if (valid.length === 0) {
    console.warn(
      `[contenido] El panel no tiene ${label} publicado: se sirve el respaldo de content/. ` +
        'Si es la primera vez que se despliega con Sanity, importa el contenido con ' +
        '`npm run migrate:build && npm run migrate:import`.',
    )
    return fallback
  }

  return valid
}

export async function getProfile(): Promise<Profile> {
  if (!isSanityConfigured) return localProfile

  const raw = await fetchContent<unknown>(PROFILE_QUERY)
  const result = profileSchema.safeParse(raw)

  if (!result.success) {
    // El perfil afecta a la cabecera, al pie y a los metadatos de todas las páginas, así
    // que aquí el respaldo no es una comodidad: es lo que impide que un documento a
    // medias en el panel deje el sitio sin nombre ni contacto.
    console.warn(
      `[contenido] El documento «Perfil» del panel no es válido, se sirve el respaldo de ` +
        `content/profile.ts: ${result.error.issues
          .map((issue) => `${issue.path.join('.')} ${issue.message}`)
          .join('; ')}`,
    )
    return localProfile
  }

  // **El retrato tiene respaldo propio, por campo.** Todo lo demás en este módulo cae al
  // repositorio por documento entero, y con la foto no vale: un «Perfil» del panel sin
  // imagen elegida es un documento válido, así que no dispara el respaldo de arriba y el
  // hero se quedaría con el hueco de trama de `Figure` —una portada con un rectángulo
  // rayado donde va la cara—. El panel manda cuando ha elegido una; si no, se sirve la del
  // repositorio, que es el recorte calibrado para el marco del hero.
  return { ...result.data, photo: result.data.photo ?? portrait }
}

export function getExperience(): Promise<ExperienceEntry[]> {
  return collection(EXPERIENCE_QUERY, experienceSchema, 'el puesto', localExperience)
}

export function getEducation(): Promise<EducationEntry[]> {
  return collection(EDUCATION_QUERY, educationSchema, 'la formación', localEducation)
}

export function getSkills(): Promise<SkillGroup[]> {
  return collection(SKILLS_QUERY, skillGroupSchema, 'el grupo del stack', localSkills)
}

export function getProjects(): Promise<ProjectEntry[]> {
  return collection(PROJECTS_QUERY, projectSchema, 'el proyecto', localProjects)
}

/**
 * Los destacados de la portada. Si nadie ha marcado ninguno, se cogen los primeros: una
 * portada sin proyectos sería peor que una portada con los proyectos en orden de lista.
 */
export async function getFeaturedProjects(limit = 4): Promise<ProjectEntry[]> {
  const projects = await getProjects()
  const featured = projects.filter((project) => project.featured)
  return (featured.length > 0 ? featured : projects).slice(0, limit)
}

export async function getProject(slug: string): Promise<ProjectEntry | undefined> {
  const projects = await getProjects()
  return projects.find((project) => project.slug === slug)
}

/** Para `generateStaticParams`: sólo los proyectos que de verdad se van a poder pintar. */
export async function getProjectSlugs(): Promise<string[]> {
  const projects = await getProjects()
  return projects.map((project) => project.slug)
}

/**
 * Proyecto anterior y siguiente, en bucle, para recorrer la lista sin volver al índice.
 * Con menos de dos proyectos no hay nada que recorrer y se devuelve `null`, que es lo que
 * la ficha usa para no pintar el bloque.
 */
export async function getProjectNeighbours(
  slug: string,
): Promise<{ previous: ProjectEntry; next: ProjectEntry } | null> {
  const projects = await getProjects()
  const index = projects.findIndex((project) => project.slug === slug)
  if (index === -1 || projects.length < 2) return null
  const previous = projects[(index - 1 + projects.length) % projects.length]
  const next = projects[(index + 1) % projects.length]
  if (!previous || !next) return null
  return { previous, next }
}

export type { EducationEntry, ExperienceEntry, Localized, Profile, ProjectEntry, SkillGroup }
