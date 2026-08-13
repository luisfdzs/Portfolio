import { NextResponse, type NextRequest } from 'next/server'
import { defaultLocale, isLocale, locales } from '@/lib/i18n/config'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  )
  if (hasLocale) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = `/${negotiateLocale(request)}${pathname === '/' ? '' : pathname}`
  return NextResponse.redirect(url)
}

function negotiateLocale(request: NextRequest): string {
  const header = request.headers.get('accept-language')
  if (!header) return defaultLocale

  const preferred = header
    .split(',')
    .map((part) => {
      const [tag = '', q = 'q=1'] = part.trim().split(';')
      return { tag: tag.toLowerCase().split('-')[0] ?? '', quality: Number(q.replace('q=', '')) }
    })
    .sort((a, b) => b.quality - a.quality)

  return preferred.find(({ tag }) => isLocale(tag))?.tag ?? defaultLocale
}

export const config = {
  matcher: ['/((?!api|admin|_next|media|favicon|robots.txt|sitemap.xml|.*\\.[\\w]+$).*)'],
}
