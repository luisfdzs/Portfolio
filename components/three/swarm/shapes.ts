import { BufferAttribute } from 'three'
import type { AgvWorkerResult } from '@/components/three/agv/agv.worker'

export const MODEL = 0
export const FRAME = 1
export const HERO = 2

export const HOLD = 5

const FIT = 2.2

export type Shape = {
  kind: typeof MODEL | typeof FRAME | typeof HERO
  position: BufferAttribute
  normal: BufferAttribute
  meta: BufferAttribute
  lift: number
  pivot: [number, number]
  turn: number
  spin: boolean
  hold: boolean
}

const ramp = (t: number, from: number, to: number) =>
  Math.min(1, Math.max(0, (t - from) / (to - from)))
const smooth = (t: number) => t * t * (3 - 2 * t)

export function emptyShape(kind: Shape['kind'], count: number): Shape {
  return {
    kind,
    position: new BufferAttribute(new Float32Array(count * 4), 4),
    normal: new BufferAttribute(new Float32Array(count * 4), 4),
    meta: new BufferAttribute(new Float32Array(count * 2), 2),
    lift: 0,
    pivot: [0, 0],
    turn: 0,
    spin: false,
    hold: false,
  }
}

export function poseOf(shape: Shape, cycle: number) {
  const lower = shape.hold ? 0 : smooth(ramp(cycle, 3.1, 4.3))
  const raise = cycle < 0 ? 0 : smooth(ramp(cycle, 0.5, 1.7)) * (1 - lower)
  const sweep = shape.spin ? smooth(ramp(cycle, 0.2, HOLD - 0.2)) : raise
  return { lift: shape.lift * raise, ratio: raise, turn: shape.turn * sweep }
}

export function modelShape(data: AgvWorkerResult, count: number): Shape {
  const n = data.tone.length
  const [px, py] = data.pivot
  const c = Math.cos(data.turn)
  const s = Math.sin(data.turn)
  let minX = Infinity
  let minY = Infinity
  let minZ = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let maxZ = -Infinity
  for (let i = 0; i < n; i++) {
    const x = data.position[i * 3] ?? 0
    const y = data.position[i * 3 + 1] ?? 0
    const z = data.position[i * 3 + 2] ?? 0
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
    minZ = Math.min(minZ, z)
    maxZ = Math.max(maxZ, z)
    if ((data.move[i] ?? 0) > 3.5) {
      const tx = px + c * (x - px) - s * (y - py)
      const ty = py + s * (x - px) + c * (y - py)
      minX = Math.min(minX, tx)
      maxX = Math.max(maxX, tx)
      minY = Math.min(minY, ty)
      maxY = Math.max(maxY, ty)
    }
  }
  const size =
    (FIT * data.fit) / Math.max(Math.hypot(maxX - minX, maxZ - minZ), (maxY - minY) * 1.2)
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const cz = (minZ + maxZ) / 2

  const pick = new Uint32Array(count)
  const order = new Uint32Array(n)
  for (let i = 0; i < n; i++) order[i] = i
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const swap = order[i] ?? 0
    order[i] = order[j] ?? 0
    order[j] = swap
  }
  for (let i = 0; i < count; i++) pick[i] = order[i % n] ?? 0
  const height = (j: number) => data.position[j * 3 + 1] ?? 0
  pick.sort((a, b) => height(a) - height(b))

  const shape = emptyShape(MODEL, count)
  const position = shape.position.array as Float32Array
  const normal = shape.normal.array as Float32Array
  const meta = shape.meta.array as Float32Array
  const jitter = count > n ? 0.004 : 0
  for (let i = 0; i < count; i++) {
    const j = pick[i] ?? 0
    const y = height(j)
    position[i * 4] = ((data.position[j * 3] ?? 0) - cx) * size + (Math.random() - 0.5) * jitter
    position[i * 4 + 1] = (y - cy) * size + (Math.random() - 0.5) * jitter
    position[i * 4 + 2] =
      ((data.position[j * 3 + 2] ?? 0) - cz) * size + (Math.random() - 0.5) * jitter
    position[i * 4 + 3] = data.tone[j] ?? 1
    normal[i * 4] = data.normal[j * 3] ?? 0
    normal[i * 4 + 1] = data.normal[j * 3 + 1] ?? 0
    normal[i * 4 + 2] = data.normal[j * 3 + 2] ?? 0
    normal[i * 4 + 3] = data.glow[j] ?? 0
    meta[i * 2] = data.move[j] ?? 0
    meta[i * 2 + 1] = Math.min(1, ((y - minY) / (maxY - minY || 1)) * 0.75 + Math.random() * 0.2)
  }
  shape.lift = data.lift * size
  shape.pivot = [(px - cx) * size, (py - cy) * size]
  shape.turn = data.turn
  shape.spin = data.spin
  shape.hold = data.hold
  return shape
}

