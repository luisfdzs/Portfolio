import {
  SpecBuilder,
  band,
  bezier,
  clip,
  cone,
  cut,
  cyl,
  rbox,
  showcaseSpec,
  tube,
  turned,
  union,
  withEdges,
  type AgvSpec,
  type Vec3,
} from '../geometry'

const fract = (v: number) => ((v % 1) + 1) % 1

function helix(radius: number, from: number, to: number, z0: number, z1: number): Vec3[] {
  const points: Vec3[] = []
  for (let i = 0; i <= 32; i++) {
    const t = i / 32
    const a = from + (to - from) * t
    points.push([Math.cos(a) * radius, Math.sin(a) * radius, z0 + (z1 - z0) * t])
  }
  return points
}

export function turbofan(): AgvSpec {
  const b = new SpecBuilder()
  const R = 0.62

  const shell = cut(cyl(0, 0, 0, R, 0.8, 'z'), cyl(0, 0, 0, R - 0.05, 0.9, 'z'))
  const cowl = (x: number, y: number, z: number) => {
    if (z > 0.76) return 1.9
    if (Math.abs(z + 0.18) < 0.008 || Math.abs(y) < 0.008) return 1.6
    if (Math.hypot(x, y) < R - 0.02) return 0.6
    return fract(Math.atan2(y, x) * 3) < 0.03 ? 1.25 : 1
  }
  b.add(
    clip(shell, (_x, y) => y),
    7000,
    cowl,
  )
  b.add(
    clip(shell, (_x, y) => -y),
    7000,
    cowl,
    { move: 2 },
  )

  const spinner = cone(0, 0, 0.72, 0.17, 0.02, 0.12, 'z')
  b.add(
    spinner,
    900,
    (x, y, z) => (fract(Math.atan2(y, x) / (Math.PI * 2) + z * 3) < 0.18 ? 2.3 : 0.9),
    {
      move: 4,
    },
  )
  b.add(cyl(0, 0, 0.58, 0.17, 0.03, 'z'), 500, 1.2, { move: 4 })
  for (let k = 0; k < 18; k++) {
    const blade = turned(rbox(0, 0.37, 0.6, 0.06, 0.2, 0.007, 0.004), 'y', 0.65, [0, 0.37, 0.6])
    b.add(
      turned(blade, 'z', (k / 18) * Math.PI * 2, [0, 0, 0]),
      420,
      (x, y) => (Math.hypot(x, y) > 0.54 ? 2 : 1.25),
      { move: 4 },
    )
  }
  for (let k = 0; k < 14; k++) {
    b.add(
      turned(
        rbox(0, 0.45, 0.34, 0.008, 0.12, 0.045, 0.003),
        'z',
        (k / 14) * Math.PI * 2,
        [0, 0, 0],
      ),
      140,
      0.9,
    )
  }

  b.add(cyl(0, 0, -0.05, 0.32, 0.55, 'z'), 5200, (_x, _y, z) => (fract(z * 7) < 0.1 ? 1.7 : 0.85))
  b.add(cone(0, 0, -0.7, 0.22, 0.32, 0.1, 'z'), 900, 1)
  b.add(cone(0, 0, -0.93, 0.03, 0.19, 0.13, 'z'), 800, band('z', -0.86, 0.01, 2, 1))
  b.add(cut(cyl(0, 0, -0.81, 0.235, 0.012, 'z'), cyl(0, 0, -0.81, 0.19, 0.1, 'z')), 500, 2.3, {
    glow: 2,
  })

  b.add(tube(helix(0.34, 0.4, 2.6, 0.32, -0.45), 0.012), 700, 1.6)
  b.add(tube(helix(0.34, 3.3, 5.2, 0.28, -0.5), 0.01), 600, 1.4)
  const unit = rbox(0.22, -0.3, -0.08, 0.07, 0.045, 0.13, 0.01)
  b.add(unit, 380, withEdges(unit, 1.1, 1.6))
  b.add(cyl(0.24, -0.35, 0.02, 0.012, 0.004, 'y'), 40, 2.3, { glow: 1 })

  for (const z of [-0.45, 0.45]) {
    const ring = cut(cyl(0, 0, z, R + 0.07, 0.04, 'z'), cyl(0, 0, z, R + 0.005, 0.1, 'z'))
    b.add(
      clip(ring, (_x, y) => y + 0.28),
      700,
      1.3,
    )
    for (const x of [-0.36, 0.36]) {
      const leg = rbox(x, -0.74, z, 0.04, 0.14, 0.04, 0.008)
      b.add(leg, 260, withEdges(leg, 0.9, 1.5))
    }
  }
  for (const x of [-0.4, 0.4]) {
    const rail = rbox(x, -0.9, 0, 0.05, 0.03, 0.62, 0.008)
    b.add(rail, 700, withEdges(rail, 0.9, 1.6))
    for (const z of [-0.56, 0.56])
      b.add(cyl(x, -0.97, z, 0.04, 0.025, 'x'), 110, band('x', x, 0.008, 2, 0.7))
  }

  return showcaseSpec(b, { lift: 0.42, pivot: [0, 0, 0], turn: Math.PI * 4, spin: true })
}

