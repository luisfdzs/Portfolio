'use client'

import { memo, useEffect, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { AdditiveBlending, BufferAttribute, BufferGeometry, Points, ShaderMaterial } from 'three'
import type { AgvModelKey } from './models'
import type { AgvWorkerRequest, AgvWorkerResult } from './agv.worker'
import { agvFragment, agvMorphVertex } from './shaders'

type Shape = {
  key: AgvModelKey
  shape: Float32Array
  normalGlow: Float32Array
  delay: Float32Array
  move: Float32Array
  lift: number
}

type MorphState = { t: number; index: number; cycle: number }

const FIT = 2.2
const FORM_FROM = 2
const FORM_TO = 3.4
const HOLD = 5
const MORPH = 1.4

const ramp = (t: number, from: number, to: number) =>
  Math.min(1, Math.max(0, (t - from) / (to - from)))
const smooth = (t: number) => t * t * (3 - 2 * t)

function toShape(data: AgvWorkerResult, count: number): Shape {
  const n = data.tone.length
  let minX = Infinity
  let minY = Infinity
  let minZ = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let maxZ = -Infinity
  for (let i = 0; i < n; i++) {
    const x = data.position[i * 3] ?? 0
    const y = data.position[i * 3 + 1] ?? 0
    const z = data.position[i * 3 + 2] ?? 0
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
    minZ = Math.min(minZ, z)
    maxZ = Math.max(maxZ, z)
  }
  const size = FIT / Math.max(Math.hypot(maxX - minX, maxZ - minZ), (maxY - minY) * 1.2)
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const cz = (minZ + maxZ) / 2

  const pick = new Uint32Array(count)
  const order = new Uint32Array(n)
  for (let i = 0; i < n; i++) order[i] = i
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const swap = order[i] ?? 0
    order[i] = order[j] ?? 0
    order[j] = swap
  }
  for (let i = 0; i < count; i++) pick[i] = order[i % n] ?? 0
  const height = (j: number) => data.position[j * 3 + 1] ?? 0
  pick.sort((a, b) => height(a) - height(b))

  const shape = new Float32Array(count * 4)
  const normalGlow = new Float32Array(count * 4)
  const delay = new Float32Array(count)
  const move = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const j = pick[i] ?? 0
    const jitter = count > n ? 0.004 : 0
    const y = height(j)
    shape[i * 4] = ((data.position[j * 3] ?? 0) - cx) * size + (Math.random() - 0.5) * jitter
    shape[i * 4 + 1] = (y - cy) * size + (Math.random() - 0.5) * jitter
    shape[i * 4 + 2] =
      ((data.position[j * 3 + 2] ?? 0) - cz) * size + (Math.random() - 0.5) * jitter
    shape[i * 4 + 3] = data.tone[j] ?? 1
    normalGlow[i * 4] = data.normal[j * 3] ?? 0
    normalGlow[i * 4 + 1] = data.normal[j * 3 + 1] ?? 0
    normalGlow[i * 4 + 2] = data.normal[j * 3 + 2] ?? 0
    normalGlow[i * 4 + 3] = data.glow[j] ?? 0
    move[i] = data.move[j] ?? 0
    delay[i] = Math.min(1, ((y - minY) / (maxY - minY || 1)) * 0.75 + Math.random() * 0.2)
  }
  return { key: data.key, shape, normalGlow, delay, move, lift: data.lift * size }
}

function buildMorph(count: number) {
  const cloud = new Float32Array(count * 3)
  const core = new Float32Array(count * 3)
  const seed = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const u = Math.random() * 2 - 1
    const a = Math.random() * Math.PI * 2
    const s = Math.sqrt(1 - u * u)
    const r = 1.1 + Math.pow(Math.random(), 0.7) * 1.2
    cloud[i * 3] = s * Math.cos(a) * r
    cloud[i * 3 + 1] = u * r * 0.7
    cloud[i * 3 + 2] = s * Math.sin(a) * r
    const u2 = Math.random() * 2 - 1
    const a2 = Math.random() * Math.PI * 2
    const s2 = Math.sqrt(1 - u2 * u2)
    const r2 = 0.3 * Math.cbrt(Math.random())
    core[i * 3] = s2 * Math.cos(a2) * r2
    core[i * 3 + 1] = u2 * r2
    core[i * 3 + 2] = s2 * Math.sin(a2) * r2
    seed[i] = Math.random()
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(cloud, 3))
  geometry.setAttribute('aCore', new BufferAttribute(core, 3))
  geometry.setAttribute('aSeed', new BufferAttribute(seed, 1))
  geometry.setAttribute('aFrom', new BufferAttribute(new Float32Array(count * 4), 4))
  geometry.setAttribute('aFromNormalGlow', new BufferAttribute(new Float32Array(count * 4), 4))
  geometry.setAttribute('aShape', new BufferAttribute(new Float32Array(count * 4), 4))
  geometry.setAttribute('aNormalGlow', new BufferAttribute(new Float32Array(count * 4), 4))
  geometry.setAttribute('aDelay', new BufferAttribute(new Float32Array(count), 1))
  geometry.setAttribute('aMove', new BufferAttribute(new Float32Array(count), 1))
  const material = new ShaderMaterial({
    uniforms: {
      uCharge: { value: 0 },
      uBurst: { value: 0 },
      uForm: { value: 0 },
      uMorph: { value: 1 },
      uLift: { value: 0 },
      uLiftRatio: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: 7 },
      uPixelRatio: { value: 1 },
    },
    vertexShader: agvMorphVertex,
    fragmentShader: agvFragment,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const points = new Points(geometry, material)
  points.frustumCulled = false
  return { points, geometry, material }
}

