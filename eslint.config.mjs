import next from 'eslint-config-next/core-web-vitals'

const DIRECTIVE = /^\s*(eslint-|@ts-|ts-|prettier-|globals\s)/

const house = {
  rules: {
    'no-comments': {
      meta: {
        type: 'problem',
        docs: { description: 'This repo ships code without comments. See CLAUDE.md.' },
        schema: [],
      },
      create(context) {
        return {
          Program() {
            for (const comment of context.sourceCode.getAllComments()) {
              if (comment.type === 'Shebang' || comment.type === 'Hashbang') continue
              if (DIRECTIVE.test(comment.value)) continue
              context.report({
                loc: comment.loc,
                message:
                  'No comments in this repo: put the reasoning in the commit message. Only tool directives are allowed.',
              })
            }
          },
        }
      },
    },
  },
}

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
  {
    files: ['**/*.{ts,tsx,mjs,js}'],
    plugins: { house },
    rules: { 'house/no-comments': 'error' },
  },
]

export default config
