import {
  SpecBuilder,
  bezier,
  cone,
  cyl,
  rbox,
  showcaseSpec,
  tube,
  turned,
  withEdges,
  type AgvSpec,
  type Vec3,
} from '../geometry'

const fract = (v: number) => ((v % 1) + 1) % 1

const WING_X = -0.95
const WING_HX = 1.15
const WING_Z = 0.38
const DRUM: Vec3 = [0.72, 0, 0.12]
const DRUM_R = 0.55

function windows(x: number, pane: number) {
  const mullion = fract(x / pane) < 0.1
  return mullion ? 1.8 : 0.55
}

function pine(b: SpecBuilder, x: number, z: number, height: number) {
  b.add(cyl(x, height * 0.3, z, 0.025, height * 0.3, 'y'), 160, 0.8)
  const tiers = 3
  for (let k = 0; k < tiers; k++) {
    const y = height * (0.42 + k * 0.2)
    const r = 0.22 * (1 - k * 0.22)
    b.add(cone(x, y, z, r, 0.02, height * 0.14, 'y'), 420, (px, py, pz) =>
      fract(Math.atan2(pz - z, px - x) * 2.5 + py * 6) < 0.25 ? 1.2 : 0.65,
    )
  }
}

export function eei(): AgvSpec {
  const b = new SpecBuilder()
  const [dx, , dz] = DRUM

  const wing = rbox(WING_X, 0.42, 0, WING_HX, 0.42, WING_Z, 0.01)
  b.add(wing, 10000, (x, y, z) => {
    if (z < WING_Z - 0.01) return y > 0.83 ? 0.9 : 0.6
    if (y > 0.07 && y < 0.31) return windows(x, 0.105)
    if (Math.abs(y - 0.35) < 0.012) return 1.5
    const groups = [
      [-2.02, -1.72],
      [-1.4, -1.02],
      [-0.9, -0.55],
    ]
    if (y > 0.47 && y < 0.66 && groups.some(([a = 0, c = 0]) => x > a && x < c)) {
      return y < 0.48 || y > 0.65 ? 1.8 : windows(x, 0.09)
    }
    return fract(x * 28) < 0.5 !== fract(y * 28) < 0.5 ? 1.05 : 0.8
  })
  const cornice = rbox(WING_X, 0.865, 0.03, WING_HX + 0.03, 0.03, WING_Z + 0.05, 0.008)
  b.add(cornice, 1800, withEdges(cornice, 1.2, 1.7))
  b.add(rbox(WING_X, 0.345, WING_Z + 0.02, WING_HX, 0.012, 0.025, 0.004), 600, 1.5)
  const roof = turned(rbox(WING_X, 0.94, -0.02, WING_HX, 0.008, WING_Z, 0.004), 'x', 0.12, [
    WING_X,
    0.9,
    0,
  ])
  b.add(roof, 1600, 0.75)

  for (const [x, z, flip] of [
    [0.05, -0.28, 1],
    [1.3, -0.1, -1],
  ] as const) {
    const blade = turned(rbox(x, 1.06, z, 0.2, 0.2, 0.012, 0.004), 'y', 0.5 * flip, [x, 1.06, z])
    b.add(turned(blade, 'x', -0.35, [x, 0.86, z]), 900, (px, py) =>
      fract(py * 12) < 0.2 ? 1.6 : 0.9,
    )
  }

  b.add(cyl(dx, 0.61, dz, DRUM_R, 0.22, 'y'), 6500, (x, y, z) => {
    if (y > 0.815) return Math.hypot(x - dx, z - dz) > DRUM_R - 0.03 ? 2.1 : 0.7
    if (y < 0.4) return 1.3
    if (Math.abs(y - 0.72) < 0.03 && x > dx + 0.05 && x < dx + 0.42 && z > dz) {
      return fract(x * 40) < 0.5 ? 1.5 : 0.8
    }
    return 1
  })
  const banner = rbox(dx - 0.26, 0.6, dz + 0.5, 0.11, 0.17, 0.006, 0.004)
  b.add(banner, 600, withEdges(banner, 1.2, 1.8))
  b.label('EEI', dx - 0.26, 0.66, 0.08, dz + 0.508, 500)
  b.label('UVIGO', dx + 0.12, 0.62, 0.05, dz + 0.55, 400)

  b.add(cyl(dx, 0.19, dz - 0.04, 0.38, 0.19, 'y'), 2400, (x, y, z) => {
    if (y > 0.36) return 0.9
    const a = Math.atan2(z - dz, x - dx)
    return fract(a * 4) < 0.08 ? 1.8 : z > dz ? 0.55 : 0.4
  })
  for (const a of [-1.15, -0.4, 0.4, 1.15]) {
    const x = dx + Math.sin(a) * (DRUM_R - 0.06)
    const z = dz + Math.cos(a) * (DRUM_R - 0.06)
    b.add(cyl(x, 0.19, z, 0.03, 0.19, 'y'), 260, 1.5)
  }
  b.add(cyl(dx - 0.18, 0.19, dz + 0.3, 0.06, 0.18, 'y'), 300, 1.8)

  const east = rbox(1.72, 0.36, -0.12, 0.42, 0.36, 0.3, 0.01)
  b.add(east, 3000, (x, y, z) => {
    if (east.edge(x, y, z)) return 1.6
    if (z > 0.17 && y > 0.08 && y < 0.3) return windows(x, 0.12)
    if (z > 0.17 && y > 0.44 && y < 0.62) return windows(x, 0.1)
    return 0.85
  })

  const totem = rbox(-1.62, 0.62, 1.05, 0.1, 0.62, 0.03, 0.01)
  b.add(totem, 1800, (x, y, z) => {
    if (totem.edge(x, y, z)) return 2.1
    if (y > 0.1 && y < 0.36 && Math.abs(x + 1.62) < 0.075) return 0.5
    if (Math.abs(x + 1.64) < 0.03 && y > 0.5 && y < 1.15) return fract(y * 22) < 0.6 ? 2 : 0.8
    return 1.3
  })

  b.add(rbox(-0.95, 0.07, WING_Z + 0.2, 0.95, 0.07, 0.05, 0.03), 1400, (x, y) =>
    fract(x * 9 + y * 3) < 0.4 ? 0.9 : 0.55,
  )
  b.add(rbox(-0.1, 0.004, 0.55, 2.2, 0.004, 0.85, 0.004), 3000, (x, _y, z) =>
    fract(x * 3 + z * 7) < 0.1 ? 0.7 : 0.35,
  )
  b.add(rbox(0.9, 0.006, WING_Z + 0.27, 1.25, 0.006, 0.08, 0.004), 700, 0.9)

  const trunk: Vec3 = [1.55, 0, 0.9]
  b.add(tube([trunk, [1.55, 0.55, 0.9]], 0.02), 200, 1.1)
  for (const [tx, ty, tz] of [
    [1.35, 1.05, 0.85],
    [1.72, 1.1, 0.95],
    [1.5, 1.2, 1.0],
    [1.66, 0.95, 0.78],
  ] as const) {
    b.add(
      tube(
        bezier([1.55, 0.45, 0.9], [1.55, 0.7, 0.9], [(tx + 1.55) / 2, 0.85, tz], [tx, ty, tz]),
        0.008,
      ),
      160,
      1.2,
    )
  }

  for (const [x, z, h] of [
    [-2.0, -0.75, 1.55],
    [-1.3, -0.85, 1.8],
    [-0.55, -0.7, 1.45],
    [0.3, -0.85, 1.7],
    [1.1, -0.7, 1.5],
    [1.9, -0.75, 1.35],
  ] as const) {
    pine(b, x, z, h)
  }

  return showcaseSpec(b, { fit: 1.9 })
}
