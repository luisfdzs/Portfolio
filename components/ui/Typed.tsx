import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * El paso por carácter de la frase de portada, en milisegundos. 45 ms dan poco más de un
 * segundo para «Hola, soy Luis Fernández Sangil».
 */
export const TYPED_STEP = 45

type Props = {
  /** El texto, tal cual. Se parte aquí; nadie de fuera tiene que trocearlo. */
  text: string
  /**
   * Cuándo empieza a escribirse este bloque: un número de milisegundos o **cualquier
   * expresión CSS de tiempo**, incluida una que lea variables (`calc(var(--x) * 3)`).
   *
   * Lo segundo es lo que usa la portada, y no es un lujo: el ritmo de las dos líneas que se
   * escriben se decide en la hoja de estilos, por versión, así que el arranque del titular
   * tiene que poder calcularse a partir del paso del nombre sin volver a renderizar nada.
   */
  start?: number | string
  /** El paso por carácter: milisegundos o expresión CSS. Ver `TYPED_STEP`. */
  step?: number | string
  className?: string
}

/** Un tiempo para el CSS: los números se leen en milisegundos, lo demás pasa tal cual. */
function time(value: number | string): string {
  return typeof value === 'number' ? `${value}ms` : value
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
 * **Se usa UNA sola vez en la portada: el titular del puesto.** El nombre no se teclea —enfoca
 * de golpe— y todo lo demás está puesto desde el primer fotograma; el razonamiento de por qué
 * el gesto se concentra ahí está en `components/sections/Hero.tsx`. El `start` y el `step` le
 * llegan como variables de CSS y no como números calculados aquí, y es a propósito: el
 * tecleado del titular arranca **solapado** con el final del enfoque del nombre, así que las
 * dos mitades de la secuencia son una sola cuenta y esa cuenta tiene que vivir donde vive la
 * animación (bloque «Texto que se escribe» de `globals.css`).
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
      style={{ '--typed-start': time(start), '--typed-step': time(step) } as CSSProperties}
    >
      {nodes}
    </span>
  )
}
