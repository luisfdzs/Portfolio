import { AdditiveBlending, Color, FrontSide, ShaderMaterial } from 'three'
import { feature } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import land from 'world-atlas/land-110m.json'

const MASK_W = 2048
const MASK_H = 1024

function landMask() {
  const canvas = document.createElement('canvas')
  canvas.width = MASK_W
  canvas.height = MASK_H
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return () => false

  const topology = land as unknown as Topology<{ land: GeometryCollection }>
  const shapes = feature(topology, topology.objects.land)
  const project = ([lon, lat]: number[]) =>
    [(((lon ?? 0) + 180) / 360) * MASK_W, ((90 - (lat ?? 0)) / 180) * MASK_H] as const

  context.fillStyle = '#fff'
  for (const shape of shapes.features) {
    const geometry = shape.geometry
    const polygons =
      geometry.type === 'Polygon'
        ? [geometry.coordinates]
        : geometry.type === 'MultiPolygon'
          ? geometry.coordinates
          : []
    for (const polygon of polygons) {
      context.beginPath()
      for (const ring of polygon) {
        ring.forEach((point, index) => {
          const [x, y] = project(point)
          if (index === 0) context.moveTo(x, y)
          else context.lineTo(x, y)
        })
        context.closePath()
      }
      context.fill('evenodd')
    }
  }

  const { data } = context.getImageData(0, 0, MASK_W, MASK_H)
  return (lat: number, lon: number) => {
    const x = Math.min(MASK_W - 1, Math.max(0, Math.floor(((lon + 180) / 360) * MASK_W)))
    const y = Math.min(MASK_H - 1, Math.max(0, Math.floor(((90 - lat) / 180) * MASK_H)))
    return (data[(y * MASK_W + x) * 4 + 3] ?? 0) > 127
  }
}

export function globeDots(radius: number, count: number) {
  const isLand = landMask()
  const landPoints: number[] = []
  const oceanPoints: number[] = []
  const spacing = Math.sqrt((4 * Math.PI) / count) * 0.45
  for (let i = 0; i < count; i++) {
    const baseY = 1 - (i / (count - 1)) * 2
    const theta = i * 2.399963
    const baseRing = Math.sqrt(1 - baseY * baseY)
    const jx = Math.cos(theta) * baseRing + (Math.random() - 0.5) * spacing
    const jy = baseY + (Math.random() - 0.5) * spacing
    const jz = Math.sin(theta) * baseRing + (Math.random() - 0.5) * spacing
    const length = Math.hypot(jx, jy, jz) || 1
    const x = jx / length
    const y = jy / length
    const z = jz / length
    const lat = 90 - (Math.acos(y) * 180) / Math.PI
    let lon = (Math.atan2(z, -x) * 180) / Math.PI - 180
    if (lon < -180) lon += 360
    if (isLand(lat, lon)) landPoints.push(x * radius, y * radius, z * radius)
    else if (i % 7 === 0) oceanPoints.push(x * radius, y * radius, z * radius)
  }
  return { land: new Float32Array(landPoints), ocean: new Float32Array(oceanPoints) }
}

export function atmosphereMaterial(color: string) {
  return new ShaderMaterial({
    uniforms: {
      uColor: { value: new Color(color) },
      uOpacity: { value: 0 },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float rim = 1.0 - max(dot(vNormal, vView), 0.0);
        float glow = pow(rim, 4.5) * 0.55 + pow(rim, 16.0) * 0.5;
        gl_FragColor = vec4(uColor * glow, glow * uOpacity);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: FrontSide,
  })
}
