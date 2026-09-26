'use client'

import { useEffect, useState } from 'react'
import { Canvas, useFrame, useThree, type RootState } from '@react-three/fiber'
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  NoBlending,
  Points,
  ShaderMaterial,
  Vector2,
  Vector3,
} from 'three'
import type { AgvWorkerRequest, AgvWorkerResult } from '@/components/three/agv/agv.worker'
import type { ShowcaseModelKey } from '@/components/three/agv/models'
import {
  anchorsVersion,
  listAnchors,
  subscribeAnchors,
  swarmLink,
  type SwarmAnchor,
} from './registry'
import {
  HERO,
  HOLD,
  MODEL,
  SOCIAL,
  emptyShape,
  fillFlat,
  fillSocial,
  frameShape,
  modelShape,
  nebulaShape,
  poseOf,
  type Shape,
} from './shapes'
import { swarmFragment, swarmVertex } from './shaders'

const FOV = 30
const DEPTH = 10
const MORPH = 1.4
const TRAVEL = 0.7
const FOLLOW = 7
const SPIN = 0.35
const REST = 0.0005
const DOMINANT = 0.6
const FRAME_INSET = 14

type Rect = { x: number; y: number; w: number; h: number }

type Station = {
  anchor: SwarmAnchor
  rect: Rect
  shown: boolean
  index: number
  cycle: number
  spin: number
  card: HTMLElement | null
}

type End = { station: Station; shape: Shape }

type Flow = { from: End; to: End; bridge: boolean; d: number }

type Library = {
  nebula: Shape
  frame: Shape
  button: Shape
  name: Shape
  hero: number
  social: Shape
  socialVersion: number
  socialReady: boolean
  models: Map<ShowcaseModelKey, Shape>
}

const ramp = (t: number, from: number, to: number) =>
  Math.min(1, Math.max(0, (t - from) / (to - from)))
const smooth = (t: number) => t * t * (3 - 2 * t)

function sideUniforms() {
  return {
    center: { value: new Vector3() },
    scale: { value: new Vector2(1, 1) },
    kind: { value: 0 },
    spin: { value: 0 },
    pose: { value: new Vector3() },
    pivot: { value: new Vector2() },
  }
}

