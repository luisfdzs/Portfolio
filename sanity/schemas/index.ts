import type { SchemaTypeDefinition } from 'sanity'
import { education } from './education'
import { experience } from './experience'
import { localizedParagraphs, localizedString, localizedText } from './localized'
import { profile } from './profile'
import { project } from './project'
import { skillGroup } from './skillGroup'

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
