'use client'

import { useEffect, useRef } from 'react'

type Pulse = { x: number; y: number; age: number }

type Beam = { axis: 0 | 1; line: number; pos: number; dir: 1 | -1 }

const TAU = Math.PI * 2

const BUCKETS = 12

const DOT_RADIUS = { min: 1, max: 2.6 }
const DOT_ALPHA = { min: 0.24, max: 0.82 }

const AMBIENT = { base: 0.14, wave: 0.06, speed: 0.5 }

const PUSH = 15

const LINK_FROM = 0.28

const PULSE = { speed: 620, band: 105, life: 1.5, push: 11 }

const BEAM = { speed: 880, trail: 230, head: 26 }

const BEAM_EVERY = { min: 2.4, max: 5.2 }

const IDLE_AFTER = 2.4

const EASE = { energy: 11, displacement: 7, damp: 6 }

const TEXT = { damp: 0.12, padX: 26, padY: 12, every: 0.06 }

type CaretDoc = Document & {
  caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null
  caretRangeFromPoint?: (x: number, y: number) => Range | null
}

function spacingFor(width: number) {
  if (width < 640) return 25
  if (width < 1280) return 29
  return 34
}

function radiusFor(width: number, height: number) {
  return Math.max(150, Math.min(320, Math.min(width, height) * 0.34))
}

