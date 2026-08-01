import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { site } from '@/content/site'

/**
 * Raíz propia para el panel: `(studio)` es un grupo de rutas aparte de `(site)`, así que
 * `/admin` **no hereda** la cabecera, el pie, la barra de móvil ni las tipografías del
 * sitio público. Eso es lo que se busca: el panel de Sanity trae su propia interfaz
 * completa, y meterla dentro del `<body>` del portfolio provocaría dos barras de
 * navegación peleando y el CSS de uno pisando al del otro.
 *
 * Por eso hay dos `<html>` en el proyecto y ninguno en `app/layout.tsx`: cada grupo es su
 * propia raíz.
 */
export const metadata: Metadata = {
  // `metadataBase` hace falta aquí también, aunque el panel no comparta layout con el
  // sitio: la imagen de apertura de `app/opengraph-image.tsx` está en la raíz de `app/`, así
  // que Next intenta resolverla para TODAS las rutas, panel incluido. Sin base, el build
  // avisa de que está usando `http://localhost:3000` para resolverla.
  metadataBase: new URL(site.url),
  title: 'Panel · Luis Fernández Sangil',
  // El panel no tiene nada que hacer en Google, y esto es independiente de `robots.ts`:
  // vale también en el entorno de producción, donde el resto del sitio sí se indexa.
  robots: { index: false, follow: false },
}

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      {/* El panel gestiona su propio scroll y su propio tema; el `<body>` no debe
          aportar nada que lo estorbe. */}
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
