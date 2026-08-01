import Image from 'next/image'
import { cn } from '@/lib/cn'

/**
 * ESCENARIO CINÉTICO DE LA PORTADA
 *
 * El telón de fondo del hero: tres columnas de tejas —fotografías de dominio público y dos
 * paneles de interfaz dibujados aquí mismo— que se desplazan despacio y en direcciones
 * alternas, sobre un resplandor de cobre que respira, y todo ello disuelto en el grafito por
 * dos máscaras de degradado.
 *
 * Está aquí porque la portada tenía un problema real: un titular, un párrafo y cuatro cifras
 * sobre negro son correctos y no dicen a qué se dedica quien firma. El escenario lo dice en el
 * primer segundo y sin una palabra —código, servidores, cacharrería, un puesto de trabajo—, que
 * es exactamente el tiempo que hay antes de que alguien decida si sigue leyendo.
 *
 * Las cinco decisiones que lo sostienen:
 *
 * 1. **Cero JavaScript.** Ni un `useEffect`, ni un observador, ni una librería de animación: son
 *    animaciones CSS infinitas sobre `transform` y `opacity`, las dos únicas propiedades que el
 *    navegador puede animar en el compositor sin volver a calcular la maquetación. Esto es un
 *    componente de servidor y no hay nada que hidratar. Toda la portada sigue siendo HTML
 *    estático, que es la decisión de arquitectura del proyecto y no se toca por un adorno.
 *
 * 2. **Es DECORACIÓN, y se declara como tal.** `aria-hidden` en la raíz y `alt=""` en las once
 *    fotos. Anunciar «fotografía de un pasillo de servidores» a quien navega con lector de
 *    pantalla no le aporta nada sobre este CV: es ruido antes del nombre. Y `pointer-events:
 *    none` en todo el escenario, para que no se pueda interceptar un clic destinado a un botón.
 *
 * 3. **El texto manda sobre la imagen, siempre.** El escenario vive en el 58 % derecho en
 *    escritorio y por debajo del texto en móvil, con una máscara que lo apaga del todo antes de
 *    llegar al titular, y encima lleva un velo (`__scrim`) que devuelve el fondo a grafito puro
 *    bajo la columna de texto. Un hero ilustrado en el que hay que esforzarse para leer el
 *    nombre es un hero peor que uno negro.
 *
 * 4. **Dos paneles dibujados, no fotografiados.** Un editor y una salida de despliegue, hechos
 *    con la monoespaciada y los colores del sistema. Cumplen dos funciones que ninguna foto de
 *    banco de imágenes cumple: se ven **nítidos** a cualquier densidad de pantalla, y son lo que
 *    convierte el conjunto de «fotos de tecnología» en «alguien que escribe y despliega
 *    software». Además pesan cero bytes de imagen.
 *
 * 5. **Se para si molesta.** Con `prefers-reduced-motion: reduce` el escenario se queda quieto
 *    —no desaparece, se congela— en `globals.css`. Once tejas moviéndose es justo el tipo de
 *    movimiento periférico continuo que provoca mareo a quien tiene sensibilidad vestibular.
 *
 * La procedencia y la licencia de las once fotos están en `public/hero/CREDITS.md`, y se
 * reconstruyen con `node scripts/build-hero-tiles.mjs`. Las once son **CC0 1.0**: dominio
 * público, uso comercial, sin atribución exigida.
 */

/** Las once tejas miden lo mismo. El porqué de este tamaño está en `scripts/build-hero-tiles.mjs`. */
const TILE = { width: 600, height: 400 } as const

/**
 * Ancho declarado a `next/image`, por tramo: ~300 px con las tres columnas de escritorio,
 * ~280 px con las tres de tableta y ~190 px con las dos de móvil.
 *
 * **Aquí no ahorra bytes, y conviene saberlo antes de intentar afinarlo.** Este proyecto usa un
 * cargador propio (`sanity/imageLoader.ts`) que devuelve las rutas locales **tal cual**: las
 * transformaciones las hace la CDN de Sanity, y estas once tejas no están en Sanity, están en
 * `public/`. Así que el navegador recibe un `srcset` en el que todos los anchos apuntan al mismo
 * archivo, y descarga el de 600 px pase lo que pase. Se comprobó midiendo: pasar de un `300px`
 * fijo a estos tres tramos no cambió ni un byte.
 *
 * Se declara igualmente porque es correcto y gratis —el día que estas tejas se editen desde el
 * panel, el `sizes` ya está bien puesto—, pero **el único sitio donde se recorta el peso del
 * escenario es el archivo**: el ancho y la calidad de `scripts/build-hero-tiles.mjs`.
 */
