/**
 * Lo que se ve en /admin cuando no hay proyecto de Sanity configurado.
 *
 * Existe porque el fallo por defecto sería mucho peor: sin `projectId`, el panel de Sanity
 * lanza una excepción al montarse y en producción eso es una pantalla en blanco o un error
 * genérico, sin ninguna pista de qué falta. Aquí se dice exactamente qué variable falta,
 * dónde se consigue y en qué orden.
 *
 * **Y la web sigue funcionando**: el contenido del CV vive en `content/`, así que lo único
 * que no está disponible es la edición. Merece la pena decirlo, porque quien llegue aquí
 * puede pensar que el sitio entero está roto.
 */
const steps = [
  'Crea un proyecto en sanity.io/manage (plan gratuito).',
  'Copia .env.example a .env.local y pega el Project ID en NEXT_PUBLIC_SANITY_PROJECT_ID.',
  'En Vercel, añade la misma variable a los dos proyectos (producción y test).',
  'Importa el contenido inicial: npm run migrate:build && npm run migrate:import',
]

export function ConnectionNotice() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: '#08090b',
        color: '#edeef0',
        // Estilos en línea y no Tailwind: este grupo de rutas no importa `globals.css`
        // (ver `(studio)/layout.tsx`), así que aquí no existe ninguna utilidad.
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        lineHeight: 1.7,
      }}
    >
      <div style={{ maxWidth: '44rem' }}>
        <p
          style={{
            color: '#e0a458',
            fontSize: '0.6875rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          Panel no configurado
        </p>

        <h1 style={{ fontSize: '1.75rem', margin: '1rem 0 0', fontWeight: 400 }}>
          Falta el proyecto de Sanity
        </h1>

        <p style={{ color: '#a2a8b0', marginTop: '1.25rem' }}>
          El panel necesita la variable <code style={code}>NEXT_PUBLIC_SANITY_PROJECT_ID</code>. La
          web pública <strong style={{ color: '#edeef0' }}>funciona igual sin ella</strong>: el
          contenido del CV se sirve de <code style={code}>content/</code>. Lo único que no está
          disponible es editarlo desde aquí.
        </p>

        <ol style={{ color: '#a2a8b0', marginTop: '1.75rem', paddingLeft: '1.25rem' }}>
          {steps.map((step) => (
            <li key={step} style={{ marginBottom: '0.75rem' }}>
              {step}
            </li>
          ))}
        </ol>

        <p style={{ color: '#6d747c', fontSize: '0.8125rem', marginTop: '2rem' }}>
          El detalle completo está en el README, en «Puesta en marcha del panel».
        </p>
      </div>
    </main>
  )
}

const code = {
  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
  fontSize: '0.875em',
  background: '#0f1116',
  border: '1px solid #2a3037',
  borderRadius: '4px',
  padding: '0.1em 0.4em',
} as const
