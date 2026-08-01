import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { ArrowUpRight } from './Icons'

type Variant = 'primary' | 'secondary' | 'quiet'

const variants: Record<Variant, string> = {
  // El único botón sólido del sitio, y sólo hay uno por pantalla. En cuanto haya dos,
  // ninguno es el principal.
  primary: 'bg-signal text-ink hover:bg-paper',
  secondary: 'border border-line-strong text-paper hover:border-signal hover:text-signal',
  quiet: 'text-paper-soft hover:text-signal',
}

type Props = {
  href: string
  children: ReactNode
  variant?: Variant
  /** Añade la flechita y los atributos de enlace externo. */
  external?: boolean
  /** Se lee después del texto del enlace, sólo para lectores de pantalla. */
  externalHint?: string
  className?: string
}

/**
 * Enlace de acción: los botones del hero, los enlaces a la web y al repositorio de cada
 * proyecto, la navegación entre fichas.
 *
 * Los externos llevan `rel="noopener noreferrer"` —`noopener` para que la pestaña nueva
 * no pueda tocar esta, `noreferrer` porque a la web de un cliente no le hace falta saber
 * de dónde viene el visitante— y un aviso invisible para lectores de pantalla: quien no
 * ve la flechita tiene derecho a saber que el enlace va a abrir otra pestaña antes de
 * pulsarlo, no después.
 *
 * Se usa `next/link` también para los externos: `Link` delega en un `<a>` normal cuando
 * el href es absoluto, así que no hay coste y hay un solo componente que mantener.
 */
export function Action({
  href,
  children,
  variant = 'secondary',
  external = false,
  externalHint,
  className,
}: Props) {
  const isQuiet = variant === 'quiet'

  return (
    <Link
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn(
        'group inline-flex items-center gap-2 text-small transition-colors duration-300',
        !isQuiet && 'rounded-full px-5 py-2.5 font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
      {external ? (
        <>
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          {externalHint ? <span className="sr-only">({externalHint})</span> : null}
        </>
      ) : null}
    </Link>
  )
}
