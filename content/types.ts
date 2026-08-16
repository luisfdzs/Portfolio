import type { DateRange } from '@/lib/format'
import type { Localized } from '@/lib/i18n/config'

export type ProjectStatus = 'live' | 'prototype' | 'archived'

export type DescribedImage = {
  src: string
  width: number
  height: number
  alt: Localized
}

export type ExperienceClient = {
  name: string
  url?: string | null
}

export type ExperienceEntry = {
  slug: string
  role: Localized
  company: string
  clients?: ExperienceClient[]
  range: DateRange
  location: Localized
  remote: boolean
  summary: Localized<string[]>
  stack: string[]
  url?: string | null
}

export type EducationEntry = {
  slug: string
  title: Localized
  institution: Localized
  range: DateRange
  location?: Localized | null
  note?: Localized<string[]> | null
  url?: string | null
}

export type SkillGroup = {
  key: string
  title: Localized
  items: string[]
}

export type ProjectEntry = {
  slug: string
  name: string
  tagline: Localized
  year: string
  status: ProjectStatus
  role: Localized
  summary: Localized<string[]>
  highlights: Localized[]
  stack: string[]
  liveUrl?: string | null
  repoUrl?: string | null
  note?: Localized | null
  image?: DescribedImage | null
  featured?: boolean
}

export type Profile = {
  name: string
  headline: Localized
  location: Localized
  email: string
  linkedin: string
  github: string
  bio: Localized<string[]>
  photo: DescribedImage
}
