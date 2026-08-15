// Clips del hero animado de cada proyecto, en public/projects/<slug>.webm.
// Se generan con `node scripts/record-project-heros.mjs`.
const clips = new Set([
  'swiftmet',
  'mila-barber',
  'cedece',
  'sangil-studio',
  'bonsai-artesania',
  'almuerziko-san-fermin',
  'portfolio',
])

export type ProjectClip = { desktop: string; mobile: string }

export function projectClip(slug: string): ProjectClip | null {
  if (!clips.has(slug)) return null
  return { desktop: `/projects/${slug}.webm`, mobile: `/projects/${slug}-mobile.webm` }
}
