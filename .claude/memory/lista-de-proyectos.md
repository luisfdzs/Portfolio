---
name: lista-de-proyectos
description: Qué proyectos salen en la web se decide en content/projects.config.ts poniendo el título, la portada de cada tarjeta es la primera pantalla de su web en vivo, y desde el 2026-08-03 no hay índice: la lista vive sólo en la portada y cada proyecto tiene ficha
metadata:
  type: project
---

Encargo del **2026-08-03** (rama `develop`, sin rama de tarea porque Luis pidió trabajar ahí
directamente): publicar **todos los repositorios de github.com/luisfdzs menos Manfisa**, poder
añadir y quitar proyectos «poniendo los títulos» en un fichero de configuración, y que la portada
de cada tarjeta sea **la sección principal de la página principal** del proyecto.

## La lista y las fichas están separadas

- **`content/projects.config.ts`** — qué se publica y en qué orden. Es el único fichero que hay que
  tocar para añadir, quitar o reordenar. `featured` sigue ahí, pero desde el 2026-08-03 **no decide
  quién sale en la portada** —salen todos— sino por cuáles abre el carrusel: ver [[cover-flow]].
- **`content/projects.ts`** — las fichas (`sheets`), unidas a la lista por el `name` exacto. Al
  final resuelve la una contra las otras y exporta `projects` en el orden de la lista.

Dos decisiones de esa frontera:

1. **`featured` salió de la ficha y se fue a la lista.** Es información de dónde se coloca un
   proyecto, no de qué es. (Y desde el 2026-08-03 sólo eso: el orden de salida del carrusel.)
2. **Un título sin ficha no se publica**, y avisa con su nombre en el log del build. Es lo
   contrario de lo que pedía la frase «con el título basta», y está así a propósito: media tarjeta
   —sin frase, sin año y con el hueco tramado de `Figure`— la lee un recruiter como un descuido, y
   la web existe para lo contrario. El aviso importa tanto como el descarte: sin él, quien añade un
   título y no ve nada supone que el fichero de configuración no funciona.

Al revés no cuesta nada: **una ficha que no está en la lista simplemente no sale**, así que retirar
un proyecto no obliga a borrar lo escrito. Manfisa sí se borró del catálogo, y su captura de
`public/projects/` también: `public/` viaja entero al despliegue, así que un fichero huérfano ahí
seguiría sirviéndose en la web pública. Es la diferencia con las fotos de `public/hero/`, que se
conservaron huérfanas un día (decisión 9 del CLAUDE.md): aquélla era materia prima documentada,
ésta es la captura de la web de un cliente retirado.

## EL ÍNDICE DE `/projects` SE RETIRÓ (2026-08-03, tarde)

Encargo de Luis, en la rama `feature/proyectos-sin-indice` y worktree propio: «con la sección de
proyectos de la portada me llega; lo que sí tiene sentido es `/projects/swiftmet` y el resto».
Y es coherente con lo que había pasado esa mañana: **desde que el carrusel enseña los ocho, el
índice era una segunda URL con las mismas ocho tarjetas** compitiendo con la portada por «Luis
Fernández Sangil», y una entrada del menú que en vez de moverse por el CV se iba de página.

Lo que se borró es **una** página, `app/(site)/[locale]/projects/page.tsx`. Las fichas
(`projects/[slug]`) no se tocan: son el argumento entero de que exista esa carpeta — una URL que se
manda suelta en una candidatura.

**How to apply — lo que arrastra quitar esa página, que es más de lo que parece:**

1. **`lib/i18n/routes.ts`**: `projects` sale de `routes` y entra en `sections`; `routes` se queda
   con `home`. Las fichas se enlazan con la función nueva **`projectHref(locale, slug)`** —
   `href(locale, 'projects', slug)` ahora devolvería `/es#projects`, porque `href` mira primero si la
   clave es sección. El segmento vive en una constante privada del módulo: nadie debe volver a
   enlazar `/es/projects` a secas.
2. **`next.config.ts`**: redirección permanente de `/:locale(es|en)/projects` a `/:locale#projects`.
   La URL estuvo en el menú, enlazada desde la propia sección y **en el `sitemap.xml`**, así que
   Google la conoce. **Sin comodín**: un `/:path*` se llevaría por delante las ocho fichas. Y
   `/proyectos` (redirección vieja del portfolio de Astro) deja de apuntar al índice.
