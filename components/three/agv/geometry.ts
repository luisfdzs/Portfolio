const DENSITY = 4.2

export type Vec3 = readonly [number, number, number]
export type Box = [number, number, number, number, number, number]
export type Field = (x: number, y: number, z: number) => number
export type Shape = { f: Field; box: Box }
export type RoundBox = Shape & { edge: (x: number, y: number, z: number) => boolean }
export type MoveCode = 0 | 1 | 2 | 3 | 4

type Part = {
  f: Field
  box: Box
  n: number
  tone: Field
  glow: number
  move: Field
  reveal: boolean
  nested: boolean
}
type Label = {
  text: string
  x: number
  y: number
  height: number
  z: number
  n: number
  move: MoveCode
}

export type AgvSpec = {
  parts: Part[]
  labels: Label[]
  lift: number
  pivot?: Vec3
  turn?: number
  spin?: boolean
  hold?: boolean
  fit?: number
}

export type AgvGeometry = {
  position: Float32Array
  tone: Float32Array
  glow: Float32Array
  move: Float32Array
  normal: Float32Array
}

export function rbox(
  cx: number,
  cy: number,
  cz: number,
  hx: number,
  hy: number,
  hz: number,
  r = 0.01,
): RoundBox {
  const f: Field = (x, y, z) => {
    const qx = Math.abs(x - cx) - hx + r
    const qy = Math.abs(y - cy) - hy + r
    const qz = Math.abs(z - cz) - hz + r
    return (
      Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) +
      Math.min(Math.max(qx, qy, qz), 0) -
      r
    )
  }
  const edge = (x: number, y: number, z: number) => {
    const e = r + 0.012
    const hits =
      Number(Math.abs(x - cx) > hx - e) +
      Number(Math.abs(y - cy) > hy - e) +
      Number(Math.abs(z - cz) > hz - e)
    return hits >= 2
  }
  return { f, edge, box: [cx - hx, cy - hy, cz - hz, cx + hx, cy + hy, cz + hz] }
}

export function cyl(
  cx: number,
  cy: number,
  cz: number,
  radius: number,
  half: number,
  axis: 'x' | 'y' | 'z',
): Shape {
  const f: Field = (x, y, z) => {
    let r: number
    let h: number
    if (axis === 'y') {
      r = Math.hypot(x - cx, z - cz)
      h = y - cy
    } else if (axis === 'z') {
      r = Math.hypot(x - cx, y - cy)
      h = z - cz
    } else {
      r = Math.hypot(y - cy, z - cz)
      h = x - cx
    }
    const dx = r - radius
    const dy = Math.abs(h) - half
    return Math.min(Math.max(dx, dy), 0) + Math.hypot(Math.max(dx, 0), Math.max(dy, 0))
  }
  const ex = axis === 'x' ? half : radius
  const ey = axis === 'y' ? half : radius
  const ez = axis === 'z' ? half : radius
  return { f, box: [cx - ex, cy - ey, cz - ez, cx + ex, cy + ey, cz + ez] }
}

export function cone(
  cx: number,
  cy: number,
  cz: number,
  bottom: number,
  top: number,
  half: number,
  axis: 'x' | 'y' | 'z',
): Shape {
  const f: Field = (x, y, z) => {
    let r: number
    let h: number
    if (axis === 'y') {
      r = Math.hypot(x - cx, z - cz)
      h = y - cy
    } else if (axis === 'z') {
      r = Math.hypot(x - cx, y - cy)
      h = z - cz
    } else {
      r = Math.hypot(y - cy, z - cz)
      h = x - cx
    }
    const k2x = top - bottom
    const k2y = 2 * half
    const cax = r - Math.max(0, Math.min(r, h < 0 ? bottom : top))
    const cay = Math.abs(h) - half
    const t = Math.min(
      1,
      Math.max(0, ((top - r) * k2x + (half - h) * k2y) / (k2x * k2x + k2y * k2y)),
    )
    const cbx = r - top + k2x * t
    const cby = h - half + k2y * t
    const sign = cbx < 0 && cay < 0 ? -1 : 1
    return sign * Math.sqrt(Math.min(cax * cax + cay * cay, cbx * cbx + cby * cby))
  }
  const radius = Math.max(bottom, top)
  const ex = axis === 'x' ? half : radius
  const ey = axis === 'y' ? half : radius
  const ez = axis === 'z' ? half : radius
  return { f, box: [cx - ex, cy - ey, cz - ez, cx + ex, cy + ey, cz + ez] }
}

