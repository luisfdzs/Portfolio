import { buildAgvGeometry } from './geometry'
import { showcaseModels, type ShowcaseModelKey } from './models'

export type AgvWorkerRequest = { keys: ShowcaseModelKey[]; scale: number }

export type AgvWorkerResult = {
  key: ShowcaseModelKey
  position: Float32Array
  tone: Float32Array
  normal: Float32Array
  glow: Float32Array
  move: Float32Array
  lift: number
  pivot: [number, number]
  turn: number
  spin: boolean
  fit: number
  hold: boolean
}

type WorkerScope = {
  onmessage: ((event: MessageEvent<AgvWorkerRequest>) => void) | null
  postMessage: (message: AgvWorkerResult, transfer: Transferable[]) => void
}

const scope = self as unknown as WorkerScope

scope.onmessage = (event) => {
  const { keys, scale } = event.data
  for (const key of keys) {
    const spec = showcaseModels[key]()
    const data = buildAgvGeometry(spec, scale)
    const result: AgvWorkerResult = {
      key,
      position: data.position,
      tone: data.tone,
      normal: data.normal,
      glow: data.glow,
      move: data.move,
      lift: spec.lift,
      pivot: [spec.pivot?.[0] ?? 0, spec.pivot?.[1] ?? 0],
      turn: spec.turn ?? 0,
      spin: spec.spin ?? false,
      fit: spec.fit ?? 1,
      hold: spec.hold ?? false,
    }
    scope.postMessage(result, [
      result.position.buffer,
      result.tone.buffer,
      result.normal.buffer,
      result.glow.buffer,
      result.move.buffer,
    ])
  }
}
