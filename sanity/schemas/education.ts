import { orderRankField } from '@sanity/orderable-document-list'
import { defineField, defineType } from 'sanity'

const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/

export const education = defineType({
  name: 'education',
  title: 'Formación',
  type: 'document',
  fields: [
    orderRankField({ type: 'education' }),
    defineField({
      name: 'title',
      title: 'Titulación',
      type: 'localizedString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Identificador',
      type: 'slug',
      options: { source: 'title.es', maxLength: 64 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'institution',
      title: 'Centro',
      type: 'localizedString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'startDate',
      title: 'Inicio (AAAA-MM)',
      type: 'string',
      validation: (rule) =>
        rule.required().regex(monthPattern, { name: 'AAAA-MM, por ejemplo 2020-09' }),
    }),
    defineField({
      name: 'endDate',
      title: 'Fin (AAAA-MM)',
      type: 'string',
      description: 'Déjalo vacío si está en curso.',
      validation: (rule) =>
        rule
          .regex(monthPattern, { name: 'AAAA-MM, por ejemplo 2025-06' })
          .custom((end, context) => {
            const start = (context.document as { startDate?: string } | undefined)?.startDate
            if (!end || !start) return true
            return end >= start || 'El fin no puede ser anterior al inicio'
          }),
    }),
    defineField({
      name: 'location',
      title: 'Ubicación',
      type: 'localizedString',
    }),
    defineField({
      name: 'note',
      title: 'Nota (párrafos)',
      type: 'localizedParagraphs',
      description:
        'Qué base te dejó la titulación. Un párrafo por idea: la web los pinta separados y centrados.',
    }),
    defineField({
      name: 'url',
      title: 'Web del centro',
      type: 'url',
    }),
  ],
  preview: {
    select: {
      title: 'title.es',
      institution: 'institution.es',
      start: 'startDate',
      end: 'endDate',
    },
    prepare({ title, institution, start, end }) {
      return {
        title: title ?? '(sin titulación)',
        subtitle: `${institution ?? '—'} · ${start ?? '?'} → ${end ?? 'en curso'}`,
      }
    },
  },
})
