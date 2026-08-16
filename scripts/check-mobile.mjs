#!/usr/bin/env node

import process from 'node:process'
import { chromium } from 'playwright-core'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const LOCALE = process.env.LOCALE ?? 'es'

const CHROME =
  process.env.CHROME_PATH ??
  (process.platform === 'win32'
    ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    : process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : '/usr/bin/google-chrome')

const results = []
const check = (ok, label) => {
  results.push({ ok, label })
  console.log(`${ok ? '  ✓' : '  ✗'} ${label}`)
}

function horizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
}

function overflowCulprit(page) {
  return page.evaluate(() => {
    const width = window.innerWidth
    let worst = null
    for (const el of document.querySelectorAll('body *')) {
      const rect = el.getBoundingClientRect()
      if (rect.width === 0) continue
      const excess = Math.max(0, Math.round(rect.right - width), Math.round(-rect.left))
      if (excess > 1 && (!worst || excess > worst.excess)) {
        worst = {
          excess,
          tag: el.tagName.toLowerCase(),
          className: typeof el.className === 'string' ? el.className.slice(0, 90) : '',
          text: (el.textContent ?? '').trim().slice(0, 60),
        }
      }
    }
    return worst
  })
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME })
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  })
  const page = await context.newPage()

  const errors = []
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()))
  page.on('pageerror', (error) => errors.push(String(error)))
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`HTTP ${response.status()} · ${response.url()}`)
  })

  console.log(`\nRevisión móvil (390×844) sobre ${BASE}/${LOCALE}\n`)

  console.log('Portada')
  await page.goto(`${BASE}/${LOCALE}`, { waitUntil: 'networkidle' })

  const homeOverflow = await horizontalOverflow(page)
  if (homeOverflow > 1) console.log('    culpable:', await overflowCulprit(page))
  check(homeOverflow <= 1, 'la portada no desborda en horizontal')

  check(
    !(await page.locator('header nav').first().isVisible()),
    'la cabecera de escritorio está oculta en móvil',
  )

  const bar = page.locator(
    `nav[aria-label="${LOCALE === 'es' ? 'Navegación de móvil' : 'Mobile navigation'}"]`,
  )
  check(await bar.isVisible(), 'la barra inferior de móvil se ve')

  const navNames = await page.evaluate(() =>
    [...document.querySelectorAll('nav[aria-label]')].map((n) => n.getAttribute('aria-label')),
  )
  check(
    new Set(navNames).size === navNames.length,
    `cada <nav> tiene un nombre distinto (${navNames.length})`,
  )

  check(
    (await bar.locator('li').count()) === 5,
    `la barra tiene cinco destinos (${await bar.locator('li').count()})`,
  )

  console.log('\nMenú')
  const menuButton = bar.locator('button[aria-controls="mobile-menu"]')
  await menuButton.click()

  const panel = page.locator('#mobile-menu')
  const opened = await panel
    .waitFor({ state: 'visible', timeout: 4000 })
    .then(() => true)
    .catch(() => false)
  check(opened, 'el panel del menú se abre')

  const panelBox = await panel.boundingBox()
  check(
    (panelBox?.height ?? 0) > 150,
    `el panel tiene altura real (${Math.round(panelBox?.height ?? 0)} px)`,
  )

  const barBox = await bar.boundingBox()
  check(
    (panelBox?.y ?? 0) + (panelBox?.height ?? 0) <= (barBox?.y ?? 0) + 2,
    'el panel queda por encima de la barra, sin taparla',
  )

  check(
    (await page.evaluate(() => document.body.style.overflow)) === 'hidden',
    'el scroll de la página se bloquea con el menú abierto',
  )

  const contrastOk = await panel
    .locator('a')
    .first()
    .evaluate((el) => {
      const parse = (value) => (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number)
      const luminance = ([r, g, b]) => {
        const channel = (v) => {
          const s = v / 255
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
        }
        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
      }
      const fg = luminance(parse(getComputedStyle(el).color))
      const bg = luminance(parse(getComputedStyle(el.closest('#mobile-menu')).backgroundColor))
      const [light, dark] = fg > bg ? [fg, bg] : [bg, fg]
      return (light + 0.05) / (dark + 0.05)
    })
  check(
    contrastOk >= 4.5,
    `las entradas del menú contrastan con su fondo (${contrastOk.toFixed(1)}:1)`,
  )

  await page.keyboard.press('Escape')
  check(
    await panel
      .waitFor({ state: 'hidden', timeout: 3000 })
      .then(() => true)
      .catch(() => false),
    'el panel se cierra con Escape',
  )

  console.log('\nPie')
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(600)

  const footerClear = await page.evaluate(() => {
    const footer = document.querySelector('footer')
    const nav = document.querySelector('nav[data-print="hide"]')
    if (!footer || !nav) return null
    return Math.round(nav.getBoundingClientRect().top - footer.getBoundingClientRect().bottom)
  })
  check(
    (footerClear ?? -99) >= -1,
    `el pie termina por encima de la barra (${footerClear} px de holgura)`,
  )

  console.log('\nÁreas pulsables')
  const tooSmall = await page.evaluate(() => {
    const offenders = []
    for (const el of document.querySelectorAll('a[href], button')) {
      const style = getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden') continue
      if (el.classList.contains('sr-only')) continue
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) continue

      const boxes = [rect, ...[...el.querySelectorAll('*')].map((n) => n.getBoundingClientRect())]
      const width = Math.max(...boxes.map((box) => box.width))
      const height = Math.max(...boxes.map((box) => box.height))

      const grow = el.classList.contains('tap') ? 12 : 0
      if (width + grow < 24 || height + grow < 24) {
        offenders.push(
          `${el.tagName.toLowerCase()}«${(el.textContent ?? '').trim().slice(0, 24)}» ` +
            `${Math.round(width)}×${Math.round(height)}`,
        )
      }
    }
    return offenders
  })
  if (tooSmall.length > 0) console.log('    ', tooSmall.join('\n     '))
  check(tooSmall.length === 0, 'todo lo pulsable llega a 24×24 px')

  console.log('\nSección activa')
  await page.goto(`${BASE}/${LOCALE}`, { waitUntil: 'networkidle' })
  check(
    (await bar.locator('a[aria-current]').count()) === 0,
    'sobre el hero no hay ninguna entrada resaltada',
  )

  await page.evaluate(() => {
    const target = document.getElementById('experience')
    if (target) {
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY + 10,
        behavior: 'instant',
      })
    }
  })
  await page.waitForTimeout(400)
  const marked = await bar.locator('a[aria-current]').allInnerTexts()
  check(
    marked.length === 1 && /experien/i.test(marked[0] ?? ''),
    `en experiencia se resalta sólo esa entrada (${JSON.stringify(marked)})`,
  )

  console.log('\nFicha de proyecto')
  await page.goto(`${BASE}/${LOCALE}/projects`, { waitUntil: 'networkidle' })
  check(
    new URL(page.url()).pathname === `/${LOCALE}`,
    `/${LOCALE}/projects redirige a la portada (${new URL(page.url()).pathname})`,
  )

  const firstCard = page.locator('li:not([data-clone]) article h3 a').first()
  const cardHref = await firstCard.getAttribute('href')
  check(Boolean(cardHref?.startsWith('/')), `los enlaces de tarjeta son absolutos (${cardHref})`)

  await firstCard.click()
  const navigated = await page
    .waitForURL(new RegExp(`/${LOCALE}/projects/.+`), { timeout: 8000 })
    .then(() => true)
    .catch(() => false)
  check(navigated, `la ficha carga (${page.url()})`)
  await page.waitForLoadState('networkidle')

  const detailOverflow = await horizontalOverflow(page)
  if (detailOverflow > 1) console.log('    culpable:', await overflowCulprit(page))
  check(detailOverflow <= 1, 'la ficha no desborda en horizontal')

  const backHref = await page
    .locator('a', { hasText: /proyectos|projects/i })
    .first()
    .getAttribute('href')
  check(Boolean(backHref?.startsWith('/')), `el enlace de vuelta es absoluto (${backHref})`)

  console.log('\nMetadatos sociales')
  await page.goto(`${BASE}/${LOCALE}`, { waitUntil: 'networkidle' })

  const metaUrls = await page.evaluate(() => ({
    ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? null,
    icon: document.querySelector('link[rel="icon"]')?.getAttribute('href') ?? null,
  }))

  for (const [label, url] of Object.entries(metaUrls)) {
    if (!url) {
      check(false, `${label}: no se declara en el HTML`)
      continue
    }
    const target = new URL(url, BASE)
    const response = await page.request.get(`${BASE}${target.pathname}${target.search}`)
    check(
      response.ok(),
      `${label} se sirve (${response.status()} ${response.headers()['content-type'] ?? '?'})`,
    )
  }

  console.log('\nConsola')
  if (errors.length > 0) console.log('    ', errors.join('\n     '))
  check(errors.length === 0, 'ningún error de consola')

  await browser.close()

  const failed = results.filter((result) => !result.ok)
  console.log(`\n${results.length - failed.length}/${results.length} comprobaciones correctas.`)
  if (failed.length > 0) {
    console.log('\nFallan:')
    for (const result of failed) console.log(`  ✗ ${result.label}`)
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error('\nLa revisión no pudo completarse:', error.message)
  console.error(
    '\n¿Está el servidor levantado? (`npm start` o `npm run dev`)\n' +
      `¿Está Chrome en «${CHROME}»? Si no, pásalo con CHROME_PATH.`,
  )
  process.exitCode = 1
})
