type Box = { x: number; y: number; w: number; h: number }

const RIM = 0
const KEY = 1
const GLYPH = 2
const FACE = 3

const SHARES: [number, number][] = [
  [RIM, 0.3],
  [KEY, 0.24],
  [GLYPH, 0.36],
  [FACE, 0.1],
]

const TOTAL = 12000
const SCALE = 2

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

function radiusOf(element: Element) {
  return parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0
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

export async function sampleSocial(root: HTMLElement): Promise<Float32Array | null> {
  const slab = root.querySelector<HTMLElement>('.social-card__slab')
  if (!slab || root.offsetWidth < 1 || root.offsetHeight < 1) return null
  const width = root.offsetWidth
  const height = root.offsetHeight
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(width * SCALE)
  canvas.height = Math.ceil(height * SCALE)
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return null
  context.scale(SCALE, SCALE)

  const slabBox = boxWithin(slab, root)
  const slabRadius = radiusOf(slab)
  const keys = [...slab.querySelectorAll<HTMLElement>('.social-key')].map((key) => ({
    box: boxWithin(key, root),
    radius: radiusOf(key),
    icon: key.querySelector<SVGSVGElement>('svg'),
  }))
  const glyphs = await Promise.all(
    keys.map(({ box, icon }) => (icon ? glyphImage(icon, box.w * 0.46 * SCALE) : null)),
  )

  const hits = new Map<number, number[]>()
  const collect = (role: number, draw: () => void) => {
    context.clearRect(0, 0, width, height)
    context.fillStyle = '#fff'
    context.strokeStyle = '#fff'
    draw()
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
    const list: number[] = []
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        if ((data[(y * canvas.width + x) * 4 + 3] ?? 0) > 120) list.push(x / SCALE, y / SCALE)
      }
    }
    hits.set(role, list)
  }

  collect(RIM, () => {
    context.lineWidth = 1.6
    context.beginPath()
    context.roundRect(slabBox.x, slabBox.y, slabBox.w, slabBox.h, slabRadius)
    context.stroke()
  })
  collect(KEY, () => {
    context.lineWidth = 1.3
    for (const { box, radius } of keys) {
      context.beginPath()
      context.roundRect(box.x, box.y, box.w, box.h, radius)
      context.stroke()
    }
  })
  collect(GLYPH, () => {
    keys.forEach(({ box }, index) => {
      const glyph = glyphs[index]
      if (!glyph) return
      const size = box.w * 0.46
      context.drawImage(glyph, box.x + (box.w - size) / 2, box.y + (box.h - size) / 2, size, size)
    })
  })
  collect(FACE, () => {
    context.beginPath()
    context.roundRect(slabBox.x, slabBox.y, slabBox.w, slabBox.h, slabRadius)
    context.fill()
    context.globalCompositeOperation = 'destination-out'
    for (const { box, radius } of keys) {
      context.beginPath()
      context.roundRect(box.x - 3, box.y - 3, box.w + 6, box.h + 6, radius + 3)
      context.fill()
    }
    context.globalCompositeOperation = 'source-over'
  })

  const points = new Float32Array(TOTAL * 4)
  let cursor = 0
  for (const [role, share] of SHARES) {
    const list = hits.get(role) ?? []
    const available = list.length / 2
    const amount = Math.round(TOTAL * share)
    for (let i = 0; i < amount && cursor < TOTAL && available > 0; i++) {
      const pick = Math.floor(Math.random() * available)
      const px = (list[pick * 2] ?? 0) + (Math.random() - 0.5) / SCALE
      const py = (list[pick * 2 + 1] ?? 0) + (Math.random() - 0.5) / SCALE
      const x = px / width - 0.5
      const y = 0.5 - py / height
      points.set([x, y, role, Math.atan2(y * height, x * width) / (Math.PI * 2) + 0.5], cursor * 4)
      cursor++
    }
  }
  return cursor > 0 ? points.slice(0, cursor * 4) : null
}
