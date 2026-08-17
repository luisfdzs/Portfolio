import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { ArrowUpRight } from './Icons'

type Variant = 'primary' | 'secondary' | 'quiet' | 'beacon'

const variants: Record<Variant, string> = {
  primary: 'bg-signal text-ink hover:bg-paper',
  secondary: 'border border-line-strong text-paper hover:border-signal hover:text-signal',
  quiet: 'text-paper-soft hover:text-signal',
  beacon:
    'border border-signal bg-ink text-signal shadow-[0_0_0_1px_var(--color-ink),0_12px_34px_-10px_var(--color-ink)] hover:bg-signal hover:text-ink',
}

type Props = {
  href: string
  children: ReactNode
  variant?: Variant
  external?: boolean
  externalHint?: string
  className?: string
}

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
