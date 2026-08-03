import Image from 'next/image'
import { cn } from '@/lib/cn'

/**
 * ESCENARIO CINÉTICO DE LA PORTADA
 *
 * Lo primero que se ve al abrir la web: una pared de pantallas, servidores, red y cacharrería
 * —dieciséis fotografías de dominio público y cuatro paneles de interfaz dibujados aquí mismo—
 * ocupando el alto completo de la ventana, en cinco columnas que se desplazan despacio y en
 * direcciones alternas sobre un resplandor de cobre que respira.
 *
 * **Es el fondo de la PRIMERA SECCIÓN, y sólo de ella.** El resto de la web lo cubre el campo
 * interactivo (`components/layout/SiteField.tsx`), una capa fija montada en el layout con una
 * retícula de nodos que reacciona al puntero. Los dos conviven porque el escenario es una capa
 * **opaca** dentro del hero: tapa el campo mientras dura la primera pantalla y se disuelve en
 * los últimos 9 rem, que es donde el campo emerge. Esa disolución es una máscara en
 * `.hero-stage` (ver `globals.css`) y es la única costura entre los dos fondos: **quien toque
 * uno tiene que mirarla.** Sin ella el borde inferior del hero sería una raya horizontal a media
 * pantalla, entre grafito liso y retícula.
 *
 * **Antes era una banda en la mitad derecha del hero; ahora es la primera pantalla.** El cambio
 * no es de tamaño, es de quién manda: el texto pasó a apoyarse abajo, sobre el mosaico, en vez de
 * convivir con él a media altura. Eso permitió tirar tres piezas frágiles —el «el carril empieza
 * en el 62 %», la máscara de franja de móvil y el velo lateral de escritorio, que había que
 * mantener coordinados en la misma unidad— y sustituirlas por un único degradado vertical que es
 * el mismo en todos los anchos. La referencia declarada del encargo es la portada de sanity.io,
 * que hace exactamente esto: un collage en movimiento a pantalla completa con el texto encima.
 *
 * Las cinco decisiones que lo sostienen:
 *
 * 1. **Cero JavaScript.** Ni un `useEffect`, ni un observador, ni una librería de animación: son
 *    animaciones CSS infinitas sobre `transform` y `opacity`, las dos únicas propiedades que el
 *    navegador puede animar en el compositor sin volver a calcular la maquetación. Esto es un
 *    componente de servidor y no hay nada que hidratar. Toda la portada sigue siendo HTML
 *    estático, que es la decisión de arquitectura del proyecto y no se toca por un adorno —y
 *    menos ahora que el adorno es la primera pantalla.
 *
 * 2. **Es DECORACIÓN, y se declara como tal.** `aria-hidden` en la raíz y `alt=""` en las fotos.
 *    Anunciar «fotografía de un pasillo de servidores» a quien navega con lector de pantalla no
 *    le aporta nada sobre este CV: es ruido antes del nombre. Y `pointer-events: none` en todo el
 *    escenario, para que no se pueda interceptar un clic destinado a un botón.
 *
 * 3. **El texto manda sobre la imagen, siempre.** El velo (`__scrim`) devuelve el fondo a grafito
 *    puro en la mitad inferior, que es donde vive el bloque de texto, y lo deja abierto arriba,
 *    que es donde se ve el mosaico. Un hero ilustrado en el que hay que esforzarse para leer el
 *    nombre es un hero peor que uno negro. La regla operativa está en el CLAUDE.md: si al tocar
 *    el velo hay que esforzarse para leer el nombre a 390 px, el cambio está mal.
 *
 * 4. **Cuatro paneles dibujados, no fotografiados.** Un editor, una salida de despliegue, una
 *    terminal y una topología, hechos con la monoespaciada y los colores del sistema. Cumplen dos
 *    funciones que ninguna foto de banco de imágenes cumple: se ven **nítidos** a cualquier
 *    densidad de pantalla, y son lo que convierte el conjunto de «fotos de tecnología» en
 *    «alguien que escribe y despliega software». Además pesan cero bytes de imagen.
 *
 * 5. **Se para si molesta.** Con `prefers-reduced-motion: reduce` el escenario se queda quieto
 *    —no desaparece, se congela— en `globals.css`. Treinta y cinco tejas moviéndose es justo el
 *    tipo de movimiento periférico continuo que provoca mareo a quien tiene sensibilidad
 *    vestibular, y a pantalla completa con más razón.
 *
 * La procedencia y la licencia de las dieciséis fotos están en `public/hero/CREDITS.md`, y se
 * reconstruyen con `node scripts/build-hero-tiles.mjs`. Las dieciséis son **CC0 1.0**: dominio
 * público, uso comercial, sin atribución exigida.
 */

