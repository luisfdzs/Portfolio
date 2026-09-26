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
    launch: {
      start: 'Ejecutar git push y empezar la animación',
      hint: 'Pulsa para desplegar',
      projects: 'Ver proyectos',
    },
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
    agvShowcase: 'Modelos de AGV en partículas',
    agvOpen: 'ver a pantalla completa',
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
    copyEmail: 'Copiar el correo',
    copied: 'Copiado',
  },

  footer: {
    builtWith: 'Construido con Next.js y Tailwind CSS. Desplegado en Vercel.',
    sourceCode: 'Código de esta web',
    rights: 'Todos los derechos reservados.',
  },

  chat: {
    open: 'Abrir el chat',
    close: 'Cerrar el chat',
    title: 'Pregúntame',
    subtitle: 'Asistente virtual de Luis',
    placeholder: 'Escribe un mensaje…',
    send: 'Enviar',
    intro: 'Hola, soy el asistente de Luis. Pregúntame lo que quieras.',
    expand: 'Ampliar el chat',
    collapse: 'Reducir el chat',
    thinking: 'Pensando…',
    error: 'No he podido responder. Inténtalo otra vez en un momento.',
  },

  experiments: {
    phases: {
      core: 'Núcleo',
      explode: 'Explosión',
      assemble: 'Ensamblaje',
    },
    replay: 'Repetir',
    pause: 'Pausa',
    play: 'Reproducir',
    scrub: 'Posición en la animación',
    particles: '{count} partículas en el vehículo',
    models: {
      agv2: {
        title: 'AGV de plataforma',
        lead: 'Plataforma de carga pesada con mesa elevadora, escáneres de seguridad y parachoques.',
        description:
          'Experimento con three.js: un núcleo de partículas doradas estalla y ensambla un AGV de plataforma.',
        work: 'Elevación',
      },
      agv4: {
        title: 'Apilador autónomo',
        lead: 'Apilador con mástil dúplex que avanza y eleva sus horquillas.',
        description:
          'Experimento con three.js: un núcleo de partículas doradas estalla y ensambla un apilador autónomo.',
        work: 'Elevación',
      },
      agv5: {
        title: 'Carretilla retráctil autónoma',
        lead: 'Carretilla de mástil triple con brazo de sensores que eleva sus horquillas en altura.',
        description:
          'Experimento con three.js: un núcleo de partículas doradas estalla y ensambla una carretilla autónoma de mástil alto.',
        work: 'Elevación',
      },
    },
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
    launch: {
      start: 'Run git push and start the animation',
      hint: 'Press to deploy',
      projects: 'See projects',
    },
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
    agvShowcase: 'AGV models in particles',
    agvOpen: 'view full screen',
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
    copyEmail: 'Copy email',
    copied: 'Copied',
  },

  footer: {
    builtWith: 'Built with Next.js and Tailwind CSS. Deployed on Vercel.',
    sourceCode: 'Source of this site',
    rights: 'All rights reserved.',
  },

  chat: {
    open: 'Open the chat',
    close: 'Close the chat',
    title: 'Ask me',
    subtitle: "Luis's virtual assistant",
    placeholder: 'Type a message…',
    send: 'Send',
    intro: "Hi, I'm Luis's assistant. Ask me anything.",
    expand: 'Expand the chat',
    collapse: 'Shrink the chat',
    thinking: 'Thinking…',
    error: 'I could not answer. Try again in a moment.',
  },

  experiments: {
    phases: {
      core: 'Core',
      explode: 'Burst',
      assemble: 'Assembly',
    },
    replay: 'Replay',
    pause: 'Pause',
    play: 'Play',
    scrub: 'Animation position',
    particles: '{count} particles in the vehicle',
    models: {
      agv2: {
        title: 'Platform AGV',
        lead: 'A heavy-load platform with a lift table, safety scanners and bumpers.',
        description:
          'A three.js experiment: a core of golden particles bursts and assembles a platform AGV.',
        work: 'Lifting',
      },
      agv4: {
        title: 'Autonomous stacker',
        lead: 'A duplex-mast stacker that drives forward and raises its forks.',
        description:
          'A three.js experiment: a core of golden particles bursts and assembles an autonomous stacker.',
        work: 'Lifting',
      },
      agv5: {
        title: 'Autonomous reach truck',
        lead: 'A triplex-mast truck with a sensor arm that raises its forks to height.',
        description:
          'A three.js experiment: a core of golden particles bursts and assembles a high-mast autonomous truck.',
        work: 'Lifting',
      },
    },
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
