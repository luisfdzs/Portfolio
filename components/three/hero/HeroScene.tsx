'use client'

import { memo, useEffect, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from '@react-three/postprocessing'
import type { ChromaticAberrationEffect } from 'postprocessing'
import {
  AdditiveBlending,
  CatmullRomCurve3,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  ShaderMaterial,
  SphereGeometry,
  Vector2,
  Vector3,
  type BufferGeometry,
  type Camera,
} from 'three'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { swarmLink } from '@/components/three/swarm/registry'
import {
  BEAM_LENGTH,
  GLOBE_CENTER,
  GLOBE_RADIUS,
  NAME_Z,
  buildGeometry,
  streakGeometry,
} from './targets'
import { holdVertex, pointsFragment, pointsVertex, streakFragment, streakVertex } from './shaders'
import { atmosphereMaterial } from './globe'

const DURATION = 10
export type HeroClock = { t: number; playing: boolean; hover: boolean }
export const IDLE_AT = 0.6

type Key = { t: number; position: Vector3; target: Vector3; fov: number }

const v = (x: number, y: number, z: number) => new Vector3(x, y, z)

const KEYS: Key[] = [
  { t: 0, position: v(0, 0, 7.4), target: v(0, 0, 0), fov: 36 },
  { t: 1.3, position: v(0, 0, 6.3), target: v(0, 0, 0), fov: 38 },
  { t: 2.1, position: v(0.5, 0.35, 0.5), target: v(0, 0, -10), fov: 52 },
  { t: 3.4, position: v(0.4, 0.3, -36), target: v(0, 0.3, -50), fov: 58 },
  { t: 4.6, position: v(-2.6, 2.2, -40.5), target: v(0, 0.2, -60), fov: 48 },
  { t: 6.7, position: v(9.5, 3.8, -41), target: v(0, 0, -60), fov: 44 },
  { t: 8.6, position: v(0.6, 0.45, -37.5), target: v(0, 0.1, -53), fov: 40 },
  { t: DURATION, position: v(0, 0.3, -37), target: v(0, 0.1, -53), fov: 40 },
]

const RUSH: Key[] = [
  ...KEYS.slice(0, 4),
  { t: 4.5, position: v(-1.6, 3.4, -51.5), target: v(1.5, 1.2, -60), fov: 48 },
]

type Path = { keys: Key[]; position: CatmullRomCurve3; target: CatmullRomCurve3 }

function path(keys: Key[]): Path {
  return {
    keys,
    position: new CatmullRomCurve3(
      keys.map((key) => key.position),
      false,
      'centripetal',
    ),
    target: new CatmullRomCurve3(
      keys.map((key) => key.target),
      false,
      'centripetal',
    ),
  }
}

const rushPath = path(RUSH)
const mainPath = path(KEYS)

function keyParam(keys: Key[], t: number) {
  const last = keys[keys.length - 1]?.t ?? DURATION
  const clamped = Math.min(last, Math.max(0, t))
  let index = keys.findIndex((key, i) => clamped <= (keys[i + 1]?.t ?? last) && clamped >= key.t)
  if (index === -1) index = keys.length - 2
  const from = keys[index]
  const to = keys[index + 1] ?? from
  if (!from || !to) return { u: 0, fov: 40 }
  const local = to.t === from.t ? 0 : (clamped - from.t) / (to.t - from.t)
  const smooth = local * local * (3 - 2 * local)
  return {
    u: (index + local) / (keys.length - 1),
    fov: from.fov + (to.fov - from.fov) * smooth,
  }
}

const scratchPosition = new Vector3()
const scratchTarget = new Vector3()

function sample(t: number, position: Vector3, target: Vector3) {
  const blend = Math.min(1, Math.max(0, (t - 3.2) / 0.4))
  const mix = blend * blend * (3 - 2 * blend)
  const main = keyParam(KEYS, t)
  mainPath.position.getPoint(main.u, position)
  mainPath.target.getPoint(main.u, target)
  if (mix >= 1) return main.fov
  const rush = keyParam(RUSH, t)
  rushPath.position.getPoint(rush.u, scratchPosition)
  rushPath.target.getPoint(rush.u, scratchTarget)
  position.lerpVectors(scratchPosition, position, mix)
  target.lerpVectors(scratchTarget, target, mix)
  return rush.fov + (main.fov - rush.fov) * mix
}

const cameraPosition = new Vector3()
const cameraTarget = new Vector3()
const previous = new Vector3()
const previousTarget = new Vector3()
const velocity = new Vector3()

function placeCamera(camera: Camera, t: number) {
  const fov = sample(t, cameraPosition, cameraTarget)
  sample(t - 0.05, previous, previousTarget)
  velocity.copy(cameraPosition).sub(previous).divideScalar(0.05)
  camera.position.copy(cameraPosition)
  camera.lookAt(cameraTarget)
  if (camera instanceof PerspectiveCamera && camera.fov !== fov) {
    camera.fov = fov
    camera.updateProjectionMatrix()
  }
  return velocity
}

const projector = new PerspectiveCamera()
const projected = new Vector3()
const X_AXIS = new Vector3(1, 0, 0)
const Z_AXIS = new Vector3(0, 0, 1)

function aim(t: number, aspect: number) {
  projector.fov = sample(t, cameraPosition, cameraTarget)
  projector.aspect = aspect
  projector.position.copy(cameraPosition)
  projector.lookAt(cameraTarget)
  projector.updateProjectionMatrix()
  projector.updateMatrixWorld()
}

function publishHandoff(geometry: BufferGeometry, aspect: number) {
  const position = geometry.getAttribute('position')
  const part = geometry.getAttribute('aPart')
  const name = geometry.getAttribute('aName')
  const tone = geometry.getAttribute('aTone')
  const total = position.count
  const button: number[] = []
  const title: number[] = []
  const push = (list: number[], shade: number) => {
    projected.project(projector)
    list.push(projected.x * 0.5, projected.y * 0.5, shade)
  }

  aim(IDLE_AT, aspect)
  for (let i = 0; i < total; i++) {
    const ring = part.getX(i)
    if (ring > 0.5) {
      const angle = part.getY(i)
      const radius = part.getZ(i)
      projected.set(Math.cos(angle) * radius, Math.sin(angle) * radius, position.getZ(i))
      if (ring < 1.5) projected.applyAxisAngle(X_AXIS, 1.2)
      else projected.applyAxisAngle(X_AXIS, -1.3).applyAxisAngle(Z_AXIS, 0.15)
    } else {
      projected.set(position.getX(i), position.getY(i), position.getZ(i))
    }
    projected.applyAxisAngle(X_AXIS, 0.12)
    push(button, tone.getX(i))
  }

  aim(DURATION, aspect)
  for (let i = 0; i < total; i++) {
    if (tone.getW(i) < 0.5) continue
    projected.set(name.getX(i), name.getY(i) + 0.35, name.getZ(i) + NAME_Z)
    push(title, tone.getZ(i))
  }

  swarmLink.hero.button = new Float32Array(button)
  swarmLink.hero.name = new Float32Array(title)
  swarmLink.hero.version++
}

function particleBudget() {
  const narrow = window.innerWidth < 768
  const cores = navigator.hardwareConcurrency || 4
  if (narrow || cores <= 4) return 50000
  if (cores >= 8 && window.innerWidth >= 1200) return 130000
  return 110000
}

function makeUniforms() {
  return {
    uTime: { value: 0 },
    uGlobeRot: { value: 0 },
    uGlobe: { value: GLOBE_CENTER.clone() },
    uGlobeR: { value: GLOBE_RADIUS },
    uNameZ: { value: NAME_Z },
    uBeamLength: { value: BEAM_LENGTH },
    uCamVel: { value: new Vector3() },
    uStreak: { value: 0.045 },
    uIntro: { value: 0 },
    uHover: { value: 0 },
    uHold: { value: 0 },
    uWall: { value: 0 },
    uPointer: { value: new Vector2() },
    uSpin: { value: 0 },
    uSize: { value: 15 },
    uPixelRatio: { value: 1 },
  }
}

function buildScene(count: number, portrait: boolean) {
  const geometry = buildGeometry(count, portrait)
  const globeRadius = portrait ? GLOBE_RADIUS * 0.75 : GLOBE_RADIUS
  const uniforms = makeUniforms()
  uniforms.uGlobeR.value = globeRadius
  const points = new Points(
    geometry,
    new ShaderMaterial({
      uniforms,
      vertexShader: pointsVertex,
      fragmentShader: pointsFragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  )
  const streaks = new LineSegments(
    streakGeometry(geometry, 0.28),
    new ShaderMaterial({
      uniforms,
      vertexShader: streakVertex,
      fragmentShader: streakFragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  )
  const hold = new Points(
    geometry,
    new ShaderMaterial({
      uniforms,
      vertexShader: holdVertex,
      fragmentShader: pointsFragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  )
  hold.frustumCulled = false
  hold.visible = false
  const occluder = new Mesh(
    new SphereGeometry(globeRadius * 0.985, 64, 48),
    new MeshBasicMaterial({ color: '#050506' }),
  )
  const atmosphere = new Mesh(
    new SphereGeometry(globeRadius * 1.08, 64, 48),
    atmosphereMaterial('#e0a458'),
  )
  occluder.position.copy(GLOBE_CENTER)
  atmosphere.position.copy(GLOBE_CENTER)
  occluder.renderOrder = -1
  atmosphere.renderOrder = 2
  points.frustumCulled = false
  streaks.frustumCulled = false
  return { points, streaks, uniforms, occluder, atmosphere, hold }
}

type Scene = ReturnType<typeof buildScene>

function drive(
  scene: Scene,
  camera: Camera,
  t: number,
  pixelRatio: number,
  aberration: ChromaticAberrationEffect | null,
  wall: number,
  hover: boolean,
  pointer: Vector2,
  delta: number,
) {
  const speed = placeCamera(camera, t)
  const u = scene.uniforms
  u.uTime.value = t
  u.uWall.value = wall
  u.uHover.value += ((hover ? 1 : 0) - u.uHover.value) * 0.12
  u.uPointer.value.lerp(pointer, 0.06)
  u.uSpin.value += Math.min(delta, 1 / 20) * (0.35 + 1.6 * u.uHover.value)
  u.uGlobeRot.value = -1.25 + t * 0.07
  u.uCamVel.value.copy(speed)
  scene.streaks.visible = speed.length() > 2
  u.uIntro.value = Math.min(1, wall / 0.8)
  u.uPixelRatio.value = pixelRatio
  const grow = Math.min(1, Math.max(0, (t - 3.6) / 1.4))
  scene.occluder.visible = grow > 0.001
  scene.occluder.scale.setScalar(grow * grow * (3 - 2 * grow))
  const halo = Math.min(1, Math.max(0, (t - 4.6) / 1.0))
  const handover = Math.min(1, Math.max(0, (t - 6.3) / 0.7))
  u.uHold.value = handover * handover * (3 - 2 * handover)
  scene.hold.visible = handover > 0.001
  const atmosphere = scene.atmosphere.material as ShaderMaterial
  if (atmosphere.uniforms.uOpacity) atmosphere.uniforms.uOpacity.value = halo
  scene.atmosphere.visible = halo > 0.001
  if (aberration) {
    const rush = Math.min(1, speed.length() / 40)
    const charge = u.uHover.value * (t < 0.61 ? 1 : 0)
    aberration.offset.set(0.0022 * rush + 0.0014 * charge, 0.0012 * rush + 0.0006 * charge)
  }
}

function advance(clock: HeroClock, delta: number, still: boolean) {
  if (still) clock.t = Math.max(clock.t, DURATION + 2)
  if (!clock.playing && clock.t < IDLE_AT) clock.t = IDLE_AT
  if (clock.playing) clock.t = Math.min(clock.t + Math.min(delta, 1 / 20), DURATION + 3600)
  return clock.t
}

function Particles({
  clock,
  aberration,
  still,
}: {
  clock: RefObject<HeroClock>
  aberration: RefObject<ChromaticAberrationEffect | null>
  still: boolean
}) {
  const [scene] = useState(() =>
    buildScene(particleBudget(), window.innerWidth / window.innerHeight < 0.8),
  )
  const size = useThree((state) => state.size)

  useEffect(() => {
    if (size.height > 0) publishHandoff(scene.points.geometry, size.width / size.height)
  }, [scene, size.width, size.height])

  useFrame((state, delta) => {
    const t = advance(clock.current, delta, still)
    drive(
      scene,
      state.camera,
      t,
      state.viewport.dpr,
      aberration.current,
      state.clock.elapsedTime,
      clock.current.hover,
      state.pointer,
      delta,
    )
  })

  return (
    <>
      <primitive object={scene.occluder} />
      <primitive object={scene.atmosphere} />
      <primitive object={scene.hold} />
      <primitive object={scene.streaks} />
      <primitive object={scene.points} />
    </>
  )
}

export const HeroScene = memo(function HeroScene({
  clock,
  paused,
}: {
  clock: RefObject<HeroClock>
  paused: boolean
}) {
  const reduced = useReducedMotion()
  const aberration = useRef<ChromaticAberrationEffect | null>(null)

  return (
    <Canvas
      frameloop={paused ? 'never' : 'always'}
      camera={{ position: [0, 0, 6.9], fov: 37, near: 0.1, far: 300 }}
      dpr={1}
      gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      eventSource={document.body}
      eventPrefix="client"
    >
      <Particles clock={clock} aberration={aberration} still={reduced} />
      <EffectComposer multisampling={0} resolutionScale={0.5}>
        <Bloom
          mipmapBlur
          intensity={1.15}
          luminanceThreshold={0.42}
          luminanceSmoothing={0.3}
          radius={0.72}
        />
        <ChromaticAberration
          ref={aberration}
          offset={new Vector2(0, 0)}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette offset={0.24} darkness={0.82} />
      </EffectComposer>
    </Canvas>
  )
})
