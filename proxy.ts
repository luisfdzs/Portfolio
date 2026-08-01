import { NextResponse, type NextRequest } from 'next/server'
import { defaultLocale, isLocale, locales } from '@/lib/i18n/config'

/**
 * Única responsabilidad: si la URL no trae idioma, deducirlo del navegador y
 * redirigir. Todo lo demás del sitio es estático.
 *
 * En Next 16 este fichero se llama `proxy.ts` (antes `middleware.ts`) y la función
 * exportada, `proxy`.
 */
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

/**
 * Negocia el idioma con `Accept-Language`. Se compara sólo la parte primaria del tag
 * (`en-GB` → `en`, `es-AR` → `es`): a un recruiter en Londres su navegador le manda
 * `en-GB`, que no coincidiría con un cotejo literal contra `en`.
 */
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
  // `admin` queda fuera: el panel no tiene versión por idioma y redirigirlo a /es/admin
  // lo dejaría inaccesible.
  matcher: ['/((?!api|admin|_next|media|favicon|robots.txt|sitemap.xml|.*\\.[\\w]+$).*)'],
}