export function nebulaShape(count: number): Shape {
  const shape = emptyShape(MODEL, count)
  const position = shape.position.array as Float32Array
  const meta = shape.meta.array as Float32Array
  for (let i = 0; i < count; i++) {
    const u = Math.random() * 2 - 1
    const a = Math.random() * Math.PI * 2
    const ring = Math.sqrt(1 - u * u)
    const r = 0.3 + Math.pow(Math.random(), 0.8) * 0.7
    position[i * 4] = ring * Math.cos(a) * r
    position[i * 4 + 1] = u * r * 0.8
    position[i * 4 + 2] = ring * Math.sin(a) * r
    position[i * 4 + 3] = 0.8 + Math.random() * 0.2
    meta[i * 2 + 1] = Math.random() * 0.9
  }
  return shape
}

export function fillFlat(shape: Shape, source: Float32Array | null) {
  const total = source ? source.length / 3 : 0
  if (!source || total === 0) return
  const position = shape.position.array as Float32Array
  const meta = shape.meta.array as Float32Array
  const count = meta.length / 2
  for (let i = 0; i < count; i++) {
    const pick = Math.floor(Math.random() * total)
    const x = source[pick * 3] ?? 0
    position[i * 4] = x
    position[i * 4 + 1] = source[pick * 3 + 1] ?? 0
    position[i * 4 + 2] = 0
    position[i * 4 + 3] = source[pick * 3 + 2] ?? 0
    meta[i * 2 + 1] = Math.min(1, Math.max(0, x + 0.5) * 0.75 + Math.random() * 0.2)
  }
  shape.position.needsUpdate = true
  shape.meta.needsUpdate = true
}

function roundedRect(u: number, radius: number) {
  const straight = 1 - 2 * radius
  const arc = (Math.PI / 2) * radius
  const total = 4 * straight + 4 * arc
  let d = u * total
  const corners: [number, number, number][] = [
    [0.5 - radius, 0.5 - radius, 0],
    [-0.5 + radius, 0.5 - radius, Math.PI / 2],
    [-0.5 + radius, -0.5 + radius, Math.PI],
    [0.5 - radius, -0.5 + radius, (3 * Math.PI) / 2],
  ]
  const edges: [number, number, number, number, number, number][] = [
    [0.5 - radius, 0.5, -1, 0, 0, 1],
    [-0.5, 0.5 - radius, 0, -1, -1, 0],
    [-0.5 + radius, -0.5, 1, 0, 0, -1],
    [0.5, -0.5 + radius, 0, 1, 1, 0],
  ]
  for (let side = 0; side < 4; side++) {
    const corner = corners[side] ?? [0, 0, 0]
    if (d <= arc) {
      const angle = corner[2] + d / radius
      return [
        corner[0] + Math.cos(angle) * radius,
        corner[1] + Math.sin(angle) * radius,
        Math.cos(angle),
        Math.sin(angle),
      ]
    }
    d -= arc
    const edge = edges[side] ?? [0, 0, 0, 0, 0, 0]
    if (d <= straight) return [edge[0] + edge[2] * d, edge[1] + edge[3] * d, edge[4], edge[5]]
    d -= straight
  }
  return [0.5, 0.5 - radius, 1, 0]
}

export function frameShape(count: number): Shape {
  const shape = emptyShape(FRAME, count)
  const position = shape.position.array as Float32Array
  const normal = shape.normal.array as Float32Array
  const meta = shape.meta.array as Float32Array
  for (let i = 0; i < count; i++) {
    const u = Math.random()
    const [x, y, nx, ny] = roundedRect(u, 0.06)
    const spark = Math.random() < 0.18 ? Math.pow(Math.random(), 3) * 0.07 : 0
    const offset = (Math.random() - 0.5) * 0.008 + spark
    position[i * 4] = (x ?? 0) + (nx ?? 0) * offset
    position[i * 4 + 1] = (y ?? 0) + (ny ?? 0) * offset
    position[i * 4 + 2] = (Math.random() - 0.5) * 0.01
    position[i * 4 + 3] = Math.random()
    normal[i * 4] = u
    meta[i * 2 + 1] = Math.random() * 0.95
  }
  return shape
}
