import { ImageResponse } from 'next/og'
import { locales } from '@/lib/i18n/config'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#08090b',
        color: '#e0a458',
        fontSize: 34,
        fontWeight: 600,
        letterSpacing: '-0.05em',
      }}
    >
      LF
    </div>,
    size,
  )
}
