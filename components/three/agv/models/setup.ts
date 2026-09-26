import {
  SpecBuilder,
  band,
  bezier,
  cut,
  cyl,
  rbox,
  showcaseSpec,
  tube,
  turned,
  union,
  withEdges,
  type AgvSpec,
  type Shape,
  type Vec3,
} from '../geometry'

const fract = (v: number) => ((v % 1) + 1) % 1
const hash = (v: number) => fract(Math.sin(v * 127.1) * 43758.5453)
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

const plus = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const minus = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const times = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k]
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const unit = (a: Vec3): Vec3 => times(a, 1 / (Math.hypot(a[0], a[1], a[2]) || 1))
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]

const TOP = 0.73
const LIFT = 0.4
const DESK_Z = 0.39
const LEG_X = 0.7
const SCREEN_Y = 1.0
const SCREEN_Z = 0.3
const POLE_Z = 0.07
const CHAIR_Z = 1.1
const DARK = 0.15
const DESK = { move: 2 } as const

type Frame = {
  shape: (shape: Shape) => Shape
  field: <T>(f: (x: number, y: number, z: number) => T) => (x: number, y: number, z: number) => T
  point: (x: number, y: number, z: number) => Vec3
}

function frame(axis: 'x' | 'y', angle: number, pivot: Vec3): Frame {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  const [px, py, pz] = pivot
  const local = (x: number, y: number, z: number): Vec3 => {
    const dx = x - px
    const dy = y - py
    const dz = z - pz
    return axis === 'y'
      ? [px + c * dx - s * dz, y, pz + s * dx + c * dz]
      : [x, py + c * dy + s * dz, pz - s * dy + c * dz]
  }
  return {
    shape: (shape) => turned(shape, axis, angle, pivot),
    field: (f) => (x, y, z) => f(...local(x, y, z)),
    point: (x, y, z) => {
      const dx = x - px
      const dy = y - py
      const dz = z - pz
      return axis === 'y'
        ? [px + c * dx + s * dz, y, pz - s * dx + c * dz]
        : [x, py + c * dy - s * dz, pz + s * dy + c * dz]
    },
  }
}

type Screen = (u: number, v: number) => number

const EDITOR_ROWS = 10
const EDITOR_CURSOR = 6
const INDENT = [0, 1, 2, 2, 1, 2, 3, 2, 1, 0]

function editor(u: number, v: number) {
  if (v < 0.04) return u < 0.26 ? 1.8 : 1.15
  if (u < 0.04) return v > 0.5 && fract(v * 11) < 0.4 ? 1.5 : 0.45
  if (v > 0.94) return u < 0.36 ? 0.95 : u < 0.5 ? 0.58 : 0.42
  const line = (0.93 - v) * EDITOR_ROWS
  const row = Math.floor(line)
  if (u < 0.22) {
    const active = row === 4
    const off = active ? 0.62 : DARK
    if (fract(line) > 0.5) return off
    const start = 0.055 + Math.floor(hash(row + 11) * 3) * 0.02
    return u > start && u < start + 0.04 + hash(row) * 0.07 ? (active ? 2.2 : 1.15) : off
  }
  if (u > 0.94) {
    const mini = v * 70
    return fract(mini) < 0.5 && u < 0.945 + hash(Math.floor(mini)) * 0.045 ? 0.95 : 0.36
  }
  if (row < 0 || fract(line) > 0.52) return DARK
  if (u < 0.25) return u > 0.23 ? 0.85 : DARK
  if (row === EDITOR_CURSOR) return DARK
  let x = 0.27 + (INDENT[row % INDENT.length] ?? 0) * 0.035
  for (let k = 0; k < 4; k++) {
    const length = 0.035 + hash(row * 7 + k) * 0.12
    if (u >= x && u < x + length) return k === 0 ? 2.2 : k % 2 === 0 ? 1.8 : 1.35
    x += length + 0.018
    if (x > 0.9) break
  }
  return DARK
}

const TERMINAL_ROWS = 9
const TERMINAL_CURSOR = 6

function terminal(u: number, v: number) {
  if (v > 0.93) return u < 0.1 && fract(u * 30) < 0.55 ? 2.1 : 0.62
  if (u > 0.55 && u < 0.56) return 0.75
  if (u > 0.56) {
    if (v > 0.5) {
      const line = (0.9 - v) * 8
      const row = Math.floor(line)
      if (row > 2 || fract(line) > 0.55) return DARK
      if (u < 0.62) return 1.25
      return u < 0.66 + hash(row + 40) * 0.3 ? 1.95 : u < 0.97 ? 0.55 : DARK
    }
    const wave = 0.1 + 0.28 * (0.5 + 0.5 * Math.sin(u * 37) * Math.cos(u * 11))
    if (Math.abs(v - wave) < 0.014) return 2.1
    return fract(v * 8) < 0.05 ? 0.55 : DARK
  }
  const line = (0.9 - v) * TERMINAL_ROWS
  const row = Math.floor(line)
  if (row < 0 || fract(line) > 0.55) return DARK
  const prompt = row % 3 === 0
  if (prompt && u > 0.025 && u < 0.045) return 2.4
  if (row === TERMINAL_CURSOR) return DARK
  const start = prompt ? 0.06 : 0.035
  return u > start && u < start + 0.08 + hash(row + 20) * 0.38 ? (prompt ? 1.9 : 1.05) : DARK
}

