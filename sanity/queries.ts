import { defineQuery } from 'next-sanity'

/**
 * CONSULTAS GROQ
 *
 * Todas proyectan **exactamente** la forma que espera `lib/content.ts`, para que los
 * esquemas de zod validen el mismo objeto que llega y no una versión intermedia. Las
 * imágenes se resuelven aquí y no en las vistas: `asset->` trae la URL y las
 * dimensiones reales del original, que es lo que `next/image` necesita para reservar el
 * hueco y no provocar salto de maquetación.
 */

const localized = `{ es, en }`

const image = `{
  "src": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  alt ${localized}
}`

/**
 * El perfil es un singleton: si hubiera más de uno, gana el primero por antigüedad.
 *
 * **El retrato se proyecta con `select(defined(photo.asset) => …)` y no con `photo {…}` a
 * secas**, que es la forma evidente y la equivocada: proyectar un campo vacío devuelve un
 * objeto con las cuatro claves a `null` en vez de `null`, y entonces la validación del perfil
 * **entero** falla y se cae al respaldo de `content/` con él, perdiendo de paso lo que sí esté
 * editado en el panel. Con el `select`, «no hay retrato elegido» llega como `null`, que es lo
 * que `getProfile` sabe rellenar con el retrato del repositorio.
 */
export const PROFILE_QUERY = defineQuery(`
  *[_type == "profile"] | order(_createdAt asc)[0] {
    name,
    headline ${localized},
    location ${localized},
    email,
    linkedin,
    github,
    bio ${localized},
    "photo": select(defined(photo.asset) => photo ${image})
  }
`)

export const EXPERIENCE_QUERY = defineQuery(`
  *[_type == "experience"] | order(orderRank asc) {
    "slug": slug.current,
    role ${localized},
    company,
    client,
    "range": { "start": startDate, "end": endDate },
    location ${localized},
    remote,
    summary ${localized},
    stack,
    url
  }
`)

export const EDUCATION_QUERY = defineQuery(`
  *[_type == "education"] | order(orderRank asc) {
    "slug": slug.current,
    title ${localized},
    institution,
    "range": { "start": startDate, "end": endDate },
    location ${localized},
    note ${localized},
    url
  }
`)

export const SKILLS_QUERY = defineQuery(`
  *[_type == "skillGroup"] | order(orderRank asc) {
    "key": slug.current,
    title ${localized},
    items
  }
`)

export const PROJECTS_QUERY = defineQuery(`
  *[_type == "project"] | order(orderRank asc) {
    "slug": slug.current,
    name,
    tagline ${localized},
    year,
    status,
    role ${localized},
    summary ${localized},
    "highlights": highlights[] ${localized},
    stack,
    liveUrl,
    repoUrl,
    note ${localized},
    image ${image},
    featured
  }
`)

/**
 * No hay consulta aparte de slugs para `generateStaticParams`: se derivan de la lista ya
 * validada (ver `getProjectSlugs` en `lib/content.ts`). Consultarlos por separado
 * generaría la ruta de un proyecto que la validación ha descartado, y quedaría una URL
 * prerrenderizada que devuelve 404 — peor que no existir, porque Google la indexa.
 */
