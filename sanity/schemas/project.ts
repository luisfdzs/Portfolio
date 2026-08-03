import { orderRankField } from '@sanity/orderable-document-list'
import { defineField, defineType } from 'sanity'

/**
 * Un proyecto propio.
 *
 * **El `slug` sí es la URL** (`/es/projects/swiftmet`), al contrario que en los demás
 * documentos, donde es sólo una clave interna. Por eso lleva `isUnique` implícito por el
 * tipo `slug` y por eso conviene no tocarlo una vez publicado: cambiarlo rompe cualquier
 * enlace que se haya mandado en una candidatura, que es exactamente para lo que existen
 * estas fichas.
 *
 * `highlights` es el campo que hace o deshace la ficha: tres o cuatro **decisiones
 * técnicas concretas**, no adjetivos. La descripción del campo lo dice, porque es el único
 * sitio donde alguien lo va a leer justo antes de escribirlas.
 */
export const project = defineType({
  name: 'project',
  title: 'Proyectos',
  type: 'document',
  fields: [
    orderRankField({ type: 'project' }),
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL',
      type: 'slug',
      description:
        'Forma la dirección de la ficha: /es/projects/mi-proyecto. No lo cambies una vez publicado: rompería los enlaces ya enviados.',
      options: { source: 'name', maxLength: 64 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Frase',
      type: 'localizedString',
      description: 'Una línea que diga qué es. Es lo que se lee en la tarjeta y en Google.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Año',
      type: 'string',
      validation: (rule) => rule.required().regex(/^\d{4}$/, { name: 'un año de cuatro cifras' }),
    }),
    defineField({
      name: 'status',
      title: 'Estado',
      type: 'string',
      initialValue: 'live',
      options: {
        list: [
          { title: 'En producción', value: 'live' },
          { title: 'Prototipo navegable', value: 'prototype' },
          { title: 'Archivado', value: 'archived' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Mi papel',
      type: 'localizedString',
      description: 'Por ejemplo: «Diseño, desarrollo, modelo de contenido y despliegue».',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Descripción',
      type: 'localizedParagraphs',
      description: 'Qué es y qué había que resolver. Dos párrafos.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'highlights',
      title: 'Lo que tiene dentro',
      type: 'array',
      of: [{ type: 'localizedString' }],
      description:
        'Tres o cuatro decisiones técnicas comprobables, no adjetivos. «Next.js + Sanity» lo pone cualquiera; «la web se sirve estática y el webhook la actualiza en 9 segundos sin desplegar» no.',
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: 'stack',
      title: 'Stack',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'liveUrl',
      title: 'Web en vivo',
      type: 'url',
    }),
    defineField({
      name: 'repoUrl',
      title: 'Repositorio',
      type: 'url',
    }),
    defineField({
      name: 'note',
      title: 'Nota / advertencia',
      type: 'localizedText',
      description:
        'El matiz honesto: dominio pendiente de lanzar, datos de ejemplo, etc. Se muestra destacado. Es lo que hace que el resto se crea.',
    }),
    defineField({
      name: 'image',
      title: 'Captura',
      type: 'image',
      options: { hotspot: true },
      description:
        'Captura de la web. Si falta, la tarjeta muestra un hueco tramado a propósito en vez de disimularlo.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Texto alternativo',
          type: 'localizedString',
          description: 'Describe lo que se ve en la captura.',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'featured',
      title: 'Destacado en la portada',
      type: 'boolean',
      description:
        'En la portada salen todos los proyectos: esto decide por cuáles abre el carrusel. Los destacados van delante y el resto detrás, cada grupo en el orden de la lista.',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'tagline.es',
      media: 'image',
      featured: 'featured',
      status: 'status',
    },
    prepare({ title, subtitle, media, featured, status }) {
      return {
        title: `${featured ? '★ ' : ''}${title ?? '(sin nombre)'}`,
        subtitle: `${status ?? '—'} · ${subtitle ?? ''}`,
        media,
      }
    },
  },
})
