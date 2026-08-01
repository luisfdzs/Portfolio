import type { Metadata, Viewport } from 'next'
import { Inter, Instrument_Serif, JetBrains_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { site } from '@/content/site'
import { getProfile } from '@/lib/content'
import { isLocale, localeHtmlLang, locales, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import '@/app/globals.css'

/**
 * Las tres familias, autoalojadas por `next/font`: se descargan en el build y se sirven
 * desde el propio dominio. No hay ninguna petición a fonts.googleapis.com en tiempo de
 * ejecución, lo que ahorra una conexión a un tercero y, de paso, evita meter a Google en
 * el camino de cada visita — que en una web europea es también una cuestión de RGPD.
 *
 * `display: 'swap'` en las tres: se ve texto con la fuente del sistema desde el primer
 * pintado en lugar de un hueco en blanco. En un CV, leer antes vale más que leer perfecto.
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-instrument-serif',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

/** Las dos rutas de idioma se generan en el build: no hay nada dinámico que negociar. */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export const viewport: Viewport = {
  // Debe coincidir con `--color-ink`: es el color de la barra del navegador en móvil, y
  // si no coincide se ve una franja de otro tono sobre el lienzo.
  themeColor: '#08090b',
  colorScheme: 'dark',
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  const t = getDictionary(locale)
  const profile = await getProfile()

  return {
    metadataBase: new URL(site.url),
    title: {
      default: t.meta.title,
      // Las páginas interiores añaden su nombre delante: «Swiftmet · Luis Fernández».
      template: `%s · ${site.shortName}`,
    },
    description: t.meta.description,
    applicationName: site.name,
    authors: [{ name: profile.name, url: site.url }],
    creator: profile.name,
    alternates: {
      canonical: `${site.url}/${locale}`,
      // Los `hreflang` son lo que le dice a Google que estas dos URLs son la misma página
      // en dos idiomas, y no contenido duplicado. `x-default` marca a dónde mandar a quien
      // no encaje en ninguno de los dos: el castellano, que es el idioma por defecto.
      languages: {
        ...Object.fromEntries(
          locales.map((entry) => [localeHtmlLang[entry], `${site.url}/${entry}`]),
        ),
        'x-default': `${site.url}/es`,
      },
    },
    openGraph: {
      type: 'profile',
      firstName: 'Luis',
      lastName: 'Fernández Sangil',
      username: 'luisfdzs',
      locale: localeHtmlLang[locale],
      url: `${site.url}/${locale}`,
      siteName: site.name,
      title: t.meta.title,
      description: t.meta.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: t.meta.title,
      description: t.meta.description,
    },
  }
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  // Una ruta como `/fr` no existe: sin esta comprobación llegaría al diccionario con una
  // clave que no está y reventaría con un error de acceso a `undefined` en vez de un 404.
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  const t = getDictionary(locale)
  const profile = await getProfile()

  return (
    <html
      lang={localeHtmlLang[locale]}
      className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        {/* Primer elemento enfocable de la página: quien navega con teclado no debería
            tener que tabular por los seis enlaces del menú en cada carga. Sólo se ve
            cuando tiene el foco. */}
        <a
          href="#main"
          data-print="hide"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-signal focus:px-5 focus:py-2.5 focus:text-small focus:font-medium focus:text-ink"
        >
          {t.a11y.skipToContent}
        </a>

        <Header locale={locale} />
        <main id="main">{children}</main>
        <Footer locale={locale} profile={profile} />
        <MobileNav locale={locale} />
      </body>
    </html>
  )
}
