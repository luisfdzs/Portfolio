import {
  education as localEducation,
  experience as localExperience,
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
import type { Localized } from '@/lib/i18n/config'

export async function getProfile(): Promise<Profile> {
  return localProfile
}

export async function getExperience(): Promise<ExperienceEntry[]> {
  return localExperience
}

export async function getEducation(): Promise<EducationEntry[]> {
  return localEducation
}

export async function getSkills(): Promise<SkillGroup[]> {
  return localSkills
}

export async function getProjects(): Promise<ProjectEntry[]> {
  return localProjects
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
