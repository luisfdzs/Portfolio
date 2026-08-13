import next from 'eslint-config-next/core-web-vitals'

const config = [
  ...next,
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'public/**',
      'next-env.d.ts',
      '.vercel/**',
      '.claude/**',
    ],
  },
]

export default config