function browser(u: number, v: number) {
  if (v > 0.96) return u < 0.22 ? 0.95 : 0.5
  if (v > 0.9) return u > 0.1 && u < 0.78 ? 0.95 : 0.55
  if (v > 0.82) {
    if (v < 0.84 || v > 0.88) return DARK
    if (u > 0.05 && u < 0.11) return 2.1
    return u > 0.6 && u < 0.93 && fract(u * 20) < 0.6 ? 1.3 : DARK
  }
  if (v > 0.48) {
    const dx = (u - 0.76) * 1.8
    const dy = v - 0.65
    const r = Math.hypot(dx, dy)
    if (r < 0.16) {
      if (r > 0.148) return 1.9
      const span = Math.sqrt(Math.max(0.0001, 0.148 * 0.148 - dy * dy))
      return fract((dx / span) * 1.5 + 0.5) < 0.1 || fract(dy * 20) < 0.12 ? 1.6 : 0.45
    }
    if (u > 0.06 && u < 0.52) {
      if (v > 0.7 && v < 0.76) return u < 0.47 ? 2.1 : DARK
      if (v > 0.62 && v < 0.68) return u < 0.38 ? 2.1 : DARK
      if (v > 0.565 && v < 0.585) return u < 0.44 ? 1.1 : DARK
      if (v > 0.49 && v < 0.535) return u < 0.19 ? 2.3 : DARK
    }
    return DARK
  }
  if (v < 0.07 || v > 0.43) return DARK
  const column = Math.floor((u - 0.05) / 0.31)
  const cu = u - 0.05 - column * 0.31
  if (column < 0 || column > 2 || cu > 0.28) return DARK
  if (cu < 0.006 || cu > 0.274 || v < 0.076 || v > 0.424) return 1.35
  if (v > 0.26) return fract((cu + v) * 9) < 0.1 ? 1.1 : 0.72
  if (v > 0.19 && v < 0.215) return cu < 0.2 ? 1.5 : DARK
  if (v > 0.13 && v < 0.15) return cu < 0.14 ? 0.95 : DARK
  return DARK
}

function monitor(
  b: SpecBuilder,
  center: Vec3,
  hw: number,
  hh: number,
  yaw: number,
  screen: Screen,
  n: number,
  cursor?: [number, number],
) {
  const [cx, cy, cz] = center
  const view = frame('y', yaw, center)
  const bezel = 0.011
  const sw = hw - bezel
  const bottom = -hh + bezel + 0.008
  const tall = hh - bezel - bottom

  const panel = rbox(cx, cy, cz - 0.009, hw, hh, 0.009, 0.007)
  b.add(
    view.shape(panel),
    n,
    view.field((x, y, z) => {
      const lx = x - cx
      const ly = y - cy
      if (z > cz - 0.003) {
        if (Math.abs(lx) < sw && ly < hh - bezel && ly > bottom) {
          return screen((lx + sw) / (2 * sw), (ly - bottom) / tall)
        }
        if (panel.edge(x, y, z)) return 1.8
        return ly < bottom && Math.abs(lx) < 0.012 && ly < -hh + 0.01 ? 2 : 0.5
      }
      return panel.edge(x, y, z) ? 1.8 : 0.62
    }),
    DESK,
  )

  const housing = rbox(cx, cy - hh * 0.08, cz - 0.032, hw * 0.72, hh * 0.62, 0.016, 0.018)
  b.add(
    view.shape(housing),
    Math.round(n * 0.15),
    view.field((x, y, z) => {
      if (y > cy + hh * 0.3 && z < cz - 0.04 && fract((x - cx) * 45) < 0.35) return 1.25
      return housing.edge(x, y, z) ? 1.7 : 0.72
    }),
    DESK,
  )

  const glowY = cy - hh * 0.08
  const halo = cut(
    rbox(cx, glowY, cz - 0.049, hw * 0.66, hh * 0.54, 0.0025, 0.002),
    rbox(cx, glowY, cz - 0.049, hw * 0.66 - 0.008, hh * 0.54 - 0.008, 0.01, 0.002),
  )
  b.add(view.shape(halo), 120, 2.3, { glow: 2, move: 2 })

  const mountY = cy - hh * 0.05
  const vesa = rbox(cx, mountY, cz - 0.052, 0.05, 0.05, 0.004, 0.004)
  b.add(view.shape(vesa), 65, view.field(withEdges(vesa, 0.9, 1.6)), DESK)
  b.add(view.shape(cyl(cx, mountY, cz - 0.068, 0.018, 0.013, 'z')), 50, 1.5, DESK)

  if (cursor) {
    const [u, v] = cursor
    const caret = rbox(
      cx - sw + 2 * sw * u,
      cy + bottom + tall * v,
      cz + 0.0012,
      0.0024,
      0.008,
      0.0012,
      0.001,
    )
    b.add(view.shape(caret), 14, 2.6, { glow: 1, move: 2 })
  }

  return view.point(cx, mountY, cz - 0.081)
}

