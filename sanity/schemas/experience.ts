import { orderRankField } from '@sanity/orderable-document-list'
import { defineField, defineType } from 'sanity'

const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/

export const experience = defineType({
  name: 'experience',
  title: 'Experiencia',
  type: 'document',
  fields: [
    orderRankField({ type: 'experience' }),
    defineField({
      name: 'role',
      title: 'Puesto',
      type: 'localizedString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Identificador',
      type: 'slug',
      description: 'Se genera del puesto. No aparece en ninguna URL; sirve de clave interna.',
      options: { source: 'role.es', maxLength: 64 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'company',
      title: 'Empresa',
      type: 'string',
      description: 'La que firma la nómina.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'clients',
      title: 'Clientes finales',
      type: 'array',
      description:
        'Sólo en puestos de consultoría: dónde se hacía el trabajo. La web los pone detrás de una flecha, cada uno enlazado a su web: «Altia → Indra · Kids&Us».',
      of: [
        defineField({
          name: 'client',
          title: 'Cliente',
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Nombre',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({ name: 'url', title: 'Web del cliente', type: 'url' }),
          ],
          preview: { select: { title: 'name', subtitle: 'url' } },
        }),
      ],
    }),
    defineField({
      name: 'startDate',
      title: 'Inicio (AAAA-MM)',
      type: 'string',
      validation: (rule) =>
        rule.required().regex(monthPattern, { name: 'AAAA-MM, por ejemplo 2024-02' }),
    }),
    defineField({
      name: 'endDate',
      title: 'Fin (AAAA-MM)',
      type: 'string',
      description: 'Déjalo vacío si es el puesto actual.',
      validation: (rule) =>
        rule
          .regex(monthPattern, { name: 'AAAA-MM, por ejemplo 2026-01' })
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
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'remote',
      title: 'En remoto',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'summary',
      title: 'Descripción',
      type: 'localizedParagraphs',
      description: 'Uno o dos párrafos. Más de dos y no se lee.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'stack',
      title: 'Tecnologías',
      type: 'array',
      of: [{ type: 'string' }],
      description:
        'Escríbelas como en su documentación oficial: «Next.js», «ASP.NET Core». Un stack mal escrito lo lee un desarrollador.',
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'url',
      title: 'Web de la empresa',
      type: 'url',
    }),
  ],
  preview: {
    select: { title: 'role.es', company: 'company', start: 'startDate', end: 'endDate' },
    prepare({ title, company, start, end }) {
      return {
        title: title ?? '(sin puesto)',
        subtitle: `${company ?? '—'} · ${start ?? '?'} → ${end ?? 'actualidad'}`,
      }
    },
  },
})
