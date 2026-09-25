import { BufferAttribute, BufferGeometry, Vector3 } from 'three'
import { globeDots } from './globe'

export const GLOBE_CENTER = new Vector3(0, 0, -60)
export const GLOBE_RADIUS = 6
export const NAME_Z = -52
export const BEAM_LENGTH = 58
const BUTTON_WIDTH = 1.75

function monoFamily() {
  return (
    getComputedStyle(document.body).getPropertyValue('--font-mono').trim() ||
    'ui-monospace, monospace'
  )
}

const HOME = { lat: 42.24, lon: -8.72 }

const REGIONS = [
  { lat: 38.9, lon: -77 },
  { lat: 37.8, lon: -122.4 },
  { lat: -23.5, lon: -46.6 },
  { lat: 48.9, lon: 2.4 },
  { lat: 50.1, lon: 8.7 },
  { lat: 19.1, lon: 72.9 },
  { lat: 35.6, lon: 139.8 },
  { lat: -33.9, lon: 151.2 },
  { lat: -33.9, lon: 18.4 },
]

type Line = { text: string; font: string; tone: number; y: number }

function sampleText(lines: Line[], width: number, count: number) {
  const scale = 12
  const canvasWidth = 2400
  const canvasHeight = 900
  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  const context = canvas.getContext('2d', { willReadFrequently: true })
  const points = new Float32Array(count * 3)
  const tones = new Float32Array(count)
  if (!context) return { points, tones }

  let widest = 0
  for (const line of lines) {
    context.font = line.font
    widest = Math.max(widest, context.measureText(line.text).width)
  }
  const hits: number[] = []
  const hitTones: number[] = []
  lines.forEach((line) => {
    context.clearRect(0, 0, canvasWidth, canvasHeight)
    context.font = line.font
    context.textBaseline = 'middle'
    context.textAlign = 'center'
    context.fillStyle = '#fff'
    context.fillText(line.text, canvasWidth / 2, canvasHeight / 2)
    const { data } = context.getImageData(0, 0, canvasWidth, canvasHeight)
    for (let y = 0; y < canvasHeight; y += 2) {
      for (let x = 0; x < canvasWidth; x += 2) {
        if ((data[(y * canvasWidth + x) * 4 + 3] ?? 0) > 120) {
          hits.push(x - canvasWidth / 2, canvasHeight / 2 - y + line.y * scale)
          hitTones.push(line.tone)
        }
      }
    }
  })
  const unit = width / widest
  const total = hits.length / 2
  for (let i = 0; i < count; i++) {
    const pick = Math.floor(Math.random() * total)
    points[i * 3] = ((hits[pick * 2] ?? 0) + (Math.random() - 0.5) * 2) * unit
    points[i * 3 + 1] = ((hits[pick * 2 + 1] ?? 0) + (Math.random() - 0.5) * 2) * unit
    points[i * 3 + 2] = (Math.random() - 0.5) * 0.04
    tones[i] = hitTones[pick] ?? 0
  }
  return { points, tones }
}

function sampleButton(count: number) {
  const canvasWidth = 2400
  const canvasHeight = 900
  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  const context = canvas.getContext('2d', { willReadFrequently: true })
  const points = new Float32Array(count * 3)
  const tones = new Float32Array(count)
  if (!context) return { points, tones }
  const family = monoFamily()
  const layers: { tone: number; draw: () => void }[] = [
    {
      tone: 0.15,
      draw: () => {
        context.lineWidth = 14
        context.beginPath()
        context.roundRect(300, 250, 1800, 400, 110)
        context.stroke()
        context.lineWidth = 9
        context.beginPath()
        context.roundRect(1640, 335, 290, 230, 44)
        context.stroke()
      },
    },
    {
      tone: 1,
      draw: () => {
        context.font = `500 190px ${family}`
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillText('git push', 1000, 455)
      },
    },
    {
      tone: 0.55,
      draw: () => {
        context.font = `500 170px ${family}`
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillText('↵', 1785, 460)
      },
    },
  ]
  const hits: number[] = []
  const hitTones: number[] = []
  for (const layer of layers) {
    context.clearRect(0, 0, canvasWidth, canvasHeight)
    context.fillStyle = '#fff'
    context.strokeStyle = '#fff'
    layer.draw()
    const { data } = context.getImageData(0, 0, canvasWidth, canvasHeight)
    for (let y = 0; y < canvasHeight; y += 2) {
      for (let x = 0; x < canvasWidth; x += 2) {
        if ((data[(y * canvasWidth + x) * 4 + 3] ?? 0) > 120) {
          hits.push(x - canvasWidth / 2, canvasHeight / 2 - y)
          hitTones.push(layer.tone)
        }
      }
    }
  }
  const scale = BUTTON_WIDTH / 1800
  const total = hits.length / 2
  for (let i = 0; i < count; i++) {
    const pick = Math.floor(Math.random() * total)
    points[i * 3] = ((hits[pick * 2] ?? 0) + (Math.random() - 0.5) * 2) * scale
    points[i * 3 + 1] = ((hits[pick * 2 + 1] ?? 0) + (Math.random() - 0.5) * 2) * scale
    points[i * 3 + 2] = (Math.random() - 0.5) * 0.02
    tones[i] = hitTones[pick] ?? 0
  }
  return { points, tones }
}

function shuffled(points: Float32Array) {
  const total = points.length / 3
  const out = new Float32Array(points.length)
  const order = Array.from({ length: total }, (_, i) => i)
  for (let i = total - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const swap = order[i] ?? 0
    order[i] = order[j] ?? 0
    order[j] = swap
  }
  order.forEach((from, to) => {
    out[to * 3] = points[from * 3] ?? 0
    out[to * 3 + 1] = points[from * 3 + 1] ?? 0
    out[to * 3 + 2] = points[from * 3 + 2] ?? 0
  })
  return out
}

