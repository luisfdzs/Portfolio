import type { Locale } from './config'

export const routes = {
  home: '',
} as const

const PROJECT_SEGMENT = 'projects'

export const sections = {
  projects: 'projects',
  experience: 'experience',
  education: 'education',
  about: 'about',
  contact: 'contact',
} as const

export type RouteKey = keyof typeof routes
export type SectionKey = keyof typeof sections
export type LinkKey = RouteKey | SectionKey

export function isSection(key: LinkKey): key is SectionKey {
  return key in sections
}

export function href(locale: Locale, key: LinkKey, ...segments: string[]): string {
  if (isSection(key)) return `/${locale}#${sections[key]}`
  const parts = [locale, routes[key], ...segments].filter(Boolean)
  return `/${parts.join('/')}`
}

export function projectHref(locale: Locale, slug: string): string {
  return `/${locale}/${PROJECT_SEGMENT}/${slug}`
}

export function projectsHref(locale: Locale): string {
  return `/${locale}/${PROJECT_SEGMENT}`
}

export function isProjectPath(pathname: string): boolean {
  return new RegExp(`^/[^/]+/${PROJECT_SEGMENT}/.`).test(pathname)
}

export const navigation = [
  'projects',
  'experience',
  'education',
  'about',
  'contact',
] as const satisfies readonly LinkKey[]

export type NavKey = (typeof navigation)[number]

export const mobileNavigation = [
  'projects',
  'experience',
  'about',
] as const satisfies readonly NavKey[]
