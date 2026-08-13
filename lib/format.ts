import type { Locale } from '@/lib/i18n/config'

export type YearMonth = `${number}-${number}` | string

export type DateRange = { start: YearMonth; end: YearMonth | null }

function parse(value: YearMonth): { year: number; month: number } {
  const [year, month] = value.split('-')
  return { year: Number(year), month: Number(month ?? '1') }
}

function formatMonth(value: YearMonth, locale: Locale): string {
  const { year, month } = parse(value)
  const date = new Date(Date.UTC(year, month - 1, 15, 12))
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export function formatRange(range: DateRange, locale: Locale, presentLabel: string): string {
  const start = formatMonth(range.start, locale)
  const end = range.end ? formatMonth(range.end, locale) : presentLabel
  return `${start} — ${end}`
}

function monthsBetween(start: YearMonth, end: YearMonth): number {
  const a = parse(start)
  const b = parse(end)
  return (b.year - a.year) * 12 + (b.month - a.month) + 1
}

export function currentYearMonth(): YearMonth {
  const fromBuild = process.env.NEXT_PUBLIC_BUILD_MONTH
  if (fromBuild) return fromBuild

  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
}

export function buildYear(): number {
  return Number(currentYearMonth().split('-')[0])
}

export function buildDate(): Date {
  const [year, month] = currentYearMonth().split('-')
  return new Date(Date.UTC(Number(year), Number(month) - 1, 1))
}

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
  return parts.length > 0 ? parts.join(' ') : `1 ${units.month}`
}

export function totalYearsOfExperience(ranges: readonly DateRange[]): number {
  const today = currentYearMonth()
  const months = ranges.reduce(
    (sum, range) => sum + monthsBetween(range.start, range.end ?? today),
    0,
  )
  return Math.floor(months / 12)
}
