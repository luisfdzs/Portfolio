import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { site } from '@/content/site'

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: 'Panel · Luis Fernández Sangil',
  robots: { index: false, follow: false },
}

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
