import {
  SpecBuilder,
  band,
  clip,
  cut,
  cyl,
  rbox,
  showcaseSpec,
  withEdges,
  type AgvSpec,
  type Field,
} from '../geometry'

const fract = (v: number) => ((v % 1) + 1) % 1

function plane(x0: number, y0: number, nx: number, ny: number): Field {
  const length = Math.hypot(nx, ny)
  return (x, y) => ((x - x0) * nx + (y - y0) * ny) / length
}

export function car(): AgvSpec {
  const b = new SpecBuilder()
  const W = 0.42
  const wheelY = 0.17

  const arches = [-0.62, 0.62].map((x) => cyl(x, wheelY, 0, 0.205, 0.6, 'z'))
  const body = rbox(0, 0.31, 0, 1, 0.16, W, 0.07)
  b.add(cut(body, ...arches), 12000, (x, y, z) => {
    if (x > 0.97 && y < 0.36 && Math.abs(z) < 0.26) return fract(y * 40) < 0.4 ? 1.6 : 0.5
    if (Math.abs(z) > W - 0.01) {
      if (Math.abs(x - 0.06) < 0.006 || Math.abs(x + 0.5) < 0.006) return 1.5
      if (Math.abs(y - 0.38) < 0.005) return 1.6
      if (Math.abs(x - 0.3) < 0.04 && Math.abs(y - 0.4) < 0.008) return 2
    }
    if (y > 0.46) return Math.abs(Math.abs(z) - 0.3) < 0.006 ? 1.4 : 1.05
    return 0.95
  })

  const windshield = plane(0.55, 0.45, 0.3, 0.35)
  const rear = plane(-0.66, 0.45, -0.28, 0.25)
  const cabin = clip(clip(rbox(-0.06, 0.6, 0, 0.62, 0.15, 0.37, 0.05), windshield), rear)
  b.add(cabin, 7000, (x, y, z) => {
    if (windshield(x, y, z) > -0.01 || rear(x, y, z) > -0.01) {
      return Math.abs(z) > 0.33 ? 1.7 : 0.45
    }
    if (y > 0.735) return Math.abs(Math.abs(z) - 0.3) < 0.01 ? 1.5 : 1.1
    if (Math.abs(z) > 0.36 && y > 0.5) {
      if (Math.abs(x + 0.08) < 0.03 || y > 0.71) return 1.4
      return 0.45
    }
    return 1
  })

  for (const x of [-0.62, 0.62]) {
    for (const z of [-0.36, 0.36]) {
      b.add(cyl(x, wheelY, z, 0.17, 0.065, 'z'), 1500, (px, py, pz) => {
        const r = Math.hypot(px - x, py - wheelY)
        if (Math.abs(pz - z) < 0.06) return r > 0.16 ? 0.9 : 0.6
        if (r < 0.03) return 2
        if (r < 0.105) {
          const a = Math.atan2(py - wheelY, px - x)
          return fract((a / (Math.PI * 2)) * 5) < 0.2 ? 1.9 : 0.5
        }
        return r < 0.12 ? 1.7 : 0.7
      })
    }
  }

  for (const z of [-0.29, 0.29]) {
    b.add(rbox(1.0, 0.38, z, 0.012, 0.035, 0.1, 0.01), 300, 2.4, { glow: 2 })
    b.add(rbox(-1.0, 0.39, z, 0.012, 0.03, 0.11, 0.01), 280, 2)
  }
  b.add(rbox(-1.005, 0.29, 0, 0.004, 0.04, 0.12, 0.004), 200, 1.7)
  for (const z of [-0.45, 0.45]) {
    const mirror = rbox(0.42, 0.52, z, 0.04, 0.03, 0.04, 0.012)
    b.add(mirror, 160, withEdges(mirror, 1, 1.6))
  }

  return showcaseSpec(b)
}

