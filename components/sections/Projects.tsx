import type { ProjectEntry } from '@/content/types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary, interpolate } from '@/lib/i18n/dictionaries'
import { href } from '@/lib/i18n/routes'
import { Action } from '@/components/ui/Action'
import { CoverFlow } from '@/components/ui/CoverFlow'
import { Code } from '@/components/ui/Icons'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ProjectCard } from './ProjectCard'

/**
 * Proyectos en la portada: **todos**, en un carrusel «cover flow».
 *
 * Están todos a propósito, y antes no lo estaban: la portada enseñaba los cuatro destacados
 * y remitía al índice de `/projects` para el resto. El argumento era el scroll, y no se
 * sostiene en un carrusel —las tarjetas se pasan de lado, así que ocho ocupan exactamente lo
 * mismo que cuatro—, mientras el coste sí era real: la mitad del trabajo sólo se veía si a
 * alguien le apetecía entrar en una segunda página. El orden lo pone `getCarouselProjects`,
 * con los destacados delante.
 *
 * El índice sigue existiendo y sigue enlazado desde aquí, porque hace otra cosa: es una URL
 * que se puede mandar suelta por LinkedIn sin obligar a nadie a pasar por el CV entero.
 *
 * **Por qué un carrusel y no la retícula de dos columnas que había antes.** Es la única
 * sección de la página cuyo contenido es visual, y una captura de web a 45 vw compitiendo
 * con otra al lado no se mira: se hojea. El cover flow pone una tarjeta de frente y deja
 * las otras giradas al lado, que es exactamente cómo alguien elige entre varias cosas
 * parecidas. Y de paso ahorra pantallas de scroll en la mitad de la página donde se decide si
 * se sigue leyendo — con ocho tarjetas, más que antes.
 *
 * Lo que **cuesta** es honesto y conviene tenerlo escrito: en una retícula se verían todas de
 * un golpe y aquí hay una de frente y dos asomando. Se compensa con el solape —que hace
 * evidente que hay más a los lados—, con los botones y con el enlace al índice justo debajo.
 * Si alguna vez se mide que la gente no pasa de la primera tarjeta, la retícula sigue viva en
 * `/projects` y volver es cambiar este fichero.
 *
 * El efecto es CSS puro dirigido por el scroll (bloque «COVER FLOW» de `globals.css`); el
 * carrusel va a ancho completo y sólo el titular y el pie se quedan dentro de la retícula
 * de la página, porque centrar la tarjeta contra el viewport es lo que hace el efecto.
 *
 * El id de la sección es `projects` igual que la ruta `/projects`. No colisionan —uno es
 * un ancla y el otro un segmento de URL— y compartir nombre es lo que permite que el menú
 * apunte a la página y la barra de móvil a esta sección sin dos claves distintas.
 */
export function Projects({
  locale,
  projects,
}: {
  locale: Locale
  projects: readonly ProjectEntry[]
}) {
  const t = getDictionary(locale)

  return (
    // El id es una cadena literal y no una clave de `sections`: «proyectos» no es un
    // ancla del sistema de navegación —el menú y la barra de móvil llevan a la página
    // `/projects`— pero conviene poder enlazar el bloque de la portada directamente.
    // El `section-block` va aquí y el `page-gutter` en cada bloque de dentro: el carrusel
    // tiene que llegar a los dos bordes de la pantalla y el margen lateral de la página se
    // lo comería.
    <section id="projects" className="section-block text-center">
      <div className="page-gutter mx-auto max-w-7xl">
        <SectionHeading index="01" title={t.projects.title} kicker={t.projects.kicker} icon={Code}>
          <p>{t.projects.intro}</p>
        </SectionHeading>
      </div>

      {/* Un solo `Reveal`, y por fuera del contenedor con scroll. Uno por tarjeta —como en
          la retícula— dejaría las cuatro invisibles: `reveal` se mide con
          `animation-timeline: view()` en el eje de bloque, y dentro de un carrusel
          horizontal el contenedor con scroll más cercano es el propio carrusel, donde las
          tarjetas no se mueven nunca en vertical. La animación no llegaría a arrancar. */}
      <Reveal>
        <CoverFlow
          label={t.projects.carousel}
          previousLabel={t.projects.carouselPrevious}
          nextLabel={t.projects.carouselNext}
        >
          {projects.map((project) => (
            <ProjectCard key={project.slug} locale={locale} project={project} framed />
          ))}
        </CoverFlow>
      </Reveal>

      {/* El enlace al índice ya no depende de que queden proyectos por enseñar —aquí están
          todos—, sino de que el índice siga siendo un sitio útil al que ir: una página con
          las fichas en retícula, enlazable de una en una. */}
      <div className="page-gutter mx-auto max-w-7xl">
        <Reveal className="mt-12 border-t border-line pt-8">
          <Action href={href(locale, 'projects')} variant="secondary">
            {interpolate(t.projects.viewAll, { count: projects.length })}
          </Action>
        </Reveal>
      </div>
    </section>
  )
}