export function windTurbine(): AgvSpec {
  const b = new SpecBuilder()
  const H = 2.32
  const Z = 0.27

  b.add(cone(0, 1.1, 0, 0.11, 0.065, 1.1, 'y'), 5000, (_x, y) => (fract(y / 0.55) < 0.02 ? 1.7 : 1))
  b.add(cyl(0, 0.03, 0, 0.3, 0.03, 'y'), 700, band('y', 0.06, 0.006, 1.6, 0.7))
  const nacelle = rbox(0, H, -0.08, 0.12, 0.11, 0.32, 0.045)
  b.add(nacelle, 2800, (x, y, z) => {
    if (nacelle.edge(x, y, z)) return 1.7
    return Math.abs(x) > 0.11 && fract(z * 20) < 0.12 && y < H + 0.04 ? 1.4 : 1
  })
  b.add(cyl(0, H + 0.14, -0.3, 0.012, 0.03, 'y'), 60, 1.2)
  b.add(cyl(0, H + 0.18, -0.3, 0.02, 0.012, 'y'), 60, 2.4, { glow: 1 })

  b.add(cone(0, H, Z + 0.05, 0.1, 0.025, 0.1, 'z'), 900, band('z', Z, 0.008, 1.8, 1), { move: 4 })
  const segments: [number, number, number][] = [
    [0.08, 0.26, 0.05],
    [0.26, 0.62, 0.078],
    [0.62, 1.02, 0.056],
    [1.02, 1.36, 0.034],
  ]
  for (let k = 0; k < 3; k++) {
    const blade = union(
      ...segments.map(([from, to, chord]) =>
        rbox(chord * 0.3, H + (from + to) / 2, Z, chord, (to - from) / 2 + 0.01, 0.014, 0.008),
      ),
    )
    b.add(
      turned(turned(blade, 'y', 0.22, [0, H, Z]), 'z', (k / 3) * Math.PI * 2, [0, H, Z]),
      1700,
      (x, y) => (Math.hypot(x, y - H) > 1.2 ? 1.5 : 0.85),
      { move: 4 },
    )
  }

  const cabinet = rbox(0.62, 0.23, 0.22, 0.22, 0.2, 0.13, 0.015)
  b.add(cabinet, 1800, (x, y, z) => {
    if (cabinet.edge(x, y, z)) return 1.7
    if (z > 0.34 && Math.abs(x - 0.62) < 0.006) return 1.5
    if (z > 0.34 && y < 0.14 && fract(y * 60) < 0.4) return 1.3
    return 0.9
  })
  for (const [x, glow] of [
    [0.5, 1],
    [0.56, 2],
    [0.74, 1],
  ] as const) {
    b.add(cyl(x, 0.34, 0.352, 0.012, 0.004, 'z'), 50, 2.4, { glow })
  }
  const transformer = rbox(0.62, 0.15, -0.28, 0.16, 0.14, 0.12, 0.012)
  b.add(transformer, 1100, (x, y, z) =>
    transformer.edge(x, y, z) ? 1.6 : fract(x * 30) < 0.25 ? 1.3 : 0.75,
  )
  for (const x of [0.54, 0.62, 0.7]) b.add(cyl(x, 0.33, -0.28, 0.014, 0.04, 'y'), 70, 1.8)
  b.add(
    tube(
      bezier([0.4, 0.05, 0.22], [0.25, 0.02, 0.2], [0.14, 0.02, 0.1], [0.09, 0.12, 0.03]),
      0.018,
    ),
    300,
    1.4,
  )
  b.add(rbox(0.3, 0.004, 0, 0.62, 0.004, 0.5, 0.004), 1400, (x, _y, z) =>
    fract(x * 5) < 0.04 || fract(z * 5) < 0.04 ? 0.9 : 0.4,
  )

  return showcaseSpec(b, { pivot: [0, H, Z], turn: Math.PI * 2, spin: true, fit: 1.2 })
}

