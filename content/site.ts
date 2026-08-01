/**
 * Constantes técnicas del sitio, las únicas que NO se editan desde el panel.
 *
 * Todo lo editorial —presentación, experiencia, formación, proyectos— vive en el panel
 * de administración (o, mientras no haya proyecto de Sanity, en el resto de `content/`).
 * Aquí queda sólo lo que define el despliegue: el nombre y el dominio canónico, que se
 * usan para las URLs absolutas, el sitemap y los metadatos.
 */
export const site = {
  name: 'Luis Fernández Sangil',
  /** Nombre corto para el logotipo y el `<title>` de las páginas interiores. */
  shortName: 'Luis Fernández',
  /**
   * Dominio canónico de **producción**, y sólo de producción: de aquí salen las URLs
   * absolutas del sitemap y los `hreflang`. El entorno de test no lo sobrescribe a
   * propósito —no se indexa, así que sus URLs canónicas no le importan a nadie— y
   * apuntar los `alternates` al dominio real evita que Google encuentre dos copias
   * declarándose canónicas cada una de sí misma. Ver `lib/site-env.ts`.
   */
  url: 'https://luisfernandezsangil.vercel.app',
  /** Repositorio de esta web. Se enlaza en el pie: la web es también una muestra. */
  repo: 'https://github.com/luisfdzs/Portfolio',
} as const
