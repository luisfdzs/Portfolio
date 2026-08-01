import type { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  children: ReactNode
  as?: ElementType
  /** Retardo escalonado, en pasos de 60 ms, para listas. */
  step?: number
  className?: string
}

/**
 * Aparición al hacer scroll **sin JavaScript**: la hace CSS con
 * `animation-timeline: view()` (ver la utilidad `reveal` en globals.css). En navegadores
 * sin soporte el contenido simplemente se ve, que es el fallback correcto — nunca
 * contenido invisible por una animación que no corre.
 */
export function Reveal({ children, as: Tag = 'div', step = 0, className }: Props) {
  return (
    <Tag
      className={cn('reveal', className)}
      style={step > 0 ? { animationDelay: `${step * 60}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
