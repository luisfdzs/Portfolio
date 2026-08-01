import { ImageResponse } from 'next/og'
import { locales } from '@/lib/i18n/config'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

/** Una copia por idioma. El icono es el mismo; lo que cambia es la ruta (`/es/icon`). */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

/**
 * Favicon: el monograma «LF» en cobre sobre el lienzo del sitio.
 *
 * Se genera con `ImageResponse` en vez de guardar un PNG en `public/` para que los colores
 * salgan de los mismos valores que el diseño: un cambio de paleta no deja el icono
 * desincronizado, que es lo que pasa siempre con los binarios.
 *
 * **Vive dentro de `[locale]` y no en la raíz de `app/`**, aunque no dependa del idioma.
 * En la raíz no funcionaba: este proyecto no tiene `app/layout.tsx` —cada grupo de rutas,
 * `(site)` y `(studio)`, es su propia raíz con su propio `<html>`—, y un `icon.tsx` que no
 * cuelga de ningún layout queda registrado a medias: Next escribía el `<link rel="icon"
 * href="/icon">` correctamente pero la ruta devolvía 404, así que todas las páginas se
 * servían sin favicon. Lo detectó `npm run check:mobile` al vigilar los errores de consola.
 *
 * A 16 px sólo se distinguen dos trazos, así que no hay más que dos letras: cualquier
 * intento de meter un símbolo se vería como una mancha en la pestaña.
 */
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
