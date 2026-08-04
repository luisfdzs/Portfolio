import type { CSSProperties } from 'react'
import type { Profile } from '@/content/types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { href } from '@/lib/i18n/routes'
import { Action } from '@/components/ui/Action'
import { Figure } from '@/components/ui/Figure'
import { ArrowDown, GitHub, LinkedIn, Mail, MapPin } from '@/components/ui/Icons'
import { Typed } from '@/components/ui/Typed'
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
 * - **SÓLO SE ANIMAN DOS LÍNEAS: EL NOMBRE, QUE ENFOCA, Y EL TITULAR, QUE SE TECLEA.** Todo lo demás —el
 *   saludo, la ubicación, los dos botones, las cuatro cifras y el aviso de seguir bajando—
 *   está puesto desde el primer fotograma. Antes se escribían las cuatro líneas y detrás iban
 *   apareciendo los botones y las cifras en cadena, y el coste era que la primera pantalla
 *   entera tardaba casi tres segundos en existir: durante ese rato no había nada que pulsar y
 *   quien decide en treinta segundos veía una web montándose en vez de un CV. Concentrar el
 *   gesto en las dos líneas que dicen **quién eres y qué haces** deja lo demás legible y
 *   pulsable en el milisegundo cero, y hace que la animación signifique algo en vez de ser el
 *   tono de la página. **El texto va COMPLETO en el HTML del servidor** y nada se revela
 *   creciendo, así que no hay salto de maquetación ni depende de un temporizador que el nombre
 *   —el `<h1>` que se busca en Google— exista. El razonamiento largo, con el fallo de Chrome
 *   que decide cómo se escribe, en `components/ui/Typed.tsx` y en el bloque «Texto que se
 *   escribe» de `globals.css`. **La secuencia entera termina en 1,34 s**, y ése es el número
 *   que hay que defender: la versión anterior tardaba 2,9 s en tener la primera pantalla
 *   montada, o sea el 10 % de la atención que se le dedica a decidir si esto merece un scroll.
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

  const greeting = t.hero.greeting
  const headline = profile.headline[locale]
  const location = profile.location[locale]

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

        <div className="hero-copy flex flex-col items-center">
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

          {/* El saludo **no se anima**: es la línea más pequeña y más apagada del bloque, y
              escribirla letra a letra gastaba medio segundo del gesto en las dos palabras que
              menos dicen. Está puesta y hace de rampa hacia el nombre, que es lo que se
              anima. */}
          <p className="mt-7 font-display text-lead text-paper-soft">{greeting}</p>

          {/*
           * EL NOMBRE, QUE ENFOCA.
           *
           * Aparece entero y desenfocado y enfoca de golpe en 760 ms. **No se teclea, y es una
           * decisión tomada comparando las cuatro versiones en pantalla**: el tecleado es el
           * gesto más visto en un portfolio de desarrollador, así que a quien ve diez al mes le
           * dice «plantilla» justo en la línea que tiene que decir lo contrario. El enfoque
           * dura menos, se lee como algo hecho a mano y deja el guiño de teclado en el titular
           * de debajo, que es donde no compite con el nombre.
           *
           * `hero-name` es el único asidero: la animación entera está en el bloque «Texto que
           * se escribe» de `globals.css` y aquí no se declara ningún tiempo. Y el nombre va
           * completo en el HTML del servidor —es el `<h1>` que se busca en Google—, así que
           * nada de esto depende de que una animación llegue a ejecutarse.
           */}
          <h1
            id="hero-name"
            className="mt-1 text-display text-paper"
            // El nombre no se traduce, pero sí se declara su idioma: sin esto un lector
            // de pantalla en inglés lee «Sangil» con fonética inglesa.
            lang="es"
          >
            <span className="hero-name">{profile.name}</span>
          </h1>

          {/* El titular del puesto, que sí se teclea, y arranca **solapado** con el final del
              enfoque: los últimos 180 ms van a la vez, que es lo que hace que las dos líneas se
              lean como un movimiento y no como dos turnos. El `start` y el `step` son variables
              de CSS porque esa cuenta vive junto a la animación del nombre y no puede quedar
              repartida entre dos ficheros. */}
          <p className="mx-auto mt-5 max-w-[30ch] font-display text-title text-signal">
            <Typed
              className="hero-headline"
              text={headline}
              start="var(--hero-headline-start)"
              step="var(--hero-step-headline)"
            />
          </p>

          {/* La ubicación, puesta desde el principio con su icono. Se escribía, y era la línea
              que más retrasaba todo lo de abajo sin ser lo que decide nada: es un dato de
              contexto, no el titular. */}
          <p className="figure-num mt-5 flex items-center justify-center gap-2 text-small text-paper-faint">
            <MapPin className="size-4" />
            {location}
          </p>

          {/*
           * A PARTIR DE AQUÍ NADA SE MUEVE. Los botones, las cifras y el aviso de seguir
           * bajando están puestos desde el primer fotograma: son lo único accionable de la
           * primera pantalla, y una web que los hace esperar a que termine una animación es
           * una web que no se puede usar todavía. Lo que se gana con ello está contado arriba,
           * en la cabecera del componente.
           */}
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
              cifras y el filete deja de sostener el bloque de lado a lado.

              **Las cuatro en una sola fila también en móvil.** Estaban en dos columnas de dos,
              y a media pantalla del hero eso las convertía en dos parejas que se leen por
              separado: son un mismo dato de cuatro cifras —el resumen del CV en una línea— y
              hay que poder abarcarlas de un golpe. A 390 px cada hueco mide unos 82 px, así
              que el reparto es justo y lo que hay que cuidar es el rótulo. */}
          <dl className="mt-10 grid w-full grid-cols-4 gap-x-2 gap-y-7 border-t border-line pt-8 text-center lg:mt-12 lg:gap-x-8">
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