function desk(b: SpecBuilder) {
  const rug = (inset: number, half: number) => {
    const hx = 0.96 - inset
    const hz = 0.81 - inset
    const r = 0.12 - inset
    return union(
      rbox(0, -0.004, 0.68, hx - r, half, hz, 0.002),
      rbox(0, -0.004, 0.68, hx, half, hz - r, 0.002),
      ...[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => cyl(sx * (hx - r), -0.004, 0.68 + sz * (hz - r), r, half, 'y')),
      ),
    )
  }
  b.add(cut(rug(0, 0.004), rug(0.03, 0.01)), 500, 1.5)
  b.add(rug(0.03, 0.004), 300, 0.45)

  const grommet: Vec3 = [0.085, TOP, 0.035]
  const board = rbox(0, TOP - 0.014, DESK_Z, 0.9, 0.014, 0.39, 0.012)
  b.add(
    cut(board, cyl(grommet[0], TOP, grommet[2], 0.014, 0.05, 'y')),
    4400,
    (x, y, z) => {
      if (board.edge(x, y, z)) return 1.8
      if (y < TOP - 0.02) return 0.55
      return fract((z + 0.012 * Math.sin(x * 7)) * 22) < 0.12 ? 1.0 : 0.78
    },
    DESK,
  )
  b.add(
    cut(
      cyl(grommet[0], TOP + 0.002, grommet[2], 0.022, 0.003, 'y'),
      cyl(grommet[0], TOP, grommet[2], 0.014, 0.01, 'y'),
    ),
    35,
    1.9,
    DESK,
  )

  const mat = rbox(0.04, TOP, 0.555, 0.5, 0.005, 0.19, 0.004)
  b.add(
    mat,
    880,
    (x, y, z) => {
      if (y < TOP + 0.003) return 0.5
      const rim = Math.min(0.5 - Math.abs(x - 0.04), 0.19 - Math.abs(z - 0.555))
      if (rim < 0.006) return 1.2
      if (rim > 0.009 && rim < 0.013) return fract((x + z) * 60) < 0.5 ? 1.7 : 0.45
      return 0.42
    },
    DESK,
  )

  const kx = -0.07
  const kz = 0.575
  const keyboard = rbox(kx, TOP + 0.016, kz, 0.16, 0.011, 0.062, 0.006)
  b.add(
    keyboard,
    715,
    (x, y, z) => {
      if (keyboard.edge(x, y, z)) return 1.7
      if (y < TOP + 0.024) return 0.6
      const u = x - kx + 0.152
      const v = z - kz + 0.054
      const row = Math.floor(v / 0.018)
      if (u < 0 || u > 0.304 || v < 0 || row > 5) return 0.9
      if (row === 5 && u > 0.085 && u < 0.2) return fract(v / 0.018) < 0.16 ? 0.4 : 1.3
      const key = (u + row * 0.0045) / 0.0195
      if (fract(key) < 0.16 || fract(v / 0.018) < 0.16) return 0.4
      return hash(row * 31 + Math.floor(key)) > 0.9 ? 2 : 1.35
    },
    DESK,
  )

  const mouse = rbox(0.2, TOP + 0.017, 0.585, 0.03, 0.012, 0.052, 0.012)
  b.add(
    mouse,
    195,
    (x, y, z) => {
      if (y < TOP + 0.009) return 0.5
      if (z < 0.575 && Math.abs(x - 0.2) < 0.0025) return 1.8
      if (Math.abs(z - 0.575) < 0.0025) return 1.5
      return 1.05
    },
    DESK,
  )
  b.add(cyl(0.2, TOP + 0.029, 0.558, 0.006, 0.003, 'x'), 16, 2.2, DESK)
  b.add(cyl(0.2, TOP + 0.027, 0.61, 0.008, 0.002, 'y'), 22, 2.3, { glow: 2, move: 2 })

  const cup: Vec3 = [-0.62, TOP, 0.6]
  b.add(
    cut(
      cyl(cup[0], TOP + 0.048, cup[2], 0.038, 0.048, 'y'),
      cyl(cup[0], TOP + 0.07, cup[2], 0.032, 0.06, 'y'),
    ),
    195,
    band('y', TOP + 0.07, 0.006, 1.7, 1.1),
    DESK,
  )
  b.add(cyl(cup[0], TOP + 0.078, cup[2], 0.032, 0.002, 'y'), 22, 0.5, DESK)
  b.add(
    tube(
      bezier(
        [cup[0] + 0.036, TOP + 0.075, cup[2]],
        [cup[0] + 0.075, TOP + 0.075, cup[2]],
        [cup[0] + 0.075, TOP + 0.025, cup[2]],
        [cup[0] + 0.036, TOP + 0.025, cup[2]],
      ),
      0.007,
    ),
    50,
    1.2,
    DESK,
  )
}