function rotate(axis: 'x' | 'y' | 'z', angle: number, x: number, y: number, z: number): Vec3 {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  if (axis === 'x') return [x, c * y - s * z, s * y + c * z]
  if (axis === 'y') return [c * x + s * z, y, -s * x + c * z]
  return [c * x - s * y, s * x + c * y, z]
}

export function turned(shape: Shape, axis: 'x' | 'y' | 'z', angle: number, pivot: Vec3): Shape {
  const [px, py, pz] = pivot
  const f: Field = (x, y, z) => {
    const [qx, qy, qz] = rotate(axis, -angle, x - px, y - py, z - pz)
    return shape.f(qx + px, qy + py, qz + pz)
  }
  const [x0, y0, z0, x1, y1, z1] = shape.box
  const box: Box = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity]
  for (const x of [x0, x1]) {
    for (const y of [y0, y1]) {
      for (const z of [z0, z1]) {
        const [qx, qy, qz] = rotate(axis, angle, x - px, y - py, z - pz)
        box[0] = Math.min(box[0], qx + px)
        box[1] = Math.min(box[1], qy + py)
        box[2] = Math.min(box[2], qz + pz)
        box[3] = Math.max(box[3], qx + px)
        box[4] = Math.max(box[4], qy + py)
        box[5] = Math.max(box[5], qz + pz)
      }
    }
  }
  return { f, box }
}

export function union(...shapes: Shape[]): Shape {
  const box: Box = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity]
  for (const shape of shapes) {
    for (let i = 0; i < 3; i++) {
      box[i] = Math.min(box[i] ?? Infinity, shape.box[i] ?? Infinity)
      box[i + 3] = Math.max(box[i + 3] ?? -Infinity, shape.box[i + 3] ?? -Infinity)
    }
  }
  return {
    f: (x, y, z) => {
      let d = Infinity
      for (const shape of shapes) d = Math.min(d, shape.f(x, y, z))
      return d
    },
    box,
  }
}

function segmentDistance(x: number, y: number, z: number, a: Vec3, b: Vec3) {
  const bx = b[0] - a[0]
  const by = b[1] - a[1]
  const bz = b[2] - a[2]
  const px = x - a[0]
  const py = y - a[1]
  const pz = z - a[2]
  const t = Math.min(
    1,
    Math.max(0, (px * bx + py * by + pz * bz) / (bx * bx + by * by + bz * bz || 1)),
  )
  return Math.hypot(px - bx * t, py - by * t, pz - bz * t)
}

export function tube(points: Vec3[], radius: number): Shape {
  const f: Field = (x, y, z) => {
    let d = Infinity
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i]
      const b = points[i + 1]
      if (a && b) d = Math.min(d, segmentDistance(x, y, z, a, b))
    }
    return d - radius
  }
  const box: Box = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity]
  for (const [x, y, z] of points) {
    box[0] = Math.min(box[0], x - radius)
    box[1] = Math.min(box[1], y - radius)
    box[2] = Math.min(box[2], z - radius)
    box[3] = Math.max(box[3], x + radius)
    box[4] = Math.max(box[4], y + radius)
    box[5] = Math.max(box[5], z + radius)
  }
  return { f, box }
}

