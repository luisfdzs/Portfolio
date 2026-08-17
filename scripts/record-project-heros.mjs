#!/usr/bin/env node

import { mkdir, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
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

const TARGETS = [
  { slug: 'ckm-combat-academy', url: 'https://ckmcombatacademy.vercel.app' },
  { slug: 'swiftmet', url: 'https://swiftmet.vercel.app', cycle: 26 },
  { slug: 'mila-barber', url: 'https://milabarber.vercel.app', cycle: 16.5 },
  { slug: 'cedece', url: 'https://cedece.vercel.app', cycle: 7.5 },
  { slug: 'sangil-studio-test', url: 'https://sangilstudiotest.vercel.app/es', cycle: 21 },
  { slug: 'sangil-studio', url: 'https://sangilstudio.com', cycle: 26 },
  {
    slug: 'bonsai-artesania',
    url: 'https://bonsaiartesania.com',
    cycle: { desktop: 27.5, mobile: 54.5 },
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
      return { videos, canvas, animated }
    })

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

async function shoot(target, shot) {
  await mkdir(SHOT_DIR, { recursive: true })

  const ctx = await context(shot)
  const page = await ctx.newPage()

  try {
    await page.goto(target.url, { waitUntil: 'load', timeout: 45000 })
    await page.waitForTimeout(SETTLE_MS)
    const png = await page.screenshot({ type: 'png' })

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

    const destination = path.join(SHOT_DIR, `${target.slug}${shot.suffix}.webp`)
    await writeFile(destination, Buffer.from(encoded.split(',')[1], 'base64'))
    return destination
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
    for (const shot of SHOTS) {
      const file = path.join(OUT, `${target.slug}${shot.suffix}.webm`)
      if (await exists(file)) clips[shot.key] = `/projects/${target.slug}${shot.suffix}.webm`
    }

    entries.push({
      slug: target.slug,
      shots,
      clip: clips.desktop && clips.mobile ? clips : null,
    })
  }

  const body = entries
    .map((entry) => {
      const shot = (key) =>
        `${key}: { src: '${entry.shots[key].src}', width: ${entry.shots[key].width}, height: ${entry.shots[key].height} }`
      const clip = entry.clip
        ? `\n    clip: { desktop: '${entry.clip.desktop}', mobile: '${entry.clip.mobile}' },`
        : ''
      return (
        `  '${entry.slug}': {\n` +
        `    ${shot('desktop')},\n` +
        `    ${shot('mobile')},${clip}\n` +
        `  },`
      )
    })
    .join('\n')

  const file = `export type ProjectShot = { src: string; width: number; height: number }

export type ProjectMediaSet = {
  desktop: ProjectShot
  mobile: ProjectShot
  clip?: { desktop: string; mobile: string }
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

const targets = only.length ? TARGETS.filter((t) => only.includes(t.slug)) : TARGETS

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

  const lead = passes[SHOTS[0].key]
  const moves = lead.pixelsMove || lead.videos > 0 || lead.canvas > 0
  const cycle = (key) =>
    typeof target.cycle === 'number' ? target.cycle : (target.cycle?.[key] ?? null)
  const seconds = Object.fromEntries(
    SHOTS.map((shot) => [shot.key, cycle(shot.key) ?? passes[shot.key].seconds]),
  )

  report.push({ ...target, ok: true, moves, seconds })
  console.log(
    `  ${moves ? '●' : '○'} ${target.slug.padEnd(24)} ` +
      SHOTS.map((shot) =>
        cycle(shot.key)
          ? `${shot.key}:ciclo ${seconds[shot.key]}s`
          : `${shot.key}:${passes[shot.key].lastChange}ms→${seconds[shot.key].toFixed(1)}s`,
      ).join('  '),
  )
}

const reachable = report.filter((r) => r.ok)

if (wantShots) {
  console.log(`\nCapturando ${reachable.length * SHOTS.length} póster(es)…`)
  for (const target of reachable) {
    for (const shot of SHOTS) {
      try {
        const file = await shoot(target, shot)
        console.log(`  ✓ ${path.relative(process.cwd(), file)}`)
      } catch (error) {
        console.log(`  ✗ ${target.slug}${shot.suffix}: ${error.message.split('\n')[0]}`)
      }
    }
  }
}

if (wantClips) {
  const animated = reachable.filter((r) => r.moves)
  console.log(`\nGrabando ${animated.length * SHOTS.length} clip(s)…`)
  for (const target of animated) {
    for (const shot of SHOTS) {
      const seconds = target.seconds[shot.key]
      try {
        const file = await record(target, shot, seconds)
        console.log(`  ✓ ${path.relative(process.cwd(), file)} (${seconds.toFixed(1)}s)`)
      } catch (error) {
        console.log(`  ✗ ${target.slug}${shot.suffix}: ${error.message.split('\n')[0]}`)
      }
    }
  }
  await rm(TMP, { recursive: true, force: true }).catch(() => {})
  console.log(
    '\nClips en public/projects:',
    (await readdir(OUT)).filter((f) => f.endsWith('.webm')).join(', ') || '(ninguno)',
  )
}

if (!detectOnly) await writeIndex()

await browser.close()
