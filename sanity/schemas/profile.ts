import { defineField, defineType } from 'sanity'

/**
 * Perfil: documento **único**. `sanity.config.ts` quita la opción de crear otro y
 * `sanity/structure.ts` lo abre directamente en vez de mostrar una lista de uno.
 *
 * Es el documento que afecta a todas las páginas —cabecera, pie, metadatos, apertura
 * social—, así que sus campos son los únicos con validación estricta: un correo mal escrito
 * aquí rompe el único botón de la web que importa.
 */
export const profile = defineType({
  name: 'profile',
  title: 'Perfil',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre completo',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'headline',
      title: 'Titular',
      type: 'localizedString',
      description: 'Una línea. Aparece bajo el nombre en la portada y en el pie.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Ubicación',
      type: 'localizedString',
      description: 'Por ejemplo: «Vigo, Galicia · En remoto».',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Correo',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'linkedin',
      title: 'LinkedIn',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'github',
      title: 'GitHub',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'bio',
      title: 'Perfil (párrafos)',
      type: 'localizedParagraphs',
      description:
        'Los párrafos de la sección «Perfil». El primero se muestra más grande: escríbelo para que aguante solo.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'photo',
      title: 'Retrato',
      type: 'image',
      // El recorte importa aquí más que en ninguna otra imagen: se sirve en círculo en
      // móvil, y sin `hotspot` un retrato descentrado sale sin media cara.
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Texto alternativo',
          type: 'localizedString',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'headline.es', media: 'photo' },
  },
})
