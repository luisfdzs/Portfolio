import type { Profile } from '@/content/types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { href } from '@/lib/i18n/routes'
import { Action } from '@/components/ui/Action'
import { Figure } from '@/components/ui/Figure'
import { ArrowDown, GitHub, LinkedIn, Mail, MapPin } from '@/components/ui/Icons'

type Stat = { value: string; label: string }

type Props = {
  locale: Locale
  profile: Profile
  stats: readonly Stat[]
}

/**
 * Portada.
 *
 * Tiene un único trabajo: que alguien que ha abierto esto desde un enlace en LinkedIn
 * sepa en cinco segundos **quién eres, qué haces y por qué deberías interesarle**, y tenga
 * a un clic las dos únicas cosas que puede querer hacer (ver el trabajo o escribir).
 *
 * **Ocupa la ventana entera y el campo interactivo es el protagonista.** Lo primero que se ve
 * al abrir la web es una retícula de nodos que reacciona al puntero —no un titular sobre negro,
 * y tampoco un mosaico de fotografías en bucle—, y el bloque de texto se apoya abajo, encima de
 * ella. El encargo era explícito: un hero moderno, interactivo y **hecho con código**, con la
 * referencia de las portadas de Linear, Stripe, Vercel y Sanity.
 *
 * **El campo ya no se monta aquí**, y conviene saberlo antes de buscarlo: es el fondo de todo el
 * sitio y vive en el layout (`components/layout/SiteField.tsx`), en una capa fija que pasa por
 * debajo de todas las secciones. Lo que esta portada aporta al conjunto no es el fondo, es el
 * hueco: una pantalla entera sin más contenido que el nombre, que es donde el campo se ve de
 * verdad. Por eso el hero sigue midiendo `min-h-svh` aunque el fondo ya no sea suyo.
 *
 * Las cuatro decisiones que responden a eso:
 *
 * - **El nombre es el titular**, en la serif y al tamaño más grande del sitio. En un
 *   portfolio el producto es la persona; poner «Desarrollador Full Stack» de titular y el
 *   nombre en pequeño es esconder lo que se busca en Google.
 * - **Menos texto, y por esto.** La entradilla de tres líneas que había aquí —la que enumeraba
 *   Santander, INDRA, ABB e Ingeteam— se quitó: sobre un fondo que se mueve y responde, un
 *   párrafo largo obliga a elegir entre leerlo o jugar con él, y quien decide en treinta
 *   segundos no hace ni una cosa ni la otra. Los clientes no se han perdido, están en la sección de experiencia, que es
 *   donde se pueden comprobar con las fechas al lado. Lo que queda aquí es lo irreducible: el
 *   puesto actual, el nombre, una línea de qué haces y dónde estás.
 * - **El retrato es un avatar pequeño.** Ocupaba una de las dos columnas del hero, y a ese
 *   tamaño partía la pantalla en dos y le disputaba el sitio al campo. Pequeño y arriba del
 *   todo hace lo que tiene que hacer —ponerle cara a un nombre— sin ser el asunto.
 * - **Las cifras salen del contenido**, no escritas a mano: los años se suman de las
 *   fechas reales de los puestos y los proyectos se cuentan de la lista. Un titular con
 *   una cifra a mano dice «+4 años» tres años después. Le pasó al portfolio anterior.
 *
 * **`min-h-svh` y no `h-screen`.** `svh` es el alto de la ventana con las barras del navegador
 * móvil desplegadas, que es el estado en el que se abre una web; con `vh` el hero mide más que
 * la pantalla y el bloque de texto nace medio cortado por abajo hasta que el usuario hace
 * scroll. Y `min-` y no una altura fija: si alguien tiene el tipo de letra del sistema muy
 * grande, el bloque crece y empuja hacia abajo en vez de recortarse.
 *
 * **El hueco de abajo en móvil no es decorativo**: la barra de iconos es fija y se dibuja
 * encima del hero, así que sin él las cifras —el resumen del CV— quedan medio tapadas justo en
 * la primera pantalla. Va en `--spacing-nav-mobile`, que ya suma la franja del gesto del
 * iPhone, y no en un número puesto a ojo.
 */