/** Las dieciséis tejas miden lo mismo. El porqué de este tamaño está en `scripts/build-hero-tiles.mjs`. */
const TILE = { width: 600, height: 400 } as const

/**
 * Ancho declarado a `next/image`, por tramo: ~380 px con las cinco columnas de un monitor ancho y
 * ~200 px con las dos de móvil.
 *
 * **Aquí no ahorra bytes, y conviene saberlo antes de intentar afinarlo.** Este proyecto usa un
 * cargador propio (`sanity/imageLoader.ts`) que devuelve las rutas locales **tal cual**: las
 * transformaciones las hace la CDN de Sanity, y estas tejas no están en Sanity, están en
 * `public/`. Así que el navegador recibe un `srcset` en el que todos los anchos apuntan al mismo
 * archivo, y descarga el de 600 px pase lo que pase. Se comprobó midiendo: pasar de un valor fijo
 * a estos tramos no cambió ni un byte.
 *
 * Se declara igualmente porque es correcto y gratis —el día que estas tejas se editen desde el
 * panel, el `sizes` ya está bien puesto—, pero **el único sitio donde se recorta el peso del
 * escenario es el archivo**: el ancho y la calidad de `scripts/build-hero-tiles.mjs`.
 */
const TILE_SIZES =
  '(min-width: 90rem) 380px, (min-width: 64rem) 340px, (min-width: 40rem) 300px, 200px'

type Panel = 'editor' | 'deploy' | 'terminal' | 'network'
type Tile = string | { panel: Panel }

/**
 * Las cinco columnas.
 *
 * `seconds` son primos entre sí a propósito: con duraciones iguales —o múltiplos— las columnas
 * vuelven a alinearse cada vuelta y el conjunto empieza a leerse como un bloque que sube, en vez
 * de como cinco planos a distinta profundidad. Y son números altos (más de un minuto) porque esto
 * es un fondo: en cuanto el movimiento se puede *seguir* con la vista, deja de ser atmósfera y se
 * convierte en algo que compite con el titular.
 *
 * `reverse` alterna el sentido. Es lo que crea la sensación de profundidad sin tener que tocar
 * escalas ni desenfoques por columna.
 *
 * `phase` desplaza el arranque de la columna con un margen negativo (ver `globals.css`). Sin él,
 * las cinco columnas empiezan con una teja alineada en la misma línea y el mosaico se lee como una
 * tabla que se mueve. Son valores distintos y sin patrón a propósito.
 *
 * `from` es el ancho a partir del cual existe la columna. Las dos primeras siempre; las otras tres
 * van apareciendo para que el ANCHO DE TEJA se mantenga en la banda en la que una foto se reconoce
 * (~185–380 px). El razonamiento de cada tramo está en `globals.css`.
 *
 * **Las siete tejas por columna no son siete por gusto**: siete × 16 vh de alto = 112 vh, y una
 * copia de la lista tiene que ser más alta que la ventana o el bucle enseña la costura. Si se
 * quita una, hay que subir el alto de teja en el CSS. Está explicado en `.hero-stage__tile`.
 *
 * El orden dentro de cada columna mezcla los temas —servidores, red, código, teclear, hardware,
 * puesto, métricas— porque dos fotos de portátil con código seguidas se leen como una sola teja
 * repetida. Y ninguna teja se repite dentro de su columna, ni coincide con la de la misma altura en
 * la columna de al lado: es lo que evita que se vea el truco de que hay veinte imágenes repartidas
 * en treinta y cinco huecos.
 */
const COLUMNS: readonly {
  seconds: number
  reverse: boolean
  phase: string
  from?: 'tablet' | 'desktop' | 'wide'
  tiles: readonly Tile[]
}[] = [
  {
    seconds: 71,
    reverse: false,
    phase: '0rem',
    tiles: [
      'datacenter-aisle',
      { panel: 'editor' },
      'typing-dark',
      'circuit-board',
      'code-bokeh',
      'patch-panel',
      'desk-bokeh',
    ],
  },
  {
    seconds: 89,
    reverse: true,
    phase: '-8rem',
    tiles: [
      'code-editor',
      'fiber-optics',
      { panel: 'deploy' },
      'dev-at-monitor',
      'metrics-dashboard',
      'typing-warm',
      'code-dense',
    ],
  },
  {
    seconds: 79,
    reverse: false,
    phase: '-3rem',
    from: 'tablet',
    tiles: [
      'metrics-dashboard',
      'laptop-code-close',
      'switch-port',
      { panel: 'terminal' },
      'typing-laptop',
      'datacenter-aisle',
      'code-angled',
    ],
  },
  {
    seconds: 97,
    reverse: true,
    phase: '-12rem',
    from: 'desktop',
    tiles: [
      'patch-panel',
      'code-dense',
      'desk-bokeh',
      { panel: 'network' },
      'fiber-optics',
      'typing-dark',
      'code-editor',
    ],
  },
  {
    seconds: 83,
    reverse: false,
    phase: '-5rem',
    from: 'wide',
    tiles: [
      'circuit-board',
      'code-bokeh',
      'dev-at-monitor',
      'typing-warm',
      { panel: 'editor' },
      'code-angled',
      'switch-port',
    ],
  },
]

