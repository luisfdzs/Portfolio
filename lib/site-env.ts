/**
 * ¿Este despliegue debe aparecer en Google?
 *
 * **Sólo la rama `main`.** Y se decide por la rama, no por `VERCEL_ENV`, porque el
 * proyecto de test despliega la rama `test` **como su propio entorno de producción**:
 * allí `VERCEL_ENV === 'production'` también. Usar esa variable dejaría el dominio de
 * test con `index, follow` y `Allow: /` — es decir, dos copias del mismo CV compitiendo
 * en Google por «Luis Fernández Sangil». Y aquí el daño es peor que en una web de
 * empresa: el resultado que un recruiter encuentre puede ser el de test, con contenido
 * a medio revisar.
 *
 * `VERCEL_GIT_COMMIT_REF` trae la rama desplegada y no hay que configurar nada:
 *
 *   proyecto `luisfernandezsangil`      rama `main`  → indexable
 *   proyecto `luisfernandezsangiltest`  rama `test`  → NO indexable
 *   previews de cualquier rama                       → NO indexable
 *   desarrollo local (sin variables)                 → NO indexable
 *
 * Falla del lado seguro: si mañana falta la variable, no se indexa.
 */
export const INDEXABLE_BRANCH = 'main'

export function isIndexable(): boolean {
  return (
    process.env.VERCEL_ENV === 'production' &&
    process.env.VERCEL_GIT_COMMIT_REF === INDEXABLE_BRANCH
  )
}
