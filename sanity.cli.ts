import { defineCliConfig } from 'sanity/cli'
import { dataset, projectId } from './sanity/env'

/**
 * Configuración para los comandos del CLI de Sanity (`npx sanity …`), como la importación
 * del contenido inicial o la creación del webhook. Lee el proyecto y el dataset de las
 * mismas variables que la web, así que no hay dos sitios donde equivocarse.
 */
export default defineCliConfig({
  api: { projectId, dataset },
  // El panel se sirve dentro de la web (app/(studio)/admin), no como aplicación aparte.
  studioHost: undefined,
})
