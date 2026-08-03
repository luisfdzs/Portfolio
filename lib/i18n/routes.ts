import type { Locale } from './config'

/**
 * Rutas del sitio en un único sitio. Los segmentos son neutros (`/projects`) para que
 * los dos idiomas compartan estructura de ficheros; si algún día queremos slugs
 * localizados (`/es/proyectos`), se hace con un mapa aquí sin tocar ninguna página.
 *
 * **Sólo hay una ruta de primer nivel: la portada.** Lo que había antes —un índice de
 * proyectos en `/es/projects`— se retiró el 2026-08-03: la sección de la portada ya
 * enseña los ocho en el carrusel, así que el índice era una segunda lista de lo mismo
 * compitiendo con la portada por «Luis Fernández Sangil», y una entrada del menú que, en
 * vez de moverse por el CV, se iba de página.
 *
 * Lo que **sí** sigue teniendo página propia es cada proyecto (`/es/projects/swiftmet`):
 * es una URL que se manda suelta en una candidatura, y eso un ancla no lo da. Se
 * construye con `projectHref`.
 */
export const routes = {
  home: '',
} as const

/**
 * El segmento de las fichas de proyecto. Es una constante y no una entrada de `routes`
 * porque **nadie enlaza `/es/projects` a secas**: sin índice esa URL no existe, y quien
 * llegue con ella de un enlace viejo lo redirige `next.config.ts` al ancla de la portada.
 * Sólo se usa con un slug detrás.
 */
const PROJECT_SEGMENT = 'projects'

/**
 * Secciones de la portada. **No son páginas**: un CV se lee de arriba abajo de una
 * sola vez, y partirlo en seis páginas obligaría a un recruiter a navegar para
 * enterarse de lo que cabe en un scroll. Su destino es un ancla (`/es#experience`).
 *
 * Se declaran aquí, junto a las rutas, porque desde fuera se enlazan igual —con
 * `href()`— y así el día que una sección deba ser página basta con moverla de mapa.
 *
 * **`projects` es una sección como las demás desde el 2026-08-03**, cuando se retiró el
 * índice: el menú lleva al carrusel de la portada, no a otra página. Cada proyecto sigue
 * teniendo ficha, pero se enlaza con `projectHref` y no desde el menú.
 *
 * El orden es el de la portada, que es también el del menú (`navigation`) y el que
 * recorre `useActiveSection` para saber dónde estamos.
 *
 * El identificador es también el `id` del `<section>` correspondiente.
 */
export const sections = {
  projects: 'projects',
  experience: 'experience',
  education: 'education',
  stack: 'stack',
  about: 'about',
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
 * Construye una URL **absoluta dentro del sitio**: href('es', 'home') → `/es`,
 * href('es', 'about') → `/es#about`.
 *
 * La barra inicial se añade aparte a propósito. Si se mete como cadena vacía al
 * principio del array, `filter(Boolean)` se la come y devuelve `es` (relativa): desde la
 * portada cuela por casualidad, pero desde una ficha de proyecto el navegador la
 * encadena → `/es/projects/es` → 404.
 */
export function href(locale: Locale, key: LinkKey, ...segments: string[]): string {
  if (isSection(key)) return `/${locale}#${sections[key]}`
  const parts = [locale, routes[key], ...segments].filter(Boolean)
  return `/${parts.join('/')}`
}

/** La ficha de un proyecto: `projectHref('es', 'swiftmet')` → `/es/projects/swiftmet`. */
export function projectHref(locale: Locale, slug: string): string {
  return `/${locale}/${PROJECT_SEGMENT}/${slug}`
}

/**
 * ¿Es la ruta de una ficha de proyecto? Lo usa la navegación para dejar «Proyectos»
 * resaltado mientras se lee un proyecto: se ha entrado desde esa sección y volver es lo
 * único que cabe hacer, así que el menú no debería quedarse sin ninguna entrada marcada.
 */
export function isProjectPath(pathname: string): boolean {
  return new RegExp(`^/[^/]+/${PROJECT_SEGMENT}/.`).test(pathname)
}

/**
 * Entradas del menú de escritorio, en el orden en que se leen las secciones.
 * `as const` para que el tipo sea la unión exacta de claves y el diccionario pueda
 * indexarse sin comprobaciones extra.
 */
export const navigation = [
  'projects',
  'experience',
  'education',
  'stack',
  'about',
  'contact',
] as const satisfies readonly LinkKey[]

export type NavKey = (typeof navigation)[number]

/**
 * Barra inferior de móvil: **cinco** destinos y no seis. Con el pulgar, cinco iconos es
 * el máximo que cabe a 390 px sin que el área táctil baje de los 24 px que pide
 * WCAG 2.2. En la barra van los cuatro atajos que alguien busca a propósito —se caen
 * `education` y `stack`, que se leen de paso al bajar— y el quinto hueco abre el menú
 * completo, que repite **todas** las entradas: la barra es el atajo y el menú es el
 * índice, así que quien lo abre no tiene que reconstruir el sitio a partir de lo que
 * *no* está en la barra.
 *
 * El orden es el de `navigation`, que es el orden en que se leen las secciones.
 */
export const mobileNavigation = [
  'projects',
  'experience',
  'about',
  'contact',
] as const satisfies readonly NavKey[]
