#!/usr/bin/env node

import { copyFile, mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { chromium } from 'playwright-core'

const CHROME =
  process.env.CHROME_PATH ??
  (process.platform === 'win32'
    ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    : process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : '/usr/bin/google-chrome')

const SHOTS = [
  { key: 'desktop', suffix: '', size: { width: 1280, height: 800 }, mobile: false },
  { key: 'mobile', suffix: '-mobile', size: { width: 430, height: 932 }, mobile: true },
]
const CLIP_MIN = 6
const CLIP_MAX = 20
const CLIP_TAIL = 1.2
const PROBE_STEP = 400
const PROBE_STILL = 4000
const PROBE_FLOOR = 9000
const MOTION_MIN = 2500
const SETTLE_MS = 3500
const WEBP_QUALITY = 0.82

const OUT = path.resolve('public/projects')
const SHOT_DIR = path.join(OUT, 'shots')
const TMP = path.resolve('.next/cache/hero-clips')
const INDEX = path.resolve('content/project-shots.ts')
const FRAMES = path.resolve('content/project-frames.json')

const ROOT = process.env.PROJECTS_ROOT ?? 'C:/Proyectos'

const TARGETS = [
  { slug: 'ckm-combat-academy', url: 'https://ckmcombatacademy.vercel.app', project: 'CKM' },
  { slug: 'swiftmet', url: 'https://swiftmet.vercel.app', project: 'Swiftmet' },
  { slug: 'mila-barber', url: 'https://milabarber.vercel.app', project: 'MilaBarber' },
  { slug: 'cedece', url: 'https://cedece.vercel.app', project: 'Cedece' },
  { slug: 'sangil-studio-test', url: 'https://sangilstudiotest.vercel.app/es', cycle: 21 },
  { slug: 'sangil-studio', url: 'https://sangilstudio.com', cycle: 26 },
  {
    slug: 'bonsai-artesania',
    url: 'https://bonsaiartesania.com',
    project: 'BonsaiArtesania',
  },
  { slug: 'blablatour', url: 'https://blablatour.vercel.app' },
  { slug: 'almuerziko-san-fermin', url: 'https://almuerziko.vercel.app' },
  { slug: 'portfolio', url: 'https://luisfernandezsangil.vercel.app', cycle: 24 },
]

const args = process.argv.slice(2)
const detectOnly = args.includes('--detect')
const only = args.filter((arg) => !arg.startsWith('--'))
const wantShots = detectOnly ? false : !args.includes('--clips')
const wantClips = detectOnly ? false : !args.includes('--shots')
const overwrite = args.includes('--force') || only.length > 0

const browser = await chromium.launch({ executablePath: CHROME })

function context(shot, extra = {}) {
  return browser.newContext({
    viewport: shot.size,
    isMobile: shot.mobile,
    hasTouch: shot.mobile,
    reducedMotion: 'no-preference',
    ...extra,
  })
}

async function probe(target, shot) {
  const ctx = await context(shot)
  const page = await ctx.newPage()

  try {
    await page.goto(target.url, { waitUntil: 'load', timeout: 45000 })

    await page.waitForTimeout(SETTLE_MS)

    const media = await page.evaluate(() => {
      const inHero = (el) => el.getBoundingClientRect().top < window.innerHeight
      const videos = [...document.querySelectorAll('video')].filter(inHero).length
      const canvas = [...document.querySelectorAll('canvas')].filter(inHero).length
      const animated = [...document.querySelectorAll('body *')].filter((el) => {
        if (!inHero(el)) return false
        if (el.getAnimations?.().some((a) => a.playState === 'running')) return true
        const style = getComputedStyle(el)
        return style.animationName !== 'none' && style.animationIterationCount === 'infinite'
      }).length
      const spans = [...document.querySelectorAll('video')]
        .filter(inHero)
        .map((video) => video.duration)
        .filter((span) => Number.isFinite(span) && span > 1)
      return { videos, canvas, animated, span: spans.length ? Math.max(...spans) : null }
    })

    if (media.span) {
      return { ...target, ...media, lastChange: null, seconds: media.span, pixelsMove: true, ok: true }
    }

    const started = Date.now()
    let previous = null
    let lastChange = 0
    let elapsed = 0

    while (elapsed < CLIP_MAX * 1000) {
      const frame = await page.screenshot({ type: 'jpeg', quality: 40 })
      elapsed = Date.now() - started
      if (previous && Buffer.compare(previous, frame) !== 0) lastChange = elapsed
      previous = frame
      if (elapsed > PROBE_FLOOR && elapsed - lastChange > PROBE_STILL) break
      await page.waitForTimeout(PROBE_STEP)
    }

    const seconds = Math.min(CLIP_MAX, Math.max(CLIP_MIN, lastChange / 1000 + CLIP_TAIL))

    return {
      ...target,
      ...media,
      lastChange,
      seconds,
      pixelsMove: lastChange > MOTION_MIN,
      ok: true,
    }
  } catch (error) {
    return { ...target, ok: false, error: error.message.split('\n')[0] }
  } finally {
    await ctx.close()
  }
}

async function encode(page, png, destination) {
  const encoded = await page.evaluate(
    async ([source, quality]) => {
      const image = new Image()
      image.src = source
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      canvas.getContext('2d').drawImage(image, 0, 0)
      return canvas.toDataURL('image/webp', quality)
    },
    [`data:image/png;base64,${png.toString('base64')}`, WEBP_QUALITY],
  )

  if (!encoded.startsWith('data:image/webp')) throw new Error('Chrome no ha devuelto webp')
  await writeFile(destination, Buffer.from(encoded.split(',')[1], 'base64'))
  return destination
}

async function shoot(target, shot) {
  await mkdir(SHOT_DIR, { recursive: true })

  const ctx = await context(shot)
  const page = await ctx.newPage()

  try {
    await page.goto(target.url, { waitUntil: 'load', timeout: 45000 })
    await page.waitForTimeout(SETTLE_MS)
    const png = await page.screenshot({ type: 'png' })
    return await encode(page, png, shotFile(target, shot))
  } finally {
    await ctx.close()
  }
}

async function chrome(target, shot) {
  await mkdir(OUT, { recursive: true })

  const ctx = await context(shot)
  const page = await ctx.newPage()

  try {
    await page.goto(target.url, { waitUntil: 'load', timeout: 45000 })
    await page.waitForTimeout(SETTLE_MS)

    const found = await page.evaluate(() => {
      const view = window.innerWidth * window.innerHeight
      const covers = (el) => {
        const rect = el.getBoundingClientRect()
        return (
          rect.width >= window.innerWidth * 0.3 &&
          rect.height >= window.innerHeight * 0.6 &&
          rect.top < window.innerHeight * 0.25 &&
          rect.width * rect.height >= view * 0.25
        )
      }

      const round = (value) => Math.round(value * 10000) / 10000
      const videos = []

      for (const element of document.querySelectorAll('video, img')) {
        if (!covers(element)) continue
        if (element.tagName === 'VIDEO') {
          const rect = element.getBoundingClientRect()
          const source = element.currentSrc || element.src
          videos.push({
            name: source.split('?')[0].split('/').pop(),
            frame: {
              top: round((rect.top / window.innerHeight) * 100),
              left: round((rect.left / window.innerWidth) * 100),
              width: round((rect.width / window.innerWidth) * 100),
              height: round((rect.height / window.innerHeight) * 100),
            },
          })
        }
        element.style.visibility = 'hidden'
      }

      for (const element of document.querySelectorAll('html, body, body *')) {
        const paint = getComputedStyle(element).backgroundColor
        if (paint === 'transparent' || paint === 'rgba(0, 0, 0, 0)') continue
        element.style.backgroundColor = 'transparent'
      }

      return videos.filter((video) => video.name)
    })

    if (!found.length) throw new Error('el hero no tiene vídeo en este tamaño')

    const png = await page.screenshot({ type: 'png', omitBackground: true })
    await encode(page, png, chromeFile(target, shot))
    return { file: chromeFile(target, shot), videos: found }
  } finally {
    await ctx.close()
  }
}

async function record(target, shot, seconds) {
  await mkdir(TMP, { recursive: true })
  await mkdir(OUT, { recursive: true })

  const ctx = await context(shot, { recordVideo: { dir: TMP, size: shot.size } })
  const page = await ctx.newPage()

  await page.goto(target.url, { waitUntil: 'load', timeout: 45000 })
  await page.evaluate(() => {
    for (const video of document.querySelectorAll('video')) {
      if (video.getBoundingClientRect().top >= window.innerHeight) continue
      video.currentTime = 0
      void video.play().catch(() => {})
    }
  })
  await page.waitForTimeout(seconds * 1000)

  const video = page.video()
  await page.close()
  await ctx.close()

  const raw = await video.path()
  const destination = path.join(OUT, `${target.slug}${shot.suffix}.webm`)
  await rm(destination, { force: true })
  await rename(raw, destination)
  return destination
}

async function exists(file) {
  return readFile(file)
    .then(() => true)
    .catch(() => false)
}

function shotFile(target, shot) {
  return path.join(SHOT_DIR, `${target.slug}${shot.suffix}.webp`)
}

function clipFile(target, shot) {
  return path.join(OUT, `${target.slug}${shot.suffix}.webm`)
}

function chromeFile(target, shot) {
  return path.join(OUT, `${target.slug}-chrome${shot.suffix}.webp`)
}

const catalogue = new Map()

async function locate(project, name) {
  const key = `${project}/${name}`
  if (catalogue.has(key)) return catalogue.get(key)

  const root = path.join(ROOT, project, 'public')
  const found = await readdir(root, { recursive: true }).then(
    (files) =>
      files.map((file) => path.join(root, file)).find((file) => path.basename(file) === name),
    () => undefined,
  )

  catalogue.set(key, found)
  return found
}

const copies = new Map()

async function harvest(target, shot) {
  const layer = await chrome(target, shot)
  const clips = []

  for (const [index, video] of layer.videos.entries()) {
    const origin = await locate(target.project, video.name)
    if (!origin) throw new Error(`${video.name} no está en ${target.project}/public`)

    let src = copies.get(origin)
    if (!src) {
      const stack = index ? `-${index + 1}` : ''
      const destination = path.join(
        OUT,
        `${target.slug}${stack}${shot.suffix}${path.extname(origin)}`,
      )
      await copyFile(origin, destination)
      src = `/projects/${path.basename(destination)}`
      copies.set(origin, src)
    }

    clips.push({ src, frame: video.frame })
  }

  return { src: `/projects/${path.basename(layer.file)}`, clips }
}

async function settled(target) {
  if (overwrite || detectOnly) return false
  for (const shot of SHOTS) {
    if (wantShots && !(await exists(shotFile(target, shot)))) return false
  }
  if (!wantClips) return true

  if (target.project) {
    const harvested = frames[target.slug]
    if (!harvested) return false
    for (const shot of SHOTS) {
      const layer = harvested[shot.key]
      if (!layer) continue
      const files = [layer.src, ...layer.clips.map((clip) => clip.src)]
      for (const file of files) {
        if (!(await exists(path.join(OUT, path.basename(file))))) return false
      }
    }
    return true
  }

  if (!target.cycle) return false
  for (const shot of SHOTS) {
    if (!(await exists(clipFile(target, shot)))) return false
  }
  return true
}

const frames = await readFile(FRAMES, 'utf8')
  .then((raw) => JSON.parse(raw))
  .catch(() => ({}))

async function writeIndex() {
  const entries = []

  for (const target of TARGETS) {
    const shots = {}
    for (const shot of SHOTS) {
      const file = path.join(SHOT_DIR, `${target.slug}${shot.suffix}.webp`)
      if (await exists(file)) {
        shots[shot.key] = {
          src: `/projects/shots/${target.slug}${shot.suffix}.webp`,
          width: shot.size.width,
          height: shot.size.height,
        }
      }
    }
    if (!shots.desktop || !shots.mobile) continue

    const clips = {}
    const layers = {}
    for (const shot of SHOTS) {
      const harvested = frames[target.slug]?.[shot.key]
      if (harvested) {
        const files = [harvested.src, ...harvested.clips.map((clip) => clip.src)]
        const all = await Promise.all(
          files.map((file) => exists(path.join(OUT, path.basename(file)))),
        )
        if (all.every(Boolean)) layers[shot.key] = harvested
        continue
      }
      if (await exists(clipFile(target, shot)))
        clips[shot.key] = `/projects/${target.slug}${shot.suffix}.webm`
    }

    if (!Object.keys(clips).length && !Object.keys(layers).length) {
      entries.push({ slug: target.slug, shots })
      continue
    }

    entries.push({ slug: target.slug, shots, clips, layers })
  }

  const body = entries
    .map((entry) => {
      const shot = (key) =>
        `${key}: { src: '${entry.shots[key].src}', width: ${entry.shots[key].width}, height: ${entry.shots[key].height} }`

      const sources = SHOTS.map((each) => {
        const key = each.key
        const from = entry.layers?.[key]?.clips[0]?.src ?? entry.clips?.[key]
        return from ? `${key}: '${from}'` : null
      }).filter(Boolean)
      const clip = sources.length ? `\n    clip: { ${sources.join(', ')} },` : ''

      const stack = (key) => {
        const layer = entry.layers?.[key]
        if (!layer) return null
        const list = layer.clips
          .map(
            ({ src, frame }) =>
              `{ src: '${src}', frame: { top: ${frame.top}, left: ${frame.left}, width: ${frame.width}, height: ${frame.height} } }`,
          )
          .join(', ')
        return `${key}: { src: '${layer.src}', clips: [${list}] }`
      }
      const boxes = SHOTS.map((each) => stack(each.key)).filter(Boolean)
      const chrome = boxes.length
        ? `\n    chrome: {\n      ${boxes.join(',\n      ')},\n    },`
        : ''

      return (
        `  '${entry.slug}': {\n` +
        `    ${shot('desktop')},\n` +
        `    ${shot('mobile')},${clip}${chrome}\n` +
        `  },`
      )
    })
    .join('\n')

  const file = `export type ProjectShot = { src: string; width: number; height: number }

export type ProjectFrame = { top: number; left: number; width: number; height: number }

export type ProjectLayer = { src: string; frame: ProjectFrame }

export type ProjectChrome = { src: string; clips: ProjectLayer[] }

export type ProjectMediaSet = {
  desktop: ProjectShot
  mobile: ProjectShot
  clip?: { desktop?: string; mobile?: string }
  chrome?: { desktop?: ProjectChrome; mobile?: ProjectChrome }
}

const media: Record<string, ProjectMediaSet> = {
${body}
}

export function projectMedia(slug: string): ProjectMediaSet | null {
  return media[slug] ?? null
}
`

  await writeFile(INDEX, file, 'utf8')
  console.log(
    `\nÍndice escrito en ${path.relative(process.cwd(), INDEX)} (${entries.length} proyectos)`,
  )
}

const requested = only.length ? TARGETS.filter((t) => only.includes(t.slug)) : TARGETS
const targets = []
const skipped = []

for (const target of requested) {
  if (await settled(target)) skipped.push(target.slug)
  else targets.push(target)
}

if (skipped.length) console.log(`Ya grabados, se omiten: ${skipped.join(', ')}`)
if (!targets.length) {
  await writeIndex()
  await browser.close()
  process.exit(0)
}

console.log('Midiendo la duración real de cada hero…')
const report = []
for (const target of targets) {
  const passes = {}
  let failed = null

  for (const shot of SHOTS) {
    const result = await probe(target, shot)
    if (!result.ok) {
      failed = result
      break
    }
    passes[shot.key] = result
  }

  if (failed) {
    report.push(failed)
    console.log(`  ✗ ${failed.slug.padEnd(24)} ${failed.error}`)
    continue
  }

  const cycle = (key) =>
    typeof target.cycle === 'number' ? target.cycle : (target.cycle?.[key] ?? null)
  const seconds = Object.fromEntries(
    SHOTS.map((shot) => [shot.key, cycle(shot.key) ?? passes[shot.key].seconds]),
  )
  const moves = Object.fromEntries(
    SHOTS.map((shot) => {
      const pass = passes[shot.key]
      return [shot.key, pass.pixelsMove || pass.videos > 0 || pass.canvas > 0]
    }),
  )

  report.push({ ...target, ok: true, moves, seconds })
  console.log(
    `  ${SHOTS.some((shot) => moves[shot.key]) ? '●' : '○'} ${target.slug.padEnd(24)} ` +
      SHOTS.map((shot) => {
        if (cycle(shot.key)) return `${shot.key}:ciclo ${seconds[shot.key]}s`
        const pass = passes[shot.key]
        if (pass.span) return `${shot.key}:vídeo ${pass.span.toFixed(2)}s`
        return `${shot.key}:${pass.lastChange}ms→${seconds[shot.key].toFixed(1)}s`
      }).join('  '),
  )
}

const reachable = report.filter((r) => r.ok)

async function jobs(candidates, file, wanted = () => true) {
  const pending = []
  for (const target of candidates) {
    for (const shot of SHOTS) {
      if (!wanted(target, shot)) continue
      if (overwrite || !(await exists(file(target, shot)))) pending.push({ target, shot })
    }
  }
  return pending
}

if (wantShots) {
  const pending = await jobs(reachable, shotFile)
  console.log(`\nCapturando ${pending.length} póster(es)…`)
  for (const { target, shot } of pending) {
    try {
      const file = await shoot(target, shot)
      console.log(`  ✓ ${path.relative(process.cwd(), file)}`)
    } catch (error) {
      console.log(`  ✗ ${target.slug}${shot.suffix}: ${error.message.split('\n')[0]}`)
    }
  }
}

if (wantClips) {
  const pending = await jobs(
    reachable,
    (target, shot) => (target.project ? chromeFile(target, shot) : clipFile(target, shot)),
    (target, shot) => target.moves[shot.key],
  )
  console.log(`\nComponiendo ${pending.length} clip(s)…`)
  for (const { target, shot } of pending) {
    const seconds = target.seconds[shot.key]
    try {
      if (target.project) {
        await mkdir(OUT, { recursive: true })
        const layer = await harvest(target, shot)
        frames[target.slug] = { ...frames[target.slug], [shot.key]: layer }
        await writeFile(FRAMES, `${JSON.stringify(frames, null, 2)}\n`, 'utf8')
        for (const clip of layer.clips) {
          console.log(
            `  ✓ ${clip.src} (origen, marco ${clip.frame.left}%+${clip.frame.width}% × ${clip.frame.top}%+${clip.frame.height}%)`,
          )
        }
        console.log(`  ✓ ${layer.src} (capa)`)
        continue
      }
      const file = await record(target, shot, seconds)
      console.log(`  ✓ ${path.relative(process.cwd(), file)} (${seconds.toFixed(1)}s)`)
    } catch (error) {
      console.log(`  ✗ ${target.slug}${shot.suffix}: ${error.message.split('\n')[0]}`)
    }
  }
  await rm(TMP, { recursive: true, force: true }).catch(() => {})
}

if (!detectOnly) await writeIndex()

await browser.close()
