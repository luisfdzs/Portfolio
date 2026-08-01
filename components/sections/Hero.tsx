import type { Profile } from '@/content/types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary, interpolate } from '@/lib/i18n/dictionaries'
import { href } from '@/lib/i18n/routes'
import { Action } from '@/components/ui/Action'
import { Figure } from '@/components/ui/Figure'
import { GitHub, LinkedIn, Mail, MapPin } from '@/components/ui/Icons'
import { HeroStage } from '@/components/sections/HeroStage'

type Stat = { value: string; label: string }

type Props = {
  locale: Locale
  profile: Profile
  years: number
  stats: readonly Stat[]
}

/**
 * Portada.
 *
 * Tiene un único trabajo: que alguien que ha abierto esto desde un enlace en LinkedIn
 * sepa en cinco segundos **quién eres, qué haces y por qué deberías interesarle**, y tenga
 * a un clic las dos únicas cosas que puede querer hacer (ver el trabajo o escribir).
 *
 * Tres decisiones que responden a eso:
 *
 * - **El nombre es el titular**, en la serif y al tamaño más grande del sitio. En un
 *   portfolio el producto es la persona; poner «Desarrollador Full Stack» de titular y el
 *   nombre en pequeño es esconder lo que se busca en Google.
 * - **Las cifras salen del contenido**, no escritas a mano: los años se suman de las
 *   fechas reales de los puestos y los proyectos se cuentan de la lista. Un titular con
 *   una cifra a mano dice «+4 años» tres años después. Le pasó al portfolio anterior.
 * - **Ni `h-screen` ni `min-h-screen`.** El contenido —titular, entradilla, botones y cuatro
 *   cifras— ya llena la pantalla por sí solo en cualquier tamaño razonable, así que forzar
 *   una altura sólo servía para meter un hueco muerto: con `justify-center` sobraba espacio
 *   entre las cifras y la primera sección, y en móvil apaisado el bloque se recortaba. La
 *   altura la pone el contenido; el aire de abajo lo pone el `section-block` de la sección
 *   siguiente, y así no se suman dos paddings.
 *
 * Detrás de todo esto va el **escenario cinético** (`HeroStage`): el fondo animado de tejas
 * que dice a qué se dedica quien firma antes de que nadie lea una palabra. Es decoración
 * (`aria-hidden`) y no cambia nada de lo anterior — el titular sigue siendo el nombre, las
 * cifras siguen calculándose y la altura la sigue poniendo el contenido.
 */
export function Hero({ locale, profile, years, stats }: Props) {
  const t = getDictionary(locale)

  const socials = [
    { href: profile.linkedin, label: t.contact.linkedinLabel, Icon: LinkedIn },
    { href: profile.github, label: t.contact.githubLabel, Icon: GitHub },
    { href: `mailto:${profile.email}`, label: t.contact.emailLabel, Icon: Mail, internal: true },
  ]

  return (
    <section
      aria-labelledby="hero-name"
      // A sangre y recortando: el escenario tiene que llegar al borde de la ventana, y su
      // carril sale del encuadre a propósito. `overflow-hidden` es lo que impide que eso
      // ensanche el documento — `check:mobile` no tolera ni un píxel de desbordamiento.
      // `isolate` crea el contexto de apilamiento donde el `z-0` del escenario y el `z-10`
      // del contenido se ordenan sin poder afectar a las secciones de al lado.
      className="relative isolate overflow-hidden"
    >
      <HeroStage />

      <div
        // `pt` grande: la cabecera es fija y mide 4rem, así que sin él el rótulo de estado
        // nacería debajo. En móvil no hay cabecera arriba, pero sí hace falta aire.
        className="page-gutter relative z-10 mx-auto max-w-7xl pt-24 pb-4 lg:pt-36"
      >
        <div className="grid items-center gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
          <div>
            {/* Estado actual, no «disponible para trabajar»: es un dato verificable en
                LinkedIn y no una señal que pueda leer un jefe actual. */}
            <p className="eyebrow flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-signal shadow-[0_0_0_3px] shadow-signal/20"
              />
              {t.hero.availability}
            </p>

            <p className="mt-8 font-display text-lead text-paper-soft">{t.hero.greeting}</p>
            <h1
              id="hero-name"
              className="mt-1 text-display text-paper"
              // El nombre no se traduce, pero sí se declara su idioma: sin esto un lector
              // de pantalla en inglés lee «Sangil» con fonética inglesa.
              lang="es"
            >
              {profile.name}
            </h1>

            <p className="mt-6 max-w-[30ch] font-display text-title text-signal">
              {profile.headline[locale]}
            </p>

            <p className="mt-8 max-w-measure text-lead text-paper-soft">
              {interpolate(t.hero.lead, { years })}
            </p>

            <p className="figure-num mt-6 flex items-center gap-2 text-small text-paper-faint">
              <MapPin className="size-4" />
              {profile.location[locale]}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Action href={href(locale, 'projects')} variant="primary">
                {t.hero.primaryCta}
              </Action>
              <Action href={href(locale, 'contact')} variant="secondary">
                {t.hero.secondaryCta}
              </Action>

              <ul className="ml-1 flex items-center gap-1" data-print="hide">
                {socials.map(({ href: linkHref, label, Icon, internal }) => (
                  <li key={linkHref}>
                    <a
                      href={linkHref}
                      {...(internal ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                      aria-label={label}
                      className="flex size-10 items-center justify-center rounded-full text-paper-faint transition-colors hover:text-signal"
                    >
                      <Icon className="size-5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/*
           * El retrato. En móvil va detrás del texto (`order`), porque lo primero que hace
           * falta leer es el nombre y no verle la cara a nadie.
           *
           * `hero-portrait` es lo que lo pone POR ENCIMA del escenario en vez de al lado:
           * flota con una oscilación de 10 px y lleva detrás un halo que lo despega de las
           * tejas que pasan por debajo. Sin ese halo, en el momento en que a una teja clara
           * le toca pasar justo detrás, la silueta se pierde y la cara parece una foto más
           * del fondo. Es la única pieza del hero que se ha tocado por el escenario.
           */}
          <div className="hero-portrait order-first mx-auto w-40 lg:order-none lg:w-full lg:max-w-xs">
            <Figure
              image={profile.photo}
              locale={locale}
              ratio="square"
              priority
              sizes="(min-width: 1024px) 20rem, 10rem"
              className="rounded-full lg:rounded-lg"
            />
          </div>
        </div>

        {/* Cifras. Al final del bloque y con un filete encima: son el resumen del CV, así
            que se leen después del titular, nunca antes. */}
        <dl className="mt-16 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-line pt-10 lg:mt-20 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dd className="figure-num text-figure text-paper">{stat.value}</dd>
              <dt className="eyebrow mt-2">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