function frameAndLegs(b: SpecBuilder) {
  for (const x of [-LEG_X, LEG_X]) {
    const foot = rbox(x, 0.028, DESK_Z, 0.036, 0.022, 0.34, 0.012)
    b.add(foot, 330, withEdges(foot, 0.85, 1.7))
    for (const z of [DESK_Z - 0.3, DESK_Z + 0.3]) b.add(cyl(x, 0.004, z, 0.02, 0.004, 'y'), 16, 1.6)

    const low = rbox(x, 0.225, DESK_Z, 0.045, 0.175, 0.034, 0.008)
    b.add(low, 440, withEdges(low, 0.8, 1.7))
    b.add(rbox(x, 0.395, DESK_Z, 0.048, 0.008, 0.037, 0.004), 55, 1.6)

    const mid = rbox(x, 0.365, DESK_Z, 0.039, 0.185, 0.028, 0.007)
    b.add(mid, 385, withEdges(mid, 0.95, 1.6), { move: 3, nested: true })
    b.add(rbox(x, 0.545, DESK_Z, 0.042, 0.007, 0.031, 0.004), 50, 1.6, { move: 3 })

    const high = rbox(x, 0.515, DESK_Z, 0.033, 0.185, 0.022, 0.006)
    b.add(high, 360, withEdges(high, 1.1, 1.6), { move: 2, nested: true })

    const bracket = rbox(x, 0.688, DESK_Z, 0.03, 0.014, 0.34, 0.006)
    b.add(bracket, 220, withEdges(bracket, 0.8, 1.6), DESK)
  }

  const beam = rbox(0, 0.68, DESK_Z, LEG_X - 0.03, 0.02, 0.022, 0.006)
  b.add(beam, 330, withEdges(beam, 0.75, 1.6), DESK)

  const control = rbox(-0.3, 0.684, 0.56, 0.09, 0.017, 0.045, 0.008)
  b.add(control, 110, withEdges(control, 0.7, 1.5), DESK)
  b.add(cyl(-0.23, 0.684, 0.606, 0.004, 0.002, 'z'), 12, 2.4, { glow: 1, move: 2 })

  const pad = rbox(0.56, 0.69, 0.77, 0.065, 0.011, 0.028, 0.006)
  b.add(pad, 140, withEdges(pad, 0.8, 1.7), DESK)
  b.add(rbox(0.54, 0.69, 0.799, 0.022, 0.006, 0.002, 0.002), 35, 2.4, { glow: 2, move: 2 })
  for (const x of [0.585, 0.605]) b.add(cyl(x, 0.69, 0.799, 0.006, 0.002, 'z'), 12, 2, DESK)
}

function tray(b: SpecBuilder) {
  const tz = 0.18
  const basket = cut(
    rbox(0, 0.625, tz, 0.5, 0.045, 0.08, 0.006),
    rbox(0, 0.64, tz, 0.494, 0.054, 0.074, 0.003),
  )
  b.add(
    basket,
    1320,
    (x, y, z) => {
      if (y > 0.664) return 1.8
      const wire = (a: number, c: number) => fract(a * 45) < 0.22 || fract(c * 45) < 0.22
      const mesh =
        Math.abs(z - tz) > 0.072 ? wire(x, y) : Math.abs(x) > 0.492 ? wire(z, y) : wire(x, z)
      return mesh ? 1.3 : 0.22
    },
    DESK,
  )
  for (const x of [-0.35, 0.35]) b.add(rbox(x, 0.686, tz, 0.012, 0.016, 0.07, 0.004), 35, 1.4, DESK)

  const strip = rbox(-0.1, 0.604, tz, 0.24, 0.017, 0.028, 0.008)
  b.add(
    strip,
    250,
    (x, y, z) => {
      if (strip.edge(x, y, z)) return 1.6
      if (y > 0.619 && Math.hypot(fract((x + 0.34) / 0.08) - 0.5, (z - tz) / 0.04) < 0.25)
        return 0.5
      return 1.05
    },
    DESK,
  )
  b.add(rbox(-0.32, 0.621, tz, 0.012, 0.004, 0.012, 0.003), 16, 2.4, DESK)

  const plugs = [-0.22, -0.14, -0.06, 0.02]
  for (const x of plugs) {
    b.add(rbox(x, 0.632, tz, 0.016, 0.012, 0.018, 0.005), 30, 1.2, DESK)
    b.add(
      tube(
        bezier(
          [x, 0.644, tz - 0.012],
          [x, 0.66, tz - 0.035],
          [x, 0.61, tz - 0.05],
          [x + 0.03, 0.597, 0.125],
        ),
        0.0045,
      ),
      35,
      1.15,
      DESK,
    )
  }
  b.add(
    tube(
      [
        [0.085, 0.64, 0.15],
        [0.085, 0.597, 0.126],
        [-0.3, 0.597, 0.125],
      ],
      0.007,
    ),
    80,
    1.2,
    DESK,
  )
  b.add(
    tube(
      [
        [-0.3, 0.597, 0.235],
        [0.4, 0.597, 0.235],
        [0.44, 0.59, 0.2],
        [0.44, 0.585, tz],
      ],
      0.007,
    ),
    80,
    1.2,
    DESK,
  )
  for (const x of [-0.2, 0.0, 0.2]) {
    b.add(cyl(x, 0.597, 0.125, 0.011, 0.004, 'x'), 14, 2, DESK)
    b.add(cyl(x + 0.1, 0.597, 0.235, 0.011, 0.004, 'x'), 14, 2, DESK)
  }
}

