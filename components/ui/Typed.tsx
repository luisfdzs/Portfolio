import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * El paso por carácter de la frase de portada, en milisegundos. 45 ms dan poco más de un
 * segundo para «Hola, soy Luis Fernández Sangil».
 */
export const TYPED_STEP = 45

/**
 * El paso de los bloques largos —el titular del puesto y la ubicación—, en milisegundos.
 *
 * No es un capricho de ritmo: a 45 ms, los cuarenta caracteres del titular más los
 * veinticinco de la ubicación añadirían tres segundos a los 1,4 que ya gasta el nombre, y
 * los botones y las cifras no aparecerían hasta pasados cuatro segundos y medio. Quien
 * decide en treinta segundos si esto merece un scroll no espera cuatro. Con 20 ms el
 * tecleado completo cabe en 2,7 s y sigue leyéndose como alguien escribiendo.
 */
export const TYPED_STEP_DENSE = 20

/**
 * La pausa entre dos bloques que se escriben seguidos, en milisegundos. Es el respiro de
 * quien teclea al terminar una línea y empezar la siguiente; sin ella las cuatro líneas de
 * la portada se leen como un solo chorro de caracteres.
 */
export const TYPED_PAUSE = 220

type Props = {
  /** El texto, tal cual. Se parte aquí; nadie de fuera tiene que trocearlo. */
  text: string
  /**
   * Cuándo empieza a escribirse este bloque, en milisegundos desde que carga la página. Es
   * lo que encadena las cuatro líneas de la portada —saludo, nombre, titular y ubicación—
   * como si las escribiera la misma persona en vez de arrancar las cuatro a la vez.
   *
   * Va en milisegundos y no en caracteres, que es lo que había antes: desde que cada bloque
   * puede tener su propio paso, un índice de caracteres no dice cuánto tiempo se ha gastado.
   */
  start?: number
  /** Milisegundos por carácter. Ver `TYPED_STEP` y `TYPED_STEP_DENSE`. */
  step?: number
  className?: string
}

