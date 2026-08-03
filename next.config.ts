import type { NextConfig } from 'next'

/**
 * MOMENTO DEL BUILD, CONGELADO Y EXPLÍCITO
 *
 * La web escribe tres cosas que dependen de «hoy»: los años de experiencia del titular,
 * la duración del puesto actual y el año del copyright del pie. Leer el reloj durante el
 * render sería un error doble: con `cacheComponents` activo, un acceso al reloj en una
 * ruta prerrenderizada la vuelve dinámica —y una web que existe para servirse estática
 * pasaría a ejecutar una función por visita para escribir «2026»—; y, peor, dejaría la
 * congelación como un efecto secundario que nadie ve.
 *
 * Así que se resuelve **aquí**, en la configuración, que es Node normal ejecutándose una
 * vez antes de compilar. El valor viaja como variable de entorno y `lib/format.ts` lo
 * lee. La consecuencia queda dicha en voz alta: **estas cifras valen el día que se
 * despliega y envejecen hasta el siguiente despliegue.** Cualquier commit a `main` las
 * recalcula, así que el desfase real es de meses.
 */
const buildDate = new Date()
const buildMonth = `${buildDate.getUTCFullYear()}-${String(buildDate.getUTCMonth() + 1).padStart(2, '0')}`

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    // `NEXT_PUBLIC_` a propósito: el pie es un componente de servidor, pero el día que
    // una cifra haga falta en cliente no queremos descubrir que la variable no llega.
    NEXT_PUBLIC_BUILD_MONTH: buildMonth,
  },
  // Necesario para la directiva `use cache` (ver lib/content.ts): es lo que permite
  // etiquetar los datos del CMS y que el webhook de publicación los invalide.
  cacheComponents: true,
  poweredByHeader: false,
  images: {
    // Las transformaciones las hace la CDN de Sanity, que ya tiene el original: ver
    // sanity/imageLoader.ts. Así no se consume cuota de optimización de Vercel y las
    // imágenes que se suban desde el panel se optimizan igual que las locales.
    loader: 'custom',
    loaderFile: './sanity/imageLoader.ts',
    deviceSizes: [420, 640, 828, 1200, 1600, 2048],
    // Next 16 restringe las calidades a una lista blanca (por defecto sólo 75).
    // Declaramos las dos que usamos: 85 para el retrato y las capturas, 75 el resto.
    qualities: [75, 85],
  },
  async redirects() {
    return [
      {
        // El portfolio anterior (Astro) usaba anclas en castellano sin idioma en la
        // ruta. Quien llegue con un enlace viejo —de LinkedIn, de una candidatura
        // enviada, del CV en PDF— no debe caer en un 404.
        source: '/experiencia',
        destination: '/es#experience',
        permanent: true,
      },
      {
        source: '/proyectos',
        destination: '/es#projects',
        permanent: true,
      },
      {
        // El índice de proyectos se retiró el 2026-08-03 —los ocho están en el carrusel de
        // la portada—, pero la URL estuvo publicada: la enseñaba el menú, la enlazaba la
        // propia sección y **estuvo en el `sitemap.xml`**, así que Google la conoce. Sin
        // esto, quien vuelva por ella o por un enlace ya enviado se come un 404.
        //
        // El patrón no lleva comodín a propósito: casa `/es/projects` exacto y **no**
        // `/es/projects/swiftmet`, que sigue siendo una página de verdad. Un `/:path*`
        // aquí se llevaría por delante las ocho fichas.
        source: '/:locale(es|en)/projects',
        destination: '/:locale#projects',
        permanent: true,
      },
      {
        source: '/contacto',
        destination: '/es#contact',
        permanent: true,
      },
      {
        // «cv» es lo que alguien teclea de memoria buscando el curriculum.
        source: '/:locale(es|en)/cv',
        destination: '/:locale',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ]
  },
}

export default nextConfig
