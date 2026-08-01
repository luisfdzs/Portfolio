import type { Locale } from './config'

/**
 * Rutas del sitio en un único sitio. Los segmentos son neutros (`/projects`) para que
 * los dos idiomas compartan estructura de ficheros; si algún día queremos slugs
 * localizados (`/es/proyectos`), se hace con un mapa aquí sin tocar ninguna página.
 */
export const routes = {
  home: '',
  projects: 'projects',
} as const

/**
 * Secciones de la portada. **No son páginas**: un CV se lee de arriba abajo de una
 * sola vez, y partirlo en cinco páginas obligaría a un recruiter a navegar para
 * enterarse de lo que cabe en un scroll. Su destino es un ancla (`/es#experience`).
 *
 * Se declaran aquí, junto a las rutas, porque desde fuera se enlazan igual —con
 * `href()`— y así el día que una sección deba ser página basta con moverla de mapa.
 *
 * La excepción es **proyectos**, que además de resumirse en la portada tiene índice y
 * ficha propias: cada proyecto es una URL que se puede mandar suelta en una
 * candidatura, y eso un ancla no lo da.
 *
 * El identificador es también el `id` del `<section>` correspondiente.
 */
export const sections = {
  about: 'about',
  experience: 'experience',
  education: 'education',
  stack: 'stack',
  contact: 'contact',
} as const

export type RouteKey = keyof typeof routes
export type SectionKey = keyof typeof sections
export type LinkKey = RouteKey | SectionKey

/** Distingue las anclas de la portada de las páginas de verdad. */
export function isSection(key: LinkKey): key is SectionKey {
  return key in sections
}

/**
 * Construye una URL **absoluta dentro del sitio**: href('es', 'projects') →
 * `/es/projects`, href('es', 'about') → `/es#about`.
 *
 * La barra inicial se añade aparte a propósito. Si se mete como cadena vacía al
 * principio del array, `filter(Boolean)` se la come y devuelve `es/projects`
 * (relativa): desde la portada cuela por casualidad, pero desde una ficha de proyecto
 * el navegador la encadena → `/es/projects/es/projects` → 404.
 */
export function href(locale: Locale, key: LinkKey, ...segments: string[]): string {
  if (isSection(key)) return `/${locale}#${sections[key]}`
  const parts = [locale, routes[key], ...segments].filter(Boolean)
  return `/${parts.join('/')}`
}

/**
 * Entradas del menú de escritorio, en el orden en que se leen las secciones.
 * `as const` para que el tipo sea la unión exacta de claves y el diccionario pueda
 * indexarse sin comprobaciones extra.
 */
export const navigation = [
  'about',
  'experience',
  'projects',
  'education',
  'stack',
  'contact',
] as const satisfies readonly LinkKey[]

export type NavKey = (typeof navigation)[number]

/**
 * Barra inferior de móvil: **cinco** destinos y no seis. Con el pulgar, cinco iconos es
 * el máximo que cabe a 390 px sin que el área táctil baje de los 24 px que pide
 * WCAG 2.2. Se cae `education` y `stack`, que son las dos secciones que nadie busca
 * directamente —se leen de paso al bajar—, y el sexto hueco lo ocupa el menú completo.
 */
export const mobileNavigation = [
  'about',
  'experience',
  'projects',
  'contact',
] as const satisfies readonly NavKey[]
