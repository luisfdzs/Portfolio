import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export const TYPED_STEP = 45

type Props = {
  text: string
  start?: number | string
  step?: number | string
  className?: string
}

function time(value: number | string): string {
  return typeof value === 'number' ? `${value}ms` : value
}

export function Typed({ text, start = 0, step = TYPED_STEP, className }: Props) {
  const words = text.split(' ')
  const nodes: ReactNode[] = []

  let index = 0

  words.forEach((word, position) => {
    if (position > 0) {
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
