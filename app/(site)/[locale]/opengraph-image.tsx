import { ImageResponse } from 'next/og'
import { profile } from '@/content/profile'
import { site } from '@/content/site'
import { isLocale, locales, type Locale } from '@/lib/i18n/config'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Luis Fernández Sangil — Ingeniero industrial y desarrollador web'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'es'

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#08090b',
        padding: 72,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 56, height: 3, background: '#e0a458' }} />
        <div
          style={{
            display: 'flex',
            color: '#6d747c',
            fontSize: 22,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          PORTFOLIO · CV
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ color: '#edeef0', fontSize: 92, lineHeight: 1, letterSpacing: '-0.03em' }}>
          {profile.name}
        </div>
        <div style={{ color: '#e0a458', fontSize: 40, marginTop: 24 }}>
          {profile.headline[locale]}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          color: '#6d747c',
          fontSize: 24,
          borderTop: '1px solid #1b1f25',
          paddingTop: 28,
        }}
      >
        <div style={{ display: 'flex' }}>{site.url.replace('https://', '')}</div>
        <div style={{ display: 'flex' }}>{profile.location[locale]}</div>
      </div>
    </div>,
    size,
  )
}
