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
 */
export function SectionHeading({ index, title, kicker, icon: Icon, children }: Props) {
  return (
    <header className="mb-12 lg:mb-16">
      <Reveal>
        <div className="flex items-center gap-3 border-b border-line pb-4">
          <span className="figure-num text-small text-signal" aria-hidden="true">
            {index}
          </span>
          <Icon className="size-4 text-paper-faint" />
          <span className="eyebrow">{title}</span>
        </div>
      </Reveal>

      <Reveal step={1}>
        <h2 className="mt-6 max-w-[24ch] text-title text-paper lg:mt-8">{kicker}</h2>
      </Reveal>

      {children ? (
        <Reveal step={2}>
          <div className="mt-5 max-w-measure text-paper-soft">{children}</div>
        </Reveal>
      ) : null}
    </header>
  )
}
