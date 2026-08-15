// Generado por `node scripts/record-project-heros.mjs`. No se edita a mano.
//
// De cada proyecto, la primera pantalla de su web tal y como se ve en un portátil y
// en un móvil: la captura fija que enseña la tarjeta y, si la portada se mueve, el
// clip que se reproduce cuando esa tarjeta queda centrada en el carrusel.

export type ProjectShot = { src: string; width: number; height: number }

export type ProjectMediaSet = {
  desktop: ProjectShot
  mobile: ProjectShot
  clip?: { desktop: string; mobile: string }
}

const media: Record<string, ProjectMediaSet> = {
  'ckm-combat-academy': {
    desktop: { src: '/projects/shots/ckm-combat-academy.webp', width: 1280, height: 800 },
    mobile: { src: '/projects/shots/ckm-combat-academy-mobile.webp', width: 430, height: 932 },
  },
  swiftmet: {
    desktop: { src: '/projects/shots/swiftmet.webp', width: 1280, height: 800 },
    mobile: { src: '/projects/shots/swiftmet-mobile.webp', width: 430, height: 932 },
    clip: { desktop: '/projects/swiftmet.webm', mobile: '/projects/swiftmet-mobile.webm' },
  },
  'mila-barber': {
    desktop: { src: '/projects/shots/mila-barber.webp', width: 1280, height: 800 },
    mobile: { src: '/projects/shots/mila-barber-mobile.webp', width: 430, height: 932 },
    clip: { desktop: '/projects/mila-barber.webm', mobile: '/projects/mila-barber-mobile.webm' },
  },
  cedece: {
    desktop: { src: '/projects/shots/cedece.webp', width: 1280, height: 800 },
    mobile: { src: '/projects/shots/cedece-mobile.webp', width: 430, height: 932 },
    clip: { desktop: '/projects/cedece.webm', mobile: '/projects/cedece-mobile.webm' },
  },
  'sangil-studio': {
    desktop: { src: '/projects/shots/sangil-studio.webp', width: 1280, height: 800 },
    mobile: { src: '/projects/shots/sangil-studio-mobile.webp', width: 430, height: 932 },
    clip: {
      desktop: '/projects/sangil-studio.webm',
      mobile: '/projects/sangil-studio-mobile.webm',
    },
  },
  'bonsai-artesania': {
    desktop: { src: '/projects/shots/bonsai-artesania.webp', width: 1280, height: 800 },
    mobile: { src: '/projects/shots/bonsai-artesania-mobile.webp', width: 430, height: 932 },
    clip: {
      desktop: '/projects/bonsai-artesania.webm',
      mobile: '/projects/bonsai-artesania-mobile.webm',
    },
  },
  blablatour: {
    desktop: { src: '/projects/shots/blablatour.webp', width: 1280, height: 800 },
    mobile: { src: '/projects/shots/blablatour-mobile.webp', width: 430, height: 932 },
  },
  'almuerziko-san-fermin': {
    desktop: { src: '/projects/shots/almuerziko-san-fermin.webp', width: 1280, height: 800 },
    mobile: { src: '/projects/shots/almuerziko-san-fermin-mobile.webp', width: 430, height: 932 },
    clip: {
      desktop: '/projects/almuerziko-san-fermin.webm',
      mobile: '/projects/almuerziko-san-fermin-mobile.webm',
    },
  },
  portfolio: {
    desktop: { src: '/projects/shots/portfolio.webp', width: 1280, height: 800 },
    mobile: { src: '/projects/shots/portfolio-mobile.webp', width: 430, height: 932 },
    clip: { desktop: '/projects/portfolio.webm', mobile: '/projects/portfolio-mobile.webm' },
  },
}

export function projectMedia(slug: string): ProjectMediaSet | null {
  return media[slug] ?? null
}