function buildSwarm(count: number) {
  const cloud = new Float32Array(count * 3)
  const seed = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const u = Math.random() * 2 - 1
    const a = Math.random() * Math.PI * 2
    const ring = Math.sqrt(1 - u * u)
    const r = Math.cbrt(Math.random())
    cloud[i * 3] = ring * Math.cos(a) * r
    cloud[i * 3 + 1] = u * r
    cloud[i * 3 + 2] = ring * Math.sin(a) * r
    seed[i] = Math.random()
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(cloud, 3))
  geometry.setAttribute('aSeed', new BufferAttribute(seed, 1))
  const from = sideUniforms()
  const to = sideUniforms()
  const uniforms = {
    uFromCenter: from.center,
    uFromScale: from.scale,
    uFromKind: from.kind,
    uFromSpin: from.spin,
    uFromPose: from.pose,
    uFromPivot: from.pivot,
    uToCenter: to.center,
    uToScale: to.scale,
    uToKind: to.kind,
    uToSpin: to.spin,
    uToPose: to.pose,
    uToPivot: to.pivot,
    uMix: { value: 0 },
    uStream: { value: 0 },
    uCalm: { value: 0 },
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
    uPixel: { value: 1 },
    uSize: { value: 1.5 },
    uViewH: { value: 1 },
    uPulse: { value: 0 },
    uVisible: { value: 0 },
    uOcclude: { value: count < 40000 ? 4 : 3 },
    uDensity: { value: count < 40000 ? 1.8 : 1 },
    uFormed: { value: -1 },
  }
  const material = new ShaderMaterial({
    uniforms,
    vertexShader: swarmVertex,
    fragmentShader: swarmFragment,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const depth = new ShaderMaterial({
    uniforms,
    vertexShader: swarmVertex,
    fragmentShader: swarmFragment,
    defines: { OCCLUDE: '' },
    colorWrite: false,
    depthWrite: true,
    blending: NoBlending,
  })
  const points = new Points(geometry, material)
  const shadow = new Points(geometry, depth)
  points.frustumCulled = false
  shadow.frustumCulled = false
  points.add(shadow)
  return { points, geometry, material, depth, uniforms, from, to }
}

type Swarm = ReturnType<typeof buildSwarm>

function frontCard(section: Element | null) {
  if (!section) return null
  const cards = section.querySelectorAll<HTMLElement>(
    '.cover-flow-track > li:not([data-clone]) .cover-flow-card',
  )
  const middle = window.innerWidth / 2
  let best: HTMLElement | null = null
  let distance = Infinity
  for (const card of cards) {
    if (card.closest<HTMLElement>('li')?.style.visibility === 'hidden') continue
    const rect = card.getBoundingClientRect()
    if (rect.width < 1) continue
    const gap = Math.abs(rect.left + rect.width / 2 - middle)
    if (gap < distance) {
      distance = gap
      best = card
    }
  }
  return best
}

function measure(station: Station) {
  const source = station.anchor.source
  let element: HTMLElement | null = station.anchor.element
  let inset = 0
  if (source.kind === 'frame') {
    element = frontCard(station.anchor.element.closest('section'))
    inset = FRAME_INSET
  }
  if (!element) {
    station.shown = false
    return false
  }
  const box = element.getBoundingClientRect()
  station.rect = {
    x: box.left - inset,
    y: box.top - inset,
    w: box.width + inset * 2,
    h: box.height + inset * 2,
  }
  station.shown = box.width > 1 && box.height > 1
  const changed = source.kind === 'frame' && station.card !== null && station.card !== element
  station.card = element
  return changed
}

function current(station: Station, library: Library) {
  const source = station.anchor.source
  if (source.kind === 'hero') return swarmLink.hero.pose === 'name' ? library.name : library.button
  if (source.kind === 'frame') return library.frame
  if (source.kind === 'social') return library.socialReady ? library.social : library.nebula
  const key = source.keys[station.index]
  return (key && library.models.get(key)) || library.nebula
}

const same = (a: End, b: End) => a.station === b.station && a.shape === b.shape

const inView = (rect: Rect, width: number, height: number) =>
  rect.y < height && rect.y + rect.h > 0 && rect.x < width && rect.x + rect.w > 0

function applySide(
  side: Swarm['from'],
  end: End,
  library: Library,
  wpp: number,
  width: number,
  height: number,
) {
  const { rect } = end.station
  side.center.value.set(
    (rect.x + rect.w / 2 - width / 2) * wpp,
    (height / 2 - rect.y - rect.h / 2) * wpp,
    0,
  )
  if (end.shape.kind === MODEL) {
    const unit = Math.min(rect.h / 2.9, rect.w / 2.3) * wpp
    side.scale.value.set(unit, unit)
  } else {
    side.scale.value.set(rect.w * wpp, rect.h * wpp)
  }
  side.kind.value = end.shape.kind
  side.spin.value = end.station.spin
  const live = end.shape === current(end.station, library)
  const pose = poseOf(end.shape, live ? end.station.cycle : HOLD)
  side.pose.value.set(pose.lift, pose.ratio, pose.turn)
  side.pivot.value.set(end.shape.pivot[0], end.shape.pivot[1])
}

function bind(swarm: Swarm, flow: Flow) {
  const geometry = swarm.geometry
  if (geometry.getAttribute('aFrom') !== flow.from.shape.position) {
    geometry.setAttribute('aFrom', flow.from.shape.position)
    geometry.setAttribute('aFromNormal', flow.from.shape.normal)
    geometry.setAttribute('aFromMeta', flow.from.shape.meta)
  }
  if (geometry.getAttribute('aTo') !== flow.to.shape.position) {
    geometry.setAttribute('aTo', flow.to.shape.position)
    geometry.setAttribute('aToNormal', flow.to.shape.normal)
    geometry.setAttribute('aToMeta', flow.to.shape.meta)
  }
}

type Director = {
  swarm: Swarm
  library: Library
  stations: Map<SwarmAnchor, Station>
  order: Station[]
  synced: number
  flow: Flow | null
  pulse: number
  formed: number
}

function createDirector(count: number): Director {
  return {
    swarm: buildSwarm(count),
    library: {
      nebula: nebulaShape(count),
      frame: frameShape(count),
      button: emptyShape(HERO, count),
      name: emptyShape(HERO, count),
      hero: -1,
      social: emptyShape(SOCIAL, count),
      socialVersion: -1,
      socialReady: false,
      models: new Map(),
    },
    stations: new Map(),
    order: [],
    synced: -1,
    flow: null,
    pulse: 0,
    formed: -1,
  }
}

function direct(director: Director, state: RootState, delta: number, calm: boolean) {
  const dt = Math.min(delta, 1 / 20)
  const { width, height } = state.size
  const wpp = (2 * DEPTH * Math.tan((FOV * Math.PI) / 360)) / height
  const { swarm, library } = director
  const u = swarm.uniforms

  if (director.synced !== anchorsVersion()) {
    const next = new Map<SwarmAnchor, Station>()
    for (const anchor of listAnchors()) {
      next.set(
        anchor,
        director.stations.get(anchor) ?? {
          anchor,
          rect: { x: 0, y: 0, w: 0, h: 0 },
          shown: false,
          index: 0,
          cycle: 0,
          spin: 0.6,
          card: null,
        },
      )
    }
    director.stations = next
    director.order = [...next.values()].sort((a, b) =>
      a.anchor.element.compareDocumentPosition(b.anchor.element) & Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : 1,
    )
    director.synced = anchorsVersion()
  }

  if (library.hero !== swarmLink.hero.version) {
    fillFlat(library.button, swarmLink.hero.button)
    fillFlat(library.name, swarmLink.hero.name)
    library.hero = swarmLink.hero.version
  }

  if (library.socialVersion !== swarmLink.social.version) {
    if (fillSocial(library.social, swarmLink.social.points)) library.socialReady = true
    library.socialVersion = swarmLink.social.version
  }

  const shown: Station[] = []
  for (const station of director.order) {
    if (measure(station)) director.pulse = 1
    if (station.shown) shown.push(station)
  }
  const first = shown[0]
  if (!first) {
    swarm.points.visible = false
    return
  }

  const remaining = document.documentElement.scrollHeight - window.scrollY - window.innerHeight
  const reference = height * (0.5 + 0.4 * (1 - smooth(ramp(remaining, 0, height * 0.6))))
  const middle = (station: Station) => station.rect.y + station.rect.h / 2
  let i = 0
  while (i < shown.length - 1 && middle(shown[i + 1] ?? first) <= reference) i++
  let wantA = shown[i] ?? first
  let wantB = shown[i + 1] ?? wantA
  let p = 0
  if (wantA === wantB && i > 0) {
    wantA = shown[i - 1] ?? first
    p = 1
  } else if (wantA !== wantB) {
    const from = middle(wantA)
    const to = middle(wantB)
    p = smooth(ramp(to === from ? 1 : (reference - from) / (to - from), 0.2, 0.8))
  }
  const want = {
    from: { station: wantA, shape: current(wantA, library) },
    to: { station: wantB, shape: current(wantB, library) },
  }

  let f = director.flow
  if (!f) {
    f = { from: want.from, to: want.to, bridge: false, d: p }
    director.flow = f
  }
  const matches = !f.bridge && same(f.from, want.from) && same(f.to, want.to)
  if (matches) {
    f.d = calm ? p : f.d + (p - f.d) * (1 - Math.exp(-dt * FOLLOW))
    if (Math.abs(p - f.d) < REST) f.d = p
  } else {
    const at = f.d <= REST && !f.bridge ? f.from : f.d >= 1 - REST ? f.to : null
    if (at && same(at, want.from)) {
      Object.assign(f, { from: want.from, to: want.to, bridge: false, d: 0 })
    } else if (at && same(at, want.to)) {
      Object.assign(f, { from: want.from, to: want.to, bridge: false, d: 1 })
    } else if (at) {
      const target = p < 0.5 ? want.from : want.to
      const instant = calm || (at.station === target.station && at.shape.kind === HERO)
      Object.assign(f, { from: at, to: target, bridge: true, d: instant ? 1 : 0 })
    } else {
      const touches = (end: End) => same(end, want.from) || same(end, want.to)
      const goal = f.bridge || touches(f.to) ? 1 : touches(f.from) ? 0 : f.d > 0.5 ? 1 : 0
      const rate = f.from.station === f.to.station ? 1 / MORPH : 1 / TRAVEL
      f.d = calm
        ? goal
        : goal > f.d
          ? Math.min(goal, f.d + dt * rate)
          : Math.max(goal, f.d - dt * rate)
    }
  }

  const resting = !f.bridge && (f.d <= REST || f.d >= 1 - REST)
  const home = resting ? (f.d <= REST ? f.from : f.to) : null
  const lead = f.bridge ? null : f.d <= 1 - DOMINANT ? f.from : f.d >= DOMINANT ? f.to : null
  if (lead && !calm) {
    const station = lead.station
    const source = station.anchor.source
    if (source.kind === 'models' && lead.shape === current(station, library)) {
      station.cycle += dt
      if (station.cycle >= HOLD) {
        const next = (station.index + 1) % source.keys.length
        const key = source.keys[next]
        if (lead === home && next !== station.index && key && library.models.has(key)) {
          station.index = next
          station.cycle = 0
        } else {
          station.cycle = lead.shape.hold ? HOLD : 0
        }
      }
    }
  }

  if (home && home.shape === library.social && director.formed < 0) {
    director.formed = 0
    swarmLink.social.formed = true
  }
  if (director.formed >= 0) director.formed += calm ? 10 : dt

  for (const station of shown) {
    if (!calm && station.anchor.source.kind === 'models' && inView(station.rect, width, height))
      station.spin += dt * SPIN
  }
  director.pulse = Math.max(0, director.pulse - dt * 1.4)

  document.body.dataset.swarm = JSON.stringify({ from: f.from.station.anchor.source.kind, to: f.to.station.anchor.source.kind, d: +f.d.toFixed(3), p: +p.toFixed(3), bridge: f.bridge, lead: lead ? (lead === f.to ? 'to' : 'from') : null, home: home ? (home === f.to ? 'to' : 'from') : null, cycle: lead ? +lead.station.cycle.toFixed(2) : null, index: lead ? lead.station.index : null, fromTop: Math.round(f.from.station.rect.y), toTop: Math.round(f.to.station.rect.y) })
  bind(swarm, f)
  applySide(swarm.from, f.from, library, wpp, width, height)
  applySide(swarm.to, f.to, library, wpp, width, height)
  u.uMix.value = f.d
  u.uStream.value = f.from.station === f.to.station ? 0 : 1
  u.uCalm.value = calm ? 1 : 0
  if (!calm) u.uTime.value += dt
  u.uPixelRatio.value = state.viewport.dpr
  u.uPixel.value = wpp
  u.uViewH.value = height * wpp
  u.uPulse.value = calm ? 0 : director.pulse
  u.uFormed.value = director.formed
  u.uVisible.value = Math.min(1, u.uVisible.value + dt / 0.8)

  const heroFrom = f.from.shape.kind === HERO
  const heroTo = f.to.shape.kind === HERO
  swarmLink.handoff =
    heroFrom && heroTo
      ? 0
      : heroFrom
        ? smooth(ramp(f.d, 0, 0.2))
        : heroTo
          ? smooth(ramp(1 - f.d, 0, 0.2))
          : 1
  const hidden =
    (heroFrom && heroTo) ||
    (heroFrom && !f.bridge && f.d <= REST) ||
    (heroTo && !f.bridge && f.d >= 1 - REST)
  swarm.points.visible = !hidden

  const settling = director.formed >= 0 && director.formed < 2
  const busy = !resting || !matches || director.pulse > 0 || settling
  const seen =
    inView(f.from.station.rect, width, height) || inView(f.to.station.rect, width, height)
  if (busy || (!hidden && seen)) state.invalidate()
}

function Scene({ count, calm }: { count: number; calm: boolean }) {
  const [director] = useState(() => createDirector(count))
  const { swarm, library } = director
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    const worker = new Worker(new URL('../agv/agv.worker.ts', import.meta.url), {
      type: 'module',
    })
    const requested = new Set<ShowcaseModelKey>()
    worker.onmessage = (event: MessageEvent<AgvWorkerResult>) => {
      library.models.set(event.data.key, modelShape(event.data, count))
      invalidate()
    }
    const distance = (element: HTMLElement) => {
      const box = element.getBoundingClientRect()
      if (box.width === 0 && box.height === 0) return Infinity
      return Math.max(0, box.top - window.innerHeight, -box.bottom)
    }
    const request = () => {
      const anchors = [...listAnchors()]
        .sort((a, b) =>
          a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
        )
        .sort((a, b) => distance(a.element) - distance(b.element))
      for (const anchor of anchors) {
        if (anchor.source.kind !== 'models') continue
        const keys = anchor.source.keys.filter((key) => !requested.has(key))
        if (keys.length === 0) continue
        for (const key of keys) requested.add(key)
        const message: AgvWorkerRequest = { keys, scale: count < 40000 ? 0.35 : 0.9 }
        worker.postMessage(message)
      }
    }
    request()
    const stop = subscribeAnchors(() => {
      request()
      invalidate()
    })
    return () => {
      stop()
      worker.terminate()
    }
  }, [count, library, invalidate])

  useEffect(() => {
    const wake = () => invalidate()
    window.addEventListener('scroll', wake, { passive: true })
    window.addEventListener('resize', wake)
    window.addEventListener('pointerup', wake)
    swarmLink.social.live = true
    swarmLink.social.formed = false
    return () => {
      swarmLink.social.live = false
      window.removeEventListener('scroll', wake)
      window.removeEventListener('resize', wake)
      window.removeEventListener('pointerup', wake)
      swarmLink.handoff = 0
    }
  }, [invalidate])

  useEffect(
    () => () => {
      swarm.geometry.dispose()
      swarm.material.dispose()
      swarm.depth.dispose()
    },
    [swarm],
  )

  useFrame((state, delta) => direct(director, state, delta, calm))

  return <primitive object={swarm.points} />
}

export function SwarmScene({ calm }: { calm: boolean }) {
  const [count] = useState(() => (window.innerWidth < 1280 ? 32000 : 90000))

  return (
    <Canvas
      frameloop="demand"
      camera={{ position: [0, 0, DEPTH], fov: FOV, near: 0.1, far: 100 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
    >
      <Scene count={count} calm={calm} />
    </Canvas>
  )
}
