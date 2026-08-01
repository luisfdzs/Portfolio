import type { SchemaTypeDefinition } from 'sanity'
import { education } from './education'
import { experience } from './experience'
import { localizedParagraphs, localizedString, localizedText } from './localized'
import { profile } from './profile'
import { project } from './project'
import { skillGroup } from './skillGroup'

/**
 * Los tipos de objeto traducibles van primero por legibilidad, no por necesidad: Sanity
 * resuelve las referencias entre tipos sin importar el orden del array.
 */
export const schemaTypes: SchemaTypeDefinition[] = [
  localizedString,
  localizedText,
  localizedParagraphs,
  profile,
  experience,
  education,
  skillGroup,
  project,
]