3. **`app/sitemap.ts`**: fuera la entrada del índice.
4. **Diccionarios**: se caen `projects.viewAll` y `projects.index` (título y entradilla, que sólo
   usaba esa página), y `backToProjects` pasa a «Volver a los proyectos», que es lo que hace ahora
   el enlace de la ficha: lleva a `/es#projects`.
5. **`ProjectCard` pierde `framed` y `priority`.** Servían para distinguir el panel del carrusel de
   la retícula del índice, y sin segundo consumidor una bandera que nadie pone es una trampa. La
   tarjeta es siempre el panel con borde.
6. **`check-mobile.mjs`**: el recorrido «índice → clic en tarjeta → ficha» ya no puede empezar en el
   índice. Empieza en la portada y **selecciona `li:not([data-clone])`**, porque las otras dos copias
   del carrusel son clones `inert` y un clic ahí no llega a ningún sitio. De paso comprueba que
   `/es/projects` redirige a la portada.

Comprobado con el build de producción: `/es/projects` → 308 → `/es` (delta 0 sobre la sección),
las ocho fichas siguen prerrenderizadas, el `sitemap.xml` ya no la anuncia, y el enlace de vuelta de
una ficha aterriza en la sección con la URL limpia. `npm run check` limpio y `check:mobile` 23/23 en
los dos idiomas.

## `import './projects.config.ts'` lleva la extensión escrita

Y hace falta `allowImportingTsExtensions` en `tsconfig.json` por ese único import. El motivo es que
`scripts/build-project-shots.mjs` y `scripts/build-sanity-import.mjs` importan `content/projects.ts`
con el despojado de tipos de Node, que **no resuelve especificadores sin extensión** (comprobado:
`ERR_MODULE_NOT_FOUND`). Hasta ahora colaba porque todos los `import` de `content/` eran
`import type` y desaparecían; éste es el primero que es un valor.

## La captura es el viewport, no un recorte

`npm run shots` (`scripts/build-project-shots.mjs`, reescrito) abre cada `liveUrl` en un Chrome
real con la ventana **a 1400×700** —el 2:1 exacto del hueco de la tarjeta— y guarda el viewport a
`deviceScaleFactor: 2`, que sharp reduce a 1400×700.

**Medir la ventana con la proporción de destino es lo que hace que no haya que recortar nada.** La
versión anterior tomaba capturas a mano de 1568×698 y las recortaba a 2:1 anclando arriba e
izquierda, con 86 px perdidos por lado; y encima tenía un mapa `sufijo del fichero → slug` que
había que mantener a mano. Ahora la lista y las URLs salen de `content/`, así que un proyecto nuevo
ya está en el script.

Dos cosas que sí hay que hacer a mano:

- **Escribir el `alt` mirando la captura.** El script no lo puede inventar y una tarjeta con un
  `alt` genérico es peor que un `alt` que describa lo que hay.
- **Esperar a que la animación de entrada acabe.** `SETTLE_MS = 4500` no es un margen caprichoso:
  casi todas estas webs entran con el texto apareciendo o con un vídeo arrancando, y disparar antes
  deja el titular a media opacidad.

## LA LISTA NO MANDA EN LO DESPLEGADO

El panel de Sanity gana cuando tiene documentos ([[contenido-dos-fuentes]]), así que **cambiar esta
lista no cambia la web pública** hasta reflejarlo en el panel, y no lo avisa ni el `check` ni el
build. Es el mismo síntoma engañoso que con el retrato ([[hero-sanity]]).

**Pendiente por esto mismo (2026-08-03):** el `liveUrl` y el `note` de Sangil Studio están cambiados
en `content/` y **no** en el panel, así que la web pública sigue enlazando a test. Se arregla a mano
en `/admin` → Proyectos → Sangil Studio → «Web en vivo» = `https://sangilstudio.com`, «Nota» vacía →
_Publish_. **Nunca con `migrate:import`**, que corre con `--replace` y machacaría el retrato vacío
del perfil y el orden arrastrable.

El 2026-08-03 se sincronizó por CLI, con Luis pidiéndolo explícitamente: `npm run migrate:build &&
npm run migrate:import` y después
`npx sanity documents delete project-manfisa --dataset production`. Dos cosas aprendidas ahí:

