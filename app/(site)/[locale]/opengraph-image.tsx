import { ImageResponse } from 'next/og'
import { profile } from '@/content/profile'
import { site } from '@/content/site'
import { isLocale, locales, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
/**
 * El texto alternativo del `<meta>` de apertura. Es una constante y no un valor por idioma
 * porque Next sólo acepta `alt` como exportación estática: localizarlo exigiría
 * `generateImageMetadata`, y describe una imagen cuyo contenido es un nombre propio.
 */
export const alt = 'Luis Fernández Sangil — Ingeniero industrial y desarrollador web'

/** Una imagen por idioma, generadas en el build igual que las páginas. */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

/**
 * Imagen de apertura social: lo que se ve al pegar el enlace en LinkedIn, en WhatsApp o en
 * Slack. En un portfolio es la primera impresión más veces que la propia portada, porque el
 * enlace circula mucho antes de que alguien lo abra.
 *
 * **Vive dentro de `[locale]` y no en la raíz de `app/`**, por dos motivos. El bueno: así hay
 * una versión por idioma y el titular se lee en el del visitante. El práctico: en la raíz se
 * aplicaba también a `/_not-found` y al panel, rutas cuyos metadatos no declaran
 * `metadataBase`, y el build avisaba de que estaba resolviendo la imagen contra
 * `localhost:3000`.
 *
 * No se declaran fuentes: `ImageResponse` usa su tipografía por defecto, y traerse la
 * Instrument Serif significaría empaquetar el fichero de la fuente sólo para esto. El texto
 * son dos líneas; la voz de la marca la pone el color.
 */
export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  // Un idioma desconocido no debería llegar aquí (las rutas se generan de `locales`), pero
  // esto es una imagen: fallar en silencio al castellano es mejor que romper la vista previa
  // del enlace, que es lo único que se vería.
  const locale: Locale = isLocale(raw) ? raw : 'es'
  const t = getDictionary(locale)

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
      {/* Filete en cobre: el mismo acento que el sitio, y hace de firma. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 56, height: 3, background: '#e0a458' }} />
        <div
          style={{
            color: '#6d747c',
            fontSize: 22,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          {t.nav.projects} · CV
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
