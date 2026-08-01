import type { Locale } from '@/lib/i18n/config'

/**
 * Fechas del CV: se guardan como `YYYY-MM` y nunca como `Date`.
 *
 * Es una decisión, no una simplificación. Un puesto empieza «en marzo de 2026», no el
 * 1 de marzo a las 00:00 UTC: en cuanto se mete un `Date` aparece un día inventado y,
 * peor, un desfase de zona horaria que en España convierte `2026-03-01T00:00Z` en el
 * 28 de febrero. Con `YYYY-MM` no hay nada que pueda cambiar de mes solo.
 */
export type YearMonth = `${number}-${number}` | string

/** `null` en `end` significa «hasta hoy». */
export type DateRange = { start: YearMonth; end: YearMonth | null }

function parse(value: YearMonth): { year: number; month: number } {
  const [year, month] = value.split('-')
  return { year: Number(year), month: Number(month ?? '1') }
}

/**
 * «mar. 2026» / «Mar 2026». Se construye con un `Date` en UTC **a mediodía**: a las
 * 00:00 el desplazamiento de zona horaria negativo lo tira al mes anterior, y el
 * formateador escribiría febrero donde el CV dice marzo.
 */
function formatMonth(value: YearMonth, locale: Locale): string {
  const { year, month } = parse(value)
  const date = new Date(Date.UTC(year, month - 1, 15, 12))
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

/** «mar. 2026 — actualidad» / «Feb 2024 — Jan 2026». */
export function formatRange(range: DateRange, locale: Locale, presentLabel: string): string {
  const start = formatMonth(range.start, locale)
  const end = range.end ? formatMonth(range.end, locale) : presentLabel
  // Raya (—) y no guion: es un intervalo, no una palabra compuesta.
  return `${start} — ${end}`
}

/** Meses entre dos `YYYY-MM`, contando ambos extremos como hace LinkedIn. */
function monthsBetween(start: YearMonth, end: YearMonth): number {
  const a = parse(start)
  const b = parse(end)
  return (b.year - a.year) * 12 + (b.month - a.month) + 1
}

/**
 * El `YYYY-MM` del momento en que se compiló, **no** el de ahora.
 *
 * La variable la fija `next.config.ts`, donde está explicado el por qué: con
 * `cacheComponents` activo, leer el reloj dentro del render volvería dinámica una ruta
 * que debe ser estática. El `??` no es un descuido: cubre el caso de importar este módulo
 * fuera de un build de Next (un script, un test), donde la variable no existe.
 */
export function currentYearMonth(): YearMonth {
  const fromBuild = process.env.NEXT_PUBLIC_BUILD_MONTH
  if (fromBuild) return fromBuild

  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
}

/** El año del build, para el copyright del pie. Misma congelación y mismo motivo. */
export function buildYear(): number {
  return Number(currentYearMonth().split('-')[0])
}

/**
 * La fecha del build como `Date`, para el `lastModified` del sitemap.
 *
 * Se fija el día 1 del mes del build: el mes es toda la precisión que hay (ver
 * `currentYearMonth`) y poner el día de hoy fingiría una exactitud que no existe. A un
 * rastreador le sirve igual —usa `lastModified` para decidir cada cuánto volver, no para
 * ordenar resultados— y así el valor no depende de a qué hora se despliegue.
 */
export function buildDate(): Date {
  const [year, month] = currentYearMonth().split('-')
  return new Date(Date.UTC(Number(year), Number(month) - 1, 1))
}

/**
 * Duración de un rango, en años y meses ya redactados: «2 años 3 meses».
 * Los rangos abiertos se cierran contra el mes del build (ver `currentYearMonth`).
 */
export function formatDuration(
  range: DateRange,
  units: { year: string; years: string; month: string; months: string },
): string {
  const total = monthsBetween(range.start, range.end ?? currentYearMonth())
  const years = Math.floor(total / 12)
  const months = total % 12

  const parts: string[] = []
  if (years > 0) parts.push(`${years} ${years === 1 ? units.year : units.years}`)
  if (months > 0) parts.push(`${months} ${months === 1 ? units.month : units.months}`)
  // Un rango de menos de un mes no existe en un CV, pero si el dato viniera mal
  // preferimos «1 mes» a una cadena vacía dentro de un paréntesis.
  return parts.length > 0 ? parts.join(' ') : `1 ${units.month}`
}

/**
 * Años de experiencia acumulados, **contando el tiempo trabajado y no el calendario**.
 *
 * La diferencia importa: entre el primer puesto y hoy hay tramos sin contrato, y
 * restar la primera fecha de la última los contaría como experiencia. Se suman los
 * rangos y se redondea **hacia abajo**, que es la única dirección honesta cuando la
 * cifra va en un titular.
 */
export function totalYearsOfExperience(ranges: readonly DateRange[]): number {
  const today = currentYearMonth()
  const months = ranges.reduce(
    (sum, range) => sum + monthsBetween(range.start, range.end ?? today),
    0,
  )
  return Math.floor(months / 12)
}
