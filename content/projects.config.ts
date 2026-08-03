/**
 * QUÉ PROYECTOS SALEN EN LA WEB, Y EN QUÉ ORDEN
 *
 * **Este es el único fichero que hay que tocar para añadir, quitar o reordenar un
 * proyecto.** Con poner el título basta: el orden de esta lista es el orden en que se
 * publican, y `featured` marca por cuáles abre el carrusel de la portada. Todo lo demás
 * —el resumen, el stack, la captura— vive en la ficha del proyecto, en `content/projects.ts`.
 *
 * ## Cómo se añade uno
 *
 *   1. Se escribe el título aquí, en el sitio de la lista que le toque.
 *   2. Se escribe su ficha en `content/projects.ts`, con el mismo `name`.
 *   3. Se genera la captura de portada: `npm run shots -- <slug>`.
 *
 * Si falta el paso 2, el build lo dice por su nombre y el proyecto **no se publica**. Es
 * deliberado: media tarjeta —sin frase, sin año y con el hueco tramado donde va la captura—
 * la lee un recruiter como un descuido, y este portfolio existe para lo contrario. El aviso
 * queda en el log del build, que es donde alguien lo va a leer.
 *
 * ## Cómo se quita uno
 *
 * Se borra su línea de aquí. La ficha puede quedarse: no se publica lo que no está en esta
 * lista, y conservarla cuesta cero y ahorra reescribirla si el proyecto vuelve.
 *
 * ## Qué hay y qué no
 *
 * Están todos los repositorios de github.com/luisfdzs **menos Manfisa**, que se retiró de la
 * web a propósito. La lista de esta web y la de GitHub no tienen por qué coincidir nunca: un
 * repositorio es código y una tarjeta es un argumento de venta.
 */

/** Un proyecto de la lista: el título solo, o el título con sus banderas. */
export type ProjectListing = string | { title: string; featured?: boolean }

/**
 * **En el carrusel de la portada salen todos**, así que `featured` ya no decide quién sale
 * sino **por dónde se abre**: primero los marcados y detrás el resto, cada grupo en el orden
 * de esta lista (ver `getCarouselProjects`). Los cuatro de ahora están elegidos para que la
 * primera vuelta enseñe el alcance del trabajo y no cuatro veces lo mismo: un catálogo
 * industrial B2B, una aplicación con cuentas y agenda, la web de un artista y un portfolio de
 * arquitectura. Cambiar cuáles son es mover la bandera, nada más.
 */
export const projectList: ProjectListing[] = [
  { title: 'Swiftmet', featured: true },
  { title: 'Mila Barber', featured: true },
  { title: 'Cedecé', featured: true },
  { title: 'Sangil Studio', featured: true },
  'Bonsái Artesanía',
  'BlaBlaTour',
  'Almuerziko San Fermín',
  'Portfolio',
]
