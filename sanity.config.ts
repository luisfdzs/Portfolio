'use client'

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { apiVersion, dataset, projectId } from './sanity/env'
import { schemaTypes } from './sanity/schemas'
import { structure } from './sanity/structure'

/**
 * PANEL DE ADMINISTRACIÓN — se sirve dentro de la propia web, en /admin.
 *
 * Se entra con la cuenta de Sanity, así que no hay contraseña que compartir ni que guardar
 * en ningún sitio, cada cambio queda con autor y fecha, y hay historial para deshacer.
 *
 * Lo que se gana teniéndolo: **cambiar el CV sin desplegar.** El día que haya un puesto
 * nuevo o un proyecto terminado, se edita desde el móvil, se pulsa «Publish» y la web se
 * actualiza en segundos por el webhook de `app/api/revalidate`. Sin panel habría que abrir
 * el editor, tocar `content/`, hacer commit y esperar un build — y por ese roce los CV se
 * quedan viejos.
 */
export default defineConfig({
  name: 'portfolio',
  title: 'Portfolio · Luis Fernández Sangil',
  basePath: '/admin',
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({ structure }),
    // Vision permite lanzar consultas GROQ a mano: útil para comprobar qué devuelve una
    // proyección sin desplegar nada.
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  document: {
    // «Perfil» es único: no se ofrece crear otro.
    newDocumentOptions: (prev) => prev.filter((template) => template.templateId !== 'profile'),
  },
})
