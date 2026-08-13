import type { ComponentType, ReactNode, SVGProps } from 'react'
import { Reveal } from './Reveal'

type Props = {
  index: string
  title: string
  kicker?: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  children?: ReactNode
}

export function SectionHeading({ index, title, kicker, icon: Icon, children }: Props) {
  return (
    <header className="mb-12 text-center lg:mb-16">
      <Reveal>
        <div className="flex items-center justify-center gap-3 border-b border-line pb-4">
          <span className="figure-num text-small text-signal" aria-hidden="true">
            {index}
          </span>
          <Icon className="size-4 text-paper-faint" />
          {kicker ? <span className="eyebrow">{title}</span> : <h2 className="eyebrow">{title}</h2>}
        </div>
      </Reveal>

      {kicker ? (
        <Reveal step={1}>
          <h2 className="mt-6 mx-auto max-w-[24ch] text-title text-paper lg:mt-8 lg:max-w-[52ch]">
            {kicker}
          </h2>
        </Reveal>
      ) : null}

      {children ? (
        <Reveal step={2}>
          <div className="mt-5 mx-auto max-w-measure text-paper-soft">{children}</div>
        </Reveal>
      ) : null}
    </header>
  )
}