1. **`--replace` no borra nada**: reemplaza los documentos cuyo `_id` viene en el NDJSON y deja
   intacto lo que sobra. El documento retirado hay que eliminarlo aparte.
2. **De rebote, el retrato del perfil quedó vacío**, que era justo lo que pedía el otro pendiente:
   el import no sube la foto, así que producción pasó a servir el recorte de `public/luis.webp`.

## QUITAR UN PROYECTO NECESITA ADEMÁS UN BUILD

Lo más útil de esa sesión, y no era obvio. Tras borrar el documento y con el webhook funcionando:

- La portada, las fichas vivas y el índice —que entonces existía— se pusieron al día solas, **pero
  sirviendo una vez
  la copia vieja**: la primera petición después de publicar devuelve lo anterior y regenera en
  segundo plano. Comprobar una sola vez y concluir «no revalida» es el error fácil aquí.
- `/es/projects/manfisa` **siguió respondiendo 200** con su HTML prerrenderizado del build, con el
  documento ya borrado.
- `sitemap.xml` siguió anunciando los slugs viejos: es estático del build.

Los dos restos se van con un despliegue —el build nuevo no genera ese slug, la ruta pasa a
resolverse en el momento y devuelve 404—. Regla: **borrar el documento y desplegar después.**

## Sangil Studio pasa a apuntar a su dominio (2026-08-03)

Encargo de Luis en el mismo trabajo que llevó todos los proyectos a la portada: el `liveUrl` de la
ficha deja de ser `sangilstudiotest.vercel.app` y pasa a `https://sangilstudio.com`, con el `note`
que explicaba el desvío borrado.

**Lo que se comprobó antes de tocarlo, y se hizo igual porque lo pidió:** ese día el dominio seguía
sirviendo la página de «Web en construcción» (`curl` → `<title>Sangil Studio — En proceso</title>`),
así que el botón «Web en vivo» de esa tarjeta lleva a un cartel hasta que el estudio lance. Dos
consecuencias que conviene no perder:

1. **No regenerar la captura** con `npm run shots -- sangil-studio` hasta que el dominio sirva la web
   de verdad: hoy capturaría el cartel. La que hay se tomó contra test y es la web terminada.
2. **Volver a test es una línea** en `content/projects.ts` (y el campo del panel).

Y aplica lo de la sección de abajo: la web pública sigue enlazando a test hasta editarlo **en el
panel**, porque el `liveUrl` también vive ahí.

## Manfisa también se retiró de internet (2026-08-03)

Segundo encargo del mismo día: que las dos webs de Manfisa dejaran de verse **sin borrar nada**. En
Vercel no se pudo hacer como se pidió —«pausar proyecto» no existe en el plan **Hobby**, y la
protección «All Deployments» de Vercel Authentication está detrás de Pro—, así que se hizo quitando
el **dominio de producción** de cada proyecto: `manfisa.vercel.app` y `manfisatest.vercel.app`, que
eran el único dominio de cada uno (sin dominio propio). Los dos proyectos, sus despliegues y el
repositorio siguen intactos; en el panel aparecen como «No Production Deployment» y se restauran
reañadiendo el dominio en Settings → Domains.

Lo que hizo que la solución fuera suficiente, y que se comprobó con `curl` antes de tocar nada:
**la única URL pública de cada proyecto era su dominio de producción.** El resto —los alias de rama
y los de despliegue— ya devolvían el login de Vercel, porque la Standard Protection que sí está
disponible en Hobby protege todo **menos** los dominios de producción. Comprobado después: los dos
dominios dan 404 y los alias siguen dando login.

Consecuencia para esta web: si alguien devuelve la ficha de Manfisa a la lista, **su `liveUrl` está
muerta**. Habría que reañadir el dominio en Vercel antes.

## Los tres proyectos que se añadieron

`Mila Barber` (barbería en Pamplona: Sanity para el contenido y MongoDB para cuentas y citas),
`Cedecé` (web de un rapero de Vigo, trilingüe es/en/gl) y `Portfolio` (esta misma web). Los datos
de sus fichas salen del `README.md`/`CLAUDE.md` de cada repositorio, no de la memoria: es la misma
regla de no inventar que aplica al CV.
