import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S, context) => {
  return S.list()
    .title('Contenido')
    .items([
      S.listItem()
        .title('Perfil')
        .id('profile')
        .child(S.document().schemaType('profile').documentId('profile').title('Perfil')),

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
