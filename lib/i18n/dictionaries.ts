import type { Locale } from './config'
import type { NavKey } from './routes'

/**
 * TODO EL TEXTO DE INTERFAZ, EN UN SOLO SITIO
 *
 * Aquí viven los rótulos, los botones y los textos que no son contenido editorial:
 * eso último —la presentación, la experiencia, los proyectos— está en `content/` y en
 * el panel de Sanity. La frontera es útil: cambiar «Ver el código» no debería obligar
 * a entrar en el CMS, y corregir la descripción de un puesto no debería ser un commit.
 *
 * El tipo `Dictionary` se deriva del castellano, así que **si se añade una clave en
 * `es` y no en `en`, no compila**. Es la única forma de que un idioma no se quede atrás
 * en silencio, que es exactamente lo que le pasa a la mayoría de las webs bilingües.
 */
const es = {
  nav: {
    about: 'Perfil',
    experience: 'Experiencia',
    projects: 'Proyectos',
    education: 'Formación',
    stack: 'Stack',
    contact: 'Contacto',
  } satisfies Record<NavKey, string>,

  a11y: {
    skipToContent: 'Saltar al contenido',
    mainNavigation: 'Navegación principal',
    /**
     * La barra de móvil necesita un nombre DISTINTO del de la cabecera. Las dos existen en
     * el DOM a la vez —una oculta por CSS según el ancho— y dos `<nav>` con el mismo nombre
     * accesible dejan a quien usa un lector de pantalla sin forma de saber a cuál está
     * saltando desde la lista de regiones de la página.
     */
    mobileNavigation: 'Navegación de móvil',
    openMenu: 'Abrir el menú',
    closeMenu: 'Cerrar el menú',
    menu: 'Menú',
    backToTop: 'Volver arriba',
    changeLanguage: 'Cambiar de idioma',
    externalLink: 'se abre en una pestaña nueva',
  },

  hero: {
    // El saludo va aparte del nombre porque en la portada son dos líneas con peso
    // tipográfico distinto: el saludo es pequeño, el nombre es el titular.
    greeting: 'Hola, soy',
    availability: 'Analista programador senior en Mobile Smart City',
    // Aquí había una entradilla de tres líneas con los clientes (Santander, INDRA, ABB,
    // Ingeteam). Se quitó al pasar la portada al escenario a pantalla completa: sobre un fondo
    // en movimiento un párrafo largo no se lee, y esos clientes están en la sección de
    // experiencia con las fechas al lado, que es donde se pueden comprobar. El porqué completo
    // está en `components/sections/Hero.tsx`.
    primaryCta: 'Ver proyectos',
    secondaryCta: 'Hablemos',
    scrollHint: 'Sigue bajando',
  },

  /**
   * Rótulos de las cuatro cifras del hero. Los valores NO están aquí: se calculan del
   * contenido real en la portada, para que no puedan quedarse viejos.
   */
  stats: {
    experience: 'Años de experiencia',
    projects: 'Proyectos en producción',
    clients: 'Empresas y clientes',
    technologies: 'Tecnologías',
  },

  about: {
    title: 'Perfil',
    kicker: 'Quién soy y cómo trabajo',
  },

  experience: {
    title: 'Experiencia',
    kicker: 'Cinco años entregando software en producción',
    present: 'actualidad',
    /** Une la consultora con el cliente final: «Altia · para Banco Santander Portugal». */
    forClient: 'para',
    visitCompany: 'Sobre la empresa',
    stackLabel: 'Tecnologías',
    units: { year: 'año', years: 'años', month: 'mes', months: 'meses' },
  },

  projects: {
    title: 'Proyectos',
    kicker: 'Webs propias, de punta a punta',
    // Aparece bajo el título de la sección en la portada.
    intro:
      'No son ejercicios de curso: son webs de clientes reales en producción, con panel de administración para que el cliente edite su propio contenido sin pasar por mí.',
    viewProject: 'Ver el proyecto',
    // El carrusel de la portada. Los rótulos de los dos botones son de lector de
    // pantalla: en pantalla sólo hay una flecha, porque «Siguiente» al lado de una flecha
    // que apunta a la derecha es la misma información dos veces.
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
    // Lleva al carrusel de la portada, no a un índice: se dice «volver» porque es de ahí
    // de donde se entra a una ficha.
    backToProjects: 'Volver a los proyectos',
  },

  education: {
    title: 'Formación',
    kicker: 'De la ingeniería industrial al desarrollo web',
    ongoing: 'en curso',
  },

  stack: {
    title: 'Stack',
    kicker: 'Con lo que trabajo, agrupado por para qué sirve',
    // Nota honesta al pie de la sección: una lista de logos sin matices no dice nada.
    note: 'Ordenado por lo que uso a diario, no por lo que he tocado alguna vez.',
  },

  contact: {
    title: 'Contacto',
    kicker: '¿Hablamos?',
    lead: 'Estoy abierto a escuchar propuestas interesantes. La forma más rápida es el correo; respondo en el día.',
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
    // {years} se sustituye igual que en el hero.
    title: 'Luis Fernández Sangil · Ingeniero industrial y desarrollador web',
    description:
      'Portfolio y CV de Luis Fernández Sangil. Ingeniero industrial y desarrollador web con {years} años de experiencia en .NET, React y Next.js. Proyectos, experiencia y formación.',
    ogAlt: 'Luis Fernández Sangil — Ingeniero industrial y desarrollador web',
  },
}

