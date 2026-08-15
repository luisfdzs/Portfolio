'use client'

import { useMemo, useState, type ReactNode } from 'react'

type Control = {
  key: keyof typeof DEFAULTS
  label: string
  min: number
  max: number
  step: number
  unit: string
  hint?: string
}

const DEFAULTS = {
  cardWidth: 36,
  cardHeight: 0,
  imageRatio: 2.2,
  overlap: 0.46,
  turn: 58,
  gap: 1.25,
  padding: 1,
  viewportWidth: 2.6,
}

const CONTROLS: readonly Control[] = [
  {
    key: 'cardWidth',
    label: 'Ancho de la tarjeta',
    min: 12,
    max: 60,
    step: 0.5,
    unit: 'rem',
    hint: '--cover-flow-card',
  },
  {
    key: 'cardHeight',
    label: 'Alto mínimo de la tarjeta',
    min: 0,
    max: 60,
    step: 0.5,
    unit: 'rem',
    hint: '0 = automático (según contenido)',
  },
  {
    key: 'imageRatio',
    label: 'Proporción de la imagen',
    min: 0.5,
    max: 4,
    step: 0.05,
    unit: ': 1',
    hint: 'ancho ÷ alto — 2 = 2/1, 1 = cuadrada',
  },
  {
    key: 'padding',
    label: 'Padding interior',
    min: 0,
    max: 4,
    step: 0.125,
    unit: 'rem',
  },
  {
    key: 'overlap',
    label: 'Solape entre tarjetas',
    min: 0.2,
    max: 1,
    step: 0.02,
    unit: '×',
    hint: '--cover-flow-step = ancho × este valor',
  },
  {
    key: 'turn',
    label: 'Giro 3D lateral',
    min: 0,
    max: 80,
    step: 1,
    unit: 'deg',
    hint: '--cover-flow-turn',
  },
  {
    key: 'gap',
    label: 'Separación (sin animación 3D)',
    min: 0,
    max: 4,
    step: 0.125,
    unit: 'rem',
  },
  {
    key: 'viewportWidth',
    label: 'Ancho visible del carrusel',
    min: 0,
    max: 6,
    step: 0.1,
    unit: '× paso',
    hint: 'cuántas tarjetas laterales se ven',
  },
]

const PRESETS: Record<string, Partial<typeof DEFAULTS>> = {
  Actual: DEFAULTS,
  Horizontal: { cardWidth: 42, cardHeight: 0, imageRatio: 2.4, overlap: 0.72, turn: 44 },
  Cuadrada: { cardWidth: 26, cardHeight: 26, imageRatio: 1.6, overlap: 0.62, turn: 52 },
  Vertical: { cardWidth: 20, cardHeight: 34, imageRatio: 1.1, overlap: 0.5, turn: 58 },
}

export function ProjectsLab({ children }: { children: ReactNode }) {
  const [values, setValues] = useState(DEFAULTS)
  const [open, setOpen] = useState(true)
  const [override, setOverride] = useState(false)

  const css = useMemo(() => (override ? buildCss(values) : ''), [override, values])

  function set(key: keyof typeof DEFAULTS, value: number) {
    setOverride(true)
    setValues((previous) => ({ ...previous, [key]: value }))
  }

  return (
    <div data-lab="">
      <style>{css}</style>

      {children}

      <div
        data-print="hide"
        className="fixed top-4 right-4 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-line-strong bg-ink-raised/95 text-left shadow-2xl backdrop-blur"
      >
        <button
          type="button"
          onClick={() => setOpen((state) => !state)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-small text-paper"
        >
          <span className="eyebrow text-signal">Panel de medidas</span>
          <span aria-hidden="true">{open ? '−' : '+'}</span>
        </button>

        {open ? (
          <div className="max-h-[80vh] overflow-y-auto border-t border-line px-4 pt-3 pb-4">
            <p className="mb-3 text-micro text-paper-faint">
              {override
                ? 'Override activo: los valores del panel sustituyen a los responsive del sitio.'
                : 'Mostrando los valores reales del sitio (responsive). Mueve un slider para sobrescribirlos.'}
            </p>

            <div className="mb-4 flex flex-wrap gap-2">
              {Object.entries(PRESETS).map(([name, preset]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setOverride(true)
                    setValues({ ...DEFAULTS, ...preset })
                  }}
                  className="rounded-full border border-line-strong px-3 py-1 text-micro text-paper-soft transition-colors hover:border-signal hover:text-signal"
                >
                  {name}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              {CONTROLS.map((control) => (
                <label key={control.key} className="block">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-small text-paper">{control.label}</span>
                    <span className="figure-num text-micro text-signal">
                      {formatValue(values[control.key])}
                      {control.unit}
                    </span>
                  </span>

                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={values[control.key]}
                    onChange={(event) => set(control.key, Number(event.target.value))}
                    className="mt-2 w-full accent-[var(--color-signal)]"
                  />

                  {control.hint ? (
                    <span className="mt-1 block text-micro text-paper-faint">{control.hint}</span>
                  ) : null}
                </label>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setOverride(false)
                  setValues(DEFAULTS)
                }}
                className="rounded-full border border-line-strong px-3 py-1.5 text-micro text-paper-soft transition-colors hover:border-signal hover:text-signal"
              >
                Volver al sitio
              </button>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(buildSnippet(values))}
                className="rounded-full border border-line-strong px-3 py-1.5 text-micro text-paper-soft transition-colors hover:border-signal hover:text-signal"
              >
                Copiar CSS
              </button>
            </div>

            <pre className="mt-3 overflow-x-auto rounded-lg border border-line bg-ink p-3 text-micro text-paper-faint">
              {buildSnippet(values)}
            </pre>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function formatValue(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2).replace(/0$/, '')
}

function buildSnippet(v: typeof DEFAULTS) {
  return [
    '.cover-flow {',
    `  --cover-flow-card: ${v.cardWidth}rem;`,
    `  --cover-flow-step: calc(var(--cover-flow-card) * ${v.overlap});`,
    `  --cover-flow-turn: ${v.turn}deg;`,
    `  max-width: calc(var(--cover-flow-card) + var(--cover-flow-step) * ${v.viewportWidth});`,
    '}',
    '',
    '/* ProjectCard */',
    `padding: ${v.padding}rem;`,
    v.cardHeight > 0 ? `min-height: ${v.cardHeight}rem;` : '/* alto automático */',
    `/* Figure */ aspect-ratio: ${v.imageRatio} / 1;`,
  ].join('\n')
}

function buildCss(v: typeof DEFAULTS) {
  return `
[data-lab] .cover-flow {
  --cover-flow-card: ${v.cardWidth}rem;
  --cover-flow-step: calc(var(--cover-flow-card) * ${v.overlap});
  --cover-flow-turn: ${v.turn}deg;
  max-width: calc(var(--cover-flow-card) + var(--cover-flow-step) * ${v.viewportWidth});
}

[data-lab] .cover-flow-track {
  gap: ${v.gap}rem;
}

@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    [data-lab] .cover-flow-track {
      gap: 0;
    }
  }
}

[data-lab] .cover-flow-card > article {
  padding: ${v.padding}rem;
  ${v.cardHeight > 0 ? `min-height: ${v.cardHeight}rem;` : ''}
}

[data-lab] .cover-flow-card > article > :first-child {
  aspect-ratio: ${v.imageRatio} / 1;
}
`
}
