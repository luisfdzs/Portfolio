#!/usr/bin/env node
/**
 * VERIFICACIÓN EN MÓVIL · `npm run check:mobile`
 *
 * Abre el sitio en un Chrome real a 390×844 (tamaño de iPhone) y comprueba lo que en
 * escritorio no se ve. No es un test unitario: es la lista de cosas que se rompen en móvil y
 * que desde un portátil no se notan —varias de ellas ya han pasado en los proyectos de los
 * que este hereda la arquitectura—.
 *
 * Lo que este script existe para impedir:
 *  1. **Desbordamiento horizontal.** La causa más habitual es un correo o una URL larga sin
 *     `break-all` en una caja de 390 px. Aquí hay un correo a tamaño de titular, así que es
 *     el candidato número uno.
 *  2. **El panel del menú midiendo 0 px de alto.** El `backdrop-blur` de la barra convierte
 *     al elemento que lo contiene en bloque contenedor de sus descendientes `fixed`, y el
 *     panel se colapsa. Se ve correcto en el DOM y no se ve en pantalla.
 *  3. **La barra fija tapando el final del pie.** El `<body>` se reserva un hueco de
 *     `--spacing-nav-mobile`; si alguien lo quita, el copyright queda detrás de los iconos.
 *  4. **Áreas pulsables por debajo de los 24 px que pide WCAG 2.2**, que es exactamente el
 *     problema de los enlaces pequeños del pie y del selector de idioma cuando se usan con
 *     el dedo y no con el ratón.
 *  5. **`href()` devolviendo rutas relativas**, que se encadenan y dan 404. Se comprueba
 *     desde una ficha de proyecto, que es donde el fallo aparece y no desde la portada,
 *     donde cuela por casualidad.
 *  6. **Las dos navegaciones con el mismo nombre accesible.** Cabecera y barra de móvil
 *     coexisten en el DOM; si comparten `aria-label`, un lector de pantalla las lista
 *     idénticas.
 *
 * Usa `playwright-core` con el Chrome YA instalado: no descarga navegadores.
 * Requiere el servidor levantado (`npm run dev` o `npm start`) o un despliegue:
 *
 *   npm run check:mobile
 *   BASE=https://luisfernandezsangiltest.vercel.app npm run check:mobile
 *   LOCALE=en npm run check:mobile
 */

import process from 'node:process'
import { chromium } from 'playwright-core'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const LOCALE = process.env.LOCALE ?? 'es'

/** Chrome instalado en el sistema. Se puede sobreescribir con CHROME_PATH. */
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

/** Cuántos píxeles desborda el documento por los lados. Debe ser 0 (se tolera 1 por redondeo). */
function horizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
}