function spine(b: SpecBuilder) {
  const x = 0.44
  const bottom = 0.02
  const top = 0.58
  const span = top - bottom
  const zAt = (y: number) => 0.18 - 0.05 * Math.sin((Math.PI * (y - bottom)) / span)
  const rise = (y: number) => clamp01((y - bottom) / span)
  const links = 15
  for (let k = 0; k < links; k++) {
    const y = bottom + ((k + 0.5) / links) * span
    const z = zAt(y)
    const hoop = (hx: number) =>
      cut(cyl(hx, y, z, 0.015, 0.011, 'y'), cyl(hx, y, z, 0.0105, 0.02, 'y'))
    b.add(
      union(rbox(x, y, z, 0.009, 0.014, 0.009, 0.004), hoop(x - 0.022), hoop(x + 0.022)),
      60,
      (_x, py) => (Math.abs(py - y) > 0.008 ? 1.75 : 1.05),
      { rise: rise(y) },
    )
  }
  for (const side of [-1, 1]) {
    const path: Vec3[] = []
    for (let i = 0; i <= 16; i++) {
      const y = bottom + (i / 16) * span
      path.push([x + side * 0.022, y, zAt(y)])
    }
    b.add(tube(path, 0.0065), 120, 1.25, { rise: (_x, y) => rise(y) })
  }

  const base = rbox(x, 0.009, 0.18, 0.045, 0.009, 0.035, 0.004)
  b.add(base, 80, withEdges(base, 0.9, 1.7))
  b.add(
    tube(
      [
        [x, 0.006, 0.145],
        [x, 0.006, -0.075],
      ],
      0.0055,
    ),
    65,
    1.1,
  )
  const socket = rbox(x, 0.018, -0.1, 0.045, 0.018, 0.028, 0.006)
  b.add(socket, 80, withEdges(socket, 0.8, 1.7))
  b.add(cyl(x + 0.03, 0.037, -0.1, 0.004, 0.002, 'y'), 12, 2.4, { glow: 1 })
}

