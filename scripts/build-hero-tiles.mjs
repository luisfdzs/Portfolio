#!/usr/bin/env node
/**
 * TEJAS DE LA PORTADA · `node scripts/build-hero-tiles.mjs`
 *
 * Descarga las dieciséis fotografías del escenario cinético de la portada y las deja en
 * `public/hero/` ya recortadas, graduadas y en WebP. Existe para que la carpeta sea
 * **reproducible**: sin este script, `public/hero/` es un montón de binarios sin explicación y
 * nadie se atreve a tocar ninguno.
 *
 * Las dieciséis son **CC0 1.0** (dominio público, sin atribución exigida) y se localizaron con la
 * API de Openverse, que no pide clave. La procedencia de cada una está en `public/hero/CREDITS.md`;
 * ahí está también por qué se descartó CC-BY.
 *
 * Al terminar imprime la tabla de procedencia en Markdown, lista para pegar en `CREDITS.md`. Es
 * la parte que antes se copiaba a mano de la respuesta de la API, que es exactamente el paso que
 * se salta quien tiene prisa — y una foto sin procedencia documentada es una foto que hay que
 * quitar.
 *
 * Sólo se ejecuta a mano, cuando haya que cambiar alguna teja. No forma parte del build: las
 * imágenes están versionadas en el repositorio, y hacer que un despliegue dependa de que
 * Openverse conteste sería regalar un punto de fallo a cambio de nada.
 */

import { mkdirSync } from 'node:fs'
import process from 'node:process'
import sharp from 'sharp'

const OUT = new URL('../public/hero/', import.meta.url)

/**
 * La selección, con el `id` de Openverse de cada foto.
 *
 * Se eligieron a ojo sobre una hoja de contactos de ~200 candidatas, con tres criterios:
 * **oscuras** (el sitio es grafito y una foto clara abre un agujero en la composición),
 * **legibles a 200 px de ancho** —que es lo que mide una teja en columna— y **temáticamente
 * distintas entre sí**: cuatro fotos de portátil con código serían cuatro veces la misma teja.
 *
 * `theme` no lo usa el script: documenta qué papel juega cada una en el escenario, para que al
 * sustituir una se busque un reemplazo del mismo tema y la mezcla no se desequilibre.
 */
const CHOSEN = [
  { id: '58f92c3a-d455-4941-9aa0-d7638ec004bf', slug: 'datacenter-aisle', theme: 'servidores' },
  { id: '674c77a7-017c-4de5-b44b-b54805b40446', slug: 'switch-port', theme: 'red' },
  { id: 'f4a0cabe-4e2d-4018-8700-9bd267beaa73', slug: 'code-editor', theme: 'codigo' },
  { id: 'd03c370a-816d-4e66-94a2-16d2c4ce0bb8', slug: 'code-dense', theme: 'codigo' },
  { id: 'b6cdb485-bad8-4951-ac84-402019b27577', slug: 'laptop-code-close', theme: 'codigo' },
  { id: '14cdc478-1b96-4745-8ed7-4c186331faf0', slug: 'typing-laptop', theme: 'teclear' },
  { id: 'e04b0fa5-4296-4a2f-a098-eda45aaf94c5', slug: 'typing-dark', theme: 'teclear' },
  { id: 'f01a9429-f23a-4127-b131-32114d5a5c34', slug: 'typing-warm', theme: 'teclear' },
  { id: 'ef822ae6-1776-41a9-973e-eac8804b9112', slug: 'circuit-board', theme: 'hardware' },
  { id: 'f628df35-94f6-4b47-ab47-ff71d069c220', slug: 'desk-bokeh', theme: 'puesto' },
  { id: '6634708b-fbe6-4f23-9eed-b01d0f8ce403', slug: 'dev-at-monitor', theme: 'puesto' },

  /*
   * Las cinco de la portada inmersiva. El escenario pasó de ser una banda en la mitad derecha a
   * ocupar la primera pantalla completa, y con once tejas repartidas en cinco columnas la
   * repetición se veía: la misma foto salía dos veces a la vez en pantalla.
   *
   * Se eligieron con el mismo criterio que las once primeras —oscuras, legibles a 200 px y
   * temáticamente distintas—, sobre una hoja de contactos de 771 candidatas CC0. Las dos
   * primeras cubren temas que no había y que son justo los que dicen «esto es trabajo de
   * verdad» y no «alguien delante de un portátil»: un panel de métricas y una topología física.
   */
  {
    id: 'fc187610-55b4-4785-8294-37b3c3c7cb18',
    slug: 'metrics-dashboard',
    theme: 'observabilidad',
  },
  { id: '6a9e12cd-1883-41c7-8a2b-4d6f353f0777', slug: 'patch-panel', theme: 'red' },
  { id: '85ae2149-a6c5-4e4a-997c-0c17beb16191', slug: 'fiber-optics', theme: 'red' },
  { id: 'd5483644-b90f-403e-864b-ab54826f87cd', slug: 'code-angled', theme: 'codigo' },
  { id: '3c928305-ee63-40a3-9ed9-7e54ce4bed62', slug: 'code-bokeh', theme: 'codigo' },
]

