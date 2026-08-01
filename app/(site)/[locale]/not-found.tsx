import { defaultLocale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { href } from '@/lib/i18n/routes'
import { Action } from '@/components/ui/Action'

/**
 * 404 dentro del grupo del sitio, así que hereda la cabecera, el pie y las tipografías: un
 * 404 desnudo parece que la web se ha caído, y no que un enlace estaba mal.
 *
 * **Va en castellano siempre**, y aquí no hay más remedio: `not-found.tsx` no recibe
 * `params`, porque Next la renderiza sin haber resuelto la ruta —eso es justamente lo que
 * ha fallado—. Se usa el idioma por defecto, que es lo que hace el `proxy` con cualquier
 * visita que no declare ninguno.
 */
export default function NotFound() {
  const t = getDictionary(defaultLocale)

  return (
    <div className="page-gutter mx-auto flex min-h-[70svh] max-w-3xl flex-col items-center justify-center py-section text-center">
      <p className="figure-num text-figure text-signal">404</p>
      <h1 className="mt-4 text-title text-paper">{t.notFound.title}</h1>
      <p className="mt-5 mx-auto max-w-measure text-paper-soft">{t.notFound.lead}</p>
      <div className="mt-10">
        <Action href={href(defaultLocale, 'home')} variant="primary">
          {t.notFound.cta}
        </Action>
      </div>
    </div>
  )
}
