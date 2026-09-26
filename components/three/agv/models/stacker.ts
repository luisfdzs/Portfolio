import {
  SpecBuilder,
  band,
  cyl,
  rbox,
  tube,
  withEdges,
  showcaseSpec,
  type AgvSpec,
} from '../geometry'

export function stacker(): AgvSpec {
  const b = new SpecBuilder()

  const body = rbox(-0.5, 0.43, 0, 0.35, 0.37, 0.4, 0.1)
  b.add(body, 6200, (x, y, z) => {
    if (body.edge(x, y, z)) return 1.55
    if (Math.abs(z) > 0.39 && Math.abs(y - 0.62) < 0.005) return 1.4
    return Math.abs(z) > 0.39 ? 0.85 : 1
  })
  b.add(rbox(-0.5, 0.06, 0, 0.34, 0.05, 0.39, 0.04), 1400, 0.42)
  const hood = rbox(-0.52, 0.87, 0, 0.3, 0.08, 0.36, 0.05)
  b.add(hood, 2000, withEdges(hood, 0.55, 1.9))
  for (const z of [-0.402, 0.402]) {
    b.add(rbox(-0.52, 0.795, z, 0.26, 0.006, 0.003, 0.003), 260, 1.9, { glow: 2 })
    b.add(cyl(-0.28, 0.66, z + Math.sign(z) * 0.012, 0.026, 0.012, 'z'), 110, 2.1)
  }

  b.add(
    tube(
      [
        [-0.6, 0.95, 0],
        [-0.7, 1.2, 0],
      ],
      0.028,
    ),
    380,
    0.8,
  )
  const head = rbox(-0.72, 1.24, 0, 0.05, 0.035, 0.15, 0.015)
  b.add(head, 480, withEdges(head, 0.9, 1.6))
  b.add(cyl(-0.72, 1.285, 0, 0.02, 0.012, 'y'), 90, 2.2)
  for (const z of [-0.12, 0.12]) b.add(cyl(-0.72, 1.24, z, 0.03, 0.035, 'z'), 90, 1.2)

  b.add(cyl(-0.82, 0.17, 0.3, 0.055, 0.045, 'y'), 420, band('y', 0.172, 0.014, 2.3, 0.85))
  b.add(cyl(-0.82, 0.225, 0.3, 0.06, 0.007, 'y'), 90, 1.3)

  b.add(rbox(-0.08, 0.25, 0, 0.08, 0.2, 0.39, 0.02), 1300, 0.62)
  for (const z of [-0.34, 0.34]) {
    const outer = rbox(0, 1.04, z, 0.05, 0.96, 0.035, 0.006)
    b.add(outer, 1700, withEdges(outer, 0.8, 1.7))
    const inner = rbox(0.045, 1.06, z * 0.83, 0.035, 0.94, 0.025, 0.006)
    b.add(inner, 1400, withEdges(inner, 0.95, 1.6), { move: 3 })
  }
  b.add(rbox(0, 1.98, 0, 0.04, 0.03, 0.36, 0.006), 360, 1.1)
  b.add(rbox(0, 0.62, 0, 0.035, 0.025, 0.36, 0.006), 300, 0.9)
  b.add(rbox(0.045, 1.975, 0, 0.03, 0.022, 0.3, 0.006), 300, 1.2, { move: 3 })
  b.add(cyl(-0.03, 0.8, 0, 0.04, 0.7, 'y'), 650, 0.85)
  b.add(cyl(-0.03, 1.72, 0, 0.022, 0.24, 'y'), 260, 1.3, { move: 3 })
  for (const z of [-0.13, 0.13])
    b.add(rbox(0.085, 1.0, z, 0.008, 0.62, 0.012, 0.003), 240, 0.9, { move: 3 })

  const plate = rbox(0.12, 0.3, 0, 0.025, 0.14, 0.36, 0.008)
  b.add(plate, 900, withEdges(plate, 1, 1.6), { move: 2 })
  for (const z of [-0.33, -0.2, -0.07, 0.07, 0.2, 0.33]) {
    b.add(rbox(0.14, 0.745, z, 0.012, 0.305, 0.012, 0.004), 200, 1.1, { move: 2 })
  }
  for (const y of [0.75, 1.05])
    b.add(rbox(0.14, y, 0, 0.014, 0.014, 0.35, 0.004), 240, 1.2, { move: 2 })
  for (const z of [-0.2, 0.2]) {
    const shank = rbox(0.165, 0.32, z, 0.02, 0.2, 0.05, 0.006)
    b.add(shank, 300, withEdges(shank, 1.1, 1.5), { move: 2 })
    const blade = rbox(0.74, 0.14, z, 0.575, 0.025, 0.05, 0.008)
    b.add(blade, 900, withEdges(blade, 1.05, 1.5), { move: 2 })
  }

  const cabinet = rbox(-0.05, 1.3, -0.45, 0.09, 0.16, 0.05, 0.01)
  b.add(cabinet, 700, (x, y, z) => {
    if (z < -0.495 && Math.abs(y - 1.34) < 0.06 && Math.abs(x + 0.05) < 0.06) return 2
    return withEdges(cabinet, 0.7, 1.6)(x, y, z)
  })

  b.add(cyl(-0.04, 2.25, 0, 0.028, 0.25, 'y'), 420, 0.9)
  b.add(cyl(-0.04, 2.56, 0, 0.06, 0.05, 'y'), 520, band('y', 2.565, 0.015, 2.3, 0.9))
  b.add(cyl(-0.04, 2.625, 0, 0.064, 0.008, 'y'), 100, 1.3)
  b.add(cyl(-0.04, 2.66, 0, 0.025, 0.025, 'y'), 120, 2, { glow: 1 })
  b.add(rbox(0.04, 2.38, 0, 0.05, 0.03, 0.05, 0.008), 220, 0.9)
  b.add(cyl(0.095, 2.38, 0, 0.02, 0.008, 'x'), 70, 2.3)

  b.label('ASTI', -0.5, 0.36, 0.09, 0.405, 700)
  b.label('ASTI', -0.5, 0.36, 0.09, -0.405, 700)

  return showcaseSpec(b, { lift: 0.85 })
}
