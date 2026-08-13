import { defineQuery } from 'next-sanity'

const localized = `{ es, en }`

const image = `{
  "src": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  alt ${localized}
}`

export const PROFILE_QUERY = defineQuery(`
  *[_type == "profile"] | order(_createdAt asc)[0] {
    name,
    headline ${localized},
    location ${localized},
    email,
    linkedin,
    github,
    bio ${localized},
    "photo": select(defined(photo.asset) => photo ${image})
  }
`)

export const EXPERIENCE_QUERY = defineQuery(`
  *[_type == "experience"] | order(orderRank asc) {
    "slug": slug.current,
    role ${localized},
    company,
    client,
    "range": { "start": startDate, "end": endDate },
    location ${localized},
    remote,
    summary ${localized},
    stack,
    url
  }
`)

export const EDUCATION_QUERY = defineQuery(`
  *[_type == "education"] | order(orderRank asc) {
    "slug": slug.current,
    title ${localized},
    institution ${localized},
    "range": { "start": startDate, "end": endDate },
    location ${localized},
    note ${localized},
    url
  }
`)

export const SKILLS_QUERY = defineQuery(`
  *[_type == "skillGroup"] | order(orderRank asc) {
    "key": slug.current,
    title ${localized},
    items
  }
`)

export const PROJECTS_QUERY = defineQuery(`
  *[_type == "project"] | order(orderRank asc) {
    "slug": slug.current,
    name,
    tagline ${localized},
    year,
    status,
    role ${localized},
    summary ${localized},
    "highlights": highlights[] ${localized},
    stack,
    liveUrl,
    repoUrl,
    note ${localized},
    image ${image},
    featured
  }
`)
