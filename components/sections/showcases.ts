import type { ShowcaseSet } from '@/content/types'
import type { ShowcaseModelKey } from '@/components/three/agv/models'

export const showcaseSets: Record<ShowcaseSet, ShowcaseModelKey[]> = {
  agv: ['agv4', 'agv2', 'agv5'],
  power: ['turbofan', 'windTurbine', 'converter'],
  devices: ['database', 'laptop', 'server'],
  parking: ['car', 'barrier', 'parkingSign'],
  campus: ['eei'],
  setup: ['setup'],
}
