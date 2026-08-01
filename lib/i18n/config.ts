/**
 * IDIOMAS
 *
 * `es` es el idioma por defecto porque es el idioma de quien más probablemente llegue
 * aquí: un recruiter o un cliente en España. El inglés no es decoración —es la mitad
 * del objetivo del sitio—: las ofertas remotas y las empresas internacionales leen el
 * perfil en inglés, y un CV que sólo existe en castellano se autodescarta de ellas.
 *
 * Sólo dos idiomas, y los dos completos. Un tercero a medias sería peor que no tenerlo.
 */
export const locales = ['es', 'en'] as const
export const defaultLocale = 'es' satisfies Locale

export type Locale = (typeof locales)[number]

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

/** Etiquetas del selector de idioma. */
export const localeNames: Record<Locale, string> = {
  es: 'ES',
  en: 'EN',
}

/** Nombre del idioma en el propio idioma, para el `title` del selector (accesibilidad). */
export const localeLabels: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
}

/**
 * `hreflang` para los alternates de SEO. Genéricos a propósito: `es-ES` haría que
 * Google sirviera la versión castellana sólo en España, y una parte del mercado
 * hispanohablante está en Latinoamérica.
 */
export const localeHtmlLang: Record<Locale, string> = {
  es: 'es',
  en: 'en',
}

/**
 * Un texto que existe en los dos idiomas. Todo el contenido usa esta forma, de modo
 * que añadir un idioma nuevo sea ampliar el tipo y que TypeScript señale exactamente
 * qué falta traducir.
 */
export type Localized<T = string> = Record<Locale, T>

export function pick<T>(value: Localized<T>, locale: Locale): T {
  return value[locale]
}