export function barrier(): AgvSpec {
  const b = new SpecBuilder()
  const pivotY = 0.8
  const armZ = 0.2

  const island = rbox(0.75, 0.03, 0, 1.4, 0.03, 0.26, 0.01)
  b.add(island, 2600, (x, y, z) =>
    island.edge(x, y, z) ? 1.7 : Math.abs(z) > 0.25 && fract(x * 3) < 0.5 ? 1.6 : 0.5,
  )

  const housing = rbox(0, 0.5, 0, 0.14, 0.44, 0.15, 0.025)
  b.add(housing, 5000, (x, y, z) => {
    if (housing.edge(x, y, z)) return 1.8
    if (z > 0.14 && Math.abs(x) < 0.1 && y > 0.2 && y < 0.6) {
      const rim = Math.abs(x) > 0.095 || y < 0.205 || y > 0.595
      return rim ? 1.5 : 0.8
    }
    if (z > 0.14 && Math.hypot(x, y - 0.3) < 0.035) return 1.9
    return 0.95
  })
  const cap = rbox(0, 0.955, 0, 0.16, 0.018, 0.17, 0.01)
  b.add(cap, 700, withEdges(cap, 1.2, 1.6))
  b.add(cyl(0, 1.01, 0, 0.04, 0.04, 'y'), 250, 2.4, { glow: 1 })

  b.add(cyl(0, pivotY, armZ - 0.03, 0.075, 0.03, 'z'), 450, band('z', armZ, 0.006, 2, 1.2))
  const arm = rbox(1.08, pivotY, armZ, 1.02, 0.035, 0.022, 0.014)
  b.add(arm, 5500, (x, y, z) => (arm.edge(x, y, z) ? 1.2 : fract(x * 3.2) < 0.5 ? 1.5 : 0.4), {
    move: 4,
  })
  for (const x of [0.5, 1.05, 1.6, 2.05]) {
    b.add(cyl(x, pivotY + 0.04, armZ, 0.014, 0.008, 'y'), 50, 2.5, { glow: 1, move: 4 })
  }
  const weight = rbox(-0.2, pivotY, armZ, 0.12, 0.06, 0.03, 0.012)
  b.add(weight, 500, withEdges(weight, 0.9, 1.6), { move: 4 })

  const rest = rbox(2.02, 0.38, armZ, 0.028, 0.34, 0.028, 0.008)
  b.add(rest, 600, withEdges(rest, 1, 1.6))
  for (const dz of [-0.04, 0.04])
    b.add(rbox(2.02, 0.76, armZ + dz, 0.02, 0.04, 0.006, 0.004), 80, 1.6)

  const reader = rbox(-0.55, 0.5, 0.55, 0.09, 0.44, 0.08, 0.02)
  b.add(reader, 2200, (x, y, z) => {
    if (reader.edge(x, y, z)) return 1.7
    if (x > -0.46 && y > 0.66 && y < 0.82 && Math.abs(z - 0.55) < 0.05) return 2.1
    if (x > -0.46 && Math.abs(y - 0.55) < 0.008 && Math.abs(z - 0.55) < 0.04) return 2.3
    return 0.9
  })
  b.add(cyl(-0.455, 0.45, 0.55, 0.03, 0.006, 'x'), 80, 2.3, { glow: 2 })

  return showcaseSpec(b, { pivot: [0, pivotY, armZ], turn: 1.45 })
}

export function parkingSign(): AgvSpec {
  const b = new SpecBuilder()

  b.add(cyl(0, 0.85, 0, 0.035, 0.85, 'y'), 1600, 1.2)
  b.add(cyl(0, 0.02, 0, 0.14, 0.02, 'y'), 400, 1)
  const sign = rbox(0, 1.95, 0, 0.36, 0.36, 0.03, 0.05)
  b.add(sign, 6500, (x, y, z) => {
    if (sign.edge(x, y, z)) return 2
    return Math.abs(x) > 0.31 || Math.abs(y - 1.95) > 0.31 ? 1.5 : 0.55
  })
  b.label('P', 0, 1.95, 0.5, 0.032, 2600)
  b.label('P', 0, 1.95, 0.5, -0.032, 2600)

  const kiosk = rbox(0.75, 0.62, 0, 0.22, 0.6, 0.17, 0.03)
  b.add(kiosk, 7000, (x, y, z) => {
    if (kiosk.edge(x, y, z)) return 1.8
    if (z > 0.16) {
      if (Math.abs(x - 0.75) < 0.15 && y > 0.86 && y < 1.08) {
        const rim = Math.abs(x - 0.75) > 0.14 || y < 0.87 || y > 1.07
        return rim ? 1.9 : fract(y * 30) < 0.35 && x < 0.84 ? 2 : 0.6
      }
      if (Math.abs(x - 0.75) < 0.1 && y > 0.52 && y < 0.76) {
        return fract((x - 0.65) * 15) < 0.7 && fract((y - 0.52) * 16.6) < 0.7 ? 1.6 : 0.5
      }
      if (Math.abs(y - 0.4) < 0.008 && Math.abs(x - 0.75) < 0.08) return 2.3
    }
    return 0.9
  })
  const hood = rbox(0.75, 1.24, 0.03, 0.25, 0.025, 0.21, 0.012)
  b.add(hood, 800, withEdges(hood, 1.2, 1.6))
  b.add(rbox(0.75, 1.2, 0.2, 0.2, 0.006, 0.004, 0.003), 200, 2.3, { glow: 2 })
  b.add(cyl(0.9, 0.4, 0.176, 0.02, 0.006, 'z'), 60, 2.4, { glow: 1 })

  return showcaseSpec(b)
}