/**
 * El castellano define la forma; el inglés debe rellenarla completa o no compila.
 *
 * **Sin `as const`**, y es la diferencia entre que esto funcione y que no: con `as const`
 * cada valor sería su propio tipo literal («Perfil» y no `string`), así que la traducción
 * inglesa fallaría en las ciento y pico claves por no ser idéntica al castellano — que es
 * justo lo contrario de lo que se quiere comprobar. Lo que interesa validar son **las
 * claves**, no los valores.
 */
export type Dictionary = typeof es

const en: Dictionary = {
  nav: {
    about: 'Profile',
    experience: 'Experience',
    projects: 'Projects',
    education: 'Education',
    stack: 'Stack',
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
    changeLanguage: 'Change language',
    externalLink: 'opens in a new tab',
  },

  hero: {
    greeting: "Hi, I'm",
    availability: 'Senior developer/analyst at Mobile Smart City',
    primaryCta: 'See projects',
    secondaryCta: "Let's talk",
    scrollHint: 'Keep scrolling',
  },

  stats: {
    experience: 'Years of experience',
    projects: 'Projects in production',
    clients: 'Companies and clients',
    technologies: 'Technologies',
  },

  about: {
    title: 'Profile',
    kicker: 'Who I am and how I work',
  },

  experience: {
    title: 'Experience',
    kicker: 'Five years shipping software to production',
    present: 'Present',
    forClient: 'for',
    visitCompany: 'About the company',
    stackLabel: 'Technologies',
    units: { year: 'year', years: 'years', month: 'month', months: 'months' },
  },

  projects: {
    title: 'Projects',
    kicker: 'My own websites, end to end',
    intro:
      'Not course exercises: real client websites in production, each with an admin panel so the client edits their own content without going through me.',
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
  },

  education: {
    title: 'Education',
    kicker: 'From industrial engineering to web development',
    ongoing: 'ongoing',
  },

  stack: {
    title: 'Stack',
    kicker: 'What I work with, grouped by what it is for',
    note: 'Ordered by what I use daily, not by what I have touched once.',
  },

  contact: {
    title: 'Contact',
    kicker: 'Shall we talk?',
    lead: 'I am open to hearing interesting proposals. Email is the fastest way; I reply the same day.',
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

/**
 * Sustituye `{clave}` por su valor. Existe porque hay dos frases —el titular y la
 * descripción para buscadores— donde la cifra de años se calcula de las fechas reales
 * del CV y no puede estar escrita a mano: el día que se escriba a mano, se queda vieja.
 */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key]
    return value === undefined ? match : String(value)
  })
}
