import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Loader = {
  mark: string
  ring?: string
  art: ReactNode
  cycle: number
}

const PETALS = [0, 72, 144, 216, 288]

const flower = (
  <svg
    viewBox="0 0 40 60"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.4}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="pl-flower"
  >
    <path className="pl-stem" d="M20 58 C20 47 18.5 37 20 28" />
    <path className="pl-leaf" d="M20 47 C14 46 11 41.5 12 37.5 C17 38 19.5 42 20 47" />
    <path className="pl-leaf" d="M20 42 C25.5 41 28 37 27 33.5 C22.5 34 20.5 37.5 20 42" />
    {PETALS.map((angle, index) => (
      <g key={angle} transform={`rotate(${angle} 20 21)`}>
        <ellipse
          className="pl-petal"
          cx="20"
          cy="15"
          rx="3.1"
          ry="5"
          style={{ animationDelay: `${index * 70}ms` }}
        />
      </g>
    ))}
    <circle className="pl-heart" cx="20" cy="21" r="2.4" fill="currentColor" stroke="none" />
  </svg>
)

const coil = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    className="pl-trace"
  >
    <path d="M4 2v20" />
    <path d="M20 2v20" />
    <path className="pl-ghost" d="M4 8h16" />
    <path className="pl-ghost" d="M4 16h16" />
    <path className="pl-draw" style={{ '--pl-length': 16 } as CSSProperties} d="M4 8h16" />
    <path
      className="pl-draw"
      style={{ '--pl-length': 16, animationDelay: '280ms' } as CSSProperties}
      d="M4 16h16"
    />
  </svg>
)

const monogram = (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth={3} className="pl-trace">
    <circle className="pl-ghost" cx="20" cy="20" r="18" />
    <circle
      className="pl-draw"
      style={{ '--pl-length': 113 } as CSSProperties}
      cx="20"
      cy="20"
      r="18"
    />
    <rect className="pl-blink" x="14" y="6" width="3.4" height="28" fill="currentColor" />
  </svg>
)

const kerchief = (
  <svg viewBox="0 0 40 36" fill="none" className="pl-bob">
    <path d="M4 7 H36 L20 33 Z" fill="currentColor" />
    <circle cx="20" cy="6" r="3.4" fill="#e0a92e" />
  </svg>
)

const pole = <span className="pl-pole" />

const bar = <span className="pl-bar" />

const ring = <span className="pl-ring" />

const slam = (
  <span className="pl-slam">
    <span />
    <span />
    <span />
  </span>
)

const terminal = (
  <span className="pl-term">
    <span className="pl-term__sign">$</span>
    <span className="pl-term__line">
      <span className="pl-term__caret" />
    </span>
  </span>
)

const dots = (
  <span className="pl-dots">
    <span />
    <span />
    <span />
    <span />
    <span />
  </span>
)

const crossFade = (
  <span className="pl-fade">
    <span />
    <span />
    <span />
  </span>
)

const loaders: Record<string, Loader> = {
  site: { mark: '#e0a458', art: terminal, cycle: 1600 },
  'bonsai-artesania': { mark: '#9db38f', art: flower, cycle: 2800 },
  swiftmet: { mark: '#5fb3d4', art: coil, cycle: 2600 },
  cedece: { mark: '#f0384f', art: monogram, cycle: 2600 },
  'mila-barber': { mark: '#e0a938', art: pole, cycle: 1500 },
  'ckm-combat-academy': { mark: '#e63b52', art: slam, cycle: 1600 },
  'sangil-studio': { mark: '#e9e6e1', art: bar, cycle: 2400 },
  'sangil-studio-test': { mark: '#d9d6d1', art: crossFade, cycle: 2700 },
  blablatour: { mark: '#4ec2a3', ring: '#2f4a43', art: ring, cycle: 1000 },
  'almuerziko-san-fermin': { mark: '#f04a56', art: kerchief, cycle: 2400 },
  portfolio: { mark: '#e0a458', art: dots, cycle: 1500 },
}

const fallback: Loader = { mark: '#e0a458', art: dots, cycle: 1500 }

export function loaderCycle(slug: string) {
  return (loaders[slug] ?? fallback).cycle
}

export function ProjectLoader({
  slug,
  leaving = false,
  className,
}: {
  slug: string
  leaving?: boolean
  className?: string
}) {
  const loader = loaders[slug] ?? fallback

  const palette = {
    '--pl-mark': loader.mark,
    '--pl-ring': loader.ring ?? loader.mark,
  } as CSSProperties

  return (
    <span
      aria-hidden="true"
      className={cn('project-loader', className)}
      data-leaving={leaving || undefined}
      style={palette}
    >
      <span className="pl-mark">{loader.art}</span>
    </span>
  )
}
