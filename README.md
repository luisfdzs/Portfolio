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

| Quiero cambiar…                          | Fichero                             |
| ---------------------------------------- | ----------------------------------- |
| Experiencia, formación, stack, perfil    | `content/profile.ts`                |
| Proyectos (o el panel, en `/admin`)      | `content/projects.ts`               |
| Nombre, dominio canónico, repositorio    | `content/site.ts`                   |
| Textos de interfaz y traducciones        | `lib/i18n/dictionaries.ts`          |
| Colores, tipografías, ritmo, animaciones | `app/globals.css` (`@theme`)        |
| Menú y anclas de sección                 | `lib/i18n/routes.ts`                |
| Que el ancla no se vea en la URL         | `components/layout/HashCleaner.tsx` |
| Idiomas                                  | `lib/i18n/config.ts`                |
| Esquemas del panel                       | `sanity/schemas/`                   |

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
  JavaScript, y respetan `prefers-reduced-motion`. El fondo de la portada sí lleva JavaScript,
  porque reacciona al puntero: ver «El campo interactivo de la portada» más abajo.
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

### El campo interactivo de la portada

**La primera pantalla completa es el campo.** Al abrir la web se ve una retícula de nodos —de mil
a tres mil, según el tamaño de la ventana— dibujada en un `<canvas>`, con el bloque de texto
apoyado abajo, encima de ella. **Reacciona a quien la mira:** el puntero abre un pozo de luz, los
nodos se apartan y se encienden en cobre y tejen entre ellos una constelación que sólo existe
donde hay luz; un clic lanza una onda que recorre la pantalla entera; y cada dos o cuatro segundos
un pulso viaja por una fila o una columna dejando estela, como un dato por un bus.

Vive en `components/sections/HeroField.tsx` —que es todo el motor— y su parte estática (la
atmósfera de cobre desenfocada, la retícula de planos y el velo) en el bloque «Campo interactivo de
la portada» de `app/globals.css`. El razonamiento largo está en los comentarios de los dos.

**Sustituye al escenario cinético**, el mosaico de dieciséis fotografías CC0 que ocupaba esta
pantalla hasta el 2026-08-02. El cambio no es de estilo: aquello era material grabado en bucle,
indiferente a quien estuviera delante, y esto es un sistema que responde. En un portfolio de
desarrollo, un fondo generado con código dice en tres segundos lo que el CV tarda dos pantallas en
argumentar.

- **Un solo lienzo y cero dependencias.** Ni Three, ni una librería de animación: contexto 2D,
  `Float32Array` y un bucle. Es el único componente de cliente de la portada; el resto sigue siendo
  HTML estático.
- **Es decoración declarada.** `aria-hidden` en la raíz y `pointer-events: none` en toda la capa: el
  campo reacciona al puntero **sin recibirlo** —los eventos se escuchan en `window` y se descartan
  los que caen fuera—, así que un clic destinado a un botón llega siempre al botón. No sale en la
  impresión, y con `prefers-reduced-motion: reduce` no se registra ni un escuchador: se dibuja un
  único fotograma.
- **Trabaja sólo cuando se le ve.** El bucle se para al salir el hero de la pantalla y al cambiar
  de pestaña.
- **La legibilidad se resuelve en el origen.** Los nodos de la mitad inferior —donde vive el
  texto— se dibujan cada vez más apagados hasta un suelo del 10 %, en vez de dibujarse enteros y
  taparse después con un velo. El velo del texto (`.hero-copy::before`) sigue existiendo, con los
  topes rebajados, y sigue **anclado AL TEXTO** y no a un porcentaje del alto del hero: esto es la
  corrección de un fallo real, y lo que se cae primero es el rótulo del puesto y la línea de la
  ubicación, no el nombre.
- **El rótulo del puesto lleva pastilla propia** (`.hero-chip`): fondo casi opaco y desenfoque
  detrás. Es lo que permite que el velo empiece tarde y flojo, y por tanto que se siga viendo el
  campo en el centro de la pantalla.
- **El campo tiene que verse sin tocar nada.** Un fondo que sólo aparece bajo el puntero es
  invisible en un móvil, donde no hay puntero — pasó en la primera captura, y por eso el nodo en
  reposo tiene un tamaño y una opacidad mínimos que se ven solos. Lo que la interacción añade es
  el relieve, no la existencia.
- **Verificar a 390 px antes de cerrar.** `overflow-hidden` en la sección es lo único que impide
  que el campo ensanche el documento, y es el fallo nº 1 de `check:mobile`.

Las dieciséis fotografías CC0 del escenario anterior siguen en `public/hero/` con su
`CREDITS.md` y su `scripts/build-hero-tiles.mjs`, **pero ya no las usa nadie**. Se dejaron ahí a
propósito: borrarlas es una decisión aparte y son reconstruibles.

### En la barra de direcciones nunca se ve una almohadilla

Las secciones de la portada son anclas y `/es/projects` es una página. Es una diferencia real —el
fragmento es la única parte de una URL que no llega al servidor—, pero al visitante le llega como
una incoherencia: unas entradas del mismo menú dejan `/es/projects` y otras `/es#experience`.

`components/layout/HashCleaner.tsx` quita esa diferencia, y **sin tocar los `href`**: siguen
llevando el ancla, así que la navegación funciona sin JavaScript, se puede abrir en otra pestaña,
y los enlaces viejos de LinkedIn siguen llevando a su sección. Lo que cambia es que un clic normal
no llega a escribirla: se intercepta, se desplaza a mano —descontando la cabecera fija— y se
mueve el foco a la sección, que es lo que hace de más un ancla nativa.

**La regla que lo sostiene: el ancla nunca entra en el router.** Next lleva su propia URL
canónica, y en cuanto tiene un fragmento dentro, cualquier arreglo por debajo la desincroniza y el
clic siguiente compone sobre lo que él cree que hay: `/es#education#contact`. Se probó a limpiar
después con `history.replaceState` —se desincroniza— y con `router.replace` —no actualiza la
barra—; la única forma estable es no generar el fragmento.

Queda un caso en el que el ancla sí llega, la visita que entra con ella puesta desde un enlace
viejo. Ahí no hay clic que interceptar, así que se deja actuar al navegador y se borra después,
**esperando a que la sección exista de verdad**: quitar el fragmento antes de tiempo no descoloca
la URL, cancela el salto —la portada llega por streaming y el navegador tiene el salto pendiente
hasta que la sección aparece—.

A cambio se pierden dos cosas, y conviene saberlo antes de tocarlo: copiar la URL ya no comparte
la sección, y «atrás» sale de la página en vez de recorrer las secciones visitadas.

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
