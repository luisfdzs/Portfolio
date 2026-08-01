/**
 * RECORTA Y CONVIERTE LAS CAPTURAS DE LOS PROYECTOS
 *
 * Las capturas se toman de las webs en vivo con el navegador, a 1568×698 (la proporción del
 * viewport que devuelve la herramienta), y llegan como JPEG sueltos en una carpeta temporal.
 * Este script las deja como las quiere la web: **2:1 exacto y WebP**.
 *
 * Por qué 2:1 y no 16:10, que es la proporción típica de una captura: 698 px de alto sólo dan
 * para 1117 px de ancho a 16:10, así que habría que recortar 225 px por lado — y ahí se va la
 * tercera columna de la cuadrícula de producto de Bonsái y media navegación de Manfisa. A 2:1
 * el recorte es de 86 px por lado, que en una captura de web no se echa en falta.
 *
 * Uso:
 *   node scripts/build-project-shots.mjs <carpeta-con-los-jpg>
 *
 * El mapa de abajo dice qué fichero es de qué proyecto, y hay que actualizarlo si se vuelven
 * a tomar las capturas: los nombres que genera el navegador llevan una marca de tiempo y no
 * dicen nada. No es bonito, pero es honesto — la alternativa sería adivinar por orden.
 */
import { readdir } from 'node:fs/promises'
import { basename, join } from 'node:path'
import sharp from 'sharp'

/** Ancho final. 1400 cubre la ficha a pantalla completa sin pasarse de peso. */
const WIDTH = 1400
const HEIGHT = WIDTH / 2

/** Sufijo del fichero de origen → slug del proyecto. */
const MAP = {
  '-0': 'swiftmet',
  '-1': 'manfisa',
  '-3': 'almuerziko-san-fermin',
  '-5': 'blablatour',
  '-7': 'sangil-studio',
  '-8': 'bonsai-artesania',
}

const source = process.argv[2]
if (!source) {
  console.error('Falta la carpeta de origen.\n  node scripts/build-project-shots.mjs <carpeta>')
  process.exit(1)
}

const files = (await readdir(source)).filter((name) => name.endsWith('.jpg'))
const out = join(process.cwd(), 'public', 'projects')

let written = 0

for (const [suffix, slug] of Object.entries(MAP)) {
  const match = files.find((name) => basename(name, '.jpg').endsWith(suffix))
  if (!match) {
    console.warn(`[capturas] Sin fichero para «${slug}» (sufijo ${suffix}): se omite.`)
    continue
  }

  const target = join(out, `${slug}.webp`)

  await sharp(join(source, match))
    // `cover` anclado ARRIBA e IZQUIERDA, no centrado. Las dos anclas son deliberadas:
    //
    // - Arriba, porque ahí están la cabecera y el titular, que es lo que hace que la captura
    //   se reconozca como una web y no como una fotografía cualquiera.
    // - A la izquierda, porque una web se maqueta de izquierda a derecha: el logotipo y el
    //   titular arrancan en el margen izquierdo. Con el recorte centrado —que es lo primero
    //   que probé— se comían 86 px por lado y salía «NGIL STUDIO» en vez de «SANGIL STUDIO»
    //   y un titular de Manfisa empezado por la mitad de la primera letra. Lo que sobra por
    //   la derecha de una captura suele ser margen; lo que sobra por la izquierda, nunca.
    .resize(WIDTH, Math.round(HEIGHT), { fit: 'cover', position: 'left top' })
    .webp({ quality: 82 })
    .toFile(target)

  written += 1
  console.log(`[capturas] ${match} → public/projects/${slug}.webp`)
}

console.log(`\n[capturas] ${written} de ${Object.keys(MAP).length} escritas en public/projects/.`)
