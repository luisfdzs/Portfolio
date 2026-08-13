import { defineField, defineType } from 'sanity'

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
      description:
        'Opcional. Si lo dejas vacío se usa el retrato que viene con la web (public/luis.webp), que es un recorte con transparencia preparado para el marco de la portada. Si subes uno propio, súbelo también recortado: una foto con fondo se ve como una tarjeta oscura alrededor de la cara.',
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
