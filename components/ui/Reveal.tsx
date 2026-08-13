import type { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  children: ReactNode
  as?: ElementType
  step?: number
  className?: string
}

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
