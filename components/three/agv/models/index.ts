import type { AgvSpec } from '../geometry'
import { eei } from './campus'
import { database, laptop, server } from './devices'
import { barrier, car, parkingSign } from './parking'
import { platform } from './platform'
import { converter, turbofan, windTurbine } from './power'
import { reach } from './reach'
import { setup } from './setup'
import { stacker } from './stacker'

export const showcaseModels = {
  agv2: platform,
  agv4: stacker,
  agv5: reach,
  turbofan,
  windTurbine,
  converter,
  laptop,
  server,
  database,
  car,
  barrier,
  parkingSign,
  eei,
  setup,
} as const satisfies Record<string, () => AgvSpec>

export type ShowcaseModelKey = keyof typeof showcaseModels
