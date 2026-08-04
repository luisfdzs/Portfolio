import type { CSSProperties } from 'react'
import type { Profile } from '@/content/types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { href } from '@/lib/i18n/routes'
import { Action } from '@/components/ui/Action'
import { Figure } from '@/components/ui/Figure'
import { ArrowDown, GitHub, LinkedIn, Mail, MapPin } from '@/components/ui/Icons'
import { Typed, TYPED_PAUSE, TYPED_STEP, TYPED_STEP_DENSE, typedEnd } from '@/components/ui/Typed'
import { HeroStage } from '@/components/sections/HeroStage'

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
 * **Ocupa la ventana entera y el escenario cinético es el protagonista.** Lo primero que se ve
 * al abrir la web es el mosaico de código, servidores y red moviéndose —no un titular sobre
 * negro—, y el bloque de texto se apoya abajo, encima de él. El encargo era explícito: que el
 * fondo dinámico se vea desde el primer segundo, con la referencia de la portada de
 * `swiftmet.vercel.app` y del collage de sanity.io.
 *
 * **HAY DOS FONDOS EN ESTA WEB, Y ÉSTE ES EL DE LA PRIMERA PANTALLA.** El otro es el campo
 * interactivo (`components/layout/SiteField.tsx`), una capa fija montada en el layout que pasa
 * por debajo de todas las secciones de todas las páginas. El escenario es una capa OPACA dentro
 * de esta sección: se pone delante del campo mientras dura el hero y se disuelve en sus últimos
 * 9 rem, que es donde el campo emerge y se queda ya para el resto de la web. Si se toca uno de
 * los dos, hay que mirar la costura entre ambos — está en la máscara de `.hero-stage`.
 *
 * Las cuatro decisiones que responden a eso:
 *
 * - **El nombre es el titular**, en la serif y al tamaño más grande del sitio. En un
 *   portfolio el producto es la persona; poner «Desarrollador Full Stack» de titular y el
 *   nombre en pequeño es esconder lo que se busca en Google. **Y se escribe solo**, como el
 *   resto del bloque: ver el punto siguiente.
 * - **LA PORTADA SE MONTA SOLA, EN SECUENCIA, Y NO HAY UNA LÍNEA DE JAVASCRIPT EN ELLO.**
 *   Primero se escriben letra a letra las cuatro líneas de texto —saludo, nombre, titular y
 *   ubicación— como si las teclease alguien delante, y cuando la última termina van
 *   apareciendo con un fundido corto los botones, las cuatro cifras y el aviso de seguir
 *   bajando, uno detrás de otro. Son dos mecanismos (`Typed` y la clase `hero-enter`) unidos
 *   por una sola cuenta, que está unas líneas más abajo: el momento en que acaba el tecleado
 *   es el momento cero de las apariciones. **El texto va COMPLETO en el HTML del servidor** y
 *   nada se revela creciendo, así que no hay salto de maquetación en la primera pantalla ni
 *   depende de un temporizador que el nombre —el `<h1>` que se busca en Google— exista. El
 *   razonamiento largo, con el fallo de Chrome que decide cómo se escribe, en
 *   `components/ui/Typed.tsx` y en los bloques «Texto que se escribe» y «La portada, que se
 *   monta sola» de `globals.css`.
 * - **Menos texto, y por esto.** La entradilla de tres líneas que había aquí —la que enumeraba
 *   Santander, INDRA, ABB e Ingeteam— se quitó: sobre un fondo en movimiento, un párrafo largo
 *   obliga a elegir entre leerlo o mirar, y quien decide en treinta segundos no hace ni una
 *   cosa ni la otra. Los clientes no se han perdido, están en la sección de experiencia, que es
 *   donde se pueden comprobar con las fechas al lado. Lo que queda aquí es lo irreducible: el
 *   puesto actual, el nombre, una línea de qué haces y dónde estás.
 * - **El retrato es un avatar pequeño.** Ocupaba una de las dos columnas del hero, y a ese
 *   tamaño partía la pantalla en dos y le disputaba el sitio al escenario. Pequeño y arriba del
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

  /*
   * LA CRONOLOGÍA DE LA PORTADA, EN UN SITIO.
   *
   * Las cuatro líneas de texto se escriben seguidas —saludo, nombre, titular y ubicación— y
   * lo que aparece después (los botones, las cifras y el aviso de seguir bajando) espera a
   * que la última haya terminado. Es una sola cuenta y se hace aquí, no repartida entre el
   * CSS y cuatro llamadas: el `start` de cada bloque es el final del anterior, así que
   * cambiar un texto o un paso recoloca todo lo demás sin tocar nada más.
   *
   * Los dos primeros bloques van al paso normal y son **una sola frase**: el espacio que
   * separa el saludo del nombre se teclea también, de ahí el `+ TYPED_STEP`. Los dos últimos
   * van al paso corto y con una pausa delante, que es el respiro de cambiar de línea.
   */
  const greeting = t.hero.greeting
  const headline = profile.headline[locale]
  const location = profile.location[locale]

  const nameStart = typedEnd(0, greeting) + TYPED_STEP
  const headlineStart = typedEnd(nameStart, profile.name) + TYPED_PAUSE
  const locationStart = typedEnd(headlineStart, headline, TYPED_STEP_DENSE) + TYPED_PAUSE
  const typingEnd = typedEnd(locationStart, location, TYPED_STEP_DENSE)

  const socials = [
    { href: profile.linkedin, label: t.contact.linkedinLabel, Icon: LinkedIn },
    { href: profile.github, label: t.contact.githubLabel, Icon: GitHub },
    { href: `mailto:${profile.email}`, label: t.contact.emailLabel, Icon: Mail, internal: true },
  ]

  return (
    <section
      aria-labelledby="hero-name"
      // A sangre y recortando: el escenario tiene que llegar al borde de la ventana por los
      // cuatro lados. `overflow-hidden` es lo que impide que las columnas —que salen del
      // encuadre por arriba y por abajo— alarguen el documento, y de paso recorta el velo del
      // texto, que se saca a sangre con `inset-inline: calc(50% - 50vw)` y con él la barra de
      // desplazamiento; `check:mobile` no tolera ni un píxel de desbordamiento.
      // `isolate` crea el contexto de apilamiento donde el `z-0` del escenario, el `z-10` del
      // contenido y el `z-index: -1` del velo se ordenan sin poder afectar a las secciones de al
      // lado ni colarse por detrás de la capa fija del campo.
      // `justify-end`: el texto se apoya en el borde de abajo y el mosaico se queda con la
      // mitad de arriba de la pantalla, que es el reparto que pedía el encargo.
      // `hero-section` y `hero-shell` sólo existen para la hoja de impresión: en papel el
      // hero deja de medir una pantalla (ver `globals.css`).
      className="hero-section relative isolate flex min-h-svh flex-col justify-end overflow-hidden"
    >
      <HeroStage />

      <div className="hero-shell page-gutter relative z-10 mx-auto w-full max-w-7xl pt-28 pb-[calc(var(--spacing-nav-mobile)+1.5rem)] text-center lg:pb-14">
        {/*
         * El retrato, ahora avatar. `hero-portrait` es lo que lo pone POR ENCIMA del
         * escenario en vez de al lado: flota con una oscilación mínima y lleva una sombra
         * de grafito que lo despega de las tejas que pasan por debajo. Sin esa sombra, en el
         * momento en que a una teja clara le toca pasar justo detrás, la silueta se pierde y
         * la cara parece una foto más del fondo. **Sin cobre**: el halo dorado que hubo ahí
         * se quitó por encargo (ver «El retrato, flotando sobre el campo» en `globals.css`).
         *
         * **Va FUERA de `.hero-copy`**, y eso es lo que deja una franja de mosaico visible
         * arriba: el velo del texto empieza justo debajo del avatar, así que el avatar flota
         * sobre las tejas en vez de sobre grafito. Es una imagen con su propia sombra — no
         * necesita el contraste que necesitan las líneas de texto.
         *
         * `hero-portrait__frame` en vez de `rounded-full`: la foto es un RECORTE con
         * transparencia, así que el marco de `Figure` —fondo, filete y esquinas— dejaría de
         * ser invisible y el busto se leería como una tarjeta oscura. La clase apaga las
         * tres cosas en `globals.css`; no se hace con utilidades porque `cn()` no resuelve
         * conflictos de Tailwind y `bg-transparent` contra `bg-ink-raised` se decidiría por
         * el orden de la hoja generada. Ver «El retrato, flotando sobre el campo».
         *
         * `profile.photo` **nunca es nulo**, y no porque el panel obligue a rellenarlo: si
         * está vacío, `getProfile` pone el retrato del repositorio (ver `portrait` en
         * `content/profile.ts`). Por eso aquí no hay ninguna comprobación ni el hero puede
         * enseñar el hueco de trama de `Figure` donde va la cara.
         */}
        <div className="hero-portrait mx-auto w-20 lg:w-24">
          <Figure
            image={profile.photo}
            locale={locale}
            ratio="square"
            priority
            sizes="6rem"
            className="hero-portrait__frame"
          />
        </div>

        {/*
         * `--hero-enter-start` es la costura entre las dos animaciones de la portada: lo que
         * tarda en escribirse la última línea de texto es lo que esperan los botones, las
         * cifras y el aviso de bajar antes de aparecer. Va aquí, en el bloque que los contiene
         * a todos, porque las variables se heredan: cada elemento sólo declara su turno
         * (`--hero-enter-index`) y el momento cero lo pone el padre una vez.
         */}
        <div
          className="hero-copy flex flex-col items-center"
          style={{ '--hero-enter-start': `${typingEnd}ms` } as CSSProperties}
        >
          {/* Estado actual, no «disponible para trabajar»: es un dato verificable en
              LinkedIn y no una señal que pueda leer un jefe actual.

              `hero-chip` le da fondo propio. No es adorno: es el texto más pequeño y más
              apagado de la portada, y está en la franja alta, que es la que tiene que quedar
              abierta para que se vea el mosaico. Con la pastilla se lee sobre cualquier teja y
              el velo del texto puede empezar más abajo y más flojo. */}
          <p className="hero-chip eyebrow mt-6">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-signal shadow-[0_0_0_3px] shadow-signal/20"
            />
            {t.hero.availability}
          </p>

          {/*
           * EL SALUDO Y EL NOMBRE SE ESCRIBEN, letra a letra, al abrir la página.
           *
           * Son dos elementos con tipografía distinta —el saludo es pequeño, el nombre es el
           * titular— pero **una sola frase**: el `offset` del nombre es lo que ya ha gastado
           * el saludo más su espacio, así que el nombre empieza a escribirse justo cuando el
           * saludo termina. Lo hace CSS, sin cursor y sin que el bloque crezca al revelarse,
           * y el texto va completo en el HTML (ver `components/ui/Typed.tsx`, que es donde
           * está el razonamiento — incluido el fallo de Chrome que decide cómo se escribe).
           */}
          <p className="mt-7 font-display text-lead text-paper-soft">
            <Typed text={greeting} />
          </p>
          <h1
            id="hero-name"
            className="mt-1 text-display text-paper"
            // El nombre no se traduce, pero sí se declara su idioma: sin esto un lector
            // de pantalla en inglés lee «Sangil» con fonética inglesa.
            lang="es"
          >
            <Typed text={profile.name} start={nameStart} />
          </h1>

          {/* El titular del puesto y la ubicación se escriben también, al paso corto: son
              largos, y al paso del nombre añadirían tres segundos de espera a lo que aparece
              después. */}
          <p className="mx-auto mt-5 max-w-[30ch] font-display text-title text-signal">
            <Typed text={headline} start={headlineStart} step={TYPED_STEP_DENSE} />
          </p>

          {/* El icono no se teclea, aparece con la línea: es un pictograma, y revelarlo letra
              a letra no significa nada. Va con el turno cero de la aparición general —el
              mismo instante en que arranca a escribirse la ubicación—, así que la línea nace
              completa en vez de con un hueco delante. */}
          <p className="figure-num mt-5 flex items-center justify-center gap-2 text-small text-paper-faint">
            <MapPin
              className="hero-enter size-4"
              style={{ '--hero-enter-start': `${locationStart}ms` } as CSSProperties}
            />
            <Typed text={location} start={locationStart} step={TYPED_STEP_DENSE} />
          </p>

          {/*
           * A PARTIR DE AQUÍ TODO APARECE SOLO, y en este orden: los botones, las cifras y el
           * aviso de seguir bajando, cada uno un turno detrás del anterior (ver `hero-enter`
           * en `globals.css`). Los tres esperan a que el texto haya terminado de escribirse,
           * que es lo que hace que la portada se lea como una secuencia y no como tres cosas
           * que se mueven a la vez.
           *
           * El fundido va con relleno hacia atrás y **sin `opacity: 0` en el estado estático**:
           * un navegador que no ejecute la animación deja los botones puestos, que es el
           * fallback correcto. Es el criterio de `reveal` y del tecleado.
           */}
          <div
            className="hero-enter mt-8 flex flex-wrap items-center justify-center gap-3"
            style={{ '--hero-enter-index': 0 } as CSSProperties}
          >
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
              cifras y el filete deja de sostener el bloque de lado a lado.

              **Las cuatro en una sola fila también en móvil.** Estaban en dos columnas de dos,
              y a media pantalla del hero eso las convertía en dos parejas que se leen por
              separado: son un mismo dato de cuatro cifras —el resumen del CV en una línea— y
              hay que poder abarcarlas de un golpe. A 390 px cada hueco mide unos 82 px, así
              que el reparto es justo y lo que hay que cuidar es el rótulo. */}
          <dl
            className="hero-enter mt-10 grid w-full grid-cols-4 gap-x-2 gap-y-7 border-t border-line pt-8 text-center lg:mt-12 lg:gap-x-8"
            style={{ '--hero-enter-index': 1 } as CSSProperties}
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <dd className="figure-num text-figure text-paper">{stat.value}</dd>
                {/*
                 * El rótulo no usa `eyebrow` y ésa es toda la diferencia: en cuatro columnas
                 * a 390 px, «PRODUCCIÓN» a 11 px con 0,14 em de entreletra mide más que la
                 * columna y desborda la página —`check:mobile` no tolera un píxel—. Aquí baja
                 * a 9 px con la entreletra a la mitad y en `lg` recupera los valores del
                 * sistema. Va con utilidades y no con la utilidad `eyebrow` más un tamaño
                 * encima porque las dos viven en la misma capa de CSS y quién gana lo
                 * decidiría el orden de la hoja generada, no lo que está escrito aquí.
                 */}
                <dt className="mt-2 font-mono text-[0.5625rem] leading-[1.4] tracking-[0.07em] text-paper-faint uppercase lg:text-[0.6875rem] lg:tracking-[0.14em]">
                  {stat.label}
                </dt>
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
            className="hero-enter mt-12 hidden items-center justify-center gap-2 text-small text-paper-faint lg:flex"
            style={{ '--hero-enter-index': 2 } as CSSProperties}
          >
            {t.hero.scrollHint}
            <ArrowDown className="hero-hint__arrow size-4" />
          </p>
        </div>
      </div>
    </section>
  )
}