type Morph = ReturnType<typeof buildMorph>

function write(morph: Morph, name: string, values: Float32Array) {
  const attribute = morph.geometry.getAttribute(name)
  if (!(attribute instanceof BufferAttribute)) return
  attribute.set(values)
  attribute.needsUpdate = true
}

function show(morph: Morph, from: Shape, to: Shape) {
  write(morph, 'aFrom', from.shape)
  write(morph, 'aFromNormalGlow', from.normalGlow)
  write(morph, 'aShape', to.shape)
  write(morph, 'aNormalGlow', to.normalGlow)
  write(morph, 'aDelay', to.delay)
  write(morph, 'aMove', to.move)
}

function advance(
  morph: Morph,
  state: MorphState,
  shapes: Shape[],
  total: number,
  delta: number,
  pixelRatio: number,
  still: boolean,
  onShow: (key: AgvModelKey) => void,
) {
  const step = Math.min(delta, 1 / 20)
  const u = morph.material.uniforms
  if (u.uPixelRatio) u.uPixelRatio.value = pixelRatio

  if (state.index === -1) {
    const first = shapes[0]
    if (!first) {
      if (u.uTime) u.uTime.value += still ? 0 : step
      return
    }
    show(morph, first, first)
    state.index = 0
    state.t = still ? FORM_TO : 0
    onShow(first.key)
  }

  if (!still) {
    state.t += step
    if (u.uTime) u.uTime.value += step
    morph.points.rotation.y += step * 0.35
    if (state.t >= FORM_TO) state.cycle += step
  }

  if (state.cycle >= HOLD) {
    const following = state.index + 1
    const target = following < shapes.length ? following : shapes.length === total ? 0 : state.index
    const current = shapes[state.index]
    const next = shapes[target]
    if (current && next && target !== state.index) {
      state.index = target
      show(morph, current, next)
      onShow(next.key)
      state.cycle = -MORPH
    } else {
      state.cycle = 0
    }
  }

  const t = state.t
  if (u.uCharge) u.uCharge.value = t < 1.8 ? ramp(t, 0, 0.8) : 0
  if (u.uBurst) u.uBurst.value = ramp(t, 0.8, 1.8)
  if (u.uForm) u.uForm.value = ramp(t, FORM_FROM, FORM_TO)
  if (u.uMorph) u.uMorph.value = state.cycle < 0 ? 1 + state.cycle / MORPH : 1
  if (u.uLift) {
    const raise = smooth(ramp(state.cycle, 0.5, 1.7)) * (1 - smooth(ramp(state.cycle, 3.1, 4.3)))
    u.uLift.value = (shapes[state.index]?.lift ?? 0) * raise
    if (u.uLiftRatio) u.uLiftRatio.value = raise
  }
}

function Scene({
  count,
  shapes,
  total,
  still,
  onShow,
}: {
  count: number
  shapes: RefObject<Shape[]>
  total: number
  still: boolean
  onShow: (key: AgvModelKey) => void
}) {
  const [morph] = useState(() => buildMorph(count))
  const state = useRef<MorphState>({ t: 0, index: -1, cycle: 0 })

  useEffect(
    () => () => {
      morph.geometry.dispose()
      morph.material.dispose()
    },
    [morph],
  )

  useFrame((frame, delta) =>
    advance(morph, state.current, shapes.current, total, delta, frame.viewport.dpr, still, onShow),
  )

  return <primitive object={morph.points} />
}

export const AgvMorph = memo(function AgvMorph({
  keys,
  active,
  still,
  onShow,
}: {
  keys: AgvModelKey[]
  active: boolean
  still: boolean
  onShow: (key: AgvModelKey) => void
}) {
  const shapes = useRef<Shape[]>([])
  const [count] = useState(() => (window.innerWidth < 1280 ? 22000 : 60000))

  useEffect(() => {
    const worker = new Worker(new URL('./agv.worker.ts', import.meta.url), { type: 'module' })
    const list = shapes.current
    worker.onmessage = (event: MessageEvent<AgvWorkerResult>) => {
      list.push(toShape(event.data, count))
    }
    const request: AgvWorkerRequest = { keys, scale: count < 30000 ? 0.3 : 0.75 }
    worker.postMessage(request)
    return () => {
      worker.terminate()
      list.length = 0
    }
  }, [keys, count])

  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [3.1, 1.7, 3.6], fov: 32, near: 0.1, far: 50 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
    >
      <Scene count={count} shapes={shapes} total={keys.length} still={still} onShow={onShow} />
    </Canvas>
  )
})