/**
 * Panel de editor.
 *
 * El fragmento no es de adorno: es la línea de `page.tsx` que calcula los años de experiencia
 * del CV a partir de las fechas reales. Si alguien con oficio se para a leerlo, lee algo que
 * existe de verdad en este repositorio — y ésa es precisamente la clase de lector al que hay que
 * caerle bien.
 */
function EditorPanel() {
  return (
    <div className="hero-panel">
      <p className="hero-panel__bar">
        <span className="hero-panel__dots" />
        page.tsx
      </p>
      <pre className="hero-panel__code">
        <span className="hero-panel__dim">const</span> years{' '}
        <span className="hero-panel__dim">=</span>{' '}
        <span className="hero-panel__fn">totalYearsOfExperience</span>({'\n  '}experience.
        <span className="hero-panel__fn">map</span>((e){' '}
        <span className="hero-panel__dim">{'=>'}</span> e.range),
        {'\n'}){'\n\n'}
        {/* Las dos barras van entre llaves: suelto en el JSX, ESLint lo lee como un comentario
            de JavaScript mal puesto y no como el texto de un comentario de código. */}
        <span className="hero-panel__dim">{'// ninguna cifra del CV está'}</span>
        {'\n'}
        <span className="hero-panel__dim">{'// escrita a mano'}</span>
      </pre>
    </div>
  )
}

/**
 * Panel de despliegue.
 *
 * Dice «esto no se queda en local» sin una sola palabra de marketing. Las cifras son las del
 * proyecto de verdad: dieciocho rutas estáticas, dos idiomas.
 */
function DeployPanel() {
  return (
    <div className="hero-panel">
      <p className="hero-panel__bar">
        <span className="hero-panel__dots" />
        build
      </p>
      <pre className="hero-panel__code">
        <span className="hero-panel__ok">✓</span> Compiled successfully
        {'\n'}
        <span className="hero-panel__ok">✓</span> Generating static pages{' '}
        <span className="hero-panel__dim">(18/18)</span>
        {'\n'}
        <span className="hero-panel__ok">✓</span> Checks{' '}
        <span className="hero-panel__dim">21/21 · es · en</span>
        {'\n\n'}
        <span className="hero-panel__accent">Ready</span>{' '}
        <span className="hero-panel__dim">— deployed to production</span>
      </pre>
    </div>
  )
}

/**
 * Panel de terminal.
 *
 * Los dos comandos son los dos que existen de verdad en el `package.json` de este repositorio, y
 * las cifras que devuelven son las que devuelven. Es el panel que dice «esto se comprueba», que es
 * una afirmación distinta de «esto se despliega» y le toca a un lector distinto: el técnico que va
 * a preguntar en la entrevista cómo pruebas lo que haces.
 */
function TerminalPanel() {
  return (
    <div className="hero-panel">
      <p className="hero-panel__bar">
        <span className="hero-panel__dots" />
        zsh
      </p>
      <pre className="hero-panel__code">
        <span className="hero-panel__accent">$</span> npm run check
        {'\n'}
        <span className="hero-panel__ok">✓</span>{' '}
        <span className="hero-panel__dim">tsc · eslint · prettier</span>
        {'\n\n'}
        <span className="hero-panel__accent">$</span> npm run check:mobile
        {'\n'}
        <span className="hero-panel__ok">✓</span>{' '}
        <span className="hero-panel__dim">21/21 · 390×844</span>
      </pre>
    </div>
  )
}

/**
 * Panel de topología.
 *
 * Es SVG y no una fotografía porque una foto de un armario de red a 200 px de ancho es una mancha
 * azul con luces, mientras que un grafo de nodos se lee como un grafo de nodos a cualquier tamaño.
 * Es la única teja «de red» que sigue diciendo algo cuando el mosaico se aprieta.
 *
 * No representa ninguna arquitectura concreta y no pretende hacerlo: el escenario entero es
 * decoración (`aria-hidden`) y este proyecto no inventa datos ni en los adornos.
 */
