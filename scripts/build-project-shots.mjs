#!/usr/bin/env node
/**
 * CAPTURAS DE PORTADA DE LOS PROYECTOS · `npm run shots`
 *
 * Lo que se ve en la tarjeta de cada proyecto es **la sección principal de su página
 * principal**: la primera pantalla de la web en vivo, tal y como la ve quien entra. No un
 * recorte de una captura larga ni un montaje.
 *
 * Cómo lo consigue: abre cada `liveUrl` en un Chrome real con la ventana **a 1400×700**, que
 * es exactamente el 2:1 del hueco de la tarjeta (`Figure`, `ratio="wide"`), y guarda el
 * viewport. Al medir la ventana con la proporción de destino no hay que recortar nada, y eso
 * es la diferencia con la versión anterior de este script: recortaba una captura de 1568×698 a
 * 2:1 y se comía 86 px por lado, es decir el borde izquierdo del titular y de la navegación.
 *
 * Se captura al doble de densidad (`deviceScaleFactor: 2`) y se reduce a 1400×700 con sharp:
 * el texto de una interfaz reducido desde el doble se lee, y capturado a 1:1 se ve sucio.
 *
 * Uso:
 *   npm run shots                       todos los proyectos publicados
 *   npm run shots -- cedece mila-barber   sólo esos slugs
 *
 * La lista de proyectos y sus URLs salen de `content/`, así que este script no tiene ningún
 * mapa que mantener: un proyecto nuevo en `content/projects.config.ts` ya está aquí. Node
 * despoja los tipos por su cuenta y todos los `import` de `content/` son `import type`, así
 * que se importa el TypeScript directamente (igual que en `build-sanity-import.mjs`).
 *
 * Usa `playwright-core` con el Chrome YA instalado: no descarga navegadores.
 */

import { join } from 'node:path'
import process from 'node:process'
import { chromium } from 'playwright-core'
import sharp from 'sharp'
import { projects } from '../content/projects.ts'

/** El hueco de la tarjeta: 2:1. Ver `components/ui/Figure.tsx`. */
const WIDTH = 1400
const HEIGHT = WIDTH / 2

/**
 * Cuánto se espera con la página ya cargada antes de disparar.
 *
 * No es un margen de seguridad caprichoso: casi todas estas webs tienen una animación de
 * entrada —el texto aparece desde abajo, el vídeo de portada arranca, el mosaico se pone en
 * marcha—. Capturar antes de que termine deja la tarjeta con el titular a medio opacidad, que
 * se lee como una captura mal hecha y no como un efecto.
 */
const SETTLE_MS = 4500

/** Chrome instalado en el sistema. Se puede sobreescribir con CHROME_PATH. */
const CHROME =
  process.env.CHROME_PATH ??
  (process.platform === 'win32'
    ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    : process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : '/usr/bin/google-chrome')

const only = process.argv.slice(2)
const targets = projects.filter(
  (project) => project.liveUrl && (only.length === 0 || only.includes(project.slug)),
)

if (targets.length === 0) {
  console.error(
    only.length > 0
      ? `Ningún proyecto publicado con esos slugs: ${only.join(', ')}`
      : 'Ningún proyecto publicado tiene `liveUrl`.',
  )
  process.exit(1)
}

const out = join(process.cwd(), 'public', 'projects')

const browser = await chromium.launch({ executablePath: CHROME })
const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 2,
  // El castellano primero: estas webs negocian el idioma por cabecera, y una captura en
  // inglés en la versión castellana de la tarjeta canta.
  locale: 'es-ES',
})

let written = 0
const failed = []

for (const project of targets) {
  const page = await context.newPage()

  try {
    await page.goto(project.liveUrl, { waitUntil: 'load', timeout: 60000 })
    // `networkidle` es lo que espera a las fuentes y a las imágenes de la primera pantalla,
    // pero un vídeo en bucle o una conexión abierta lo dejan sin cumplirse nunca: se le da un
    // tope y se sigue. Esperar de menos se ve en la captura; esperar para siempre, no.
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
    await page.evaluate(() => document.fonts.ready)
    // Arriba del todo: si la web restaura la posición del scroll, la «sección principal» que
    // se captura sería la mitad de otra.
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(SETTLE_MS)

    const shot = await page.screenshot({ type: 'png' })

    await sharp(shot)
      .resize(WIDTH, Math.round(HEIGHT))
      .webp({ quality: 82 })
      .toFile(join(out, `${project.slug}.webp`))

    written += 1
    console.log(`[capturas] ${project.name} → public/projects/${project.slug}.webp`)
  } catch (error) {
    failed.push(project.slug)
    console.error(`[capturas] ✗ ${project.name} (${project.liveUrl}): ${error.message}`)
  } finally {
    await page.close()
  }
}

await context.close()
await browser.close()

console.log(`\n[capturas] ${written} de ${targets.length} escritas en public/projects/.`)

if (failed.length > 0) {
  console.error(`[capturas] Sin captura: ${failed.join(', ')}`)
  process.exit(1)
}