export function bezier(p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, steps = 24): Vec3[] {
  const points: Vec3[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const u = 1 - t
    const w0 = u * u * u
    const w1 = 3 * u * u * t
    const w2 = 3 * u * t * t
    const w3 = t * t * t
    points.push([
      w0 * p0[0] + w1 * p1[0] + w2 * p2[0] + w3 * p3[0],
      w0 * p0[1] + w1 * p1[1] + w2 * p2[1] + w3 * p3[1],
      w0 * p0[2] + w1 * p1[2] + w2 * p2[2] + w3 * p3[2],
    ])
  }
  return points
}

export function cut(shape: Shape, ...holes: Shape[]): Shape {
  return {
    f: (x, y, z) => {
      let d = shape.f(x, y, z)
      for (const hole of holes) d = Math.max(d, -hole.f(x, y, z))
      return d
    },
    box: shape.box,
  }
}

export function clip(shape: Shape, plane: Field): Shape {
  return { f: (x, y, z) => Math.max(shape.f(x, y, z), plane(x, y, z)), box: shape.box }
}

export const flat =
  (value: number): Field =>
  () =>
    value

export const withEdges =
  (shape: RoundBox, base: number, boost = 1.55): Field =>
  (x, y, z) =>
    shape.edge(x, y, z) ? base * boost : base

export const hazard: Field = (_x, y, z) => (((((y + z) * 8) % 1) + 1) % 1 < 0.5 ? 1.8 : 0.3)

export const hazardX: Field = (x, y) => (((((x + y) * 8) % 1) + 1) % 1 < 0.5 ? 1.8 : 0.3)

export const band =
  (axis: 'x' | 'y' | 'z', at: number, half: number, on: number, off: number): Field =>
  (x, y, z) =>
    Math.abs((axis === 'x' ? x : axis === 'y' ? y : z) - at) < half ? on : off

export class SpecBuilder {
  parts: Part[] = []
  labels: Label[] = []

  add(
    shape: Shape,
    n: number,
    tone: Field | number,
    options: {
      glow?: number
      move?: MoveCode
      rise?: number | Field
      reveal?: boolean
      nested?: boolean
    } = {},
  ) {
    const rise = options.rise
    this.parts.push({
      f: shape.f,
      box: shape.box,
      n,
      tone: typeof tone === 'number' ? flat(tone) : tone,
      glow: options.reveal ? 3 : (options.glow ?? 0),
      reveal: options.reveal ?? false,
      nested: options.nested ?? false,
      move:
        rise === undefined
          ? flat(options.move ?? 1)
          : typeof rise === 'number'
            ? flat(5 + rise)
            : (x, y, z) => 5 + rise(x, y, z),
    })
  }

  label(
    text: string,
    x: number,
    y: number,
    height: number,
    z: number,
    n: number,
    move: MoveCode = 1,
  ) {
    this.labels.push({ text, x, y, height, z, n, move })
  }
}

export function showcaseSpec(
  b: SpecBuilder,
  options: Omit<AgvSpec, 'parts' | 'labels' | 'lift'> & { lift?: number } = {},
): AgvSpec {
  return { ...options, parts: b.parts, labels: b.labels, lift: options.lift ?? 0 }
}

class Cloud {
  position: number[] = []
  normal: number[] = []
  tone: number[] = []
  glow: number[] = []
  move: number[] = []

  push(
    x: number,
    y: number,
    z: number,
    tone: number,
    glow: number,
    move: number,
    nx = 0,
    ny = 0,
    nz = 0,
  ) {
    this.position.push(x, y, z)
    this.normal.push(nx, ny, nz)
    this.tone.push(tone)
    this.glow.push(glow)
    this.move.push(move)
  }

  get size() {
    return this.tone.length
  }
}

