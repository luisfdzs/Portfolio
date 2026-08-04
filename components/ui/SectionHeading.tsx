import type { ComponentType, ReactNode, SVGProps } from 'react'
import { cn } from '@/lib/cn'
import { Reveal } from './Reveal'

type Props = {
  /** Numeración de la sección: «01», «02»… Ver por qué más abajo. */
  index: string
  title: string
  /**
   * La frase de debajo del rótulo. **Opcional**, y cuando falta la sección se queda sólo con
   * el rótulo: es el caso de formación, cuyo «De la ingeniería industrial al desarrollo web»
   * se quitó por encargo. Ver por qué eso cambia qué elemento es el `<h2>`, más abajo.
   */
  kicker?: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  children?: ReactNode
  /**
   * Sangrado que centra **el texto** de la cabecera sobre la columna de texto de la sección,
   * en vez de sobre la sección entera. Se pasa como clase de relleno (`lg:pl-72`), porque el
   * número es aritmética de la sección que lo usa y tiene que vivir allí — hoy sólo lo usa
   * experiencia, cuyo carril de fechas empuja el texto 18rem a la derecha.
   *
   * **Es relleno y no margen a propósito**: el filete de debajo del rótulo pequeño tiene que
   * seguir cruzando la sección de lado a lado. Con margen se acortaría por la izquierda y la
   * cabecera dejaría de leerse como el borde superior de la sección.
   */
  textIndent?: string
}

/**
 * Cabecera de sección, idéntica en las cinco.
 *
 * La **numeración** no es un adorno: convierte una página larga en un documento con
 * índice implícito. Quien baja rápido sabe en qué punto de cinco está sin leer el título,
 * y eso reduce la sensación de scroll infinito que hunde a los portfolios de una sola
 * página. Va en monoespaciada y con el acento, que es el único sitio donde el acento
 * aparece dos veces seguidas — y por eso el icono va en gris y no en cobre.
 *
 * **Todo va centrado**, como el resto del sitio: `justify-center` en la fila del rótulo
 * —que es un flex y no hereda el `text-center`— y `mx-auto` en las dos cajas con ancho
 * máximo. Sin el `mx-auto`, una caja de 24ch dentro de un contenedor de 80rem se queda
 * pegada a la izquierda con el texto centrado dentro: el bloque parece descolocado justo
 * porque el texto sí está centrado y la caja no.
 *
 * **Centrado en la sección salvo que la sección diga otra cosa** (`textIndent`): donde el
 * contenido no ocupa el ancho entero —experiencia, con su carril de fechas a la izquierda—,
 * centrar la cabecera en la sección la deja desalineada respecto al texto que encabeza. Ahí
 * se pasa un sangrado y la cabecera se centra sobre la columna de texto.
 *
 * **El ancho máximo del rótulo son dos valores, no uno.** En móvil sigue en 24ch, que es lo
 * que impide que un titular a 24 px se lea como un párrafo; en escritorio sube a 52ch para
 * que los rótulos de una frase quepan **en una sola línea**. El que lo pedía es «Cinco años
 * entregando software en producción» (43 caracteres), que a 24ch se partía en tres líneas y
 * hacía que el titular de la sección más importante del CV pareciera un párrafo. No es
 * `max-w-none`: sin tope, en un monitor de 1920 px el rótulo se estiraría hasta los 80rem
 * del contenedor y dejaría de leerse como un titular.
 */
export function SectionHeading({ index, title, kicker, icon: Icon, children, textIndent }: Props) {
  return (
    <header className="mb-12 text-center lg:mb-16">
      <Reveal>
        <div
          className={cn(
            'flex items-center justify-center gap-3 border-b border-line pb-4',
            textIndent,
          )}
        >
          <span className="figure-num text-small text-signal" aria-hidden="true">
            {index}
          </span>
          <Icon className="size-4 text-paper-faint" />
          {/*
           * EL `<h2>` DE LA SECCIÓN ES EL RÓTULO CUANDO NO HAY FRASE, y esto no es un detalle
           * de estilo: sin frase, poner el rótulo en un `<span>` dejaría la sección sin
           * encabezado y el esquema del documento saltaría del `<h1>` del hero a los `<h3>` de
           * las entradas. El aspecto es idéntico —la clase `eyebrow` es la misma— y quien
           * navega con lector de pantalla sigue teniendo las cinco secciones en su lista.
           */}
          {kicker ? <span className="eyebrow">{title}</span> : <h2 className="eyebrow">{title}</h2>}
        </div>
      </Reveal>

      {kicker ? (
        <Reveal step={1} className={textIndent}>
          <h2 className="mt-6 mx-auto max-w-[24ch] text-title text-paper lg:mt-8 lg:max-w-[52ch]">
            {kicker}
          </h2>
        </Reveal>
      ) : null}

      {children ? (
        <Reveal step={2} className={textIndent}>
          <div className="mt-5 mx-auto max-w-measure text-paper-soft">{children}</div>
        </Reveal>
      ) : null}
    </header>
  )
}
