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

export const CONTENT_TAG = 'sanity-content'

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

const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'debe tener el formato YYYY-MM')

const dateRange = z
  .object({ start: yearMonth, end: yearMonth.nullish() })
  .transform((value) => ({ start: value.start, end: value.end ?? null }))
  .refine((value) => !value.end || value.end >= value.start, {
    message: 'la fecha de fin es anterior a la de inicio',
  })

const experienceClient = z.object({
  name: z.string().min(1),
  url: z.url().nullish(),
})

const experienceSchema = z
  .object({
    slug: z.string().min(1),
    role: localizedString,
    company: z.string().min(1),
    clients: z.array(experienceClient).nullish(),
    client: z.string().nullish(),
    range: dateRange,
    location: localizedString,
    remote: z.boolean().nullish().transform(Boolean),
    summary: localizedParagraphs,
    stack: z.array(z.string().min(1)).nullish(),
    url: z.url().nullish(),
  })
  .transform(({ client, clients, stack, ...rest }) => ({
    ...rest,
    stack: stack ?? [],
    clients: clients?.length ? clients : client ? [{ name: client, url: null }] : [],
  }))

const educationSchema = z.object({
  slug: z.string().min(1),
  title: localizedString,
  institution: localizedString,
  range: dateRange,
  location: localizedString.nullish(),
  note: localizedParagraphs.nullish(),
  url: z.url().nullish(),
})

const skillGroupSchema = z.object({
  key: z.string().min(1),
  title: localizedString,
  items: z.array(z.string().min(1)).min(1),
})

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
  photo: imageSchema.nullish(),
})

async function fetchContent<T>(query: string): Promise<T> {
  'use cache'
  cacheTag(CONTENT_TAG)
  cacheLife('max')
  return getClient().fetch<T>(query)
}

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
      `[contenido] El panel no tiene ${label} publicado: se sirve el respaldo de content/.`,
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
    console.warn(
      `[contenido] El documento «Perfil» del panel no es válido, se sirve el respaldo de ` +
        `content/profile.ts: ${result.error.issues
          .map((issue) => `${issue.path.join('.')} ${issue.message}`)
          .join('; ')}`,
    )
    return localProfile
  }

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

export async function getCarouselProjects(): Promise<ProjectEntry[]> {
  const projects = await getProjects()
  return [...projects].sort((a, b) => Number(b.featured) - Number(a.featured))
}

export async function getProject(slug: string): Promise<ProjectEntry | undefined> {
  const projects = await getProjects()
  return projects.find((project) => project.slug === slug)
}

export async function getProjectSlugs(): Promise<string[]> {
  const projects = await getProjects()
  return projects.map((project) => project.slug)
}

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