function screens(b: SpecBuilder) {
  const center = monitor(b, [0, SCREEN_Y, SCREEN_Z], 0.305, 0.178, 0, editor, 6000, [
    0.27 + (INDENT[EDITOR_CURSOR] ?? 0) * 0.035,
    0.93 - (EDITOR_CURSOR + 0.26) / EDITOR_ROWS,
  ])
  const angle = 0.52
  const sideHw = 0.27
  const side = (s: -1 | 1, screen: Screen, cursor?: [number, number]) =>
    monitor(
      b,
      [s * (0.317 + sideHw * Math.cos(angle)), SCREEN_Y, SCREEN_Z + sideHw * Math.sin(angle)],
      sideHw,
      0.158,
      -s * angle,
      screen,
      4800,
      cursor,
    )
  const left = side(-1, terminal, [0.07, 0.9 - (TERMINAL_CURSOR + 0.27) / TERMINAL_ROWS])
  const right = side(1, browser)

  b.add(
    union(
      rbox(0, TOP + 0.006, POLE_Z, 0.05, 0.006, 0.055, 0.004),
      rbox(0, TOP - 0.03, -0.012, 0.035, 0.05, 0.008, 0.004),
      rbox(0, 0.692, 0.045, 0.035, 0.006, 0.045, 0.003),
    ),
    165,
    1.3,
    DESK,
  )
  b.add(cyl(0, 0.66, 0.05, 0.007, 0.03, 'y'), 22, 1.6, DESK)
  b.add(cyl(0, 0.628, 0.05, 0.018, 0.006, 'y'), 30, 1.8, DESK)
  b.add(
    cyl(0, TOP + 0.03, POLE_Z, 0.03, 0.024, 'y'),
    80,
    band('y', TOP + 0.05, 0.004, 1.9, 1.1),
    DESK,
  )
  b.add(
    cyl(0, TOP + 0.21, POLE_Z, 0.018, 0.21, 'y'),
    385,
    (_x, y) => (fract(y * 12) < 0.04 ? 1.5 : 1.15),
    DESK,
  )
  b.add(cyl(0, TOP + 0.425, POLE_Z, 0.022, 0.008, 'y'), 35, 1.8, DESK)

  const bar = 0.955
  const crossbar = rbox(0, bar, 0.09, 0.3, 0.014, 0.016, 0.008)
  b.add(crossbar, 275, withEdges(crossbar, 0.95, 1.7), DESK)
  b.add(cyl(0, bar, POLE_Z, 0.028, 0.024, 'y'), 80, band('y', bar, 0.004, 1.9, 1.1), DESK)
  b.add(cyl(0, center[1], POLE_Z, 0.026, 0.02, 'y'), 65, 1.3, DESK)
  b.add(
    tube([[0, center[1], POLE_Z + 0.015], center], 0.014),
    165,
    (_x, y) => (y > center[1] + 0.008 ? 1.6 : 1.1),
    DESK,
  )

  const cables: Vec3[][] = [
    [
      [0.013, center[1] - 0.013, center[2] + 0.01],
      [0.013, center[1] - 0.016, 0.1],
      [0, center[1] - 0.019, 0.047],
    ],
  ]
  for (const [s, joint] of [
    [-1, left],
    [1, right],
  ] as const) {
    const elbow: Vec3 = [s * 0.3, bar, 0.09]
    const foot: Vec3 = [joint[0], bar, joint[2]]
    b.add(cyl(elbow[0], bar, elbow[2], 0.02, 0.022, 'y'), 50, band('y', bar, 0.004, 1.9, 1.2), DESK)
    b.add(tube([elbow, foot], 0.013), 195, (_x, y) => (y > bar + 0.007 ? 1.6 : 1.1), DESK)
    b.add(cyl(foot[0], bar, foot[2], 0.018, 0.02, 'y'), 45, 1.5, DESK)
    b.add(tube([foot, joint], 0.011), 55, 1.3, DESK)
    cables.push([
      [joint[0], joint[1] - 0.02, joint[2] - 0.022],
      [joint[0], bar - 0.02, joint[2] - 0.022],
      [elbow[0], bar - 0.02, elbow[2]],
      [s * 0.012, bar - 0.02, 0.047],
    ])
  }
  for (const path of cables) b.add(tube(path, 0.0045), 80, 1.15, DESK)
  for (const x of [-0.009, 0, 0.009]) {
    b.add(
      tube(
        [
          [x, 0.975, 0.047],
          [x, 0.79, 0.047],
        ],
        0.0045,
      ),
      100,
      1.15,
      DESK,
    )
  }
  for (const y of [0.81, 0.855, 0.9]) b.add(cyl(0, y, 0.062, 0.03, 0.005, 'y'), 22, 2, DESK)
  b.add(
    tube(
      bezier(
        [0, 0.79, 0.047],
        [0.03, 0.765, 0.036],
        [0.07, 0.748, 0.035],
        [0.085, TOP + 0.004, 0.035],
      ),
      0.009,
    ),
    110,
    1.15,
    DESK,
  )
  b.add(
    tube(
      bezier(
        [0.085, TOP - 0.028, 0.035],
        [0.085, 0.688, 0.06],
        [0.085, 0.69, 0.14],
        [0.085, 0.64, 0.15],
      ),
      0.009,
    ),
    110,
    1.15,
    DESK,
  )

  const camY = SCREEN_Y + 0.178 + 0.021
  const cam = rbox(0, camY, SCREEN_Z - 0.005, 0.048, 0.017, 0.017, 0.016)
  b.add(
    cam,
    250,
    (x, y, z) => {
      if (
        z > SCREEN_Z + 0.008 &&
        Math.abs(Math.abs(x) - 0.036) < 0.003 &&
        Math.abs(y - camY) < 0.004
      )
        return 1.9
      return cam.edge(x, y, z) ? 1.7 : 1.0
    },
    DESK,
  )
  b.add(
    cyl(0, camY, SCREEN_Z + 0.013, 0.012, 0.002, 'z'),
    60,
    (x, y) => {
      const r = Math.hypot(x, y - camY)
      return r < 0.005 ? 0.45 : r < 0.008 ? 2.4 : 1.4
    },
    DESK,
  )
  b.add(cyl(0.024, camY, SCREEN_Z + 0.013, 0.0035, 0.0015, 'z'), 12, 2.6, { glow: 2, move: 2 })
  b.add(rbox(0, SCREEN_Y + 0.1805, SCREEN_Z - 0.012, 0.03, 0.0025, 0.014, 0.002), 35, 1.3, DESK)
  b.add(rbox(0, SCREEN_Y + 0.155, SCREEN_Z - 0.026, 0.026, 0.024, 0.0025, 0.002), 50, 1.1, DESK)
  b.add(cyl(0, SCREEN_Y + 0.18, SCREEN_Z - 0.024, 0.004, 0.026, 'x'), 22, 1.7, DESK)
  b.add(
    tube(
      bezier(
        [0.02, SCREEN_Y + 0.135, SCREEN_Z - 0.028],
        [0.03, SCREEN_Y + 0.1, SCREEN_Z - 0.038],
        [0.03, SCREEN_Y + 0.05, SCREEN_Z - 0.056],
        [0.012, center[1] - 0.004, center[2] + 0.018],
      ),
      0.004,
    ),
    65,
    1.15,
    DESK,
  )
}

