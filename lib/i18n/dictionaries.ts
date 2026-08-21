import type { Locale } from './config'
import type { NavKey } from './routes'

const es = {
  nav: {
    about: 'Perfil',
    experience: 'Experiencia',
    projects: 'Proyectos',
    education: 'Formación',
    contact: 'Contacto',
  } satisfies Record<NavKey, string>,

  a11y: {
    skipToContent: 'Saltar al contenido',
    mainNavigation: 'Navegación principal',
    mobileNavigation: 'Navegación de móvil',
    openMenu: 'Abrir el menú',
    closeMenu: 'Cerrar el menú',
    menu: 'Menú',
    backToTop: 'Volver arriba',
    externalLink: 'se abre en una pestaña nueva',
  },

  hero: {
    greeting: 'Hola, soy',
    availability: 'Analista programador senior en Mobile Smart City',
    primaryCta: 'Ver proyectos',
    secondaryCta: 'Hablemos',
  },

  stats: {
    experience: 'Años de experiencia',
    projects: 'Proyectos en producción',
    clients: 'Empresas y clientes',
    technologies: 'Tecnologías',
  },

  about: {
    title: 'Perfil',
    kicker: 'Quién soy',
  },

  experience: {
    title: 'Experiencia',
    kicker: 'Experiencia laboral',
    present: 'actualidad',
    forClient: '→',
    visitCompany: 'Sobre la empresa',
    visitClient: 'Sobre el cliente',
    stackLabel: 'Tecnologías',
  },

  projects: {
    title: 'Proyectos',
    kicker: 'Proyectos',
    intro: 'Webs reales en producción',
    viewProject: 'Ver el proyecto',
    carousel: 'Proyectos',
    carouselPrevious: 'Proyecto anterior',
    carouselNext: 'Proyecto siguiente',
    liveSite: 'Web en vivo',
    sourceCode: 'Código',
    role: 'Mi papel',
    year: 'Año',
    statusLabel: 'Estado',
    stackLabel: 'Stack',
    highlights: 'Lo que tiene dentro',
    status: {
      live: 'En producción',
      prototype: 'Prototipo navegable',
      archived: 'Archivado',
    },
    previous: 'Anterior',
    next: 'Siguiente',
    backToProjects: 'Volver a los proyectos',
    seeAll: 'Ver todos los proyectos',
    allTitle: 'Todos los proyectos',
    allKicker: 'Cada web que he puesto en producción',
    allIntro:
      'La primera pantalla real de cada una, tal y como se ve desde el aparato con el que estás mirando esto.',
    allDescription:
      'Todas las webs de Luis Fernández Sangil en producción, con la primera pantalla real de cada una.',
    backHome: 'Volver al inicio',
  },

  education: {
    title: 'Formación',
    ongoing: 'en curso',
  },

  contact: {
    title: 'Contacto',
    kicker: '¿Hablamos?',
    lead: 'Siempre estoy abierto a escuchar propuestas interesantes.',
    emailLabel: 'Correo',
    linkedinLabel: 'LinkedIn',
    githubLabel: 'GitHub',
    locationLabel: 'Ubicación',
    copyEmail: 'Copiar el correo',
    copied: 'Copiado',
  },

  footer: {
    builtWith: 'Construido con Next.js, Sanity y Tailwind CSS. Desplegado en Vercel.',
    sourceCode: 'Código de esta web',
    rights: 'Todos los derechos reservados.',
  },

  notFound: {
    title: 'Esta página no existe',
    lead: 'El enlace que has seguido apunta a algo que no está aquí. Puede que lo haya movido.',
    cta: 'Ir al inicio',
  },

  meta: {
    title: 'Luis Fernández Sangil · Ingeniero industrial y desarrollador web',
    description:
      'Portfolio y CV de Luis Fernández Sangil. Ingeniero industrial y desarrollador web con {years} años de experiencia en .NET, React y Next.js. Proyectos, experiencia y formación.',
    ogAlt: 'Luis Fernández Sangil — Ingeniero industrial y desarrollador web',
  },
}

export type Dictionary = typeof es

const en: Dictionary = {
  nav: {
    about: 'Profile',
    experience: 'Experience',
    projects: 'Projects',
    education: 'Education',
    contact: 'Contact',
  },

  a11y: {
    skipToContent: 'Skip to content',
    mainNavigation: 'Main navigation',
    mobileNavigation: 'Mobile navigation',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    menu: 'Menu',
    backToTop: 'Back to top',
    externalLink: 'opens in a new tab',
  },

  hero: {
    greeting: "Hi, I'm",
    availability: 'Senior developer/analyst at Mobile Smart City',
    primaryCta: 'See projects',
    secondaryCta: "Let's talk",
  },

  stats: {
    experience: 'Years of experience',
    projects: 'Projects in production',
    clients: 'Companies and clients',
    technologies: 'Technologies',
  },

  about: {
    title: 'Profile',
    kicker: 'Who I am',
  },

  experience: {
    title: 'Experience',
    kicker: 'Work experience',
    present: 'Present',
    forClient: '→',
    visitCompany: 'About the company',
    visitClient: 'About the client',
    stackLabel: 'Technologies',
  },

  projects: {
    title: 'Projects',
    kicker: 'Projects',
    intro: 'Real websites in production',
    viewProject: 'View project',
    carousel: 'Projects',
    carouselPrevious: 'Previous project',
    carouselNext: 'Next project',
    liveSite: 'Live site',
    sourceCode: 'Source',
    role: 'My role',
    year: 'Year',
    statusLabel: 'Status',
    stackLabel: 'Stack',
    highlights: "What's inside",
    status: {
      live: 'In production',
      prototype: 'Working prototype',
      archived: 'Archived',
    },
    previous: 'Previous',
    next: 'Next',
    backToProjects: 'Back to projects',
    seeAll: 'See every project',
    allTitle: 'All projects',
    allKicker: 'Every site I have shipped',
    allIntro:
      'The real first screen of each one, exactly as it looks on the device you are reading this from.',
    allDescription:
      'Every site by Luis Fernández Sangil in production, with the real first screen of each one.',
    backHome: 'Back to home',
  },

  education: {
    title: 'Education',
    ongoing: 'ongoing',
  },

  contact: {
    title: 'Contact',
    kicker: 'Shall we talk?',
    lead: 'I am always open to hearing interesting proposals.',
    emailLabel: 'Email',
    linkedinLabel: 'LinkedIn',
    githubLabel: 'GitHub',
    locationLabel: 'Location',
    copyEmail: 'Copy email',
    copied: 'Copied',
  },

  footer: {
    builtWith: 'Built with Next.js, Sanity and Tailwind CSS. Deployed on Vercel.',
    sourceCode: 'Source of this site',
    rights: 'All rights reserved.',
  },

  notFound: {
    title: 'This page does not exist',
    lead: 'The link you followed points to something that is not here. I may have moved it.',
    cta: 'Go to the homepage',
  },

  meta: {
    title: 'Luis Fernández Sangil · Industrial engineer and web developer',
    description:
      'Portfolio and CV of Luis Fernández Sangil. Industrial engineer and web developer with {years} years of experience in .NET, React and Next.js. Projects, experience and education.',
    ogAlt: 'Luis Fernández Sangil — Industrial engineer and web developer',
  },
}

const dictionaries: Record<Locale, Dictionary> = { es, en }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}

export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key]
    return value === undefined ? match : String(value)
  })
}
