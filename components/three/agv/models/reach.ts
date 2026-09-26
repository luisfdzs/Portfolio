import {
  SpecBuilder,
  band,
  bezier,
  cyl,
  rbox,
  tube,
  withEdges,
  showcaseSpec,
  type AgvSpec,
} from '../geometry'

export function reach(): AgvSpec {
  const b = new SpecBuilder()
  const W = 0.55

  const body = rbox(-0.55, 0.6, 0, 0.5, 0.55, W, 0.07)
  b.add(body, 11000, (x, y, z) => {
    if (body.edge(x, y, z)) return 1.6
    const side = Math.abs(z) > W - 0.01
    if (side && x > -0.36 && x < -0.12 && y > 0.2 && y < 0.95) {
      const rim = x < -0.35 || x > -0.13 || y < 0.21 || y > 0.94
      return rim ? 1.45 : 0.42
    }
    if (Math.abs(x + 0.05) < 0.01 && y > 0.2 && y < 0.95 && Math.abs(z) < 0.4) return 0.45
    return side ? 0.85 : 1
  })
  b.add(rbox(-0.55, 0.06, 0, 0.49, 0.05, W - 0.01, 0.04), 2000, 0.42)
  const cover = rbox(-0.55, 1.165, 0, 0.46, 0.018, W - 0.04, 0.02)
  b.add(cover, 2400, (x, y, z) => {
    if (y > 1.17 && x > -0.3 && x < -0.12 && z > 0.18 && z < 0.4) return 2
    return withEdges(cover, 0.55, 1.9)(x, y, z)
  })
  for (const z of [-W - 0.002, W + 0.002]) {
    b.add(rbox(-0.55, 1.08, z, 0.44, 0.006, 0.003, 0.003), 360, 1.9, { glow: 2 })
    b.add(cyl(-0.9, 0.9, z + Math.sign(z) * 0.012, 0.028, 0.012, 'z'), 110, 2.1)
  }
  for (const z of [-0.47, 0.47]) {
    b.add(cyl(-1.02, 0.17, z, 0.055, 0.045, 'y'), 420, band('y', 0.172, 0.014, 2.3, 0.85))
  }

  for (const z of [-0.46, 0.46]) {
    const leg = rbox(0.47, 0.1, z, 0.53, 0.09, 0.07, 0.015)
    b.add(leg, 1600, withEdges(leg, 0.7, 1.8))
    b.add(cyl(0.98, 0.21, z, 0.045, 0.03, 'y'), 260, band('y', 0.212, 0.01, 2.3, 0.9))
    b.add(cyl(0.88, 0.075, z + Math.sign(z) * 0.075, 0.07, 0.012, 'z'), 180, 1.2)
  }

  for (const z of [-0.38, 0.38]) {
    const outer = rbox(0.08, 1.5, z, 0.06, 1.42, 0.04, 0.006)
    b.add(outer, 2600, withEdges(outer, 0.75, 1.8))
    const middle = rbox(0.12, 1.52, z * 0.84, 0.05, 1.38, 0.035, 0.006)
    b.add(middle, 2200, withEdges(middle, 0.85, 1.7), { move: 3 })
    const inner = rbox(0.155, 1.3, z * 0.71, 0.04, 1.2, 0.03, 0.006)
    b.add(inner, 1800, withEdges(inner, 0.95, 1.6), { move: 2 })
  }
  for (const y of [2.9, 1.7, 0.6]) b.add(rbox(0.08, y, 0, 0.045, 0.03, 0.38, 0.006), 360, 1.05)
  b.add(rbox(0.12, 2.87, 0, 0.035, 0.025, 0.32, 0.006), 300, 1.15, { move: 3 })
  for (const z of [-0.18, 0.18]) {
    b.add(cyl(0.1, 1.2, z, 0.035, 1.1, 'y'), 700, 0.85)
    b.add(cyl(0.1, 2.5, z, 0.02, 0.2, 'y'), 180, 1.3, { move: 3 })
  }
  b.add(
    tube(
      bezier([-0.12, 1.17, -0.32], [0.0, 1.9, -0.36], [0.04, 2.6, -0.3], [0.06, 2.94, -0.2]),
      0.016,
    ),
    700,
    1.3,
  )
  b.add(
    tube(
      bezier([-0.12, 1.17, -0.26], [0.02, 1.9, -0.3], [0.06, 2.6, -0.24], [0.08, 2.94, -0.14]),
      0.012,
    ),
    520,
    1.1,
  )

  const arm = rbox(0.42, 2.99, 0, 0.36, 0.035, 0.07, 0.02)
  b.add(arm, 1300, withEdges(arm, 1.3, 1.4))
  b.add(rbox(0.8, 2.95, 0, 0.05, 0.06, 0.1, 0.012), 420, 1)
  for (const z of [-0.045, 0.045]) b.add(cyl(0.855, 2.94, z, 0.022, 0.008, 'x'), 80, 2.3)
  b.add(cyl(0.08, 3.08, 0, 0.065, 0.06, 'y'), 600, band('y', 3.085, 0.016, 2.3, 0.9))
  b.add(cyl(0.08, 3.15, 0, 0.07, 0.008, 'y'), 120, 1.3)
  b.add(cyl(0.08, 3.19, 0, 0.026, 0.028, 'y'), 120, 2, { glow: 1 })

  const plate = rbox(0.22, 0.26, 0, 0.025, 0.15, 0.37, 0.008)
  b.add(plate, 950, withEdges(plate, 1, 1.6), { move: 2 })
  for (const z of [-0.34, -0.2, -0.07, 0.07, 0.2, 0.34]) {
    b.add(rbox(0.24, 0.72, z, 0.012, 0.32, 0.012, 0.004), 210, 1.1, { move: 2 })
  }
  for (const y of [0.72, 1.04])
    b.add(rbox(0.24, y, 0, 0.014, 0.014, 0.36, 0.004), 240, 1.2, { move: 2 })
  for (const z of [-0.22, 0.22]) {
    const shank = rbox(0.265, 0.23, z, 0.02, 0.19, 0.05, 0.006)
    b.add(shank, 300, withEdges(shank, 1.1, 1.5), { move: 2 })
    const blade = rbox(0.86, 0.06, z, 0.6, 0.025, 0.05, 0.008)
    b.add(blade, 900, withEdges(blade, 1.05, 1.5), { move: 2 })
  }

  b.label('»', -0.72, 0.55, 0.24, W + 0.004, 900)
  b.label('»', -0.38, 0.55, 0.24, -W - 0.004, 900)
  b.label('ASTI', -0.72, 0.85, 0.08, W + 0.004, 600)
  b.label('ASTI', -0.38, 0.85, 0.08, -W - 0.004, 600)

  return showcaseSpec(b, { lift: 1.3 })
}
