---
name: arquitectura-web
description: Stack, estructura de rutas y las decisiones técnicas que costaron un intento — cacheComponents, los dos grupos de rutas y dónde vive cada fichero de metadatos
metadata:
  type: project
---

Next.js 16 (App Router, Turbopack) + TypeScript estricto (`noUncheckedIndexedAccess`) + Tailwind
CSS 4 + zod. Mismo stack que Swiftmet, del que se copian los patrones; la única divergencia de
fondo es la doble fuente de contenido (ver [[contenido-dos-fuentes]]).

## Dos grupos de rutas y NINGÚN `app/layout.tsx`

- `app/(site)/[locale]/` — el sitio público. Su `layout.tsx` **es** la raíz: renderiza `<html>`,
  carga las tipografías y `globals.css`.
- `app/(studio)/` — el panel en `/admin`. Su propia raíz, con su propio `<html>` y sin
  `globals.css`.

**Why:** el panel de Sanity trae su interfaz completa. Metido dentro del `<body>` del portfolio
habría dos navegaciones peleando y el CSS de uno pisando al del otro.

**La consecuencia no obvia:** un fichero de metadatos que no cuelga de ningún layout queda
registrado a medias. `app/icon.tsx` en la raíz escribía el `<link rel="icon" href="/icon">`
correctamente pero **la ruta devolvía 404**, así que todo el sitio se servía sin favicon. Lo
detectó `npm run check:mobile` vigilando los errores de consola. Ahora `icon.tsx` y
`opengraph-image.tsx` viven en `app/(site)/[locale]/`, lo que además:

- les da una versión por idioma (el titular de la imagen social se lee en el idioma del visitante);
- quita el aviso de build «metadataBase is not set», que salía porque la imagen de la raíz se
  aplicaba también a `/_not-found` y al panel, rutas cuyos metadatos no declaran `metadataBase`.

`app/robots.ts` y `app/sitemap.ts` **sí** funcionan en la raíz: no son imágenes y no dependen de
ningún layout.

## `cacheComponents` y sus dos reglas

Está activo en `next.config.ts` porque es lo que permite `use cache` + `cacheTag`, y por tanto que
el webhook de Sanity invalide el contenido sin desplegar.

1. **`export const dynamic` está prohibido.** El build falla con «Route segment config "dynamic" is
   not compatible with `nextConfig.cacheComponents`». Pasó en la página del panel, que llevaba
   `force-static`; no hacía falta, porque sin acceso a datos dinámicos se prerrenderiza sola.
2. **Nada de leer el reloj en el render.** Ver [[cifras-calculadas]]: el mes del build se congela
   en `next.config.ts` y viaja como variable de entorno.

Las dos páginas del sitio —portada y ficha de proyecto; el índice se retiró el 2026-08-03, ver
[[lista-de-proyectos]]— llevan `'use cache'` + `cacheLife('max')` en la primera línea del cuerpo: sin
ellos Next reservaba capacidad de streaming para un contenido que no cambia entre visitas, y con
`cacheLife` por defecto revalidaban cada 15 minutos en vez de sólo cuando se publica.

## Patrones copiados de Swiftmet que conviene no reinventar

- **`href()` en `lib/i18n/routes.ts`** devuelve rutas **absolutas** dentro del sitio. La barra
  inicial se añade aparte porque `filter(Boolean)` se come una cadena vacía inicial y devuelve
  `es` (relativa): desde la portada cuela, y desde una ficha el navegador la encadena →
  `/es/projects/es` → 404. `check:mobile` lo comprueba **desde una ficha**. Desde el 2026-08-03
  `href` sólo construye la portada y las seis anclas; la URL de una ficha la hace **`projectHref`**,
  aparte, porque `projects` pasó a ser sección ([[navegacion-y-orden]]).
- **`proxy.ts`** (así se llama en Next 16, no `middleware.ts`) sólo negocia el idioma, y compara la
  parte primaria del tag: `en-GB` → `en`.
- **El cargador de imágenes de Sanity** (`sanity/imageLoader.ts`) sustituye al optimizador de
  Vercel para todas las imágenes: la CDN de Sanity transforma lo que ya tiene y no se consume cuota.
  Las locales se devuelven tal cual.
- **`fetchContent`** usa `'use cache'` + `cacheTag`, no `{ next: { tags } }` en `client.fetch`:
  `@sanity/client` **ignora** esa opción, y el resultado es un fallo silencioso donde el webhook
  responde 200 y la web no se actualiza nunca.
- **Los `transform` de zod normalizan en la frontera** (`stack ?? []`, `highlights ?? []`,
  `Boolean(featured)`), para que ninguna vista tenga que comprobarlo. `Boolean` y no `?? false`:
  el panel manda `null` cuando un interruptor no se ha tocado nunca, y `??` no lo absorbe.

## Estructura de contenido

`content/types.ts` es el contrato entre los datos de respaldo, los esquemas de Sanity y las vistas.
Vive en fichero propio para que `content/*.ts` se tipe sin importar el módulo que los importa a
ellos.

Los cinco tipos de documento: el singleton `profile` (con `_id` fijo `profile`, porque
`sanity/structure.ts` lo abre por ese identificador) y `experience`, `education`, `skillGroup` y
`project`, los cuatro con `orderRank` para ordenarse arrastrando.

Sólo `project.slug` es una URL. Los `slug` de los demás son claves internas.