function NetworkPanel() {
  return (
    <div className="hero-panel">
      <p className="hero-panel__bar">
        <span className="hero-panel__dots" />
        network
      </p>
      {/* El trazo va en `currentColor` (cobre, puesto en el CSS) y las líneas a media opacidad,
          para que se lean los nodos y no la maraña. */}
      <svg className="hero-panel__svg" viewBox="0 0 120 60" fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeOpacity="0.45" strokeWidth="1">
          <path d="M60 30 20 14M60 30 20 46M60 30 100 14M60 30 100 46M20 14 20 46M100 14 100 46" />
        </g>
        <g fill="currentColor">
          {/* El nodo central, mayor: es lo que hace que el dibujo se lea como una topología con un
              centro y no como cinco puntos sueltos. */}
          <circle cx="60" cy="30" r="4.5" />
          <circle cx="20" cy="14" r="2.5" fillOpacity="0.7" />
          <circle cx="20" cy="46" r="2.5" fillOpacity="0.7" />
          <circle cx="100" cy="14" r="2.5" fillOpacity="0.7" />
          <circle cx="100" cy="46" r="2.5" fillOpacity="0.7" />
        </g>
      </svg>
    </div>
  )
}

/** Los cuatro paneles, indexados por su nombre: `StageTile` no tiene que saber cuántos hay. */
const PANELS: Record<Panel, () => React.JSX.Element> = {
  editor: EditorPanel,
  deploy: DeployPanel,
  terminal: TerminalPanel,
  network: NetworkPanel,
}

function StageTile({ tile }: { tile: Tile }) {
  if (typeof tile !== 'string') {
    const PanelComponent = PANELS[tile.panel]
    return <PanelComponent />
  }

  return (
    <Image
      src={`/hero/${tile}.webp`}
      // Decoración: el escenario entero está `aria-hidden`, así que un texto aquí no llegaría
      // a ningún lector de pantalla — sólo engordaría el HTML.
      alt=""
      width={TILE.width}
      height={TILE.height}
      sizes={TILE_SIZES}
      // `lazy` en todas, incluidas las que nacen a la vista: son un fondo, y lo que tiene que
      // llegar primero es la tipografía del titular, que es el LCP de la página. Puesto en
      // `eager`, treinta y cinco tejas decorativas competirían con él — y a pantalla completa el
      // navegador ya tiene bastante que hacer.
      loading="lazy"
      // Sin `quality`: con el cargador de este proyecto no haría nada en una imagen local, y
      // además 70 no está en la lista blanca de `next.config.ts` (75 y 85). Declararlo sería
      // pedir algo que no ocurre por una vía que Next podría rechazar. La compresión de estas
      // tejas está decidida donde se decide de verdad: al generar el WebP.
      draggable={false}
      className="hero-stage__tile"
    />
  )
}

export function HeroStage() {
  return (
    <div className="hero-stage" aria-hidden="true">
      {/* La zona: existe para llevar la animación de entrada, y por qué la lleva ella y no el
          carril está explicado en `globals.css`. */}
      <div className="hero-stage__area">
        {/* El resplandor. Va DEBAJO de las tejas: no las tiñe, las separa del grafito. */}
        <div className="hero-stage__glow" />

        <div className="hero-stage__rail">
          {COLUMNS.map((column, index) => (
            <div
              key={index}
              className={cn(
                'hero-stage__column',
                column.from && `hero-stage__column--${column.from}`,
              )}
            >
              <div
                className={cn('hero-stage__track', column.reverse && 'hero-stage__track--reverse')}
                style={
                  {
                    '--hero-drift': `${column.seconds}s`,
                    '--hero-phase': column.phase,
                  } as React.CSSProperties
                }
              >
                {/*
                 * La lista dos veces, y el desplazamiento hasta el −50 % exacto: al terminar la
                 * vuelta, la segunda copia está justo donde arrancó la primera y el salto es
                 * invisible. Es la única forma de hacer un bucle continuo sin medir nada en
                 * JavaScript.
                 *
                 * `key` con la posición y el número de copia porque la misma teja puede aparecer
                 * más de una vez y React necesita distinguirlas.
                 */}
                {[0, 1].map((copy) =>
                  column.tiles.map((tile, position) => (
                    <StageTile
                      key={`${typeof tile === 'string' ? tile : tile.panel}-${position}-${copy}`}
                      tile={tile}
                    />
                  )),
                )}
              </div>
            </div>
          ))}
        </div>

        {/* El velo, ENCIMA de las tejas: es lo único que garantiza que el titular se lea. El
            razonamiento completo —y los cuatro trabajos que hace el degradado— está en
            `globals.css`. */}
        <div className="hero-stage__scrim" />
      </div>
    </div>
  )
}
