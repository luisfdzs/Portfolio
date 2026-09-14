'use client'

import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import gsap from 'gsap'
import { DoubleSide, Group, Mesh } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

const ZOOM_MIN_DISTANCE = 2.6
const ZOOM_MAX_DISTANCE = 7

const DESK_WIDTH = 3
const DESK_DEPTH = 1.3
const DESK_THICKNESS = 0.12

const SIT_HEIGHT = 0.78
const STAND_HEIGHT = 1.18

const LEG_XZ: readonly [number, number][] = [
  [-1.4, -0.58],
  [1.4, -0.58],
  [-1.4, 0.58],
  [1.4, 0.58],
]

const HOUSING_COLOR = '#0b0d10'
const METAL_COLOR = '#2a3037'
const DARK_COLOR = '#1b1f25'
const GLOW_COLOR = '#e0a458'

const SCREEN_RADIUS = 1.7
const SCREEN_ARC = 1.3
const SCREEN_HEIGHT = 0.42
const SCREEN_Z_LOCAL = -0.36
const SCREEN_CENTER_Y_LOCAL = 0.58
const CYLINDER_ORIGIN_Z = SCREEN_Z_LOCAL + SCREEN_RADIUS
const CYLINDER_THETA_START = Math.PI - SCREEN_ARC / 2

function UltrawideMonitor() {
  return (
    <group>
      <mesh position={[0, SCREEN_CENTER_Y_LOCAL, CYLINDER_ORIGIN_Z]}>
        <cylinderGeometry
          args={[SCREEN_RADIUS + 0.03, SCREEN_RADIUS + 0.03, SCREEN_HEIGHT + 0.07, 64, 1, true, CYLINDER_THETA_START, SCREEN_ARC]}
        />
        <meshStandardMaterial color={HOUSING_COLOR} roughness={0.55} side={DoubleSide} />
      </mesh>
      <mesh position={[0, SCREEN_CENTER_Y_LOCAL, CYLINDER_ORIGIN_Z]}>
        <cylinderGeometry
          args={[SCREEN_RADIUS, SCREEN_RADIUS, SCREEN_HEIGHT, 64, 1, true, CYLINDER_THETA_START, SCREEN_ARC]}
        />
        <meshStandardMaterial
          color={GLOW_COLOR}
          emissive={GLOW_COLOR}
          emissiveIntensity={0.85}
          toneMapped={false}
          side={DoubleSide}
        />
      </mesh>
      <group position={[0, SCREEN_CENTER_Y_LOCAL + SCREEN_HEIGHT / 2 + 0.05, SCREEN_Z_LOCAL + 0.02]}>
        <mesh>
          <boxGeometry args={[0.1, 0.045, 0.045]} />
          <meshStandardMaterial color={METAL_COLOR} roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.02, 12]} />
          <meshStandardMaterial color={HOUSING_COLOR} roughness={0.2} metalness={0.6} />
        </mesh>
      </group>
      <mesh position={[0, SCREEN_CENTER_Y_LOCAL - SCREEN_HEIGHT / 2 - 0.14, SCREEN_Z_LOCAL]}>
        <boxGeometry args={[0.08, 0.28, 0.05]} />
        <meshStandardMaterial color={METAL_COLOR} roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.005, SCREEN_Z_LOCAL]}>
        <boxGeometry args={[0.5, 0.01, 0.3]} />
        <meshStandardMaterial color={DARK_COLOR} roughness={0.6} />
      </mesh>
    </group>
  )
}