export function converter(): AgvSpec {
  const b = new SpecBuilder()
  const W = 0.95
  const D = 0.32
  const top = 1.14

  const plinth = rbox(0, 0.05, 0, W, 0.05, D, 0.01)
  b.add(plinth, 1800, withEdges(plinth, 0.45, 2.4))

  const shell = rbox(0, 0.62, 0, W, 0.52, D, 0.02)
  b.add(
    shell,
    13000,
    (x, y, z) => {
      if (shell.edge(x, y, z)) return 1.8
      if (z > D - 0.01) {
        if (Math.abs(Math.abs(x) - 0.32) < 0.005) return 1.6
        if (y < 0.34 && y > 0.16 && fract(y * 45) < 0.4 && Math.abs(Math.abs(x) - 0.32) > 0.05)
          return 1.3
        if (Math.abs(x) < 0.16 && y > 0.78 && y < 0.98) {
          const rim = Math.abs(x) > 0.15 || y < 0.79 || y > 0.97
          return rim ? 1.9 : fract(y * 28) < 0.35 && x < 0.08 - fract(y * 3.7) * 0.2 ? 2.1 : 0.55
        }
        if (Math.abs(Math.abs(x) - 0.26) < 0.012 && y > 0.55 && y < 0.72) return 1.9
        return 0.95
      }
      return Math.abs(x) > W - 0.01 && fract(y * 12) < 0.06 ? 1.2 : 0.8
    },
    { move: 2 },
  )
  for (const [x, glow] of [
    [-0.66, 1],
    [-0.6, 2],
    [0.6, 1],
    [0.66, 2],
  ] as const) {
    b.add(cyl(x, 0.95, D + 0.006, 0.016, 0.005, 'z'), 60, 2.4, { glow, move: 2 })
  }
  b.add(rbox(0, 1.06, D + 0.003, 0.7, 0.006, 0.003, 0.002), 300, 2, { glow: 2, move: 2 })
  for (const x of [-0.5, 0.5]) {
    b.add(
      cyl(x, top + 0.02, 0, 0.19, 0.02, 'y'),
      700,
      (px, _y, pz) => {
        const r = Math.hypot(px - x, pz)
        return fract(r * 28) < 0.3 || r < 0.04 ? 1.7 : 0.6
      },
      { move: 2 },
    )
  }

  for (const x of [-0.62, 0, 0.62]) {
    const sink = rbox(x, 0.5, -0.06, 0.2, 0.34, 0.14, 0.006)
    b.add(sink, 1500, (px) => (fract(px * 32) < 0.3 ? 1.5 : 0.55), { reveal: true })
    for (const y of [0.3, 0.52, 0.74]) {
      const igbt = rbox(x, y, 0.1, 0.13, 0.07, 0.025, 0.006)
      b.add(igbt, 320, withEdges(igbt, 1.3, 1.6), { reveal: true })
      for (const dx of [-0.07, 0, 0.07])
        b.add(cyl(x + dx, y, 0.13, 0.012, 0.01, 'z'), 30, 2.3, { reveal: true })
    }
    for (const dx of [-0.12, 0, 0.12]) {
      b.add(cyl(x + dx, 0.95, -0.12, 0.045, 0.09, 'y'), 260, band('y', 1.04, 0.01, 2.2, 0.9), {
        reveal: true,
      })
    }
  }
  for (const [y, z] of [
    [0.92, 0.14],
    [0.98, 0.1],
    [1.04, 0.06],
  ] as const) {
    b.add(rbox(0, y, z, 0.86, 0.012, 0.02, 0.003), 520, 2.1, { reveal: true })
  }
  b.add(
    tube(bezier([-0.82, 0.12, 0.2], [-0.8, 0.6, 0.24], [-0.4, 0.9, 0.2], [-0.2, 0.93, 0.15]), 0.02),
    300,
    1.5,
    { reveal: true },
  )

  b.label('IGBT', 0, 0.44, 0.07, D + 0.004, 400, 2)

  return showcaseSpec(b, { lift: 0.78 })
}
