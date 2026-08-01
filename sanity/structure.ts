import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import type { StructureResolver } from 'sanity/structure'

/**
 * ESTRUCTURA DEL PANEL
 *
 * Se define a mano en vez de dejar la lista automática de tipos por dos razones concretas:
 *
 * 1. **El perfil se abre directo.** Es un documento único, y la lista por defecto mostraría
 *    una carpeta «Perfil» con un solo elemento dentro: un clic de más en el documento que
 *    más se toca.
 * 2. **Experiencia, formación, stack y proyectos se ordenan arrastrando.**
 *    `orderableDocumentListDeskItem` es lo que lo permite; sin él el orden lo decidiría la
 *    fecha de creación del documento, que no tiene ninguna relación con el orden en que
 *    se quieren leer.
 *
 * El panel está **en castellano**, al contrario que en los proyectos de cliente: aquí lo usa
 * una sola persona y es su idioma.
 */
export const structure: StructureResolver = (S, context) => {
  return S.list()
    .title('Contenido')
    .items([
      S.listItem().title('Perfil').id('profile').child(
        // El `documentId` fijo es lo que hace que el singleton sea de verdad único: sin
        // él, cada entrada al panel podría crear un documento nuevo del mismo tipo.
        S.document().schemaType('profile').documentId('profile').title('Perfil'),
      ),

      S.divider(),

      orderableDocumentListDeskItem({
        type: 'experience',
        title: 'Experiencia',
        id: 'experience-list',
        S,
        context,
      }),

      orderableDocumentListDeskItem({
        type: 'project',
        title: 'Proyectos',
        id: 'project-list',
        S,
        context,
      }),

      orderableDocumentListDeskItem({
        type: 'education',
        title: 'Formación',
        id: 'education-list',
        S,
        context,
      }),

      orderableDocumentListDeskItem({
        type: 'skillGroup',
        title: 'Stack',
        id: 'skill-list',
        S,
        context,
      }),
    ])
}
