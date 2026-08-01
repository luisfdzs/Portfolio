import type { ComponentType, ReactNode, SVGProps } from 'react'
import { Reveal } from './Reveal'

type Props = {
  /** Numeración de la sección: «01», «02»… Ver por qué más abajo. */
  index: string
  title: string
  kicker: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  children?: ReactNode
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
 */
export function SectionHeading({ index, title, kicker, icon: Icon, children }: Props) {
  return (
    <header className="mb-12 text-center lg:mb-16">
      <Reveal>
        <div className="flex items-center justify-center gap-3 border-b border-line pb-4">
          <span className="figure-num text-small text-signal" aria-hidden="true">
            {index}
          </span>
          <Icon className="size-4 text-paper-faint" />
          <span className="eyebrow">{title}</span>
        </div>
      </Reveal>

      <Reveal step={1}>
        <h2 className="mt-6 mx-auto max-w-[24ch] text-title text-paper lg:mt-8">{kicker}</h2>
      </Reveal>

      {children ? (
        <Reveal step={2}>
          <div className="mt-5 mx-auto max-w-measure text-paper-soft">{children}</div>
        </Reveal>
      ) : null}
    </header>
  )
}
