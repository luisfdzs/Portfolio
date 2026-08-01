# Portfolio · Luis Fernández Sangil

CV, portfolio y carta de presentación de **Luis Fernández Sangil** — ingeniero industrial y
desarrollador web en Vigo. Una sola página con el CV completo, más una ficha propia por proyecto.

Next.js 16 (App Router) + TypeScript estricto + Tailwind CSS 4, con **Sanity** como panel de
administración opcional y despliegue en **Vercel** con dos entornos.

🌐 **Producción:** [luisfernandezsangil.vercel.app](https://luisfernandezsangil.vercel.app) ·
**Test:** [luisfernandezsangiltest.vercel.app](https://luisfernandezsangiltest.vercel.app) ·
**Panel:** [luisfernandezsangil.vercel.app/admin](https://luisfernandezsangil.vercel.app/admin)

Bilingüe: **castellano** (por defecto) e **inglés**, en `/es` y `/en`.

---

## Puesta en marcha

```bash
npm install
npm run dev          # http://localhost:3000
```

**No hace falta ninguna variable de entorno para arrancar.** Es la decisión de arquitectura
principal del proyecto y está explicada abajo, en «El contenido: dos fuentes y una regla».

| Script                   | Qué hace                                                          |
| ------------------------ | ----------------------------------------------------------------- |
| `npm run dev`            | Servidor de desarrollo (Turbopack)                                |
| `npm run build`          | Build de producción                                               |
| `npm start`              | Sirve el build de producción                                      |
| `npm run check`          | **Puerta de calidad**: typecheck + ESLint + formato               |
| `npm run check:mobile`   | 21 comprobaciones en un Chrome real a 390×844 (requiere servidor) |
| `npm run format`         | Aplica Prettier                                                   |
| `npm run migrate:build`  | Convierte `content/` en el NDJSON de importación a Sanity         |
| `npm run migrate:import` | Importa ese NDJSON al dataset (sube también las imágenes)         |

`npm run check:mobile` necesita el sitio levantado y usa el Chrome ya instalado —no descarga
navegadores—. Contra el entorno de test:

```bash
BASE=https://luisfernandezsangiltest.vercel.app npm run check:mobile
LOCALE=en npm run check:mobile
```

## Dónde se toca cada cosa

| Quiero cambiar…                          | Fichero                      |
| ---------------------------------------- | ---------------------------- |
| Experiencia, formación, stack, perfil    | `content/profile.ts`         |
| Proyectos (o el panel, en `/admin`)      | `content/projects.ts`        |
| Nombre, dominio canónico, repositorio    | `content/site.ts`            |
| Textos de interfaz y traducciones        | `lib/i18n/dictionaries.ts`   |
| Colores, tipografías, ritmo, animaciones | `app/globals.css` (`@theme`) |
| Menú y anclas de sección                 | `lib/i18n/routes.ts`         |
| Idiomas                                  | `lib/i18n/config.ts`         |
| Esquemas del panel                       | `sanity/schemas/`            |

---

## El contenido: dos fuentes y una regla

Todo el contenido pasa por `lib/content.ts`. Ninguna página consulta Sanity ni importa
`content/` directamente. La regla es:

> **El panel manda cuando tiene contenido; el repositorio es el suelo.**
>
> 1. Sin proyecto de Sanity configurado → se sirve `content/`.
> 2. Con Sanity configurado pero sin documentos de un tipo → se sirve `content/` **para ese tipo**.
> 3. Con documentos → mandan los del panel.

Es distinto de los proyectos de cliente (Swiftmet, Manfisa, Sangil Studio), donde Sanity es la
única fuente y su ausencia es un error. Aquí el motivo es otro: **un portfolio no debe depender
de un servicio externo para existir.** Este repositorio se clona y se despliega sin credenciales
de nada y el CV sale completo. Enchufar el panel después es una mejora —editar el CV desde el
móvil sin desplegar— y no un requisito.

El punto 2 evita el fallo más probable: crear el proyecto de Sanity, no haber importado todavía
el contenido, y que la web se quede en blanco justo el día que alguien la mira. Un dataset vacío
no es una instrucción de borrar el CV.

Cada documento se valida con **zod** por separado. Uno que no cumple se descarta con un aviso en
el log del build; nunca se tumba la web entera. Un puesto sin descripción no puede hacer
desaparecer los otros tres.

### Nada de cifras escritas a mano

Los cuatro números del titular —años de experiencia, proyectos en producción, empresas y
clientes, tecnologías— **se calculan del contenido** en `app/(site)/[locale]/page.tsx`. Los años
se suman de los rangos reales de cada puesto (tiempo trabajado, no calendario) y se redondean
hacia abajo.

Es una lección del portfolio anterior, que decía «+4 años de experiencia» cuando ya eran cinco:
una cifra escrita a mano en un CV se queda vieja y nadie se acuerda de ella.

El «hoy» contra el que se calculan se **congela en el build** (`NEXT_PUBLIC_BUILD_MONTH`, fijada
en `next.config.ts`). Es deliberado: con `cacheComponents` activo, leer el reloj durante el
render volvería dinámica una ruta que debe ser estática. Cualquier despliegue recalcula las
cifras, así que el desfase real es de meses.

## Puesta en marcha del panel (opcional)

1. Crea un proyecto en [sanity.io/manage](https://www.sanity.io/manage) (plan gratuito).
2. `cp .env.example .env.local` y pega el **Project ID** en `NEXT_PUBLIC_SANITY_PROJECT_ID`.
3. Añade la misma variable a los **dos** proyectos de Vercel (producción y test).
4. Importa el contenido actual:
   ```bash
   npm run migrate:build      # content/ → scripts/migration/import.ndjson
   npx sanity login
   npm run migrate:import     # sube también el retrato y las seis capturas
   ```
5. Crea el webhook de revalidación en sanity.io/manage › API › Webhooks:
   - URL `https://luisfernandezsangil.vercel.app/api/revalidate` (y la de test)
   - Dataset `production` · **Trigger on: create, update, delete**
   - Secret: el mismo valor que `SANITY_REVALIDATE_SECRET` en Vercel

> ⚠️ Si el webhook se crea **por API** en vez de por el panel, hay que hacer después un `PATCH`
> con `rule: {on: ["create","update","delete"]}`. El `POST` no acepta `rule`, y sin ese `PATCH`
> el webhook queda `isDisabled: false` —parece correcto— pero **no se dispara jamás** y el
> registro de entregas sale vacío. Pasó en Swiftmet y sólo se detectó comparando con uno que sí
> funcionaba.

Mientras no haya panel, `/admin` no falla: explica qué variable falta y recuerda que la web
pública funciona igual (`app/(studio)/admin/ConnectionNotice.tsx`).

---

## Diseño

Los tokens viven en el `@theme` de `app/globals.css` y **sólo** ahí: las utilidades de Tailwind
se generan a partir de ellos, así que no hay forma de usar un color o un espaciado fuera del
sistema.

- **Oscuro, sin conmutador de tema.** Comprometerse con un solo modo permite ajustar el
  contraste de cada tono en vez de buscar el valor que aguante los dos.
- **Una serif de titular (Instrument Serif) sobre una sans neutra (Inter).** Es lo que separa
  esto de los cientos de portfolios que usan la misma sans para todo.
- **Las cifras y los datos técnicos, en monoespaciada (JetBrains Mono)** con `tabular-nums`: es
  lo que hace que la línea temporal de la experiencia se lea como una tabla y no como prosa con
  números dentro.
- **Un único acento, cobre.** Marca lo accionable y el dato destacado. Nunca decora.
- **Las apariciones al hacer scroll son CSS puro** (`animation-timeline: view()`), sin
  JavaScript, y respetan `prefers-reduced-motion`.
- **Hay hoja de impresión.** Un recruiter que quiere guardar el CV pulsa Ctrl+P: sale en papel
  blanco, sin la navegación y con las URLs de los enlaces escritas al lado.

En escritorio la navegación es la cabecera fija; en móvil (`< lg`), una **barra inferior de cinco
iconos** al alcance del pulgar. Nunca las dos: tenerlas sería robar 4 rem arriba y abajo en el
dispositivo que menos tiene.

### Los proyectos destacados van en un «cover flow»

Los cuatro proyectos de la portada no están en una retícula, sino en un **carrusel 3D**: la
tarjeta centrada se mira de frente y las de los lados se giran sobre su eje vertical, se alejan y
se apagan. Es la única sección cuyo contenido es visual, y cuatro capturas de web puestas una al
lado de otra no se miran: se hojean.

Lo mueve **el scroll y nada más**. Las animaciones son `view-timeline` + `animation-timeline`, la
misma técnica que las apariciones al hacer scroll, así que no hay JavaScript calculando
posiciones. La geometría —lo único delicado— está razonada en el bloque «COVER FLOW» de
`app/globals.css`; en resumen: `--cover-flow-card` es lo que mide la tarjeta,
`--cover-flow-step` lo que avanza el scroll de una a la siguiente (más corto, y de ahí el
solape), y **el ancho del carrusel es lo que decide cuánto dura el giro**, porque con
`animation-range: contain` el giro ocupa `ancho − tarjeta`.

Lo único con JavaScript son los **dos botones** de `components/ui/CoverFlow.tsx`: con el dedo se
arrastra y con el tabulador el navegador trae al foco cada tarjeta, pero una rueda de ratón no
hace scroll horizontal y la barra está oculta a propósito.

Si el navegador no soporta animaciones dirigidas por scroll, o si el sistema pide menos
movimiento, queda **un carrusel horizontal normal** con las tarjetas separadas y ninguna girada.
Y en papel se deshace en la retícula de dos columnas que había antes: sin eso, un `overflow-x`
imprimiría el primer proyecto y recortaría los otros tres.

### Las capturas de los proyectos

Las seis capturas de `public/projects/` se toman de las webs en vivo y se procesan con
`scripts/build-project-shots.mjs`, que las recorta a **2:1 anclado arriba e izquierda**. Las dos
anclas están razonadas en el propio script; el resumen es que una web se maqueta de izquierda a
derecha, y con el recorte centrado salía «NGIL STUDIO» en vez de «SANGIL STUDIO».

Si un proyecto no tiene captura, la tarjeta enseña **la trama** de `placeholder-grid`, no un gris
que la disimule: un hueco declarado es información y un hueco camuflado es un descuido que
parece intencionado.

---

## Modelo de ramas

Cada rama larga corresponde a **un entorno**, y sólo se sube de nivel lo que ya está validado en
el anterior:

| Rama      | Para qué                                                            | Vercel                                                                     |
| --------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `develop` | Día a día: desarrollar, depurar y subir al repositorio sin publicar | **Nada.** No despliega                                                     |
| `test`    | Entorno de test                                                     | `luisfernandezsangiltest` → luisfernandezsangiltest.vercel.app (`noindex`) |
| `main`    | Producción                                                          | `luisfernandezsangil` → luisfernandezsangil.vercel.app                     |

Las ramas temporales nacen y **mueren** en `develop`. El sentido es único —`develop` → `test` →
`main`— y siempre con `git merge --no-ff`: **nunca squash**, porque crea SHA nuevos, las ramas
dejan de compartir historia y cada promoción reabre conflictos ya resueltos.

Que `develop` no toque Vercel no es una convención: está en `vercel.json`
(`git.deploymentEnabled: {"develop": false}`), versionado y aplicado igual a los dos proyectos.

### Sólo `main` se indexa

`lib/site-env.ts` decide la indexación **por la rama desplegada**, no por `VERCEL_ENV`. El motivo
es que el proyecto de test despliega `test` como su propio entorno de producción: allí
`VERCEL_ENV === 'production'` también, así que usar esa variable dejaría dos copias del mismo CV
compitiendo en Google por «Luis Fernández Sangil» — y el resultado que encontrara un recruiter
podría ser el de test, con contenido a medio revisar.

Falla del lado seguro: si mañana falta la variable, no se indexa.

---

## Pendiente

Cosas que están así a propósito y con quién se resuelven:

- **El retrato es de 200×200.** Es el original que había en el portfolio anterior. Da justo para
  el círculo de móvil (160 px) pero se ve blando en los 320 px de escritorio con pantalla de alta
  densidad. **Hace falta el original a 800×800**; las medidas declaradas en `content/profile.ts`
  son las reales, no las deseadas, porque `next/image` reserva el hueco con ellas y mentir ahí
  provoca salto de maquetación.
- **Sangil Studio apunta al entorno de test.** Es donde está la web terminada:
  `sangilstudio.com` sirve todavía una página de «en proceso». Cuando el estudio dé el visto
  bueno, cambiar `liveUrl` y borrar el campo `note` en `content/projects.ts`.
- **No hay badge de «disponible para nuevos proyectos».** La portada dice el puesto actual
  —«Analista programador senior en Mobile Smart City»—, que es un dato verificable en LinkedIn y
  no una señal de búsqueda activa. Añadirlo es decisión de Luis, no del código.
- **No hay sección de idiomas.** LinkedIn no la tiene rellena y no se inventan niveles de idioma
  en un CV. El propio sitio bilingüe ya dice algo al respecto.
- **El dominio es `vercel.app`.** Si algún día hay dominio propio, se cambia `site.url` en
  `content/site.ts` (de ahí salen el sitemap y los `hreflang`) y se apunta el DNS en Vercel.

## Fuente de los datos del CV

El contenido de `content/profile.ts` sale del perfil de
[linkedin.com/in/luisfernandezsangil](https://www.linkedin.com/in/luisfernandezsangil), que es el
documento que se mantiene al día. Fechas, puestos, empresas y cliente final de cada consultoría
son los que constan allí. Lo único redactado son los resúmenes, que reordenan esa información
para que se lea en pantalla: **no añaden hechos**. Lo que no consta, se deja fuera.
