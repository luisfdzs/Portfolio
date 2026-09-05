import type { NextConfig } from 'next'

const buildDate = new Date()
const buildMonth = `${buildDate.getUTCFullYear()}-${String(buildDate.getUTCMonth() + 1).padStart(2, '0')}`

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['192.168.1.*'],
  env: {
    NEXT_PUBLIC_BUILD_MONTH: buildMonth,
  },
  cacheComponents: true,
  poweredByHeader: false,
  images: {
    loader: 'custom',
    loaderFile: './sanity/imageLoader.ts',
    deviceSizes: [420, 640, 828, 1200, 1600, 2048],
    qualities: [75, 85],
  },
  async redirects() {
    return [
      {
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
        source: '/contacto',
        destination: '/es#contact',
        permanent: true,
      },
      {
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
      {
        source: '/projects/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ]
  },
}

export default nextConfig
