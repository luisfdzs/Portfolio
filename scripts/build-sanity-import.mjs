#!/usr/bin/env node
/**
 * GENERA EL NDJSON DE IMPORTACIÓN A SANITY · `npm run migrate:build`
 *
 * Convierte el contenido de `content/` en el fichero que espera el importador de Sanity, de
 * modo que enchufar el panel a un proyecto nuevo sea un comando y no una tarde de copiar y
 * pegar. Después:
 *
 *   npm run migrate:import        (sanity dataset import … --replace)
 *
 * ## Por qué importa que exista
 *
 * La web funciona sin Sanity: `lib/content.ts` sirve `content/` cuando no hay panel. Pero en
 * el momento en que se crea el proyecto de Sanity, el dataset está vacío y el respaldo sigue
 * mandando —correcto, pero significa que el panel no controla nada—. Este script es el puente:
 * deja el CMS con exactamente lo que ya se está publicando, y desde ahí se edita.
 *
 * ## Dos cosas no obvias
 *
 * 1. **Se importa TypeScript directamente.** Node 24 quita las anotaciones de tipo por su
 *    cuenta, y todos los `import` de `content/*.ts` son `import type`, que desaparecen al
 *    despojar. Por eso funciona sin compilar nada y sin resolver el alias `@/`.
 * 2. **Las imágenes se suben con `_sanityAsset`.** Es la forma que tiene el importador de
 *    coger un fichero del disco y crear el asset: sin esto, los documentos entrarían sin
 *    captura y las tarjetas de proyecto perderían justo lo que las hace convincentes. La ruta
 *    va como `file://` **relativa al fichero NDJSON**, así que se calcula desde él.
 * 3. **El retrato del perfil NO se sube.** Es la única pieza de `content/` que no viaja al
 *    panel: el campo existe, pero vacío la web sirve `public/luis.webp`. Ver el comentario en
 *    el documento del perfil, más abajo.
 * 4. **Los `_id` llevan guion y NUNCA un punto**: `experience-swiftmet`, no
 *    `experience.swiftmet`. Para Sanity un `_id` es una ruta separada por puntos, y **sólo la
 *    raíz es pública**; todo lo que tenga un punto exige token de lectura, que es el mecanismo
 *    con el que `drafts.` esconde los borradores. Ver `idFor` más abajo: es un fallo real y
 *    silencioso, no una preferencia de estilo.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import process from 'node:process'
import { education, experience, profile, skills } from '../content/profile.ts'
import { projects } from '../content/projects.ts'

const OUT = join(process.cwd(), 'scripts', 'migration', 'import.ndjson')

/**
 * Rangos de orden en el formato que usa `@sanity/orderable-document-list`.
 *
 * El plugin guarda un «lexorank»: una cadena que se compara alfabéticamente, para que meter un
 * documento entre otros dos no obligue a reescribir los demás. Se generan espaciados de
 * 100.000 en 100.000 para que quepan inserciones sin tener que reordenar nada.
 */
function orderRank(index) {
  return `0|${String((index + 1) * 100000).padStart(6, '0')}:`
}

/**
 * El `_id` de un documento importado: tipo y slug unidos **por un guion**.
 *
 * El punto está prohibido y no es una cuestión de gusto. Sanity trata el `_id` como una ruta
 * separada por puntos y **publica sólo la raíz**: un documento con `_id` de la forma
 * `experience.swiftmet` queda en un subcamino y **exige token de lectura**, igual que los
 * borradores en `drafts.`. Ese es el mecanismo, no un efecto secundario
 * (https://www.sanity.io/docs/content-lake/ids).
 *
 * Cómo se manifiesta si alguien lo vuelve a poner: la importación dice «Done!», el panel
 * enseña los dieciséis documentos, y **la web sigue sirviendo `content/`** —porque
 * `lib/content.ts` recibe un array vacío del cliente anónimo del build y cae al respaldo,
 * exactamente como está diseñado para hacer—. Ni un error, ni un aviso raro: sólo un panel
 * que no manda nada. Pasó al enchufar Sanity el 2026-08-03 y costó encontrarlo porque
 * `profile`, que no lleva punto, sí se leía.
 */
function idFor(type, slug) {
  return `${type}-${slug}`
}

/** Un texto traducible tal y como lo espera el esquema: `{ es, en }`. */
function localized(value) {
  return value ? { es: value.es, en: value.en } : undefined
}

/**
 * Referencia a un fichero local para que el importador lo suba como asset.
 * `src` viene con barra inicial («/projects/swiftmet.webp») porque es una URL pública.
 */