/**
 * El elemento más ancho que sobresale del viewport. Sin esto, un fallo de desbordamiento sólo
 * dice «desborda 240 px» y hay que buscarlo a mano por toda la página.
 */
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
  /**
   * El estado y la URL de cada respuesta fallida.
   *
   * Sin esto, un recurso que da 404 llega a la consola como «Failed to load resource: 404» sin
   * decir cuál, y hay que abrir las herramientas del navegador a mano para averiguarlo. Pasó
   * en la primera ejecución de este script.
   */
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`HTTP ${response.status()} · ${response.url()}`)
  })

  console.log(`\nRevisión móvil (390×844) sobre ${BASE}/${LOCALE}\n`)

  // --- Portada ---------------------------------------------------------------------------
  console.log('Portada')
  await page.goto(`${BASE}/${LOCALE}`, { waitUntil: 'networkidle' })

  const homeOverflow = await horizontalOverflow(page)
  if (homeOverflow > 1) console.log('    culpable:', await overflowCulprit(page))
  check(homeOverflow <= 1, 'la portada no desborda en horizontal')

  // La cabecera es de escritorio y no debe existir visualmente en móvil: si se ve, se están
  // gastando 4 rem de pantalla en una navegación que ya está abajo.
  check(
    !(await page.locator('header nav').first().isVisible()),
    'la cabecera de escritorio está oculta en móvil',
  )

  const bar = page.locator(
    `nav[aria-label="${LOCALE === 'es' ? 'Navegación de móvil' : 'Mobile navigation'}"]`,
  )
  check(await bar.isVisible(), 'la barra inferior de móvil se ve')

  // Los dos `<nav>` de navegación no pueden llamarse igual (ver el punto 6 de la cabecera).
  const navNames = await page.evaluate(() =>
    [...document.querySelectorAll('nav[aria-label]')].map((n) => n.getAttribute('aria-label')),
  )
  check(
    new Set(navNames).size === navNames.length,
    `cada <nav> tiene un nombre distinto (${navNames.length})`,
  )

  // Cinco destinos: cuatro secciones y el menú.
  check(
    (await bar.locator('li').count()) === 5,
    `la barra tiene cinco destinos (${await bar.locator('li').count()})`,
  )

  // --- El menú: abrir, medir, bloquear scroll, cerrar -------------------------------------
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
  // El fallo del `backdrop-blur`: el panel existe pero mide cero. Con dos entradas y el
  // selector de idioma no baja de 150 px; por debajo de eso, está colapsado.
  check(
    (panelBox?.height ?? 0) > 150,
    `el panel tiene altura real (${Math.round(panelBox?.height ?? 0)} px)`,
  )

  // No puede solaparse con la barra: si lo hace, tapa los iconos con los que se cierra.
  const barBox = await bar.boundingBox()
  check(
    (panelBox?.y ?? 0) + (panelBox?.height ?? 0) <= (barBox?.y ?? 0) + 2,
    'el panel queda por encima de la barra, sin taparla',
  )

  check(
    (await page.evaluate(() => document.body.style.overflow)) === 'hidden',
    'el scroll de la página se bloquea con el menú abierto',
  )

  // Las entradas del panel tienen que LEERSE: papel sobre papel es el fallo clásico.
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
      // El fondo lo pinta el panel, no el enlace.
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

  // --- El pie no queda debajo de la barra -------------------------------------------------
  console.log('\nPie')
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(600)

  const footerClear = await page.evaluate(() => {
    const footer = document.querySelector('footer')
    const nav = document.querySelector('nav[data-print="hide"]')
    if (!footer || !nav) return null
    return Math.round(nav.getBoundingClientRect().top - footer.getBoundingClientRect().bottom)
  })
  // Tolerancia de 1 px, igual que en el desbordamiento horizontal: el hueco que el `<body>`
  // se reserva y el alto de la barra son los dos 4rem, así que la holgura ideal es 0 y el
  // navegador redondea a −1. Un solapamiento real se cuenta en decenas de píxeles.
  check(
    (footerClear ?? -99) >= -1,
    `el pie termina por encima de la barra (${footerClear} px de holgura)`,
  )

  // --- Áreas pulsables (WCAG 2.2, 24×24 CSS px) ------------------------------------------
  console.log('\nÁreas pulsables')
  const tooSmall = await page.evaluate(() => {
    const offenders = []
    for (const el of document.querySelectorAll('a[href], button')) {
      const style = getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden') continue
      // Los elementos ocultos visualmente pero accesibles (`sr-only`) miden 1×1 a propósito:
      // el enlace «Saltar al contenido» sólo aparece cuando recibe el foco, y entonces sí es
      // grande. Contarlo como área pulsable pequeña era un falso positivo del script.
      if (el.classList.contains('sr-only')) continue
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) continue
      // La utilidad `tap` amplía el área con un ::before invisible que no entra en el
      // rectángulo del elemento: se le suma su margen negativo declarado.
      const grow = el.classList.contains('tap') ? 12 : 0
      if (rect.width + grow < 24 || rect.height + grow < 24) {
        offenders.push(
          `${el.tagName.toLowerCase()}«${(el.textContent ?? '').trim().slice(0, 24)}» ` +
            `${Math.round(rect.width)}×${Math.round(rect.height)}`,
        )
      }
    }
    return offenders
  })
  if (tooSmall.length > 0) console.log('    ', tooSmall.join('\n     '))
  check(tooSmall.length === 0, 'todo lo pulsable llega a 24×24 px')

  // --- Ficha de proyecto: el sitio donde las rutas relativas explotan ---------------------
  console.log('\nFicha de proyecto')
  await page.goto(`${BASE}/${LOCALE}/projects`, { waitUntil: 'networkidle' })
  const indexOverflow = await horizontalOverflow(page)
  if (indexOverflow > 1) console.log('    culpable:', await overflowCulprit(page))
  check(indexOverflow <= 1, 'el índice de proyectos no desborda')

  const firstCard = page.locator('article h3 a').first()
  const cardHref = await firstCard.getAttribute('href')
  check(Boolean(cardHref?.startsWith('/')), `los enlaces de tarjeta son absolutos (${cardHref})`)

  await firstCard.click()
  // `waitForURL` y no `waitForLoadState('networkidle')`: la navegación de Next es de cliente,
  // así que la red se queda quieta enseguida y `networkidle` resolvía **antes** de que la
  // ruta hubiera cambiado. La comprobación fallaba con la URL del índice, dando a entender
  // que el enlace estaba roto cuando lo que estaba mal era la espera.
  const navigated = await page
    .waitForURL(new RegExp(`/${LOCALE}/projects/.+`), { timeout: 8000 })
    .then(() => true)
    .catch(() => false)
  check(navigated, `la ficha carga (${page.url()})`)
  await page.waitForLoadState('networkidle')

  const detailOverflow = await horizontalOverflow(page)
  if (detailOverflow > 1) console.log('    culpable:', await overflowCulprit(page))
  check(detailOverflow <= 1, 'la ficha no desborda en horizontal')

  // Desde la ficha, el enlace de vuelta y el del idioma tienen que seguir siendo absolutos:
  // es aquí donde una ruta relativa se encadenaría a `/es/projects/…`.
  const backHref = await page
    .locator('a', { hasText: /proyectos|projects/i })
    .first()
    .getAttribute('href')
  check(Boolean(backHref?.startsWith('/')), `el enlace de vuelta es absoluto (${backHref})`)

  // --- Metadatos que sólo piden los rastreadores -------------------------------------------
  /**
   * La imagen de apertura social y el favicon, pedidos **a mano**.
   *
   * Hacen falta porque un navegador normal no descarga la imagen de `og:image`: sólo la piden
   * LinkedIn, WhatsApp o Slack al desplegar la vista previa de un enlace. Así que un fallo ahí
   * es invisible en local, invisible en producción y visible justo el día que se comparte el
   * enlace en una candidatura.
   *
   * Y pasó: `ImageResponse` devolvía 500 porque Satori exige `display: flex` explícito en
   * cualquier `div` con más de un hijo, y una interpolación de texto creaba dos. El error era
   * «failed to pipe response», sin más pista. Ver `app/(site)/[locale]/opengraph-image.tsx`.
   */
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
    /**
     * Se reconstruye contra `BASE` quedándose sólo con la ruta y la query.
     *
     * `og:image` se escribe **absoluta y apuntando al dominio canónico de producción** (lo
     * exige `metadataBase`), así que usar la URL tal cual haría que una revisión en local
     * comprobara producción. Sonaba a error del script y era lo contrario: la primera vez que
     * se ejecutó, delató que producción seguía con el build roto.
     */
    const target = new URL(url, BASE)
    const response = await page.request.get(`${BASE}${target.pathname}${target.search}`)
    check(
      response.ok(),
      `${label} se sirve (${response.status()} ${response.headers()['content-type'] ?? '?'})`,
    )
  }

  // --- Sin errores de consola -------------------------------------------------------------
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