const TILE_SIZES = '(min-width: 64rem) 300px, (min-width: 40rem) 280px, 190px'

type Panel = 'editor' | 'deploy'
type Tile = string | { panel: Panel }

/**
 * Las tres columnas.
 *
 * `seconds` son primos entre sí a propósito: con duraciones iguales —o múltiplos— las tres
 * columnas vuelven a alinearse cada vuelta y el conjunto empieza a leerse como un bloque que
 * sube, en vez de como tres planos a distinta profundidad. Y son números altos (más de un
 * minuto) porque esto es un fondo: en cuanto el movimiento se puede *seguir* con la vista, deja
 * de ser atmósfera y se convierte en algo que compite con el titular.
 *
 * `reverse` alterna el sentido. Es lo que crea la sensación de profundidad sin tener que tocar
 * escalas ni desenfoques por columna.
 *
 * El orden dentro de cada columna mezcla los temas: dos fotos de portátil con código seguidas se
 * leen como una sola teja repetida.
 */
const COLUMNS: readonly {
  seconds: number
  reverse: boolean
  tiles: readonly Tile[]
  /** La tercera sólo en escritorio: en 390 px no cabe, y así el móvil no descarga sus fotos. */
  desktopOnly?: boolean
}[] = [
  {
    seconds: 71,
    reverse: false,
    tiles: ['datacenter-aisle', { panel: 'editor' }, 'typing-dark', 'circuit-board'],
  },
  {
    seconds: 89,
    reverse: true,
    tiles: ['code-editor', 'desk-bokeh', { panel: 'deploy' }, 'switch-port'],
  },
  {
    seconds: 79,
    reverse: false,
    desktopOnly: true,
    tiles: ['laptop-code-close', 'code-dense', 'dev-at-monitor', 'typing-warm'],
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

function StageTile({ tile }: { tile: Tile }) {
  if (typeof tile !== 'string') {
    return tile.panel === 'editor' ? <EditorPanel /> : <DeployPanel />
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
      // llegar primero es el retrato (que sí va con `priority`) y la tipografía del titular.
      // Puesto en `eager`, once tejas decorativas competirían con el LCP de la página.
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
      {/* La zona centrada: alinea el carril con la retícula del texto aunque el
          escenario sea a sangre. El porqué está en `globals.css`. */}
      <div className="hero-stage__area">
        {/* El resplandor. Va DEBAJO de las tejas: no las tiñe, las separa del grafito. */}
        <div className="hero-stage__glow" />

        <div className="hero-stage__rail">
          {COLUMNS.map((column, index) => (
            <div
              key={index}
              className={cn('hero-stage__column', column.desktopOnly && 'hero-stage__column--wide')}
            >
              <div
                className={cn('hero-stage__track', column.reverse && 'hero-stage__track--reverse')}
                style={{ '--hero-drift': `${column.seconds}s` } as React.CSSProperties}
              >
                {/*
                 * La lista dos veces, y el desplazamiento hasta el −50 % exacto: al terminar la
                 * vuelta, la segunda copia está justo donde arrancó la primera y el salto es
                 * invisible. Es la única forma de hacer un bucle continuo sin medir nada en
                 * JavaScript.
                 *
                 * `key` con el sufijo de la copia porque la misma teja aparece dos veces y React
                 * necesita distinguirlas.
                 */}
                {[0, 1].map((copy) =>
                  column.tiles.map((tile) => (
                    <StageTile
                      key={`${typeof tile === 'string' ? tile : tile.panel}-${copy}`}
                      tile={tile}
                    />
                  )),
                )}
              </div>
            </div>
          ))}
        </div>

        {/* El velo, ENCIMA de las tejas: es lo que garantiza que el titular se lea. Va DENTRO
            de la zona, y no suelto en el escenario, para que sus porcentajes se midan contra la
            misma retícula que el carril; si no, velo y mosaico se separan al cambiar el ancho de
            la ventana. El razonamiento completo está en `globals.css`. */}
        <div className="hero-stage__scrim" />
      </div>
    </div>
  )
}
