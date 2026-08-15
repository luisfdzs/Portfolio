#!/usr/bin/env node

// Detecta qué proyectos tienen el hero animado y graba un clip corto de cada uno
// en public/projects/<slug>.webm, para reproducirlo dentro de la tarjeta del carrusel.
//
//   node scripts/record-project-heros.mjs --detect          solo detección
//   node scripts/record-project-heros.mjs                   detecta y graba
//   node scripts/record-project-heros.mjs swiftmet cedece   graba esos slugs

import { mkdir, readdir, rename, rm } from 'node:fs/promises'
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

// Dos tomas: la de escritorio alimenta la tarjeta horizontal y la de móvil
// la tarjeta vertical, para que cada una enseñe el hero tal y como se ve en ese ancho.
const SHOTS = [
  { suffix: '', size: { width: 1280, height: 800 } },
  { suffix: '-mobile', size: { width: 430, height: 932 } },
]
const SIZE = SHOTS[0].size
const CLIP_SECONDS = 6
const OUT = path.resolve('public/projects')
const TMP = path.resolve('.next/cache/hero-clips')

const TARGETS = [
  { slug: 'swiftmet', url: 'https://swiftmet.vercel.app' },
  { slug: 'mila-barber', url: 'https://milabarber.vercel.app' },
  { slug: 'cedece', url: 'https://cedece.vercel.app' },
  { slug: 'sangil-studio', url: 'https://sangilstudio.com' },
  { slug: 'bonsai-artesania', url: 'https://bonsaiartesania.com' },
  { slug: 'blablatour', url: 'https://blablatour.vercel.app' },
  { slug: 'almuerziko-san-fermin', url: 'https://almuerziko.vercel.app' },
  { slug: 'portfolio', url: 'https://luisfernandezsangil.vercel.app' },
]

const args = process.argv.slice(2)
const detectOnly = args.includes('--detect')
const only = args.filter((arg) => !arg.startsWith('--'))

const browser = await chromium.launch({ executablePath: CHROME })

async function detect(target) {
  const context = await browser.newContext({ viewport: SIZE, reducedMotion: 'no-preference' })
  const page = await context.newPage()

  try {
    await page.goto(target.url, { waitUntil: 'load', timeout: 45000 })
    await page.waitForTimeout(2500)

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

    const before = await page.screenshot({ type: 'jpeg', quality: 40 })
    await page.waitForTimeout(2000)
    const after = await page.screenshot({ type: 'jpeg', quality: 40 })
    const pixelsMove = Buffer.compare(before, after) !== 0

    return { ...target, ...media, pixelsMove, ok: true }
  } catch (error) {
    return { ...target, ok: false, error: error.message.split('\n')[0] }
  } finally {
    await context.close()
  }
}

async function record(target, shot) {
  await mkdir(TMP, { recursive: true })
  await mkdir(OUT, { recursive: true })

  const context = await browser.newContext({
    viewport: shot.size,
    isMobile: shot.suffix === '-mobile',
    hasTouch: shot.suffix === '-mobile',
    reducedMotion: 'no-preference',
    recordVideo: { dir: TMP, size: shot.size },
  })
  const page = await context.newPage()

  await page.goto(target.url, { waitUntil: 'load', timeout: 45000 })
  await page.waitForTimeout(CLIP_SECONDS * 1000)

  const video = page.video()
  await page.close()
  await context.close()

  const raw = await video.path()
  const destination = path.join(OUT, `${target.slug}${shot.suffix}.webm`)
  await rm(destination, { force: true })
  await rename(raw, destination)
  return destination
}

const targets = only.length ? TARGETS.filter((t) => only.includes(t.slug)) : TARGETS

console.log('Detectando heros animados…')
const report = []
for (const target of targets) {
  const result = await detect(target)
  report.push(result)
  console.log(
    result.ok
      ? `  ${result.pixelsMove ? '●' : '○'} ${result.slug.padEnd(24)} vídeo:${result.videos} canvas:${result.canvas} anim:${result.animated} movimiento:${result.pixelsMove}`
      : `  ✗ ${result.slug.padEnd(24)} ${result.error}`,
  )
}

if (!detectOnly) {
  const animated = report.filter((r) => r.ok && (r.pixelsMove || r.videos > 0 || r.canvas > 0))
  console.log(`\nGrabando ${animated.length * SHOTS.length} clip(s) de ${CLIP_SECONDS}s…`)
  for (const target of animated) {
    for (const shot of SHOTS) {
      try {
        const file = await record(target, shot)
        console.log(`  ✓ ${path.relative(process.cwd(), file)}`)
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

await browser.close()