function sampleParts(cloud: Cloud, parts: Part[], scale: number) {
  const pad = 0.01
  const scene = (x: number, y: number, z: number) => {
    let d = Infinity
    for (const part of parts) {
      if (part.reveal || part.nested) continue
      const [x0, y0, z0, x1, y1, z1] = part.box
      if (
        x < x0 - pad ||
        x > x1 + pad ||
        y < y0 - pad ||
        y > y1 + pad ||
        z < z0 - pad ||
        z > z1 + pad
      )
        continue
      d = Math.min(d, part.f(x, y, z))
    }
    return d
  }
  const margin = 0.022
  const e = 0.0008

  for (const part of parts) {
    const [x0, y0, z0, x1, y1, z1] = part.box
    const target = Math.max(8, Math.round(part.n * scale * DENSITY))
    let got = 0
    let tries = 0
    while (got < target && tries < target * 3000) {
      tries++
      let x = x0 - margin + Math.random() * (x1 - x0 + 2 * margin)
      let y = y0 - margin + Math.random() * (y1 - y0 + 2 * margin)
      let z = z0 - margin + Math.random() * (z1 - z0 + 2 * margin)
      const d = part.f(x, y, z)
      if (Math.abs(d) > margin) continue
      const gx = part.f(x + e, y, z) - part.f(x - e, y, z)
      const gy = part.f(x, y + e, z) - part.f(x, y - e, z)
      const gz = part.f(x, y, z + e) - part.f(x, y, z - e)
      const length = Math.hypot(gx, gy, gz) || 1
      x -= (gx / length) * d
      y -= (gy / length) * d
      z -= (gz / length) * d
      if (Math.abs(part.f(x, y, z)) > 0.002) continue
      if (!part.reveal && !part.nested && scene(x, y, z) < -0.003) continue
      cloud.push(
        x,
        y,
        z,
        part.tone(x, y, z),
        part.glow,
        part.move(x, y, z),
        gx / length,
        gy / length,
        gz / length,
      )
      got++
    }
  }
}

function labelContext(width: number, height: number) {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(width, height).getContext('2d')
  }
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas.getContext('2d')
}

function sampleLabel(cloud: Cloud, label: Label, scale: number) {
  const width = 700
  const tall = 200
  const context = labelContext(width, tall)
  if (!context) return
  context.fillStyle = '#fff'
  context.font = '900 160px "Arial Black", Arial, Helvetica, sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(label.text, width / 2, tall / 2 + 4)
  const data = context.getImageData(0, 0, width, tall).data
  const alpha = (u: number, w: number) => data[(w * width + u) * 4 + 3] ?? 0

  let minX = width
  let maxX = 0
  let minY = tall
  let maxY = 0
  for (let w = 0; w < tall; w++) {
    for (let u = 0; u < width; u++) {
      if (alpha(u, w) <= 128) continue
      minX = Math.min(minX, u)
      maxX = Math.max(maxX, u)
      minY = Math.min(minY, w)
      maxY = Math.max(maxY, w)
    }
  }
  if (maxY <= minY) return

  const mirror = label.z < 0
  const size = label.height / (maxY - minY)
  const n = Math.round(label.n * scale * DENSITY)
  let got = 0
  let tries = 0
  while (got < n && tries < n * 60) {
    tries++
    const u = minX + Math.random() * (maxX - minX)
    const w = minY + Math.random() * (maxY - minY)
    if (alpha(u | 0, w | 0) < 128) continue
    const dx = (u - (minX + maxX) / 2) * size
    cloud.push(
      label.x + (mirror ? -dx : dx),
      label.y - (w - (minY + maxY) / 2) * size,
      label.z,
      2.3,
      0,
      label.move,
      0,
      0,
      Math.sign(label.z),
    )
    got++
  }
}

export function buildAgvGeometry(spec: AgvSpec, scale: number): AgvGeometry {
  const cloud = new Cloud()
  sampleParts(cloud, spec.parts, scale)
  for (const label of spec.labels) sampleLabel(cloud, label, scale)
  return {
    position: new Float32Array(cloud.position),
    tone: new Float32Array(cloud.tone),
    glow: new Float32Array(cloud.glow),
    move: new Float32Array(cloud.move),
    normal: new Float32Array(cloud.normal),
  }
}
