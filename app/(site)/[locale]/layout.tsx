import type { Metadata, Viewport } from 'next'
import { Inter, Instrument_Serif, JetBrains_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { site } from '@/content/site'
import { getProfile } from '@/lib/content'
import { isLocale, localeHtmlLang, locales, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { BootCurtain } from '@/components/layout/BootCurtain'
import { Footer } from '@/components/layout/Footer'
import { HashCleaner } from '@/components/layout/HashCleaner'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { SiteField } from '@/components/layout/SiteField'
import { BackToTop } from '@/components/ui/BackToTop'
import '@/app/globals.css'

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

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export const viewport: Viewport = {
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
      template: `%s · ${site.shortName}`,
    },
    description: t.meta.description,
    applicationName: site.name,
    authors: [{ name: profile.name, url: site.url }],
    creator: profile.name,
    alternates: {
      canonical: `${site.url}/${locale}`,
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
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw

  const t = getDictionary(locale)
  const profile = await getProfile()

  return (
    <html
      lang={localeHtmlLang[locale]}
      data-boot="hold"
      className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <BootCurtain />

        <SiteField />

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

        <BackToTop locale={locale} />

        <HashCleaner />
      </body>
    </html>
  )
}