/**
 * TEXTO QUE SE ESCRIBE, LETRA A LETRA, **SIN JAVASCRIPT**.
 *
 * El encargo era que al abrir la web dé la impresión de que alguien está escribiendo «Hola,
 * soy Luis Fernández Sangil» en vez de encontrarlo ya puesto. Lo hace CSS: cada carácter va
 * en su propio `<span>` con un índice, y la hoja de estilos lo convierte en el momento en que
 * se enciende, así que aparecen en cascada. Es la misma familia de decisiones que `Reveal` y
 * que el cover flow — la animación la lleva el CSS y el componente sólo reparte los índices.
 *
 * **Se usa cuatro veces en la portada y las cuatro son una sola frase**: saludo, nombre,
 * titular y ubicación se escriben seguidos porque cada bloque recibe en `start` el momento en
 * que terminó el anterior (ver `typedEnd` y `components/sections/Hero.tsx`). Los dos últimos
 * van a `TYPED_STEP_DENSE` porque son largos; el paso es de cada bloque, no del sitio.
 *
 * Las cinco decisiones que lo hacen seguro, y ninguna es evidente:
 *
 * - **El índice no es un retardo, es una duración.** Éste no es un detalle del CSS que se
 *   pueda ignorar desde aquí, porque decide qué significan `--typed-index` y `--typed-start`:
 *   cada carácter arranca a la vez y dura hasta su turno —el arranque del bloque incluido, que
 *   se suma a la duración—. Con `animation-delay`, que es lo evidente, Chrome
 *   deja de aplicar el `forwards` de las animaciones de duración mínima cuyo retardo pase del
 *   segundo, y la frase se quedaba clavada en «Luis Fernánde» sin que ni el `check` ni el
 *   build tuvieran nada que decir. Está medido y contado en el bloque «Texto que se escribe»
 *   de `globals.css`.
 * - **Nada de un contador en `useState`.** Lo evidente sería un componente de cliente que
 *   recorta el texto por un índice que sube con un temporizador, y tiene dos fallos que aquí
 *   no son aceptables. El nombre es el `<h1>` de la página y el objetivo del sitio es que
 *   alguien lo busque en Google: el texto tiene que estar **completo en el HTML** que sirve
 *   el servidor. Y el arranque se vería: el HTML de servidor pinta la frase entera, la
 *   hidratación la borraría para reescribirla, y eso es un destello del texto final antes de
 *   la animación. Con CSS el HTML ya lleva la frase y lo único que hace la animación es
 *   revelarla.
 * - **Se revela EN SITIO, no crece.** Los caracteres ocultos ocupan su hueco desde el primer
 *   fotograma (`opacity: 0`, no `display: none`), así que el bloque mide lo mismo antes y
 *   después. Un texto que crece letra a letra empujaría el hero entero —que se apoya en el
 *   borde de abajo con `justify-end`— y sería un salto de maquetación en la primera pantalla,
 *   justo lo que mide Core Web Vitals.
 * - **Una palabra no se puede partir por la mitad.** Con un `<span>` por letra, el navegador
 *   puede meter el salto de línea entre dos cualesquiera, y a 390 px «Fernández» se rompería
 *   en «Fernán / dez». Por eso cada palabra va envuelta en un `nowrap`: dentro no se parte, y
 *   entre palabras el espacio sigue siendo un nodo de texto normal, que es donde el salto
 *   tiene que caer.
 * - **El espacio no se anima pero sí cuenta.** Es invisible, así que revelarlo no se ve; lo
 *   que importa es que consuma su turno, porque teclear también tarda en la barra
 *   espaciadora. Va como texto suelto entre palabras y sólo se le suma uno al índice.
 *
 * El nombre accesible no se toca: los `<span>` son en línea y no insertan espacios, así que
 * un lector de pantalla y el `aria-labelledby` del hero siguen leyendo «Luis Fernández
 * Sangil». Por lo mismo se puede seleccionar y copiar la frase entera.
 *
 * Con `prefers-reduced-motion: reduce` y en papel, todo aparece puesto y el cursor no
 * existe: ver el bloque «Texto que se escribe» de `globals.css`.
 */
export function Typed({ text, start = 0, step = TYPED_STEP, className }: Props) {
  const words = text.split(' ')
  const nodes: ReactNode[] = []

  // El índice del carácter dentro de ESTE bloque, que es lo que multiplica el paso. Se lleva
  // a mano porque el espacio entre palabras también gasta un turno sin ser un elemento
  // animado, así que la cuenta no coincide con ningún `map`.
  let index = 0

  words.forEach((word, position) => {
    if (position > 0) {
      // El espacio, como nodo de texto: es la única oportunidad de salto de línea que le
      // queda al navegador, porque dentro de cada palabra la hemos prohibido.
      nodes.push(' ')
      index += 1
    }

    nodes.push(
      <span key={`${position}-${word}`} className="typed__word">
        {[...word].map((character, letter) => (
          <span
            key={letter}
            className="typed__char"
            style={{ '--typed-index': index++ } as CSSProperties}
          >
            {character}
          </span>
        ))}
      </span>,
    )
  })

  return (
    <span
      className={cn('typed', className)}
      style={{ '--typed-start': `${start}ms`, '--typed-step': `${step}ms` } as CSSProperties}
    >
      {nodes}
    </span>
  )
}

/**
 * Cuándo termina de escribirse un bloque, en milisegundos: lo que se le pasa como `start` al
 * siguiente (más una pausa, si se quiere el respiro de `TYPED_PAUSE`).
 *
 * Existe como función y no como aritmética escrita en el sitio de la llamada porque el día
 * que el reparto de turnos cambie —que los signos de puntuación tarden más, por ejemplo— la
 * cuenta tiene que cambiar en un solo sitio y no en cuatro que se desincronizan.
 */
export function typedEnd(start: number, text: string, step = TYPED_STEP): number {
  return start + text.length * step
}
