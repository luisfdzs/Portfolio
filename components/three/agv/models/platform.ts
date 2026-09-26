import { SpecBuilder, band, cut, cyl, hazardX, rbox, type AgvSpec } from '../geometry'

export function platform(): AgvSpec {
  const b = new SpecBuilder()
  const L = 0.95
  const W = 0.575
  const top = 0.42

  const shell = rbox(0, 0.24, 0, L, 0.18, W, 0.05)
  const notches = [
    rbox(L, 0.16, W, 0.1, 0.07, 0.1, 0.012),
    rbox(-L, 0.16, -W, 0.1, 0.07, 0.1, 0.012),
  ]
  b.add(cut(shell, ...notches), 11000, (x, y, z) => {
    if (shell.edge(x, y, z)) return 1.6
    if (y > 0.41)
      return Math.abs(Math.abs(x) - 0.9) < 0.006 || Math.abs(Math.abs(z) - 0.53) < 0.006 ? 1.4 : 0.9
    if (Math.abs(z) > W - 0.01 && (Math.abs(x - 0.32) < 0.005 || Math.abs(x + 0.32) < 0.005))
      return 1.45
    if (Math.abs(x) > L - 0.01 && Math.abs(z) < 0.2 && Math.abs(y - 0.3) < 0.004) return 1.45
    return Math.abs(z) > W - 0.01 ? 0.82 : 0.95
  })
  b.add(rbox(0, 0.05, 0, L - 0.03, 0.045, W - 0.03, 0.02), 2400, 0.4)

  for (const x of [L + 0.012, -L - 0.012]) {
    const bumper = rbox(x, 0.11, 0, 0.02, 0.04, W - 0.14, 0.015)
    b.add(bumper, 1300, (px, py, pz) => (bumper.edge(px, py, pz) ? 1.4 : hazardX(pz, py, px)))
  }

  for (const [x, z] of [
    [L - 0.03, W - 0.03],
    [-L + 0.03, -W + 0.03],
  ] as const) {
    b.add(cyl(x, 0.155, z, 0.06, 0.05, 'y'), 650, band('y', 0.16, 0.016, 2.3, 0.85))
    b.add(cyl(x, 0.215, z, 0.066, 0.008, 'y'), 160, 1.3)
  }

  for (const z of [-W - 0.002, W + 0.002]) {
    b.add(rbox(0, 0.105, z, L - 0.16, 0.006, 0.003, 0.003), 520, 1.9, { glow: 2 })
  }
  for (const x of [L + 0.002, -L - 0.002]) {
    b.add(rbox(x, 0.36, 0, 0.003, 0.006, W - 0.16, 0.003), 360, 1.9, { glow: 2 })
  }

  b.add(rbox(L + 0.004, 0.27, -0.36, 0.004, 0.05, 0.1, 0.006), 300, (_x, y, z) =>
    Math.abs(y - 0.27) < 0.035 && Math.abs(z + 0.36) < 0.08 ? 2 : 0.8,
  )
  b.add(cyl(L + 0.02, 0.27, -0.18, 0.03, 0.02, 'x'), 180, 2.1)
  b.add(cyl(L + 0.006, 0.27, -0.18, 0.042, 0.006, 'x'), 110, 1.2)
  for (const [x, z] of [
    [0.72, W + 0.02],
    [-0.72, -W - 0.02],
    [0.72, -W - 0.02],
    [-0.72, W + 0.02],
  ] as const) {
    b.add(cyl(x, 0.3, z, 0.028, 0.02, 'z'), 150, 2.1)
  }

  const lift = 0.26
  const deck = rbox(0, top + 0.022, 0, L - 0.06, 0.02, W - 0.05, 0.008)
  b.add(
    deck,
    14000,
    (x, y, z) => {
      if (deck.edge(x, y, z)) return 1.9
      if (y < top + 0.041) return 1.1
      const cell = (v: number) => (((v * 10) % 1) + 1) % 1
      const grid = cell(x) < 0.06 || cell(z) < 0.06
      const rim = Math.abs(x) > L - 0.12 || Math.abs(z) > W - 0.11
      return grid || rim ? 1.3 : 0.95
    },
    { move: 2 },
  )

  for (const x of [-0.62, 0.62]) {
    for (const z of [-0.34, 0.34]) {
      b.add(cyl(x, top - lift / 2, z, 0.03, lift / 2, 'y'), 700, 1.35, { move: 2, reveal: true })
      b.add(cyl(x, top - lift / 4, z, 0.042, lift / 4, 'y'), 360, 1.1, {
        move: 3,
        reveal: true,
      })
    }
  }
  b.add(cyl(0, top - lift / 2, 0, 0.075, lift / 2, 'y'), 1100, 1.2, { move: 2, reveal: true })

  b.label('ASTI', -0.45, 0.25, 0.1, W + 0.004, 900)
  b.label('ASTI', 0.45, 0.25, 0.1, -W - 0.004, 900)

  return {
    parts: b.parts,
    labels: b.labels,
    core: { x: 0.2, y: 0.8 },
    spread: 0.95,
    target: [0.1, 0.32, 0],
    distance: 4.9,
    portraitDistance: 8.2,
    drive: 1.1,
    lift,
  }
}
