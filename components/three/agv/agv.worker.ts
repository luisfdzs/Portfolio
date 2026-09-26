import { buildAgvGeometry } from './geometry'
import { agvModels, type AgvModelKey } from './models'

export type AgvWorkerRequest = { keys: AgvModelKey[]; scale: number }

export type AgvWorkerResult = {
  key: AgvModelKey
  position: Float32Array
  tone: Float32Array
  normal: Float32Array
  glow: Float32Array
  move: Float32Array
  lift: number
}

type WorkerScope = {
  onmessage: ((event: MessageEvent<AgvWorkerRequest>) => void) | null
  postMessage: (message: AgvWorkerResult, transfer: Transferable[]) => void
}

const scope = self as unknown as WorkerScope

scope.onmessage = (event) => {
  const { keys, scale } = event.data
  for (const key of keys) {
    const spec = agvModels[key]()
    const data = buildAgvGeometry(spec, scale)
    const result: AgvWorkerResult = {
      key,
      position: data.position,
      tone: data.tone,
      normal: data.normal,
      glow: data.glow,
      move: data.move,
      lift: spec.lift,
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
