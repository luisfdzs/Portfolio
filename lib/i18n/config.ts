export const locales = ['es', 'en'] as const
export const defaultLocale = 'es' satisfies Locale

export type Locale = (typeof locales)[number]

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

export const localeNames: Record<Locale, string> = {
  es: 'ES',
  en: 'EN',
}

export const localeLabels: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
}

export const localeHtmlLang: Record<Locale, string> = {
  es: 'es',
  en: 'en',
}

export type Localized<T = string> = Record<Locale, T>

export function pick<T>(value: Localized<T>, locale: Locale): T {
  return value[locale]
}