function unit(lat: number, lon: number) {
  const phi = ((90 - lat) * Math.PI) / 180
  const theta = ((lon + 180) * Math.PI) / 180
  return new Vector3(
    -Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta),
  )
}

function slerp(a: Vector3, b: Vector3, t: number) {
  const angle = Math.acos(Math.min(1, Math.max(-1, a.dot(b))))
  if (angle < 1e-5) return a.clone()
  const s = Math.sin(angle)
  return a
    .clone()
    .multiplyScalar(Math.sin((1 - t) * angle) / s)
    .add(b.clone().multiplyScalar(Math.sin(t * angle) / s))
}

export function buildGeometry(count: number, portrait: boolean) {
  const family = monoFamily()
  const display =
    getComputedStyle(document.body).getPropertyValue('--font-display').trim() || 'serif'

  const code = sampleButton(count)

  const nameLines: Line[] = portrait
    ? [
        { text: 'Luis Fernández', font: `400 260px ${display}`, tone: 1, y: 24 },
        { text: 'Sangil', font: `400 260px ${display}`, tone: 1, y: -3 },
        {
          text: 'INGENIERO DE SOFTWARE · SISTEMAS',
          font: `500 60px ${family}`,
          tone: 0,
          y: -24,
        },
      ]
    : [
        { text: 'Luis Fernández Sangil', font: `400 280px ${display}`, tone: 1, y: 6 },
        {
          text: 'INGENIERO DE SOFTWARE Y SISTEMAS',
          font: `500 64px ${family}`,
          tone: 0,
          y: -13,
        },
      ]
  const name = sampleText(nameLines, portrait ? 5.2 : 10.5, count)

  const arcShare = 0
  const oceanShare = 0.12
  const landWanted = Math.ceil(count * (1 - arcShare - oceanShare))
  const surface = globeDots(1, Math.ceil(landWanted / 0.29))
  const land = shuffled(surface.land)
  const ocean = shuffled(surface.ocean)
  const landCount = land.length / 3
  const oceanCount = ocean.length / 3
  let landNext = 0
  let oceanNext = 0
  const home = unit(HOME.lat, HOME.lon)
  const regionUnits = REGIONS.map((region) => unit(region.lat, region.lon))

  const beam = new Float32Array(count * 3)
  const globe = new Float32Array(count * 3)
  const seed = new Float32Array(count * 4)
  const tone = new Float32Array(count * 4)

  for (let i = 0; i < count; i++) {
    const r0 = Math.random()
    const r1 = Math.random()
    const r2 = Math.random()
    const r3 = Math.random()
    seed.set([r0, r1, r2, r3], i * 4)

    const along = Math.random()
    const radius = 0.7 + Math.pow(Math.random(), 0.7) * 0.55
    const angle = along * Math.PI * 34 + r1 * Math.PI * 2
    beam.set([Math.cos(angle) * radius, Math.sin(angle) * radius, -along * BEAM_LENGTH], i * 3)

    let arcU = -1
    if (r2 < arcShare) {
      const region = regionUnits[Math.floor(r3 * regionUnits.length)] ?? home
      arcU = Math.random()
      const point = slerp(home, region, arcU)
      const angleBetween = Math.acos(Math.min(1, Math.max(-1, home.dot(region))))
      const lift = 1 + Math.sin(arcU * Math.PI) * (0.03 + angleBetween * 0.07)
      globe.set([point.x * lift, point.y * lift, point.z * lift], i * 3)
    } else if (r2 < arcShare + oceanShare && oceanCount > 0) {
      arcU = -2
      const pick = oceanNext++ % oceanCount
      globe.set([ocean[pick * 3] ?? 0, ocean[pick * 3 + 1] ?? 0, ocean[pick * 3 + 2] ?? 0], i * 3)
    } else {
      const pick = landNext++ % Math.max(1, landCount)
      globe.set([land[pick * 3] ?? 0, land[pick * 3 + 1] ?? 0, land[pick * 3 + 2] ?? 0], i * 3)
    }
    tone.set([code.tones[i] ?? 0, arcU, name.tones[i] ?? 0, r0 < 0.58 ? 1 : 0], i * 4)
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(code.points, 3))
  geometry.setAttribute('aBeam', new BufferAttribute(beam, 3))
  geometry.setAttribute('aGlobe', new BufferAttribute(globe, 3))
  geometry.setAttribute('aName', new BufferAttribute(name.points, 3))
  geometry.setAttribute('aSeed', new BufferAttribute(seed, 4))
  geometry.setAttribute('aTone', new BufferAttribute(tone, 4))
  return geometry
}

export function streakGeometry(source: BufferGeometry, share: number) {
  const total = source.getAttribute('position').count
  const count = Math.floor(total * share)
  const geometry = new BufferGeometry()
  for (const name of ['position', 'aBeam', 'aGlobe', 'aName', 'aSeed', 'aTone']) {
    const attribute = source.getAttribute(name) as BufferAttribute
    const size = attribute.itemSize
    const doubled = new Float32Array(count * 2 * size)
    for (let i = 0; i < count; i++) {
      for (let k = 0; k < size; k++) {
        const value = attribute.array[i * size + k] ?? 0
        doubled[i * 2 * size + k] = value
        doubled[(i * 2 + 1) * size + k] = value
      }
    }
    geometry.setAttribute(name, new BufferAttribute(doubled, size))
  }
  const tail = new Float32Array(count * 2)
  for (let i = 0; i < count; i++) tail[i * 2 + 1] = 1
  geometry.setAttribute('aTail', new BufferAttribute(tail, 1))
  return geometry
}
