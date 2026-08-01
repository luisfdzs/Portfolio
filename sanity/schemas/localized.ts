import { defineField, defineType } from 'sanity'

/**
 * TIPOS TRADUCIBLES
 *
 * Tres formas y ninguna más: una línea, un párrafo y una lista de párrafos. Cada una es un
 * tipo de objeto propio, así que en el panel un titular se edita en un campo de una línea y
 * una biografía en un área de texto — y no todo en el mismo cajón.
 *
 * **Sólo el castellano es obligatorio.** El inglés se puede dejar vacío y la web lo rellena
 * con el castellano (ver `localizedString` en `lib/content.ts`). Es lo que permite publicar
 * un puesto nuevo el día que se cambia de trabajo sin quedarse bloqueado por la traducción,
 * a cambio de que ese párrafo se lea en castellano en la versión inglesa hasta que se
 * traduzca. El aviso está escrito en la descripción del campo para que quien edite lo sepa.
 */

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

/**
 * Lista de párrafos. Se modela como **array de textos y no como un campo de texto largo con
 * saltos de línea**: así cada párrafo es un elemento que se puede reordenar arrastrando, y
 * la web no tiene que partir una cadena por `\n\n` —que es donde siempre aparece el párrafo
 * vacío que rompe la maquetación—.
 */
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
