import type { DateRange } from '@/lib/format'
import type { Localized } from '@/lib/i18n/config'

/**
 * FORMA DEL CONTENIDO
 *
 * Estos tipos son el contrato entre las tres piezas que manejan contenido: los datos de
 * respaldo de `content/`, los esquemas del panel de Sanity y las vistas. Viven en un
 * fichero propio —y no en `lib/content.ts`— para que `content/*.ts` pueda tiparse sin
 * importar el módulo que a su vez los importa a ellos. Un ciclo de tipos se borra al
 * compilar, pero se lee fatal.
 */

export type ProjectStatus = 'live' | 'prototype' | 'archived'

/** Imagen con su texto alternativo obligatorio en los dos idiomas. */
export type DescribedImage = {
  src: string
  width: number
  height: number
  alt: Localized
}

export type ExperienceEntry = {
  slug: string
  role: Localized
  /** La empresa que paga la nómina. */
  company: string
  /**
   * El cliente final, cuando el puesto es de consultoría. Se separa de `company` a
   * propósito: decir «desarrollador en Banco Santander» cuando la nómina la firma Altia
   * es la clase de imprecisión que un recruiter detecta al comprobar referencias, y
   * cuesta más de lo que da. La web escribe «Altia → INDRA & Kids&Us».
   */
  client?: string | null
  range: DateRange
  location: Localized
  remote: boolean
  /** Párrafos. Uno o dos: un CV que se lee en pantalla no aguanta más. */
  summary: Localized<string[]>
  stack: string[]
  /** Web de la empresa, para que quien lea pueda comprobar de qué se habla. */
  url?: string | null
}

export type EducationEntry = {
  slug: string
  title: Localized
  /**
   * Traducido, al contrario que `company` en la experiencia.
   *
   * La diferencia no es un descuido: «Altia» o «ABB» son marcas y se escriben igual en
   * cualquier idioma, pero una universidad tiene nombre oficial en cada uno —«Universidade
   * de Vigo» y «University of Vigo», los dos de uvigo.gal—, y dejar el gallego en la
   * versión inglesa era exactamente el hueco sin traducir que se ve al leerla.
   */
  institution: Localized
  range: DateRange
  location?: Localized | null
  /**
   * Párrafos, y no una cadena, desde el 2026-08-04.
   *
   * Era `Localized` a secas porque la nota siempre había sido una frase. Luis la reescribió en
   * dos párrafos —la idea y los ejemplos—, y con un solo campo de texto eso obliga a partir por
   * `\n\n` al pintar, que es justo donde aparece el párrafo vacío que rompe la maquetación
   * (está escrito en `sanity/schemas/localized.ts`, y es la razón por la que existe
   * `localizedParagraphs`). Ahora tiene la misma forma que `summary` en la experiencia: una
   * lista de párrafos que se reordenan arrastrando en el panel.
   */
  note?: Localized<string[]> | null
  url?: string | null
}

export type SkillGroup = {
  key: string
  title: Localized
  /**
   * Nombres tal y como se escriben en su documentación oficial: `Next.js` y no `NextJS`,
   * `ASP.NET Core` y no `Asp.Net Core`. Un stack mal escrito lo lee un desarrollador y
   * resta credibilidad justo en la sección que existe para darla.
   */
  items: string[]
}

export type ProjectEntry = {
  slug: string
  name: string
  tagline: Localized
  /** Año en que se construyó, como cadena: nunca se hace aritmética con él. */
  year: string
  status: ProjectStatus
  role: Localized
  summary: Localized<string[]>
  /**
   * Tres o cuatro decisiones técnicas concretas. Es la parte del proyecto que de
   * verdad diferencia: «Next.js + Sanity» lo pone cualquiera, «la web se sirve estática
   * y el webhook de publicación la actualiza en 9 segundos sin desplegar» no.
   */
  highlights: Localized[]
  stack: string[]
  liveUrl?: string | null
  repoUrl?: string | null
  /** Matiz honesto sobre el estado (dominio pendiente, datos de ejemplo…). */
  note?: Localized | null
  image?: DescribedImage | null
  /**
   * Por dónde abre el carrusel de la portada: los destacados van delante y el resto detrás.
   * **No decide quién sale** —en la portada salen todos—, sólo el orden.
   */
  featured?: boolean
}

export type Profile = {
  name: string
  headline: Localized
  location: Localized
  email: string
  linkedin: string
  github: string
  /** Párrafos de la sección «Perfil». */
  bio: Localized<string[]>
  /**
   * **Obligatorio, y no por casualidad.** El panel lo puede dejar vacío, pero
   * `getProfile` pone entonces el retrato de `content/profile.ts` (ver `portrait`), así que
   * ninguna vista recibe un perfil sin foto y el hero no puede quedarse con el hueco de
   * trama. Si esto vuelve a ser opcional, el hueco vuelve con él.
   */
  photo: DescribedImage
}
