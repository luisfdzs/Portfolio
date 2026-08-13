import Image from 'next/image'
import { cn } from '@/lib/cn'

const TILE = { width: 600, height: 400 } as const

const TILE_SIZES =
  '(min-width: 90rem) 380px, (min-width: 64rem) 340px, (min-width: 40rem) 300px, 200px'

type Panel = 'editor' | 'deploy' | 'terminal' | 'network'
type Tile = string | { panel: Panel }

const COLUMNS: readonly {
  seconds: number
  reverse: boolean
  phase: string
  from?: 'tablet' | 'desktop' | 'wide'
  tiles: readonly Tile[]
}[] = [
  {
    seconds: 71,
    reverse: false,
    phase: '0rem',
    tiles: [
      'datacenter-aisle',
      { panel: 'editor' },
      'typing-dark',
      'circuit-board',
      'code-bokeh',
      'patch-panel',
      'desk-bokeh',
    ],
  },
  {
    seconds: 89,
    reverse: true,
    phase: '-8rem',
    tiles: [
      'code-editor',
      'fiber-optics',
      { panel: 'deploy' },
      'dev-at-monitor',
      'metrics-dashboard',
      'typing-warm',
      'code-dense',
    ],
  },
  {
    seconds: 79,
    reverse: false,
    phase: '-3rem',
    from: 'tablet',
    tiles: [
      'metrics-dashboard',
      'laptop-code-close',
      'switch-port',
      { panel: 'terminal' },
      'typing-laptop',
      'datacenter-aisle',
      'code-angled',
    ],
  },
  {
    seconds: 97,
    reverse: true,
    phase: '-12rem',
    from: 'desktop',
    tiles: [
      'patch-panel',
      'code-dense',
      'desk-bokeh',
      { panel: 'network' },
      'fiber-optics',
      'typing-dark',
      'code-editor',
    ],
  },
  {
    seconds: 83,
    reverse: false,
    phase: '-5rem',
    from: 'wide',
    tiles: [
      'circuit-board',
      'code-bokeh',
      'dev-at-monitor',
      'typing-warm',
      { panel: 'editor' },
      'code-angled',
      'switch-port',
    ],
  },
]

function EditorPanel() {
  return (
    <div className="hero-panel">
      <p className="hero-panel__bar">
        <span className="hero-panel__dots" />
        page.tsx
      </p>
      <pre className="hero-panel__code">
        <span className="hero-panel__dim">const</span> years{' '}
        <span className="hero-panel__dim">=</span>{' '}
        <span className="hero-panel__fn">totalYearsOfExperience</span>({'\n  '}experience.
        <span className="hero-panel__fn">map</span>((e){' '}
        <span className="hero-panel__dim">{'=>'}</span> e.range),
        {'\n'}){'\n\n'}
        <span className="hero-panel__dim">{'// ninguna cifra del CV está'}</span>
        {'\n'}
        <span className="hero-panel__dim">{'// escrita a mano'}</span>
      </pre>
    </div>
  )
}

function DeployPanel() {
  return (
    <div className="hero-panel">
      <p className="hero-panel__bar">
        <span className="hero-panel__dots" />
        build
      </p>
      <pre className="hero-panel__code">
        <span className="hero-panel__ok">✓</span> Compiled successfully
        {'\n'}
        <span className="hero-panel__ok">✓</span> Generating static pages{' '}
        <span className="hero-panel__dim">(18/18)</span>
        {'\n'}
        <span className="hero-panel__ok">✓</span> Checks{' '}
        <span className="hero-panel__dim">21/21 · es · en</span>
        {'\n\n'}
        <span className="hero-panel__accent">Ready</span>{' '}
        <span className="hero-panel__dim">— deployed to production</span>
      </pre>
    </div>
  )
}

function TerminalPanel() {
  return (
    <div className="hero-panel">
      <p className="hero-panel__bar">
        <span className="hero-panel__dots" />
        zsh
      </p>
      <pre className="hero-panel__code">
        <span className="hero-panel__accent">$</span> npm run check
        {'\n'}
        <span className="hero-panel__ok">✓</span>{' '}
        <span className="hero-panel__dim">tsc · eslint · prettier</span>
        {'\n\n'}
        <span className="hero-panel__accent">$</span> npm run check:mobile
        {'\n'}
        <span className="hero-panel__ok">✓</span>{' '}
        <span className="hero-panel__dim">21/21 · 390×844</span>
      </pre>
    </div>
  )
}

function NetworkPanel() {
  return (
    <div className="hero-panel">
      <p className="hero-panel__bar">
        <span className="hero-panel__dots" />
        network
      </p>
      <svg className="hero-panel__svg" viewBox="0 0 120 60" fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeOpacity="0.45" strokeWidth="1">
          <path d="M60 30 20 14M60 30 20 46M60 30 100 14M60 30 100 46M20 14 20 46M100 14 100 46" />
        </g>
        <g fill="currentColor">
          <circle cx="60" cy="30" r="4.5" />
          <circle cx="20" cy="14" r="2.5" fillOpacity="0.7" />
          <circle cx="20" cy="46" r="2.5" fillOpacity="0.7" />
          <circle cx="100" cy="14" r="2.5" fillOpacity="0.7" />
          <circle cx="100" cy="46" r="2.5" fillOpacity="0.7" />
        </g>
      </svg>
    </div>
  )
}

const PANELS: Record<Panel, () => React.JSX.Element> = {
  editor: EditorPanel,
  deploy: DeployPanel,
  terminal: TerminalPanel,
  network: NetworkPanel,
}

function StageTile({ tile }: { tile: Tile }) {
  if (typeof tile !== 'string') {
    const PanelComponent = PANELS[tile.panel]
    return <PanelComponent />
  }

  return (
    <Image
      src={`/hero/${tile}.webp`}
      alt=""
      width={TILE.width}
      height={TILE.height}
      sizes={TILE_SIZES}
      loading="lazy"
      draggable={false}
      className="hero-stage__tile"
    />
  )
}

export function HeroStage() {
  return (
    <div className="hero-stage" aria-hidden="true">
      <div className="hero-stage__area">
        <div className="hero-stage__glow" />

        <div className="hero-stage__rail">
          {COLUMNS.map((column, index) => (
            <div
              key={index}
              className={cn(
                'hero-stage__column',
                column.from && `hero-stage__column--${column.from}`,
              )}
            >
              <div
                className={cn('hero-stage__track', column.reverse && 'hero-stage__track--reverse')}
                style={
                  {
                    '--hero-drift': `${column.seconds}s`,
                    '--hero-phase': column.phase,
                  } as React.CSSProperties
                }
              >
                {[0, 1].map((copy) =>
                  column.tiles.map((tile, position) => (
                    <StageTile
                      key={`${typeof tile === 'string' ? tile : tile.panel}-${position}-${copy}`}
                      tile={tile}
                    />
                  )),
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="hero-stage__scrim" />
      </div>
    </div>
  )
}
