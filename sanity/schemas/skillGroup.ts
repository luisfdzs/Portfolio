import { orderRankField } from '@sanity/orderable-document-list'
import { defineField, defineType } from 'sanity'

export const skillGroup = defineType({
  name: 'skillGroup',
  title: 'Stack',
  type: 'document',
  fields: [
    orderRankField({ type: 'skillGroup' }),
    defineField({
      name: 'title',
      title: 'Grupo',
      type: 'localizedString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Identificador',
      type: 'slug',
      options: { source: 'title.es', maxLength: 32 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Tecnologías',
      type: 'array',
      of: [{ type: 'string' }],
      description:
        'En orden de más a menos uso real. Es lo que la web dice que significa el orden.',
      options: { layout: 'tags' },
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: 'title.es', items: 'items' },
    prepare({ title, items }: { title?: string; items?: string[] }) {
      return {
        title: title ?? '(sin grupo)',
        subtitle: items?.join(' · ') ?? '',
      }
    },
  },
})