export function Hero({ locale, profile, stats }: Props) {
  const t = getDictionary(locale)

  const socials = [
    { href: profile.linkedin, label: t.contact.linkedinLabel, Icon: LinkedIn },
    { href: profile.github, label: t.contact.githubLabel, Icon: GitHub },
    { href: `mailto:${profile.email}`, label: t.contact.emailLabel, Icon: Mail, internal: true },
  ]

  return (
    <section
      aria-labelledby="hero-name"
      // `overflow-hidden` sigue haciendo falta aunque el campo ya no esté aquí: el velo del
      // texto se saca a sangre con `inset-inline: calc(50% - 50vw)`, y `vw` incluye la barra de
      // desplazamiento. Sin el recorte eso son unos píxeles de scroll horizontal, y
      // `check:mobile` no tolera ni uno.
      // `isolate` acota el `z-index: -1` de ese velo a esta sección: sin él buscaría el contexto
      // de apilamiento de arriba y podría colarse por detrás de la capa del campo.
      // `justify-end`: el texto se apoya en el borde de abajo y la mitad superior de la pantalla
      // se queda para el campo, que es el reparto que pedía el encargo.
      // `hero-section` y `hero-shell` sólo existen para la hoja de impresión: en papel el
      // hero deja de medir una pantalla (ver `globals.css`).
      className="hero-section relative isolate flex min-h-svh flex-col justify-end overflow-hidden"
    >
      <div className="hero-shell page-gutter relative z-10 mx-auto w-full max-w-7xl pt-28 pb-[calc(var(--spacing-nav-mobile)+1.5rem)] text-center lg:pb-14">
        {/*
         * El retrato, ahora avatar. `hero-portrait` es lo que lo pone POR ENCIMA del campo
         * en vez de al lado: flota con una oscilación mínima y lleva un halo de cobre y una
         * sombra que lo despegan del retículo que pasa por debajo. Sin ese halo, cuando el
         * puntero enciende los nodos que rodean la cara, la silueta se llena de puntos
         * cobrizos y deja de leerse como una fotografía.
         *
         * **Va FUERA de `.hero-copy`**, y eso es lo que deja el campo visible arriba: el velo
         * del texto empieza justo debajo del avatar, así que el avatar flota sobre los nodos
         * en vez de sobre grafito. Es una imagen con su propio halo — no necesita el
         * contraste que necesitan las líneas de texto.
         */}
        <div className="hero-portrait mx-auto w-20 lg:w-24">
          <Figure
            image={profile.photo}
            locale={locale}
            ratio="square"
            priority
            sizes="6rem"
            className="rounded-full"
          />
        </div>

        <div className="hero-copy flex flex-col items-center">
          {/* Estado actual, no «disponible para trabajar»: es un dato verificable en
              LinkedIn y no una señal que pueda leer un jefe actual.

              `hero-chip` le da fondo propio. No es adorno: es el texto más pequeño y más
              apagado de la portada, y está en la franja alta, que es la que tiene que quedar
              abierta para que se vea el campo. Con la pastilla se lee pase lo que pase por
              detrás y el velo del texto puede empezar más abajo y más flojo. */}
          <p className="hero-chip eyebrow mt-6">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-signal shadow-[0_0_0_3px] shadow-signal/20"
            />
            {t.hero.availability}
          </p>

          <p className="mt-7 font-display text-lead text-paper-soft">{t.hero.greeting}</p>
          <h1
            id="hero-name"
            className="mt-1 text-display text-paper"
            // El nombre no se traduce, pero sí se declara su idioma: sin esto un lector
            // de pantalla en inglés lee «Sangil» con fonética inglesa.
            lang="es"
          >
            {profile.name}
          </h1>

          <p className="mx-auto mt-5 max-w-[30ch] font-display text-title text-signal">
            {profile.headline[locale]}
          </p>

          <p className="figure-num mt-5 flex items-center justify-center gap-2 text-small text-paper-faint">
            <MapPin className="size-4" />
            {profile.location[locale]}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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

          {/* Cifras. Al final del bloque y con un filete encima: son el resumen del CV, así
              que se leen después del titular, nunca antes. `w-full` porque el contenedor es
              una columna flex centrada: sin él la retícula se encoge a lo que miden las
              cifras y el filete deja de sostener el bloque de lado a lado. */}
          <dl className="mt-10 grid w-full grid-cols-2 gap-x-8 gap-y-7 border-t border-line pt-8 text-center lg:mt-12 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dd className="figure-num text-figure text-paper">{stat.value}</dd>
                <dt className="eyebrow mt-2">{stat.label}</dt>
              </div>
            ))}
          </dl>

          {/*
           * El aviso de que hay más abajo. Un hero que ocupa la ventana entera y acaba en un
           * filete de cifras se puede leer como una página completa, y quien no baja se queda
           * sin ver la experiencia, que es el CV.
           *
           * Sólo en escritorio: en móvil el borde de abajo lo ocupa la barra de iconos fija, y
           * meter una flecha ahí sería competir con la navegación. Y `data-print="hide"`,
           * porque en papel no hay nada que desplazar.
           */}
          <p
            data-print="hide"
            className="mt-12 hidden items-center justify-center gap-2 text-small text-paper-faint lg:flex"
          >
            {t.hero.scrollHint}
            <ArrowDown className="hero-hint__arrow size-4" />
          </p>
        </div>
      </div>
    </section>
  )
}