function HeightButton({
  label,
  position,
  onActivate,
}: {
  label: 'up' | 'down'
  position: [number, number, number]
  onActivate: () => void
}) {
  return (
    <mesh
      position={position}
      onClick={(event) => {
        event.stopPropagation()
        onActivate()
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <cylinderGeometry args={[0.035, 0.035, 0.015, 20]} />
      <meshStandardMaterial color={label === 'up' ? GLOW_COLOR : METAL_COLOR} roughness={0.4} metalness={0.3} />
    </mesh>
  )
}

function LiftableDesk() {
  const root = useRef<Group>(null)
  const liftGroup = useRef<Group>(null)
  const legRefs = useRef<Mesh[]>([])
  const height = useRef({ value: SIT_HEIGHT })
  const [standing, setStanding] = useState(false)

  useEffect(() => {
    if (!root.current) return
    gsap.fromTo(
      root.current.scale,
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 1, z: 1, duration: 1.1, ease: 'back.out(1.6)' },
    )
  }, [])

  useFrame(() => {
    const deskBottomY = height.current.value - DESK_THICKNESS
    if (liftGroup.current) liftGroup.current.position.y = height.current.value
    for (const leg of legRefs.current) {
      if (!leg) continue
      leg.scale.y = deskBottomY
      leg.position.y = deskBottomY / 2
    }
  })

  const toggleHeight = () => {
    const next = !standing
    setStanding(next)
    gsap.to(height.current, {
      value: next ? STAND_HEIGHT : SIT_HEIGHT,
      duration: 1.3,
      ease: 'power2.inOut',
    })
  }

  return (
    <group ref={root}>
      {LEG_XZ.map(([x, z], index) => (
        <mesh
          key={`${x}-${z}`}
          ref={(mesh) => {
            legRefs.current[index] = mesh as Mesh
          }}
          position={[x, SIT_HEIGHT / 2, z]}
          scale={[1, SIT_HEIGHT, 1]}
        >
          <boxGeometry args={[0.09, 1, 0.09]} />
          <meshStandardMaterial color={METAL_COLOR} roughness={0.4} metalness={0.5} />
        </mesh>
      ))}
      <group ref={liftGroup} position={[0, SIT_HEIGHT, 0]}>
        <mesh position={[0, -DESK_THICKNESS / 2, 0]}>
          <boxGeometry args={[DESK_WIDTH, DESK_THICKNESS, DESK_DEPTH]} />
          <meshStandardMaterial color="#5c4028" roughness={0.55} metalness={0.05} />
        </mesh>
        <UltrawideMonitor />
        <group position={[DESK_WIDTH / 2 - 0.4, 0.008, DESK_DEPTH / 2 - 0.28]}>
          <mesh>
            <boxGeometry args={[0.18, 0.016, 0.06]} />
            <meshStandardMaterial color={DARK_COLOR} roughness={0.6} />
          </mesh>
          <HeightButton label="up" position={[-0.045, 0.012, 0]} onActivate={toggleHeight} />
          <HeightButton label="down" position={[0.045, 0.012, 0]} onActivate={toggleHeight} />
        </group>
      </group>
    </group>
  )
}

function CtrlWheelZoom({ controls }: { controls: OrbitControlsImpl | null }) {
  const { camera, gl } = useThree()

  useEffect(() => {
    const element = gl.domElement

    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey || !controls) return
      event.preventDefault()

      const offset = camera.position.clone().sub(controls.target)
      const distance = offset.length()
      const nextDistance = Math.min(
        ZOOM_MAX_DISTANCE,
        Math.max(ZOOM_MIN_DISTANCE, distance * (1 + event.deltaY * 0.001)),
      )
      camera.position.copy(controls.target).add(offset.normalize().multiplyScalar(nextDistance))
    }

    element.addEventListener('wheel', handleWheel, { passive: false })
    return () => element.removeEventListener('wheel', handleWheel)
  }, [camera, controls, gl])

  return null
}

export function TableScene() {
  const [controls, setControls] = useState<OrbitControlsImpl | null>(null)

  return (
    <Canvas camera={{ position: [0, 2.05, 4.6], fov: 40 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 4]} intensity={1.2} />
      <pointLight position={[0, 1.6, -0.3]} intensity={0.4} color={GLOW_COLOR} />
      <LiftableDesk />
      <OrbitControls
        ref={setControls}
        target={[0, 0.9, -0.1]}
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={1.4}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.05}
      />
      <CtrlWheelZoom controls={controls} />
    </Canvas>
  )
}
