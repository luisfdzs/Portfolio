#!/usr/bin/env node

// Vuelca los proyectos y la experiencia de `content/` al panel de Sanity.
//
// La web sirve el panel cuando tiene documentos y `content/` cuando no, así que un
// cambio escrito sólo en el repositorio no se ve en producción hasta que se sube.
// Esto lo sube: escribe un ndjson con los mismos identificadores que ya tienen los
// documentos (`project-<slug>`, `experience-<slug>`) y lo importa reemplazándolos.
//
//   node scripts/sync-sanity.mjs                 escribe el ndjson y lo importa
//   node scripts/sync-sanity.mjs --dry           sólo escribe el ndjson
//   node scripts/sync-sanity.mjs --dataset test  contra otro dataset
//
// Las fotos van dentro del propio ndjson (`_sanityAsset`): Sanity las guarda por su
// huella, así que volver a subir la misma imagen no crea un duplicado.

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { registerHooks } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'

// content/ es TypeScript y se importa entre ficheros sin extensión: Node necesita
// que alguien se la ponga antes de resolver.
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('.')) {
      const asIs = new URL(specifier, context.parentURL)
      const asTs = new URL(`${specifier}.ts`, context.parentURL)
      if (!existsSync(fileURLToPath(asIs)) && existsSync(fileURLToPath(asTs))) {
        return next(`${specifier}.ts`, context)
      }
    }
    return next(specifier, context)
  },
})

const root = process.cwd()
const { projects } = await import(pathToFileURL(path.join(root, 'content/projects.ts')).href)
const { experience } = await import(pathToFileURL(path.join(root, 'content/profile.ts')).href)

const args = process.argv.slice(2)
const dry = args.includes('--dry')
const datasetIndex = args.indexOf('--dataset')
const dataset = datasetIndex === -1 ? 'production' : args[datasetIndex + 1]

const OUT = path.join(root, 'scripts/migration/sanity.ndjson')

const rank = (index) => `0|${index + 1}00000:`
const slug = (current) => ({ _type: 'slug', current })
const keyed = (items, prefix, type) =>
  items.map((item, index) => ({ _type: type, _key: `${prefix}${index}`, ...item }))

/** La imagen viaja como fichero: el importador la sube y deja la referencia puesta. */
function asset(image) {
  if (!image) return undefined
  const file = path.join(root, 'public', image.src.replace(/^\//, ''))
  if (!existsSync(file)) throw new Error(`Falta la imagen ${image.src}`)
  return {
    _type: 'image',
    _sanityAsset: `image@${pathToFileURL(file).href}`,
    alt: image.alt,
  }
}

/** Sanity guarda los campos vacíos como ausentes, no como null. */
const clean = (value) => {
  if (Array.isArray(value)) return value.map(clean)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry !== undefined && entry !== null)
        .map(([key, entry]) => [key, clean(entry)]),
    )
  }
  return value
}

const docs = [
  ...projects.map((project, index) => ({
    _id: `project-${project.slug}`,
    _type: 'project',
    orderRank: rank(index),
    name: project.name,
    slug: slug(project.slug),
    tagline: project.tagline,
    year: project.year,
    status: project.status,
    role: project.role,
    summary: project.summary,
    highlights: keyed(project.highlights ?? [], 'highlight', 'localizedString'),
    stack: project.stack,
    liveUrl: project.liveUrl,
    repoUrl: project.repoUrl,
    note: project.note,
    image: asset(project.image),
    featured: Boolean(project.featured),
  })),
  ...experience.map((entry, index) => ({
    _id: `experience-${entry.slug}`,
    _type: 'experience',
    orderRank: rank(index),
    role: entry.role,
    slug: slug(entry.slug),
    company: entry.company,
    clients: keyed(entry.clients ?? [], 'client', 'client'),
    startDate: entry.range.start,
    endDate: entry.range.end,
    location: entry.location,
    remote: entry.remote,
    summary: entry.summary,
    stack: entry.stack,
    url: entry.url,
  })),
]

await mkdir(path.dirname(OUT), { recursive: true })
await writeFile(OUT, `${docs.map((doc) => JSON.stringify(clean(doc))).join('\n')}\n`, 'utf8')
console.log(`${docs.length} documentos escritos en ${path.relative(root, OUT)}`)

if (dry) process.exit(0)

console.log(`\nImportando en «${dataset}»…`)
// Va por shell porque en Windows npx es un .cmd y sin shell no llega a arrancar.
const result = spawnSync(
  `npx --no-install sanity dataset import "${OUT}" --dataset ${dataset} --replace`,
  { stdio: 'inherit', shell: true },
)

process.exitCode = result.status ?? 1
