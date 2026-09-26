import {
  SpecBuilder,
  bezier,
  cut,
  cyl,
  rbox,
  showcaseSpec,
  tube,
  withEdges,
  type AgvSpec,
} from '../geometry'

const fract = (v: number) => ((v % 1) + 1) % 1
const hash = (v: number) => fract(Math.sin(v * 127.1) * 43758.5453)

export function laptop(): AgvSpec {
  const b = new SpecBuilder()
  const L = 0.42
  const W = 0.62
  const hinge = -L

  const base = rbox(0, 0.022, 0, L, 0.022, W, 0.015)
  b.add(base, 9000, (x, y, z) => {
    if (base.edge(x, y, z)) return 1.7
    if (y < 0.04) return 0.7
    if (x > -0.34 && x < 0.14 && Math.abs(z) < 0.5) {
      return fract(x * 14 + 0.5) < 0.2 || fract(z * 14) < 0.2 ? 0.45 : 1.45
    }
    if (x > 0.2 && x < 0.37 && Math.abs(z) < 0.17) {
      const rim = x < 0.207 || x > 0.363 || Math.abs(z) > 0.163
      return rim ? 1.8 : 1
    }
    return 0.9
  })
  b.add(cyl(hinge, 0.045, 0, 0.018, 0.5, 'z'), 500, 1.3)

  const lid = rbox(0, 0.057, 0, L, 0.011, W, 0.012)
  b.add(
    lid,
    10000,
    (x, y, z) => {
      if (lid.edge(x, y, z)) return 1.8
      if (y > 0.062) return Math.hypot(x, z) < 0.06 ? 2.2 : 0.85
      if (Math.abs(x) > L - 0.035 || Math.abs(z) > W - 0.04) return 0.5
      const row = Math.floor((x + L) * 20)
      const indent = Math.floor(hash(row + 3) * 4) * 0.06
      const length = 0.15 + hash(row) * 0.6
      const start = -W + 0.08 + indent
      if (fract((x + L) * 20) < 0.45 && z > start && z < start + length) {
        return hash(row + 7) > 0.7 ? 2.4 : 1.7
      }
      return 0.35
    },
    { move: 4 },
  )

  return showcaseSpec(b, { pivot: [hinge, 0.045, 0], turn: 1.88, hold: true })
}

export function server(): AgvSpec {
  const b = new SpecBuilder()
  const X = 0.36
  const Z = 0.42
  const U = 0.078

  for (const x of [-X, X]) {
    for (const z of [-Z, Z]) b.add(rbox(x, 0.98, z, 0.025, 0.98, 0.025, 0.006), 700, 1.5)
  }
  for (const y of [0.03, 1.94]) {
    const panel = rbox(0, y, 0, X, 0.025, Z, 0.008)
    b.add(panel, 1500, withEdges(panel, 0.7, 2))
  }
  for (const x of [-X, X]) {
    b.add(rbox(x, 0.98, 0, 0.006, 0.93, Z - 0.02, 0.004), 1800, (_x, y, z) =>
      Math.abs(z) < 0.3 && fract(y * 14) < 0.12 ? 1.1 : 0.45,
    )
  }

  const units = [1, 2, 1, 1, 4, 2, 1, 2, 1, 4, 1]
  let y = 0.1
  units.forEach((size, index) => {
    const h = size * U
    const cy = y + h / 2
    const box = rbox(0, cy, 0, X - 0.035, h / 2 - 0.006, Z - 0.03, 0.008)
    b.add(box, 500 + size * 450, (px, py, pz) => {
      if (box.edge(px, py, pz)) return 1.8
      if (pz < Z - 0.04) return 0.6
      if (size >= 2)
        return fract((px + X) * 11) < 0.12 ? 0.4 : fract((py - y) * 36) < 0.5 ? 1.25 : 0.9
      if (px < -0.05) return fract(px * 50) < 0.4 ? 1.3 : 0.6
      return 0.85
    })
    for (let led = 0; led < Math.min(size, 3); led++) {
      b.add(cyl(0.24 + led * 0.035, cy + h / 2 - 0.03, Z - 0.022, 0.009, 0.004, 'z'), 40, 2.5, {
        glow: hash(index * 5 + led) > 0.5 ? 1 : 2,
      })
    }
    y += h + 0.012
  })

  const top = y + 0.03
  const sw = rbox(0, top, 0, X - 0.035, 0.03, Z - 0.03, 0.006)
  b.add(sw, 900, (px, py, pz) =>
    sw.edge(px, py, pz) ? 1.7 : pz > Z - 0.04 && fract(px * 45) < 0.5 ? 1.6 : 0.7,
  )
  for (let k = 0; k < 6; k++) {
    const x = -0.26 + k * 0.1
    b.add(
      tube(
        bezier(
          [x, top, Z - 0.01],
          [x, top - 0.08, Z + 0.1],
          [0.3, top - 0.25, Z + 0.08],
          [0.33, top - 0.45, Z - 0.02],
        ),
        0.008,
      ),
      160,
      1.3,
    )
  }

  return showcaseSpec(b)
}

export function database(): AgvSpec {
  const b = new SpecBuilder()
  const R = 0.6
  const h = 0.16

  const tiers: { y: number; move: 1 | 2 | 3 }[] = [
    { y: 0.2, move: 1 },
    { y: 0.58, move: 3 },
    { y: 0.96, move: 2 },
  ]
  tiers.forEach(({ y, move }, index) => {
    b.add(
      cyl(0, y, 0, R, h, 'y'),
      6500,
      (x, py, z) => {
        if (Math.abs(Math.abs(py - y) - h) < 0.012) return 1.9
        if (py > y + h - 0.005) {
          const r = Math.hypot(x, z)
          return fract(r * 8) < 0.08 ? 1.3 : 0.7
        }
        const a = Math.atan2(z, x)
        return Math.abs(py - y) < 0.02 && fract(a * 3) < 0.5 ? 1.5 : 1
      },
      { move },
    )
    for (let k = 0; k < 3; k++) {
      const a = 0.25 + k * 0.18
      b.add(
        cyl(Math.sin(a) * (R + 0.005), y - 0.05, Math.cos(a) * (R + 0.005), 0.018, 0.006, 'y'),
        40,
        2.5,
        { glow: (index + k) % 2 === 0 ? 1 : 2, move },
      )
    }
  })
  b.add(cut(cyl(0, 0.39, 0, R - 0.06, 0.03, 'y'), cyl(0, 0.39, 0, R - 0.1, 0.1, 'y')), 600, 2, {
    glow: 2,
    move: 3,
  })
  b.add(cut(cyl(0, 0.77, 0, R - 0.06, 0.03, 'y'), cyl(0, 0.77, 0, R - 0.1, 0.1, 'y')), 600, 2, {
    glow: 2,
    move: 2,
  })

  b.label('SQL', 0, 0.2, 0.12, R + 0.01, 500)

  return showcaseSpec(b, { lift: 0.3 })
}
