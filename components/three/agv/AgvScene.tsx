'use client'

import { memo, useEffect, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  PerspectiveCamera,
  Points,
  ShaderMaterial,
  TOUCH,
  Vector3,
  type Camera,
} from 'three'
import { buildAgvGeometry, type AgvSpec } from './geometry'
import { agvModels, type AgvModelKey } from './models'
import { agvFragment, agvVertex } from './shaders'

export const AGV_CYCLE = 17
export const AGV_FORMED_AT = 8

export type AgvClock = { t: number; playing: boolean; scrubbing: boolean }
export type AgvPhase = 'core' | 'explode' | 'assemble' | 'drive'

const ramp = (t: number, from: number, to: number) =>
  Math.min(1, Math.max(0, (t - from) / (to - from)))
const smooth = (t: number) => t * t * (3 - 2 * t)

export function agvPhase(t: number): AgvPhase {
  if (t < 1.4 || t >= 13.2) return 'core'
  if (t < 3.2) return 'explode'
  if (t < 8.4) return 'assemble'
  return 'drive'
}

function timeline(t: number, spec: AgvSpec) {
  const lifts = spec.lift > 0
  return {
    charge: t < 2.6 ? ramp(t, 0.3, 1.4) : 0,
    explode: ramp(t, 1.4, 2.6),
    form: ramp(t, 3.2, 7.4),
    drive: smooth(ramp(t, 8.4, lifts ? 10.6 : 11.6)) * spec.drive,
    lift: lifts ? smooth(ramp(t, 10.5, 12.4)) * spec.lift : 0,
    collapse: ramp(t, 13.2, 15.6),
  }
}

const VIEW = new Vector3(0.5, 0.36, 0.8).normalize()

function buildPoints(spec: AgvSpec, scale: number) {
  const data = buildAgvGeometry(spec, scale)
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(data.position, 3))
  geometry.setAttribute('aStart', new BufferAttribute(data.start, 3))
  geometry.setAttribute('aCore', new BufferAttribute(data.core, 3))
  geometry.setAttribute('aTone', new BufferAttribute(data.tone, 1))
  geometry.setAttribute('aDelay', new BufferAttribute(data.delay, 1))
  geometry.setAttribute('aSeed', new BufferAttribute(data.seed, 1))
  geometry.setAttribute('aGlow', new BufferAttribute(data.glow, 1))
  geometry.setAttribute('aMove', new BufferAttribute(data.move, 1))
  geometry.setAttribute('aNormal', new BufferAttribute(data.normal, 3))
  const material = new ShaderMaterial({
    uniforms: {
      uCharge: { value: 0 },
      uExplode: { value: 0 },
      uForm: { value: 0 },
      uDrive: { value: 0 },
      uLift: { value: 0 },
      uLiftRatio: { value: 0 },
      uCollapse: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: 11 },
      uPixelRatio: { value: 1 },
      uCenter: { value: new Vector3(spec.core.x, spec.core.y, 0) },
    },
    vertexShader: agvVertex,
    fragmentShader: agvFragment,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const points = new Points(geometry, material)
  points.frustumCulled = false
  return { points, material, spec, vehicleCount: data.vehicleCount }
}

type AgvPoints = ReturnType<typeof buildPoints>

function advance(
  scene: AgvPoints,
  clock: AgvClock,
  delta: number,
  pixelRatio: number,
  still: boolean,
) {
  const step = Math.min(delta, 1 / 20)
  if (clock.playing && !clock.scrubbing) clock.t = (clock.t + step) % AGV_CYCLE
  const now = timeline(clock.t, scene.spec)
  const u = scene.material.uniforms
  if (u.uCharge) u.uCharge.value = now.charge
  if (u.uExplode) u.uExplode.value = now.explode
  if (u.uForm) u.uForm.value = now.form
  if (u.uDrive) u.uDrive.value = now.drive
  if (u.uLift) u.uLift.value = now.lift
  if (u.uLiftRatio) u.uLiftRatio.value = scene.spec.lift > 0 ? now.lift / scene.spec.lift : 0
  if (u.uCollapse) u.uCollapse.value = now.collapse
  if (u.uTime && !still) u.uTime.value += step
  if (u.uPixelRatio) u.uPixelRatio.value = pixelRatio
}

function connect(camera: Camera, element: HTMLCanvasElement, spec: AgvSpec, still: boolean) {
  const portrait = element.clientWidth / Math.max(1, element.clientHeight) < 0.8
  const target = new Vector3(...spec.target)
  camera.position
    .copy(VIEW)
    .multiplyScalar(portrait ? spec.portraitDistance : spec.distance)
    .add(target)
  if (camera instanceof PerspectiveCamera) camera.updateProjectionMatrix()

  const orbit = new OrbitControls(camera, element)
  orbit.target.copy(target)
  orbit.enableDamping = true
  orbit.enablePan = false
  orbit.enableZoom = false
  orbit.maxPolarAngle = Math.PI * 0.49
  orbit.autoRotate = !still
  orbit.autoRotateSpeed = 0.35
  orbit.touches = { ONE: null, TWO: TOUCH.ROTATE }
  element.style.touchAction = 'pan-y'
  orbit.update()
  return orbit
}

function Particles({
  spec,
  clock,
  still,
  onReady,
}: {
  spec: AgvSpec
  clock: RefObject<AgvClock>
  still: boolean
  onReady: (count: number) => void
}) {
  const [scene] = useState(() => buildPoints(spec, window.innerWidth < 768 ? 0.4 : 1))

  useEffect(() => {
    onReady(scene.vehicleCount)
    return () => {
      scene.points.geometry.dispose()
      scene.material.dispose()
    }
  }, [scene, onReady])

  useFrame((state, delta) => advance(scene, clock.current, delta, state.viewport.dpr, still))

  return <primitive object={scene.points} />
}

function Orbit({ spec, still }: { spec: AgvSpec; still: boolean }) {
  const camera = useThree((state) => state.camera)
  const element = useThree((state) => state.gl.domElement)
  const controls = useRef<OrbitControls | null>(null)

  useEffect(() => {
    const orbit = connect(camera, element, spec, still)
    controls.current = orbit
    return () => {
      orbit.dispose()
      controls.current = null
    }
  }, [camera, element, spec, still])

  useFrame(() => controls.current?.update())

  return null
}

export const AgvScene = memo(function AgvScene({
  model,
  clock,
  still,
  onReady,
}: {
  model: AgvModelKey
  clock: RefObject<AgvClock>
  still: boolean
  onReady: (count: number) => void
}) {
  const [spec] = useState(() => agvModels[model]())

  return (
    <Canvas
      camera={{ position: [6, 3, 8], fov: 35, near: 0.1, far: 100 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
    >
      <Particles spec={spec} clock={clock} still={still} onReady={onReady} />
      <Orbit spec={spec} still={still} />
      <EffectComposer multisampling={0} resolutionScale={0.5}>
        <Bloom
          mipmapBlur
          intensity={0.35}
          luminanceThreshold={0.75}
          luminanceSmoothing={0.3}
          radius={0.45}
        />
        <Vignette offset={0.24} darkness={0.78} />
      </EffectComposer>
    </Canvas>
  )
})
