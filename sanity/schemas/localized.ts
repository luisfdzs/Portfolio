import { defineField, defineType } from 'sanity'

const englishDescription =
  'Opcional. Si se deja vacío, la web muestra el texto en castellano también en la versión inglesa.'

export const localizedString = defineType({
  name: 'localizedString',
  title: 'Texto traducible (una línea)',
  type: 'object',
  fields: [
    defineField({
      name: 'es',
      title: 'Castellano',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'en',
      title: 'Inglés',
      type: 'string',
      description: englishDescription,
    }),
  ],
})

export const localizedText = defineType({
  name: 'localizedText',
  title: 'Texto traducible (párrafo)',
  type: 'object',
  fields: [
    defineField({
      name: 'es',
      title: 'Castellano',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'en',
      title: 'Inglés',
      type: 'text',
      rows: 3,
      description: englishDescription,
    }),
  ],
})

export const localizedParagraphs = defineType({
  name: 'localizedParagraphs',
  title: 'Párrafos traducibles',
  type: 'object',
  fields: [
    defineField({
      name: 'es',
      title: 'Castellano',
      type: 'array',
      of: [{ type: 'text', rows: 4 }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'en',
      title: 'Inglés',
      type: 'array',
      of: [{ type: 'text', rows: 4 }],
      description: englishDescription,
    }),
  ],
})