/**
 * 600×400, y este número ES el peso que se descarga.
 *
 * Importa entenderlo antes de tocarlo: el cargador de imágenes del proyecto
 * (`sanity/imageLoader.ts`) devuelve las rutas locales **sin transformar**, porque el que
 * redimensiona es la CDN de Sanity y estas tejas no están en Sanity sino en `public/`. Así que
 * `next/image` NO genera variantes de estos archivos: lo que se genera aquí es exactamente lo
 * que viaja por la red. No hay una segunda red de seguridad.
 *
 * 600 es el ancho máximo al que se pinta una teja en pantalla de densidad 2 (~300 px CSS en la
 * composición de tres columnas de escritorio). Más ancho es peso que nadie ve; más estrecho se
 * nota blando en un portátil retina. Los originales venían a 5472 px.
 *
 * 3:2 para las once, y no la proporción de cada original: en una columna que se desplaza, tejas
 * de proporciones distintas hacen que el ritmo vertical parezca un error de maquetación.
 */
const WIDTH = 600
const HEIGHT = 400

/**
 * Calidad WebP. 66 y no 80: son once fotos de fondo, detrás de una máscara, un velo y —la mitad
 * del tiempo— del retrato, y moviéndose. El artefacto de compresión que se vería en una captura
 * de proyecto a pantalla completa aquí no llega a percibirse, y la diferencia entre 66 y 80 es la
 * diferencia entre que la decoración pese lo que pesa el resto de la portada o la mitad.
 */
const QUALITY = 66

/** El grado. Horneado en el archivo y no en CSS — el porqué está en `CREDITS.md`. */
const GRADE = { brightness: 0.92, saturation: 0.78 }

async function main() {
  mkdirSync(OUT, { recursive: true })
  let total = 0
  const failed = []
  const credits = []

  for (const { id, slug, theme } of CHOSEN) {
    try {
      // El detalle de la imagen da la URL del original a tamaño completo.
      const detail = await fetch(`https://api.openverse.org/v1/images/${id}/`, {
        headers: { 'User-Agent': 'portfolio-hero-tiles/1.0' },
      })
      if (!detail.ok) throw new Error(`Openverse ${detail.status}`)
      const { url, license, title, provider, foreign_landing_url: landing } = await detail.json()

      // Cinturón de seguridad: si una foto deja de ser CC0, no entra. Es la única comprobación
      // del script que no es cosmética — el resto se puede arreglar mirando el resultado.
      if (license !== 'cc0' && license !== 'pdm') {
        throw new Error(`licencia «${license}»: sólo se aceptan cc0 y pdm`)
      }

      const image = await fetch(url, { headers: { 'User-Agent': 'portfolio-hero-tiles/1.0' } })
      if (!image.ok) throw new Error(`descarga ${image.status}`)

      const { size } = await sharp(Buffer.from(await image.arrayBuffer()))
        // `attention` recorta por la zona de más detalle en vez de por el centro: en una foto de
        // pasillo de servidores, el centro geométrico suele ser suelo.
        .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'attention' })
        .modulate(GRADE)
        .webp({ quality: QUALITY, effort: 6 })
        .toFile(new URL(`${slug}.webp`, OUT).pathname.replace(/^\/([A-Za-z]:)/, '$1'))

      total += size
      credits.push({ slug, theme, title: title ?? '—', provider: provider ?? '—', landing })
      console.log(`  ✓ ${slug.padEnd(20)} ${String(Math.round(size / 1024)).padStart(4)} KB`)
    } catch (error) {
      failed.push(slug)
      console.log(`  ✗ ${slug.padEnd(20)} ${error.message}`)
    }
  }

  console.log(
    `\n${CHOSEN.length - failed.length}/${CHOSEN.length} tejas · ${Math.round(total / 1024)} KB en total`,
  )
  if (failed.length > 0) {
    console.log(
      '\nNo se pudo reconstruir: ' +
        failed.join(', ') +
        '\nLas que ya estaban en public/hero/ siguen intactas.',
    )
    process.exitCode = 1
  }

  // La tabla de `CREDITS.md`, ya formateada. Prettier reformatea el ancho de las columnas al
  // guardar, así que aquí no se alinea nada a mano.
  if (credits.length > 0) {
    console.log('\nProcedencia (para CREDITS.md):\n')
    console.log('| Archivo | Papel | Título original | Licencia | Fuente | Original |')
    console.log('| --- | --- | --- | --- | --- | --- |')
    for (const c of credits) {
      console.log(
        `| \`${c.slug}.webp\` | ${c.theme} | ${c.title} | CC0 1.0 | ${c.provider} | ${c.landing} |`,
      )
    }
  }
}

main().catch((error) => {
  console.error('\nLa reconstrucción no pudo completarse:', error.message)
  process.exitCode = 1
})
