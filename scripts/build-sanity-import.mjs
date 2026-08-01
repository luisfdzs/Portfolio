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
    photo: asset(profile.photo),
  }),
)

for (const [index, entry] of experience.entries()) {
  documents.push(
    clean({
      _id: `experience.${entry.slug}`,
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
      _id: `education.${entry.slug}`,
      _type: 'education',
      orderRank: orderRank(index),
      title: localized(entry.title),
      slug: { _type: 'slug', current: entry.slug },
      institution: entry.institution,
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
      _id: `skillGroup.${group.key}`,
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
      _id: `project.${project.slug}`,
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