function readColor(name: string, fallback: [number, number, number]): [number, number, number] {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  if (!/^#[0-9a-f]{6}$/i.test(raw)) return fallback

  const value = Number.parseInt(raw.slice(1), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

export function SiteField() {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const cold = readColor('--color-paper-faint', [109, 116, 124])
    const warm = readColor('--color-signal', [224, 164, 88])

    const bucketFill: string[] = []
    const bucketRadius: number[] = []
    for (let b = 0; b < BUCKETS; b++) {
      const t = b / (BUCKETS - 1)
      const ramp = Math.pow(t, 0.6)
      const r = Math.round(cold[0] + (warm[0] - cold[0]) * ramp)
      const g = Math.round(cold[1] + (warm[1] - cold[1]) * ramp)
      const bl = Math.round(cold[2] + (warm[2] - cold[2]) * ramp)
      const alpha = DOT_ALPHA.min + (DOT_ALPHA.max - DOT_ALPHA.min) * t
      bucketFill.push(`rgba(${r},${g},${bl},${alpha.toFixed(3)})`)
      bucketRadius.push(DOT_RADIUS.min + (DOT_RADIUS.max - DOT_RADIUS.min) * t)
    }

    const linkColor = `rgba(${warm[0]},${warm[1]},${warm[2]},`

    const halo = document.createElement('canvas')
    halo.width = 256
    halo.height = 256
    const haloCtx = halo.getContext('2d')
    if (haloCtx) {
      const gradient = haloCtx.createRadialGradient(128, 128, 0, 128, 128, 128)
      gradient.addColorStop(0, `rgba(${warm[0]},${warm[1]},${warm[2]},0.2)`)
      gradient.addColorStop(0.45, `rgba(${warm[0]},${warm[1]},${warm[2]},0.06)`)
      gradient.addColorStop(1, `rgba(${warm[0]},${warm[1]},${warm[2]},0)`)
      haloCtx.fillStyle = gradient
      haloCtx.fillRect(0, 0, 256, 256)
    }

    let width = 0
    let height = 0
    let cols = 0
    let rows = 0
    let spacing = 0
    let originX = 0
    let originY = 0
    let lightRadius = 0

    let energy = new Float32Array(0)
    let dispX = new Float32Array(0)
    let dispY = new Float32Array(0)
    let toEnergy = new Float32Array(0)
    let toX = new Float32Array(0)
    let toY = new Float32Array(0)

    const pulses: Pulse[] = []
    const beams: Beam[] = []
    let untilBeam = 1.4

    const pointer = {
      x: 0,
      y: 0,
      weight: 0,
      want: 0,
      still: 0,
      seen: false,
      damp: 1,
      onText: false,
      probe: false,
      sinceProbe: 0,
    }

    const caretDoc = document as CaretDoc
    const probeRange = document.createRange()

    const overText = (x: number, y: number) => {
      let node: Node | null = null
      let offset = 0

      if (caretDoc.caretPositionFromPoint) {
        const spot = caretDoc.caretPositionFromPoint(x, y)
        if (spot) {
          node = spot.offsetNode
          offset = spot.offset
        }
      } else if (caretDoc.caretRangeFromPoint) {
        const spot = caretDoc.caretRangeFromPoint(x, y)
        if (spot) {
          node = spot.startContainer
          offset = spot.startOffset
        }
      }

      if (!node || node.nodeType !== Node.TEXT_NODE) return false

      const length = node.nodeValue?.length ?? 0
      if (length === 0) return false

      const from = Math.min(offset, length - 1)
      probeRange.setStart(node, from)
      probeRange.setEnd(node, from + 1)

      for (const rect of probeRange.getClientRects()) {
        if (rect.width === 0 || rect.height === 0) continue
        if (
          x >= rect.left - TEXT.padX &&
          x <= rect.right + TEXT.padX &&
          y >= rect.top - TEXT.padY &&
          y <= rect.bottom + TEXT.padY
        ) {
          return true
        }
      }

      return false
    }

    let clock = 0
    let frame = 0
    let previous = 0
    let running = false

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let motion = !reduced.matches

    const measure = () => {
      const box = host.getBoundingClientRect()

      const nextWidth = Math.max(1, Math.round(box.width))
      const nextHeight = Math.max(1, Math.round(box.height))
      if (nextWidth === width && nextHeight === height) return

      width = nextWidth
      height = nextHeight

      const ratio = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)

      spacing = spacingFor(width)
      lightRadius = radiusFor(width, height)

      cols = Math.ceil(width / spacing) + 3
      rows = Math.ceil(height / spacing) + 3
      originX = (width - (cols - 1) * spacing) / 2
      originY = (height - (rows - 1) * spacing) / 2

      const count = cols * rows
      energy = new Float32Array(count)
      dispX = new Float32Array(count)
      dispY = new Float32Array(count)
      toEnergy = new Float32Array(count)
      toX = new Float32Array(count)
      toY = new Float32Array(count)
    }

    const light = (cx: number, cy: number, radius: number, strength: number, push: number) => {
      if (strength <= 0.001) return

      const from = Math.max(0, Math.floor((cx - radius - originX) / spacing))
      const to = Math.min(cols - 1, Math.ceil((cx + radius - originX) / spacing))
      const top = Math.max(0, Math.floor((cy - radius - originY) / spacing))
      const bottom = Math.min(rows - 1, Math.ceil((cy + radius - originY) / spacing))
      const radius2 = radius * radius

      for (let gy = top; gy <= bottom; gy++) {
        const dy = originY + gy * spacing - cy
        const base = gy * cols
        for (let gx = from; gx <= to; gx++) {
          const dx = originX + gx * spacing - cx
          const distance2 = dx * dx + dy * dy
          if (distance2 > radius2) continue

          const distance = Math.sqrt(distance2)
          const fall = 1 - distance / radius
          const power = fall * fall * strength

          const index = base + gx
          toEnergy[index] = toEnergy[index]! + power
          if (distance > 0.001) {
            const scale = (power * push) / distance
            toX[index] = toX[index]! + dx * scale
            toY[index] = toY[index]! + dy * scale
          }
        }
      }
    }

    const pulse = (x: number, y: number, age: number) => {
      const radius = age * PULSE.speed
      const fade = Math.max(0, 1 - age / PULSE.life)
      if (fade <= 0) return

      const reach = radius + PULSE.band
      const from = Math.max(0, Math.floor((x - reach - originX) / spacing))
      const to = Math.min(cols - 1, Math.ceil((x + reach - originX) / spacing))
      const top = Math.max(0, Math.floor((y - reach - originY) / spacing))
      const bottom = Math.min(rows - 1, Math.ceil((y + reach - originY) / spacing))

      for (let gy = top; gy <= bottom; gy++) {
        const dy = originY + gy * spacing - y
        const base = gy * cols
        for (let gx = from; gx <= to; gx++) {
          const dx = originX + gx * spacing - x
          const distance = Math.sqrt(dx * dx + dy * dy)
          const offset = Math.abs(distance - radius)
          if (offset > PULSE.band) continue

          const fall = 1 - offset / PULSE.band
          const power = fall * fall * fade
          const index = base + gx
          toEnergy[index] = toEnergy[index]! + power * 1.2
          if (distance > 0.001) {
            const scale = (power * PULSE.push) / distance
            toX[index] = toX[index]! + dx * scale
            toY[index] = toY[index]! + dy * scale
          }
        }
      }
    }

    const beam = (item: Beam) => {
      const along = item.axis === 0 ? cols : rows
      const origin = item.axis === 0 ? originX : originY
      const back = item.dir > 0 ? item.pos - BEAM.trail : item.pos - BEAM.head
      const front = item.dir > 0 ? item.pos + BEAM.head : item.pos + BEAM.trail
      const from = Math.max(0, Math.floor((back - origin) / spacing))
      const to = Math.min(along - 1, Math.ceil((front - origin) / spacing))

      for (let step = from; step <= to; step++) {
        const behind = (origin + step * spacing - item.pos) * -item.dir
        if (behind < -BEAM.head || behind > BEAM.trail) continue

        const fall = behind < 0 ? 1 + behind / BEAM.head : 1 - behind / BEAM.trail
        const index = item.axis === 0 ? item.line * cols + step : step * cols + item.line
        toEnergy[index] = toEnergy[index]! + fall * fall * 1.3
      }
    }

    const draw = (delta: number) => {
      toEnergy.fill(0)
      toX.fill(0)
      toY.fill(0)

      const reach = pointer.weight * pointer.damp
      light(pointer.x, pointer.y, lightRadius, reach, PUSH)

      const drift = 1 - pointer.weight
      if (drift > 0.001) {
        const x = width * (0.5 + 0.33 * Math.sin(clock * 0.11))
        const y = height * (0.45 + 0.32 * Math.sin(clock * 0.157 + 1.1))
        light(x, y, lightRadius * 1.1, drift * 0.85, PUSH * 0.8)
      }

      for (const item of pulses) pulse(item.x, item.y, item.age)
      for (const item of beams) beam(item)

      ctx.clearRect(0, 0, width, height)

      const paths: Path2D[] = []
      for (let b = 0; b < BUCKETS; b++) paths.push(new Path2D())

      const catchEnergy = 1 - Math.exp(-delta * EASE.energy)
      const catchDisplacement = 1 - Math.exp(-delta * EASE.displacement)

      for (let gy = 0; gy < rows; gy++) {
        const base = gy * cols
        const y0 = originY + gy * spacing

        for (let gx = 0; gx < cols; gx++) {
          const index = base + gx
          const x0 = originX + gx * spacing

          const ambient =
            AMBIENT.base + AMBIENT.wave * Math.sin(x0 * 0.013 + y0 * 0.019 + clock * AMBIENT.speed)
          let target = toEnergy[index]! + ambient
          if (target > 1) target = 1

          const level = energy[index]! + (target - energy[index]!) * catchEnergy
          energy[index] = level
          dispX[index] = dispX[index]! + (toX[index]! - dispX[index]!) * catchDisplacement
          dispY[index] = dispY[index]! + (toY[index]! - dispY[index]!) * catchDisplacement

          if (level < 0.014) continue

          let bucket = (level * BUCKETS) | 0
          if (bucket >= BUCKETS) bucket = BUCKETS - 1

          const radius = bucketRadius[bucket]!
          const path = paths[bucket]!
          const x = x0 + dispX[index]!
          const y = y0 + dispY[index]!
          path.moveTo(x + radius, y)
          path.arc(x, y, radius, 0, TAU)
        }
      }

      const links: Path2D[] = [new Path2D(), new Path2D(), new Path2D(), new Path2D()]
      for (let gy = 0; gy < rows; gy++) {
        const base = gy * cols
        for (let gx = 0; gx < cols; gx++) {
          const index = base + gx
          const level = energy[index]!
          if (level < LINK_FROM) continue

          const x = originX + gx * spacing + dispX[index]!
          const y = originY + gy * spacing + dispY[index]!

          for (let side = 0; side < 2; side++) {
            const other =
              side === 0 ? (gx + 1 < cols ? index + 1 : -1) : gy + 1 < rows ? index + cols : -1
            if (other < 0) continue

            const otherLevel = energy[other]!
            if (otherLevel < LINK_FROM) continue

            const strength = (Math.min(level, otherLevel) - LINK_FROM) / (1 - LINK_FROM)
            let step = (strength * links.length) | 0
            if (step >= links.length) step = links.length - 1

            const ox = side === 0 ? gx + 1 : gx
            const oy = side === 0 ? gy : gy + 1
            const link = links[step]!
            link.moveTo(x, y)
            link.lineTo(
              originX + ox * spacing + dispX[other]!,
              originY + oy * spacing + dispY[other]!,
            )
          }
        }
      }

      ctx.lineWidth = 0.75
      for (let step = 0; step < links.length; step++) {
        ctx.strokeStyle = `${linkColor}${(0.04 + step * 0.045).toFixed(3)})`
        ctx.stroke(links[step]!)
      }

      for (let b = 0; b < BUCKETS; b++) {
        ctx.fillStyle = bucketFill[b]!
        ctx.fill(paths[b]!)
      }

      ctx.lineWidth = 1
      for (const item of beams) {
        const headX = item.axis === 0 ? item.pos : originX + item.line * spacing
        const headY = item.axis === 0 ? originY + item.line * spacing : item.pos
        const tailX = item.axis === 0 ? item.pos - item.dir * BEAM.trail : headX
        const tailY = item.axis === 0 ? headY : item.pos - item.dir * BEAM.trail

        const trace = ctx.createLinearGradient(tailX, tailY, headX, headY)
        trace.addColorStop(0, `${linkColor}0)`)
        trace.addColorStop(1, `${linkColor}0.34)`)
        ctx.strokeStyle = trace
        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(headX, headY)
        ctx.stroke()
      }

      if (haloCtx) {
        ctx.globalCompositeOperation = 'lighter'
        const size = lightRadius * 3.4
        if (reach > 0.01) {
          ctx.globalAlpha = reach
          ctx.drawImage(halo, pointer.x - size / 2, pointer.y - size / 2, size, size)
        }
        if (drift > 0.01) {
          const x = width * (0.5 + 0.33 * Math.sin(clock * 0.11))
          const y = height * (0.45 + 0.32 * Math.sin(clock * 0.157 + 1.1))
          ctx.globalAlpha = drift * 0.85
          ctx.drawImage(halo, x - size / 2, y - size / 2, size, size)
        }
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = 'source-over'
      }
    }

    const step = (now: number) => {
      const delta = previous ? Math.min(0.05, (now - previous) / 1000) : 1 / 60
      previous = now
      clock += delta

      pointer.still += delta
      if (pointer.still > IDLE_AFTER) pointer.want = 0
      pointer.weight += (pointer.want - pointer.weight) * (1 - Math.exp(-delta * 3))

      pointer.sinceProbe += delta
      if (pointer.probe && pointer.sinceProbe >= TEXT.every) {
        pointer.probe = false
        pointer.sinceProbe = 0
        pointer.onText = pointer.seen && overText(pointer.x, pointer.y)
      }

      const damp = pointer.onText ? TEXT.damp : 1
      pointer.damp += (damp - pointer.damp) * (1 - Math.exp(-delta * EASE.damp))

      for (let i = pulses.length - 1; i >= 0; i--) {
        const item = pulses[i]!
        item.age += delta
        if (item.age > PULSE.life) pulses.splice(i, 1)
      }

      untilBeam -= delta
      if (untilBeam <= 0) {
        untilBeam = BEAM_EVERY.min + Math.random() * (BEAM_EVERY.max - BEAM_EVERY.min)
        const axis: 0 | 1 = Math.random() < 0.62 ? 0 : 1
        const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1
        const line = Math.floor(Math.random() * (axis === 0 ? rows : cols))
        const span = axis === 0 ? width : height
        beams.push({ axis, line, pos: dir > 0 ? -BEAM.trail : span + BEAM.trail, dir })
      }

      for (let i = beams.length - 1; i >= 0; i--) {
        const item = beams[i]!
        item.pos += item.dir * BEAM.speed * delta
        const span = item.axis === 0 ? width : height
        if (item.pos > span + BEAM.trail || item.pos < -BEAM.trail) beams.splice(i, 1)
      }

      draw(delta)
      frame = requestAnimationFrame(step)
    }

    const start = () => {
      if (running || !motion || document.hidden) return
      running = true
      previous = 0
      frame = requestAnimationFrame(step)
    }

    const stop = () => {
      running = false
      cancelAnimationFrame(frame)
    }

    const onMove = (event: PointerEvent) => {
      if (!pointer.seen) {
        pointer.seen = true
        pointer.x = event.clientX
        pointer.y = event.clientY
      }

      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.want = 1
      pointer.still = 0
      pointer.probe = true
    }

    const onLeave = () => {
      pointer.want = 0
    }

    const onScroll = () => {
      pointer.probe = true
    }

    const onPress = (event: PointerEvent) => {
      if (pulses.length >= 3) pulses.shift()
      pulses.push({ x: event.clientX, y: event.clientY, age: 0 })

      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.want = 1
      pointer.still = 0
      pointer.seen = true
      pointer.probe = true
    }

    const onVisibility = () => {
      if (document.hidden) stop()
      else start()
    }

    const paintStill = () => {
      pointer.weight = 0
      draw(1)
    }

    const onMotionChange = () => {
      motion = !reduced.matches
      stop()
      if (motion) start()
      else paintStill()
    }

    const resize = new ResizeObserver(() => {
      measure()
      if (!motion) paintStill()
    })

    measure()

    if (motion) {
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerdown', onPress, { passive: true })
      window.addEventListener('pointerleave', onLeave)
      window.addEventListener('scroll', onScroll, { passive: true })
      document.addEventListener('visibilitychange', onVisibility)
      resize.observe(host)
      start()
    } else {
      resize.observe(host)
      paintStill()
    }

    reduced.addEventListener('change', onMotionChange)

    return () => {
      stop()
      resize.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onPress)
      window.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
      reduced.removeEventListener('change', onMotionChange)
    }
  }, [])

  return (
    <div ref={hostRef} className="site-field" aria-hidden="true">
      <div className="site-field__aurora" />

      <div className="site-field__grid" />

      <canvas ref={canvasRef} className="site-field__canvas" />

      <div className="site-field__scrim" />
    </div>
  )
}
