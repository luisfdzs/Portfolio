import type { AgvSpec } from '../geometry'
import { platform } from './platform'
import { reach } from './reach'
import { stacker } from './stacker'

export const agvModels = {
  agv2: platform,
  agv4: stacker,
  agv5: reach,
} as const satisfies Record<string, () => AgvSpec>

export type AgvModelKey = keyof typeof agvModels

export const agvModelKeys = Object.keys(agvModels) as AgvModelKey[]

export function isAgvModel(value: string): value is AgvModelKey {
  return value in agvModels
}
