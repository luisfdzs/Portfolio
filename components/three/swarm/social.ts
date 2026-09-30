type Box = { x: number; y: number; w: number; h: number }

type Point = [number, number, number, number]

type Segment = { length: number; at: (t: number) => Point }

export const RIM = 0
export const GLYPH = 1
export const FACE = 2
export const DUST = 3

export const STRIDE = 8

const SHARES: [number, number][] = [
  [RIM, 0.32],
  [GLYPH, 0.28],
  [FACE, 0.16],
  [DUST, 0.24],
]

const TOTAL = 16000
const SCALE = 2
const RIM_GAP = 1.5
const FACE_INSET = 5
const CLOUD = 20

function boxWithin(element: HTMLElement, root: HTMLElement): Box {
  let x = 0
  let y = 0
  let node: HTMLElement | null = element
  while (node && node !== root) {
    x += node.offsetLeft
    y += node.offsetTop
    node = node.offsetParent instanceof HTMLElement ? node.offsetParent : null
  }
  return { x, y, w: element.offsetWidth, h: element.offsetHeight }
}

function boxInside(element: Element, key: HTMLElement, keyBox: Box): Box {
  const outer = key.getBoundingClientRect()
  const inner = element.getBoundingClientRect()
  const ratio = outer.width > 0 ? key.offsetWidth / outer.width : 1
  return {
    x: keyBox.x + (inner.left - outer.left) * ratio,
    y: keyBox.y + (inner.top - outer.top) * ratio,
    w: inner.width * ratio,
    h: inner.height * ratio,
  }
}

function radiusOf(element: Element) {
  return parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0
}

function rimPath(box: Box, radius: number) {
  const r = Math.max(0, Math.min(radius, box.w / 2, box.h / 2))
  const left = box.x
  const top = box.y
  const right = box.x + box.w
  const bottom = box.y + box.h
  const line = (ax: number, ay: number, bx: number, by: number, nx: number, ny: number) => ({
    length: Math.hypot(bx - ax, by - ay),
    at: (t: number): Point => [ax + (bx - ax) * t, ay + (by - ay) * t, nx, ny],
  })
  const bend = (cx: number, cy: number, start: number) => ({
    length: (Math.PI / 2) * r,
    at: (t: number): Point => {
      const a = start + (Math.PI / 2) * t
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, Math.cos(a), Math.sin(a)]
    },
  })
  const segments: Segment[] = [
    line(left + r, top, right - r, top, 0, -1),
    bend(right - r, top + r, -Math.PI / 2),
    line(right, top + r, right, bottom - r, 1, 0),
    bend(right - r, bottom - r, 0),
    line(right - r, bottom, left + r, bottom, 0, 1),
    bend(left + r, bottom - r, Math.PI / 2),
    line(left, bottom - r, left, top + r, -1, 0),
    bend(left + r, top + r, Math.PI),
  ]
  const total = segments.reduce((sum, segment) => sum + segment.length, 0)
  return {
    total,
    at(u: number): Point {
      let d = u * total
      for (const segment of segments) {
        if (segment.length > 0 && d <= segment.length) return segment.at(d / segment.length)
        d -= segment.length
      }
      return [left + r, top, 0, -1]
    },
  }
}

function insideRounded(box: Box, radius: number, x: number, y: number) {
  const r = Math.min(radius, box.w / 2, box.h / 2)
  const qx = Math.max(Math.abs(x - box.x - box.w / 2) - (box.w / 2 - r), 0)
  const qy = Math.max(Math.abs(y - box.y - box.h / 2) - (box.h / 2 - r), 0)
  return qx * qx + qy * qy <= r * r
}

