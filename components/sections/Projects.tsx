import type { ProjectEntry } from '@/content/types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { sections } from '@/lib/i18n/routes'
import { CoverFlow } from '@/components/ui/CoverFlow'
import { Code } from '@/components/ui/Icons'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ProjectCard } from './ProjectCard'

/**
 * Proyectos en la portada: **todos**, en un carrusel «cover flow». Y desde el 2026-08-03,
 * **el único sitio donde está la lista**: el índice de `/projects` se retiró.
 *
 * Están todos a propósito, y antes no lo estaban: la portada enseñaba los cuatro destacados
 * y remitía al índice para el resto. El argumento era el scroll, y no se sostiene en un
 * carrusel —las tarjetas se pasan de lado, así que ocho ocupan exactamente lo mismo que
 * cuatro—, mientras el coste sí era real: la mitad del trabajo sólo se veía si a alguien le
 * apetecía entrar en una segunda página. El orden lo pone `getCarouselProjects`, con los
 * destacados delante.
 *
 * **Y con los ocho aquí, el índice dejó de tener trabajo.** Era una segunda lista de lo
 * mismo, dos URLs con las mismas ocho tarjetas compitiendo por «Luis Fernández Sangil», y
 * una entrada del menú que en vez de moverse por el CV se iba de página. Lo que sí sigue
 * siendo una página es **cada proyecto**: eso es lo que se manda suelto en una candidatura,
 * y es lo que un ancla no da.
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
 * evidente que hay más a los lados— y con los botones. Ahora que el índice no existe, esto es
 * lo único que hay: si alguna vez se mide que la gente no pasa de la primera tarjeta, la
 * alternativa es volver a la retícula **aquí**, no reabrir una segunda página.
 *
 * El efecto es CSS puro dirigido por el scroll (bloque «COVER FLOW» de `globals.css`); el
 * carrusel va a ancho completo y sólo el titular se queda dentro de la retícula de la página,
 * porque centrar la tarjeta contra el viewport es lo que hace el efecto.
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
    // El id sale de `sections`, como el de las demás: desde que no hay índice, «proyectos»
    // es un destino del menú igual que experiencia o formación, y el ancla la construye
    // `href()` de ese mismo mapa. El `section-block` va aquí y el `page-gutter` en el bloque
    // de dentro: el carrusel tiene que llegar a los dos bordes de la pantalla y el margen
    // lateral de la página se lo comería.
    <section id={sections.projects} className="section-block text-center">
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
            <ProjectCard key={project.slug} locale={locale} project={project} />
          ))}
        </CoverFlow>
      </Reveal>
    </section>
  )
}