function microphone(b: SpecBuilder) {
  const base: Vec3 = [-0.865, TOP, 0.62]
  b.add(
    union(
      rbox(base[0], TOP + 0.007, base[2], 0.04, 0.007, 0.045, 0.004),
      rbox(-0.912, TOP - 0.03, base[2], 0.007, 0.045, 0.04, 0.004),
      rbox(-0.87, 0.69, base[2], 0.04, 0.006, 0.04, 0.003),
    ),
    220,
    1.3,
    DESK,
  )
  b.add(cyl(-0.86, 0.665, base[2], 0.006, 0.022, 'y'), 16, 1.6, DESK)
  b.add(cyl(-0.86, 0.64, base[2], 0.018, 0.006, 'y'), 22, 1.8, DESK)
  b.add(
    cyl(base[0], TOP + 0.03, base[2], 0.02, 0.016, 'y'),
    65,
    band('y', TOP + 0.03, 0.004, 1.9, 1.1),
    DESK,
  )

  const capsule: Vec3 = [-0.36, 1.065, 0.8]
  const mouth: Vec3 = [0, 1.2, 1.05]
  const d = unit(minus(mouth, capsule))
  const s = unit([-d[2], 0, d[0]])
  const hang: Vec3 = plus(capsule, [-0.04, 0.075, -0.04])
  const start: Vec3 = [base[0], TOP + 0.06, base[2]]
  const heading = unit([hang[0] - start[0], 0, hang[2] - start[2]])
  const elbow: Vec3 = [start[0] + heading[0] * 0.07, 1.34, start[2] + heading[2] * 0.07]
  const side: Vec3 = [-heading[2], 0, heading[0]]

  const knuckle = (p: Vec3) =>
    b.add(tube([plus(p, times(side, -0.022)), plus(p, times(side, 0.022))], 0.017), 35, 1.6, DESK)
  for (const [from, to] of [
    [start, elbow],
    [elbow, hang],
  ] as const) {
    const along = unit(minus(to, from))
    const across = unit(cross(side, along))
    for (const k of [-1, 1]) {
      const offset = times(across, k * 0.011)
      b.add(tube([plus(from, offset), plus(to, offset)], 0.0075), 110, 1.3, DESK)
    }
    const spring = times(side, 0.014)
    b.add(
      tube([plus(from, spring), plus(to, spring)], 0.005),
      65,
      (x, y, z) => (fract(dot(minus([x, y, z], from), along) * 140) < 0.5 ? 1.8 : 0.8),
      DESK,
    )
    for (const t of [0.33, 0.66]) {
      const p = plus(from, times(minus(to, from), t))
      b.add(tube([plus(p, times(along, -0.007)), plus(p, times(along, 0.007))], 0.022), 22, 2, DESK)
    }
  }
  knuckle(start)
  knuckle(elbow)
  knuckle(hang)

  const top = plus(capsule, [0, 0.05, 0])
  b.add(
    tube(
      [
        plus(capsule, times(s, 0.036)),
        plus(top, times(s, 0.036)),
        plus(top, times(s, -0.036)),
        plus(capsule, times(s, -0.036)),
      ],
      0.006,
    ),
    80,
    1.4,
    DESK,
  )
  b.add(tube([top, hang], 0.008), 35, 1.3, DESK)
  for (const k of [-1, 1]) {
    b.add(
      tube([plus(capsule, times(s, k * 0.03)), plus(capsule, times(s, k * 0.046))], 0.011),
      16,
      1.8,
      DESK,
    )
  }
  const back = plus(capsule, times(d, -0.07))
  b.add(
    tube([back, plus(capsule, times(d, 0.03))], 0.027),
    300,
    (x, y, z) => (dot(minus([x, y, z], back), d) < 0.012 ? 1.7 : 1.05),
    DESK,
  )
  b.add(tube([plus(capsule, times(d, 0.028)), plus(capsule, times(d, 0.033))], 0.03), 45, 2.3, {
    glow: 2,
    move: 2,
  })
  b.add(
    tube([plus(capsule, times(d, 0.042)), plus(capsule, times(d, 0.075))], 0.033),
    250,
    (x, y, z) => (Math.sin(x * 420) * Math.sin(y * 420) * Math.sin(z * 420) > 0 ? 1.45 : 0.8),
    DESK,
  )

  const lane = times(side, -0.016)
  b.add(
    tube(
      [
        plus(back, times(d, -0.008)),
        plus(back, [-0.01, 0.045, 0]),
        plus(hang, plus(lane, [0, 0.012, 0])),
        plus(elbow, lane),
        plus(start, lane),
        [-0.88, TOP + 0.015, 0.565],
        [-0.925, TOP + 0.015, 0.565],
        [-0.925, 0.672, 0.565],
        [-0.86, 0.664, 0.565],
        [-0.77, 0.664, 0.565],
        [-0.77, 0.664, 0.2],
        [-0.6, 0.664, 0.2],
        [-0.51, 0.69, 0.2],
        [-0.48, 0.65, 0.2],
        [-0.46, 0.62, 0.2],
      ],
      0.005,
    ),
    250,
    1.15,
    DESK,
  )
  for (const [x, z] of [
    [-0.77, 0.45],
    [-0.77, 0.3],
    [-0.66, 0.2],
  ] as const) {
    b.add(rbox(x, 0.684, z, 0.008, 0.018, 0.008, 0.003), 16, 1.8, DESK)
  }
}