async function glyphImage(svg: SVGSVGElement, size: number) {
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', String(size))
  clone.setAttribute('height', String(size))
  clone.removeAttribute('class')
  const markup = new XMLSerializer().serializeToString(clone).replaceAll('currentColor', '#fff')
  const image = new Image()
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`
  await image.decode()
  return image
}

const gauss = () =>
  Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(Math.PI * 2 * Math.random())

export async function sampleSocial(root: HTMLElement): Promise<Float32Array | null> {
  const grid = root.querySelector<HTMLElement>('.social-card__grid')
  if (!grid || root.offsetWidth < 1 || root.offsetHeight < 1) return null
  await document.fonts.ready
  const width = root.offsetWidth
  const height = root.offsetHeight
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(width * SCALE)
  canvas.height = Math.ceil(height * SCALE)
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return null
  context.scale(SCALE, SCALE)

  const keys = [...grid.querySelectorAll<HTMLElement>('.swarm-key')].map((key) => {
    const box = boxWithin(key, root)
    return {
      box,
      radius: radiusOf(key),
      icons: [...key.querySelectorAll<SVGSVGElement>('svg')].map((svg) => ({
        svg,
        box: boxInside(svg, key, box),
      })),
      words: [...key.querySelectorAll<HTMLElement>('[data-glyph]')].map((word) => ({
        word,
        box: boxInside(word, key, box),
      })),
    }
  })
  if (keys.length === 0) return null

  const images = await Promise.all(
    keys.map(({ icons }) =>
      Promise.all(icons.map(({ svg, box }) => glyphImage(svg, Math.ceil(box.w * SCALE)))),
    ),
  )

  const glyphs = keys.map(({ box, icons, words }, index) => {
    context.clearRect(0, 0, width, height)
    context.fillStyle = '#fff'
    icons.forEach((icon, slot) => {
      const image = images[index]?.[slot]
      if (image) context.drawImage(image, icon.box.x, icon.box.y, icon.box.w, icon.box.h)
    })
    for (const { word, box: area } of words) {
      const style = getComputedStyle(word)
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
      context.letterSpacing = style.letterSpacing === 'normal' ? '0px' : style.letterSpacing
      context.textBaseline = 'middle'
      context.textAlign = 'left'
      const indent = parseFloat(style.paddingLeft) || 0
      context.fillText(word.textContent ?? '', area.x + indent, area.y + area.h / 2)
    }
    const x0 = Math.max(0, Math.floor(box.x * SCALE))
    const y0 = Math.max(0, Math.floor(box.y * SCALE))
    const w = Math.max(1, Math.min(canvas.width - x0, Math.ceil(box.w * SCALE)))
    const h = Math.max(1, Math.min(canvas.height - y0, Math.ceil(box.h * SCALE)))
    const { data } = context.getImageData(x0, y0, w, h)
    const list: number[] = []
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if ((data[(y * w + x) * 4 + 3] ?? 0) > 120) list.push((x0 + x) / SCALE, (y0 + y) / SCALE)
      }
    }
    return list
  })

  const rims = keys.map(({ box, radius }) =>
    rimPath(
      { x: box.x - RIM_GAP, y: box.y - RIM_GAP, w: box.w + RIM_GAP * 2, h: box.h + RIM_GAP * 2 },
      radius + RIM_GAP,
    ),
  )
  const perimeter = rims.reduce((sum, rim) => sum + rim.total, 0)
  const areas = keys.map(({ box }) => box.w * box.h)
  const area = areas.reduce((sum, value) => sum + value, 0)
  const inked = glyphs.reduce((sum, list) => sum + list.length, 0)

  const points = new Float32Array(TOTAL * STRIDE)
  let cursor = 0
  const push = (
    px: number,
    py: number,
    role: number,
    u: number,
    key: number,
    center: [number, number],
    normal: number,
  ) => {
    const dx = px - center[0]
    const dy = center[1] - py
    points.set(
      [
        px / width - 0.5,
        0.5 - py / height,
        role,
        u,
        key,
        Math.atan2(dy, dx),
        Math.hypot(dx, dy),
        normal,
      ],
      cursor * STRIDE,
    )
    cursor++
  }
  const centerOf = (box: Box): [number, number] => [box.x + box.w / 2, box.y + box.h / 2]

  for (const [role, share] of SHARES) {
    const amount = Math.round(TOTAL * share)
    if (role === RIM) {
      keys.forEach(({ box }, index) => {
        const rim = rims[index]
        if (!rim) return
        const center = centerOf(box)
        const own = Math.round((amount * rim.total) / perimeter)
        for (let i = 0; i < own && cursor < TOTAL; i++) {
          const u = Math.random()
          const [x, y, nx, ny] = rim.at(u)
          const spread = (Math.random() - 0.5) * 0.9
          push(x + nx * spread, y + ny * spread, RIM, u, index, center, Math.atan2(-ny, nx))
        }
      })
    } else if (role === GLYPH) {
      if (inked === 0) continue
      keys.forEach(({ box }, index) => {
        const list = glyphs[index] ?? []
        const available = list.length / 2
        if (available === 0) return
        const center = centerOf(box)
        const own = Math.round((amount * available * 2) / inked)
        for (let i = 0; i < own && cursor < TOTAL; i++) {
          const pick = Math.floor(Math.random() * available)
          const x = (list[pick * 2] ?? 0) + (Math.random() - 0.5) / SCALE
          const y = (list[pick * 2 + 1] ?? 0) + (Math.random() - 0.5) / SCALE
          push(x, y, GLYPH, Math.random(), index, center, 0)
        }
      })
    } else if (role === FACE) {
      keys.forEach(({ box, radius }, index) => {
        const inner = {
          x: box.x + FACE_INSET,
          y: box.y + FACE_INSET,
          w: box.w - FACE_INSET * 2,
          h: box.h - FACE_INSET * 2,
        }
        if (inner.w <= 0 || inner.h <= 0) return
        const center = centerOf(box)
        const own = Math.round((amount * (areas[index] ?? 0)) / area)
        let placed = 0
        let tries = 0
        while (placed < own && cursor < TOTAL && tries < own * 4) {
          tries++
          const x = inner.x + Math.random() * inner.w
          const y = inner.y + Math.random() * inner.h
          if (!insideRounded(inner, Math.max(0, radius - FACE_INSET), x, y)) continue
          push(x, y, FACE, Math.random(), index, center, 0)
          placed++
        }
      })
    } else {
      keys.forEach(({ box }, index) => {
        const center = centerOf(box)
        const own = Math.round((amount * (areas[index] ?? 0)) / area)
        for (let i = 0; i < own && cursor < TOTAL; i++) {
          const x = center[0] + gauss() * (box.w * 0.5 + CLOUD)
          const y = center[1] + gauss() * (box.h * 0.5 + CLOUD)
          push(x, y, DUST, Math.random(), index, center, 0)
        }
      })
    }
  }
  return cursor > 0 ? points.slice(0, cursor * STRIDE) : null
}