function asset(image) {
  if (!image) return undefined
  const onDisk = join(process.cwd(), 'public', image.src.replace(/^\//, ''))
  // Relativa al NDJSON y con barras hacia delante: en Windows, `relative` devuelve `\`
  // y el importador interpreta la barra invertida como un carácter más del nombre.
  const fromNdjson = relative(dirname(OUT), onDisk).split('\\').join('/')
  return {
    _type: 'image',
    _sanityAsset: `image@file://./${fromNdjson}`,
    alt: localized(image.alt),
  }
}

/** Quita las claves con valor `undefined`: el importador las rechaza. */
function clean(document) {
  return JSON.parse(JSON.stringify(document))
}

const documents = []

// --- Perfil: un único documento, con `_id` fijo -----------------------------------------
// El `_id` tiene que ser exactamente «profile» porque `sanity/structure.ts` abre el singleton
// por ese identificador. Con un id generado, el panel mostraría un documento vacío al lado del
// importado y sería imposible saber cuál es el bueno.
documents.push(
  clean({
    _id: 'profile',
    _type: 'profile',
    name: profile.name,
    headline: localized(profile.headline),
    location: localized(profile.location),
    email: profile.email,
    linkedin: profile.linkedin,
    github: profile.github,
    bio: localized(profile.bio),
    // **El retrato se deja SIN subir a propósito**, aunque el campo exista en el panel: con
    // el campo vacío la web sirve `public/luis.webp` (ver `getProfile`), y así el fichero del
    // repositorio es lo que se ve mientras nadie elija otro. Subirlo aquí dejaría dos copias
    // de la misma foto con la del panel ganando, que es exactamente el fallo que se arregló:
    // cambiar el recorte en `public/` no cambiaba nada en producción, sin un solo error.
  }),
)

for (const [index, entry] of experience.entries()) {
  documents.push(
    clean({
      _id: idFor('experience', entry.slug),
      _type: 'experience',
      orderRank: orderRank(index),
      role: localized(entry.role),
      slug: { _type: 'slug', current: entry.slug },
      company: entry.company,
      client: entry.client ?? undefined,
      startDate: entry.range.start,
      endDate: entry.range.end ?? undefined,
      location: localized(entry.location),
      remote: entry.remote,
      summary: localized(entry.summary),
      stack: entry.stack,
      url: entry.url ?? undefined,
    }),
  )
}

for (const [index, entry] of education.entries()) {
  documents.push(
    clean({
      _id: idFor('education', entry.slug),
      _type: 'education',
      orderRank: orderRank(index),
      title: localized(entry.title),
      slug: { _type: 'slug', current: entry.slug },
      institution: localized(entry.institution),
      startDate: entry.range.start,
      endDate: entry.range.end ?? undefined,
      location: localized(entry.location),
      note: localized(entry.note),
      url: entry.url ?? undefined,
    }),
  )
}

for (const [index, group] of skills.entries()) {
  documents.push(
    clean({
      _id: idFor('skillGroup', group.key),
      _type: 'skillGroup',
      orderRank: orderRank(index),
      title: localized(group.title),
      slug: { _type: 'slug', current: group.key },
      items: group.items,
    }),
  )
}

for (const [index, project] of projects.entries()) {
  documents.push(
    clean({
      _id: idFor('project', project.slug),
      _type: 'project',
      orderRank: orderRank(index),
      name: project.name,
      slug: { _type: 'slug', current: project.slug },
      tagline: localized(project.tagline),
      year: project.year,
      status: project.status,
      role: localized(project.role),
      summary: localized(project.summary),
      highlights: project.highlights.map((highlight) => ({
        _type: 'localizedString',
        ...localized(highlight),
      })),
      stack: project.stack,
      liveUrl: project.liveUrl ?? undefined,
      repoUrl: project.repoUrl ?? undefined,
      note: localized(project.note),
      image: asset(project.image),
      featured: Boolean(project.featured),
    }),
  )
}

await mkdir(dirname(OUT), { recursive: true })
await writeFile(OUT, documents.map((document) => JSON.stringify(document)).join('\n') + '\n')

const counts = documents.reduce((totals, document) => {
  totals[document._type] = (totals[document._type] ?? 0) + 1
  return totals
}, {})

console.log(`\n${documents.length} documentos escritos en scripts/migration/import.ndjson`)
for (const [type, count] of Object.entries(counts))
  console.log(`  ${count.toString().padStart(2)} × ${type}`)
console.log('\nSiguiente paso:  npm run migrate:import')