function chair(b: SpecBuilder) {
  const cz = CHAIR_Z
  b.add(cyl(0, 0.1, cz, 0.042, 0.035, 'y'), 120, band('y', 0.128, 0.006, 1.8, 1.1))
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + 0.3
    const dx = Math.sin(a)
    const dz = Math.cos(a)
    const tip: Vec3 = [dx * 0.3, 0.078, cz + dz * 0.3]
    b.add(tube([[dx * 0.03, 0.098, cz + dz * 0.03], tip], 0.019), 145, (x, _y, z) =>
      Math.hypot(x, z - cz) > 0.285 ? 1.8 : 1.2,
    )
    b.add(cyl(tip[0], 0.058, tip[2], 0.008, 0.012, 'y'), 16, 1.5)
    const wheel: Vec3 = [tip[0] + dx * 0.022, 0.031, tip[2] + dz * 0.022]
    b.add(
      turned(cyl(wheel[0], wheel[1], wheel[2], 0.03, 0.017, 'x'), 'y', a, wheel),
      105,
      (x, y, z) => {
        const along = (x - wheel[0]) * dz - (z - wheel[2]) * dx
        const radial = Math.hypot(y - wheel[1], (x - wheel[0]) * dx + (z - wheel[2]) * dz)
        if (Math.abs(along) < 0.003) return 0.45
        return radial > 0.025 ? 1.35 : 0.9
      },
    )
  }

  b.add(cyl(0, 0.2, cz, 0.032, 0.065, 'y'), 195, (_x, y) => (fract(y * 80) < 0.5 ? 1.15 : 0.7))
  b.add(cyl(0, 0.34, cz, 0.015, 0.09, 'y'), 110, band('y', 0.42, 0.004, 2.4, 1.9))
  const mechanism = rbox(0, 0.44, cz + 0.02, 0.11, 0.018, 0.13, 0.01)
  b.add(mechanism, 220, withEdges(mechanism, 0.7, 1.7))
  b.add(
    tube(
      [
        [0.1, 0.437, cz - 0.05],
        [0.22, 0.43, cz - 0.08],
      ],
      0.006,
    ),
    30,
    1.3,
  )
  b.add(
    tube(
      [
        [0.22, 0.43, cz - 0.08],
        [0.25, 0.43, cz - 0.085],
      ],
      0.011,
    ),
    16,
    1.8,
  )

  const seat = rbox(0, 0.49, cz, 0.24, 0.035, 0.25, 0.03)
  b.add(seat, 1430, (x, y, z) => {
    if (seat.edge(x, y, z)) return 1.8
    if (y < 0.5) return 0.6
    if (Math.abs(x) < 0.15) return fract((z - cz) * 13) < 0.08 ? 1.55 : 1.0
    return 0.85
  })
  for (const s of [-1, 1]) {
    const bolster = rbox(s * 0.195, 0.545, cz + 0.01, 0.05, 0.035, 0.235, 0.035)
    b.add(bolster, 360, (x, y) => {
      if (Math.abs(x - s * 0.15) < 0.012) return 1.9
      return y > 0.57 ? 1.15 : 0.9
    })
  }

  const recline = frame('x', 0.13, [0, 0.53, cz + 0.23])
  const bz = cz + 0.27
  const shell = cut(
    union(
      rbox(0, 0.9, bz, 0.23, 0.33, 0.05, 0.045),
      rbox(0, 1.1, bz - 0.012, 0.27, 0.1, 0.055, 0.055),
      rbox(0, 1.3, bz, 0.155, 0.1, 0.045, 0.06),
      rbox(-0.205, 0.78, bz - 0.04, 0.05, 0.2, 0.05, 0.045),
      rbox(0.205, 0.78, bz - 0.04, 0.05, 0.2, 0.05, 0.045),
    ),
    rbox(-0.075, 1.255, bz, 0.03, 0.018, 0.2, 0.014),
    rbox(0.075, 1.255, bz, 0.03, 0.018, 0.2, 0.014),
  )
  b.add(
    recline.shape(shell),
    4125,
    recline.field((x, y, z) => {
      const lx = Math.abs(x)
      if (z > bz + 0.035) return y > 1.2 ? 0.95 : 0.78
      if (z > bz - 0.035) return 1.4
      if (lx > 0.132 && lx < 0.16 && y < 1.21) return 1.95
      if (lx < 0.132) return fract(y * 11) < 0.07 ? 1.5 : 1.02
      return 0.85
    }),
  )
  b.add(
    recline.shape(rbox(0, 1.29, bz - 0.08, 0.11, 0.045, 0.035, 0.035)),
    250,
    recline.field((x, y) => (Math.abs(x) < 0.05 && Math.abs(y - 1.29) < 0.006 ? 2 : 1.15)),
  )
  b.add(
    recline.shape(rbox(0, 0.76, bz - 0.09, 0.15, 0.07, 0.04, 0.04)),
    275,
    recline.field((x, y) => (Math.abs(y - 0.76) > 0.055 || Math.abs(x) > 0.135 ? 1.5 : 1.05)),
  )

  for (const s of [-1, 1]) {
    const x = s * 0.275
    b.add(rbox(s * 0.19, 0.46, cz + 0.06, 0.1, 0.01, 0.03, 0.005), 65, 0.9)
    b.add(rbox(x, 0.53, cz + 0.06, 0.021, 0.06, 0.032, 0.008), 80, 0.8)
    b.add(rbox(x, 0.585, cz + 0.06, 0.017, 0.12, 0.028, 0.008), 100, 1.3)
    const rest = rbox(x, 0.715, cz + 0.02, 0.04, 0.013, 0.13, 0.013)
    b.add(rest, 250, (px, py, pz) => (rest.edge(px, py, pz) ? 1.8 : py > 0.722 ? 1.25 : 0.9))
  }

  const [lx, ly, lz] = recline.point(0, 1.1, bz + 0.056)
  b.label('LF', lx, ly, 0.11, lz, 330)
}

export function setup(): AgvSpec {
  const b = new SpecBuilder()
  desk(b)
  frameAndLegs(b)
  tray(b)
  spine(b)
  screens(b)
  microphone(b)
  chair(b)
  return showcaseSpec(b, { lift: LIFT, fit: 1.25 })
}
