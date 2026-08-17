export type ProjectShot = { src: string; width: number; height: number }

export type ProjectFrame = { top: number; left: number; width: number; height: number }

export type ProjectLayer = { src: string; frame: ProjectFrame }

export type ProjectChrome = { src: string; clips: ProjectLayer[] }

export type ProjectMediaSet = {
  desktop: ProjectShot
  mobile: ProjectShot
  clip?: { desktop?: string; mobile?: string }
  chrome?: { desktop?: ProjectChrome; mobile?: ProjectChrome }
}

const media: Record<string, ProjectMediaSet> = {
  'ckm-combat-academy': {
    desktop: { src: '/projects/shots/ckm-combat-academy.webp', width: 1280, height: 800 },
    mobile: { src: '/projects/shots/ckm-combat-academy-mobile.webp', width: 430, height: 932 },
    clip: { desktop: '/projects/ckm-combat-academy.mp4', mobile: '/projects/ckm-combat-academy-4.mp4' },
    chrome: {
      desktop: { src: '/projects/ckm-combat-academy-chrome.webp', clips: [{ src: '/projects/ckm-combat-academy.mp4', frame: { top: 8.0614, left: -49.2606, width: 37.2956, height: 106.3089 } }, { src: '/projects/ckm-combat-academy-2.webm', frame: { top: 6.065, left: -12.6319, width: 38.6964, height: 110.3016 } }, { src: '/projects/ckm-combat-academy-3.mp4', frame: { top: 8.0614, left: 25.3976, width: 37.2956, height: 106.3089 } }, { src: '/projects/ckm-combat-academy-4.mp4', frame: { top: 6.065, left: 62.0263, width: 38.6964, height: 110.3016 } }] },
      mobile: { src: '/projects/ckm-combat-academy-chrome-mobile.webp', clips: [{ src: '/projects/ckm-combat-academy-4.mp4', frame: { top: 6.9742, left: 0, width: 100, height: 87.8923 } }] },
    },
  },
  'swiftmet': {
    desktop: { src: '/projects/shots/swiftmet.webp', width: 1280, height: 800 },
    mobile: { src: '/projects/shots/swiftmet-mobile.webp', width: 430, height: 932 },
    clip: { desktop: '/projects/swiftmet.webm', mobile: '/projects/swiftmet-mobile.webm' },
    chrome: {
      desktop: { src: '/projects/swiftmet-chrome.webp', clips: [{ src: '/projects/swiftmet.webm', frame: { top: 0, left: 0, width: 100, height: 100.3711 } }] },
      mobile: { src: '/projects/swiftmet-chrome-mobile.webp', clips: [{ src: '/projects/swiftmet-mobile.webm', frame: { top: 0, left: 0, width: 100, height: 100 } }] },
    },
  },
  'mila-barber': {
    desktop: { src: '/projects/shots/mila-barber.webp', width: 1280, height: 800 },
    mobile: { src: '/projects/shots/mila-barber-mobile.webp', width: 430, height: 932 },
    clip: { desktop: '/projects/mila-barber.webm', mobile: '/projects/mila-barber-mobile.webm' },
    chrome: {
      desktop: { src: '/projects/mila-barber-chrome.webp', clips: [{ src: '/projects/mila-barber.webm', frame: { top: 12, left: 0, width: 100, height: 100 } }] },
      mobile: { src: '/projects/mila-barber-chrome-mobile.webp', clips: [{ src: '/projects/mila-barber-mobile.webm', frame: { top: 8.5837, left: 0, width: 100, height: 100 } }] },
    },
  },
  'cedece': {
    desktop: { src: '/projects/shots/cedece.webp', width: 1280, height: 800 },
    mobile: { src: '/projects/shots/cedece-mobile.webp', width: 430, height: 932 },
    clip: { desktop: '/projects/cedece.mp4', mobile: '/projects/cedece.mp4' },
    chrome: {
      desktop: { src: '/projects/cedece-chrome.webp', clips: [{ src: '/projects/cedece.mp4', frame: { top: 0, left: 0, width: 100, height: 100 } }] },
      mobile: { src: '/projects/cedece-chrome-mobile.webp', clips: [{ src: '/projects/cedece.mp4', frame: { top: 0, left: 0, width: 100, height: 100 } }] },
    },
  },
  'sangil-studio-test': {
    desktop: { src: '/projects/shots/sangil-studio-test.webp', width: 1280, height: 800 },
    mobile: { src: '/projects/shots/sangil-studio-test-mobile.webp', width: 430, height: 932 },
    clip: { desktop: '/projects/sangil-studio-test.webm', mobile: '/projects/sangil-studio-test-mobile.webm' },
  },
  'sangil-studio': {
    desktop: { src: '/projects/shots/sangil-studio.webp', width: 1280, height: 800 },
    mobile: { src: '/projects/shots/sangil-studio-mobile.webp', width: 430, height: 932 },
    clip: { desktop: '/projects/sangil-studio.webm', mobile: '/projects/sangil-studio-mobile.webm' },
  },
  'bonsai-artesania': {
    desktop: { src: '/projects/shots/bonsai-artesania.webp', width: 1280, height: 800 },
    mobile: { src: '/projects/shots/bonsai-artesania-mobile.webp', width: 430, height: 932 },
    clip: { desktop: '/projects/bonsai-artesania.mp4', mobile: '/projects/bonsai-artesania.mp4' },
    chrome: {
      desktop: { src: '/projects/bonsai-artesania-chrome.webp', clips: [{ src: '/projects/bonsai-artesania.mp4', frame: { top: 0, left: 0, width: 49.9609, height: 100 } }, { src: '/projects/bonsai-artesania-2.mp4', frame: { top: 0, left: 49.9609, width: 50.0391, height: 100 } }] },
      mobile: { src: '/projects/bonsai-artesania-chrome-mobile.webp', clips: [{ src: '/projects/bonsai-artesania.mp4', frame: { top: 0, left: 0, width: 100, height: 100 } }] },
    },
  },
  'blablatour': {
    desktop: { src: '/projects/shots/blablatour.webp', width: 1280, height: 800 },
    mobile: { src: '/projects/shots/blablatour-mobile.webp', width: 430, height: 932 },
  },
  'almuerziko-san-fermin': {
    desktop: { src: '/projects/shots/almuerziko-san-fermin.webp', width: 1280, height: 800 },
    mobile: { src: '/projects/shots/almuerziko-san-fermin-mobile.webp', width: 430, height: 932 },
  },
  'portfolio': {
    desktop: { src: '/projects/shots/portfolio.webp', width: 1280, height: 800 },
    mobile: { src: '/projects/shots/portfolio-mobile.webp', width: 430, height: 932 },
    clip: { desktop: '/projects/portfolio.webm', mobile: '/projects/portfolio-mobile.webm' },
  },
}

export function projectMedia(slug: string): ProjectMediaSet | null {
  return media[slug] ?? null
}
