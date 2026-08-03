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
| `npm run shots`          | Recaptura la portada de cada proyecto de su web en vivo           |
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
| Qué proyectos salen y en qué orden       | `content/projects.config.ts`        |
| El contenido de un proyecto              | `content/projects.ts`               |
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

### La excepción: el retrato tiene respaldo por campo

Los tres puntos funcionan **por documento**, y hay un caso en el que eso no alcanza. El campo
«Retrato» del «Perfil» es opcional en el panel, y un perfil sin foto elegida es un documento
perfectamente válido: no dispara ningún respaldo, así que el hero se quedaría con el hueco de
trama de `Figure` —un rectángulo rayado donde va la cara—. Por eso el retrato se resuelve **por
campo**:

> **Si el panel trae un retrato, manda el del panel. Si el campo está vacío, se sirve
> `public/luis.webp`.**

Lo pone `getProfile` en `lib/content.ts`, con la imagen exportada como `portrait` en
`content/profile.ts`. Dos consecuencias prácticas:

- **Vaciar el campo en el panel es una acción legítima**, no un documento a medias: es la forma
  de decir «usa la foto que viene con la web». De ahí que el campo no lleve `required()`.
- **`migrate:import` no sube el retrato** aunque el campo exista, precisamente para que un
  proyecto recién importado sirva el fichero del repositorio y no una segunda copia de la misma
  foto que además ganaría. Es el fallo que esto arregla: cambiar el recorte en `public/` no
  cambiaba nada en producción, y ni el `check` ni el build se quejaban.

En la consulta, el retrato se proyecta con `select(defined(photo.asset) => …)` y **no** con
`photo {…}` a secas, que es la forma evidente y la equivocada: proyectar un campo vacío devuelve
un objeto con las claves a `null` en vez de `null`, y entonces falla la validación del perfil
entero y se cae al respaldo con él, perdiendo lo que sí esté editado en el panel.

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

## El panel (ya enchufado)

El proyecto de Sanity existe desde el **2026-08-03**: `Portfolio`, id **`3pdexisd`**, dataset
`production` **público**, con los documentos del CV importados y sus capturas subidas. La web ya
se construye leyendo del panel; `content/` sigue en su sitio como respaldo y como suelo de la
regla de arriba. La importación inicial subió dieciséis documentos y siete imágenes; **la lista de
proyectos del panel ya no coincide con la del repositorio** (ver «Pendiente»).

Público a propósito: la web lee **sin token** al construir, así que un dataset privado obligaría
a meter una credencial de lectura en los dos proyectos de Vercel para servir un CV que es
público de todas formas.

Lo que hay montado, y con qué comando se reproduce en un proyecto nuevo:

```bash
npx sanity projects create "Portfolio" --dataset production --dataset-visibility public
# → devuelve el projectId; va a .env.local y a los dos proyectos de Vercel

npm run migrate:build      # content/ → scripts/migration/import.ndjson
npm run migrate:import     # sube también las capturas (el retrato NO: ver más abajo)

# Orígenes CORS: sin esto /admin carga pero no puede hablar con Sanity
npx sanity cors add http://localhost:3000 --credentials
npx sanity cors add https://luisfernandezsangil.vercel.app --credentials
npx sanity cors add https://luisfernandezsangiltest.vercel.app --credentials
```

Variables (las tres, en `.env.local` y en **los dos** proyectos de Vercel):
`NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` y `SANITY_REVALIDATE_SECRET`.
Las dos primeras no son secretas —van en el HTML de cualquier web con Sanity—; la tercera sí.

### Los dos webhooks de revalidación

Uno por entorno, los dos sobre el dataset `production`, apuntando a `/api/revalidate` de
producción y de test, con `rule.on = ["create","update","delete"]` y un filtro que los limita a
los cinco tipos del CV (así una subida de imagen no regenera el sitio). El secreto es el mismo
`SANITY_REVALIDATE_SECRET`.

> ⚠️ **El endpoint de webhooks es el del host del proyecto, no el global.** Es
> `https://<projectId>.api.sanity.io/v2025-02-19/hooks/projects/<projectId>`, y el cuerpo lleva
> `type` con el valor `document` obligatoriamente. Contra `api.sanity.io` responde un endpoint más
> viejo que va rechazando campo por campo (`"rule" is not allowed`, luego `apiVersion`, luego
> `httpMethod`…) y de ahí salió la creencia —anotada aquí durante meses— de que había que crear
> el webhook y **parchearlo después** con `rule`. No hace falta: contra el host correcto el
> `POST` acepta `rule` a la primera. `npx sanity openapi get webhooks` da el contrato exacto.

> ⚠️ **Ningún `_id` importado puede llevar un punto.** Para Sanity el `_id` es una ruta separada
> por puntos y **sólo la raíz es pública**: `experience.altia` exige token de lectura igual que
> `drafts.algo`. El script genera `experience-altia`, con guion, y el comentario de `idFor` en
> `scripts/build-sanity-import.mjs` explica por qué. Cómo se manifiesta si se rompe: la
> importación dice «Done!», el panel enseña los dieciséis documentos y **la web sigue sirviendo
> `content/`** sin un solo error, porque el cliente anónimo del build recibe listas vacías y la
> regla del contenido cae al respaldo, que es justo lo que debe hacer. Se tardó en encontrar
> porque `profile` —el único `_id` sin punto— sí se leía.

Si algún día faltaran las variables, `/admin` no falla: explica cuál falta y recuerda que la web
pública funciona igual (`app/(studio)/admin/ConnectionNotice.tsx`).

### QUITAR un proyecto del panel necesita además un build

Publicar y **editar** se ve en segundos por el webhook. Quitar, no del todo, y conviene saberlo
antes de retirar algo: comprobado el 2026-08-03 al borrar Manfisa del dataset, con los dos
entornos ya desplegados.

Lo que el webhook arregla solo: la portada, `/es/projects` y las fichas que siguen existiendo.
Sirven una vez la copia vieja —regeneran en segundo plano, así que la **primera** petición después
de publicar todavía enseña lo anterior; la segunda ya no— y luego quedan al día.

Lo que **no** arregla:

- **La ficha del proyecto retirado.** `/es/projects/manfisa` se prerrenderizó en el build y sigue
  respondiendo 200 con su copia, aunque el documento ya no exista. Nada la enlaza, pero la URL
  funciona y Google la tiene.
- **`sitemap.xml`**, que es estático del build entero: sigue anunciando los slugs viejos.

Los dos se arreglan **desplegando** —cualquier push a `test` o `main`—: el build nuevo genera
`generateStaticParams` sin ese slug, la ruta pasa a resolverse en el momento, no encuentra el
proyecto y devuelve 404. Así que el orden correcto para retirar un proyecto es **borrar el
documento y desplegar después**, no sólo borrarlo.

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
  JavaScript, y respetan `prefers-reduced-motion`. De los dos fondos del sitio, el mosaico de la
  portada tampoco lleva JavaScript; el campo sí, porque reacciona al puntero. Ver «Los dos fondos»
  más abajo.
- **Hay hoja de impresión.** Un recruiter que quiere guardar el CV pulsa Ctrl+P: sale en papel
  blanco, sin la navegación y con las URLs de los enlaces escritas al lado.

En escritorio la navegación es la cabecera fija; en móvil (`< lg`), una **barra inferior de cinco
iconos** al alcance del pulgar. Nunca las dos: tenerlas sería robar 4 rem arriba y abajo en el
dispositivo que menos tiene.

El quinto icono de la barra abre el **menú a pantalla completa**, y ahí están **todas** las
secciones —no sólo las dos que no caben en la barra— con los dos idiomas al final, detrás de un
filete horizontal. Es el menú de `Swiftmet`: un panel que sólo lista el sobrante obliga a mirar la
barra para deducir qué falta.

### El orden de las secciones

`hero → proyectos → experiencia → formación → stack → perfil → contacto`.

Los proyectos van primero porque son la única sección con prueba visual, y quien dedica treinta
segundos a un CV los gasta mirando. El perfil —tres párrafos de prosa— va al final, para quien ya
ha decidido seguir leyendo.

**Cambiar este orden toca tres sitios**, y no hay nada que avise si se olvida uno:
`app/(site)/[locale]/page.tsx`, el `index` de cada `SectionHeading` (la numeración `01`…`06`, que es
el índice implícito de la página) y `navigation` en `lib/i18n/routes.ts`, que es el menú.

### Volver arriba

Botón flotante (`components/ui/BackToTop.tsx`), en escritorio y en móvil, que **aparece pasada la
primera pantalla**: encima del hero sería una flecha para subir a donde ya estás. Sustituye a la que
había en el pie, que era un enlace a la ruta actual y por tanto no movía el scroll. Llama a
`window.scrollTo({ top: 0 })` **sin `behavior`** a propósito: así se aplica el `scroll-behavior` de
la hoja de estilos, que ya es suave e instantáneo bajo `prefers-reduced-motion`.

### Los proyectos de la portada van en un «cover flow» infinito

Los proyectos de la portada no están en una retícula, sino en un **carrusel 3D**: la
tarjeta centrada se mira de frente y las de los lados se giran sobre su eje vertical, se alejan y
se apagan. Es la única sección cuyo contenido es visual, y varias capturas de web puestas una al
lado de otra no se miran: se hojean.

**Salen todos los proyectos, no una selección.** Antes eran sólo los cuatro `featured` y el resto
quedaba en el índice de `/projects`; el argumento era ahorrar scroll y no se sostiene aquí, porque
en un carrusel las tarjetas se pasan de lado y ocho ocupan lo mismo que cuatro. El coste sí era
real: la mitad del trabajo sólo se veía entrando en una segunda página. `featured` sigue sirviendo
para algo —decide **por dónde abre** el carrusel, ver `getCarouselProjects` en `lib/content.ts`— y
el índice sigue enlazado debajo, porque hace otra cosa: es una URL que se manda suelta.

Lo mueve **el scroll y nada más**. Las animaciones son `view-timeline` + `animation-timeline`, la
misma técnica que las apariciones al hacer scroll, así que no hay JavaScript calculando
posiciones. La geometría —lo único delicado— está razonada en el bloque «COVER FLOW» de
`app/globals.css`; en resumen: `--cover-flow-card` es lo que mide la tarjeta,
`--cover-flow-step` lo que avanza el scroll de una a la siguiente (más corto, y de ahí el
solape), y **el ancho del carrusel es lo que decide cuánto dura el giro**, porque con
`animation-range: contain` el giro ocupa `ancho − tarjeta`.

De JavaScript hay dos cosas en `components/ui/CoverFlow.tsx`. Los **dos botones**: con el dedo se
arrastra y con el tabulador el navegador trae al foco cada tarjeta, pero una rueda de ratón no
hace scroll horizontal y la barra está oculta a propósito. Y **el bucle**, que es lo que sigue.

**El carrusel no tiene extremos: después de la última tarjeta vuelve la primera.** La lista se
pinta **tres veces** y quien mira vive en la copia del medio; cuando el scroll se ha ido una lista
entera hacia un lado, se le resta o se le suma esa lista **de golpe**. La tarjeta centrada antes
del salto y la de después son la misma tarjeta en el mismo sitio de la pantalla, así que el salto
no se ve: es una cinta de correr, no una animación. Tres copias y no dos porque hace falta una de
sobra **a cada lado** para poder dar la vuelta en los dos sentidos. Dos detalles que hacen que no
se note:

- **El salto se hace con el scroll quieto** (140 ms sin eventos). Recolocar en marcha aborta el
  desplazamiento suave del navegador y mata la inercia del dedo, que es la sensación exacta de
  carrusel roto. Esperar sale gratis porque hay una lista entera de margen a cada lado.
- **Las copias van `inert`**: fuera del tabulador y fuera del árbol de accesibilidad. Con
  `aria-hidden` a secas quedarían veinticuatro enlaces alcanzables con el teclado para ocho
  proyectos.

Si el navegador no soporta animaciones dirigidas por scroll, o si el sistema pide menos
movimiento, queda **un carrusel horizontal normal** con las tarjetas separadas y ninguna girada —y
el bucle sigue funcionando, porque no depende del CSS—. Y en papel se deshace en la retícula de dos
columnas que había antes: sin eso, un `overflow-x` imprimiría el primer proyecto y recortaría todos
los demás. **En papel las copias no se imprimen** (`.cover-flow-item[data-clone]`): serían seis
hojas con los ocho proyectos tres veces.

### Los dos fondos: el mosaico en la portada, el campo en todo lo demás

**La web tiene dos fondos y cada uno tiene su sitio.** La primera pantalla es el **escenario
cinético**: un mosaico a sangre de dieciséis fotografías CC0 y cuatro paneles de interfaz dibujados
en CSS, en cinco columnas que se desplazan despacio y en direcciones alternas sobre un resplandor de
cobre que respira, con el texto del hero apoyado abajo encima de él. En cuanto se baja de ahí
—y en todas las páginas interiores— manda el **campo interactivo**.

El escenario vive en `components/sections/HeroStage.tsx` y en el bloque «Escenario cinético de la
portada» de `app/globals.css`. **No lleva una línea de JavaScript**: son animaciones CSS infinitas
sobre `transform` y `opacity`, las dos propiedades que el navegador anima en el compositor sin
volver a medir. Es decoración declarada (`aria-hidden`, `alt=""`, `pointer-events: none`), se
congela con `prefers-reduced-motion` y no se imprime. La procedencia y la licencia de las dieciséis
fotografías están en `public/hero/CREDITS.md`; se reconstruyen con
`node scripts/build-hero-tiles.mjs`.

#### El campo interactivo

Detrás de todas las secciones que no son la portada, y de todas las páginas, hay una retícula de
nodos —de mil a tres mil, según el tamaño de la ventana— dibujada en un `<canvas>`. **Reacciona a
quien la mira:** el puntero abre un pozo de luz, los nodos se apartan y se encienden en cobre y
tejen entre ellos una constelación que sólo existe donde hay luz; un clic lanza una onda que recorre
la pantalla entera; y cada dos o cinco segundos un pulso viaja por una fila o una columna dejando
estela, como un dato por un bus.

Vive en `components/layout/SiteField.tsx` —que es todo el motor, y se monta una sola vez en el
layout— y su parte estática (la atmósfera de cobre desenfocada, la retícula de planos y el velo) en
el bloque «Campo interactivo del sitio» de `app/globals.css`. El razonamiento largo está en los
comentarios de los dos.

- **Un solo lienzo y cero dependencias.** Ni Three, ni una librería de animación: contexto 2D,
  `Float32Array` y un bucle. Es el único componente de cliente del sitio junto a la navegación; el
  resto sigue siendo HTML estático.
- **Fijo a la ventana, nunca del alto del documento.** Un lienzo tan alto como la página serían
  decenas de miles de nodos y un mapa de bits de varios megapíxeles; así son siempre los mismos dos
  mil y el coste no depende de lo que mida el contenido. De paso, el texto viaja sobre una
  superficie quieta en vez de arrastrar la retícula consigo, y al navegar entre páginas del mismo
  idioma el lienzo **no se reinicia**: el layout no se vuelve a montar.
- **Es decoración declarada.** `aria-hidden` en la raíz y `pointer-events: none` en toda la capa: el
  campo reacciona al puntero **sin recibirlo** —los eventos se escuchan en `window`—, así que un
  clic destinado a un botón llega siempre al botón. No sale en la impresión —y ahí importa el
  doble, porque una capa fija se imprimiría en **todas** las hojas—, y con
  `prefers-reduced-motion: reduce` no se registra ni un escuchador: se dibuja un único fotograma.
- **El orden de capas es explícito.** El campo es un elemento posicionado con `z-index: 0`, y en el
  orden de pintado de CSS eso va por encima del contenido de los elementos estáticos aunque esté
  antes en el documento. Por eso `globals.css` lleva
  `body > main, body > footer { position: relative; z-index: 1 }`. **Si añades un hermano directo
  del `<body>` que tenga que verse, súbelo también.**
- **La legibilidad se reparte entre tres piezas, y ninguna es un velo global fuerte.** El velo del
  texto de la portada (`.hero-copy::before`), la pastilla del rótulo del puesto (`.hero-chip`) y el
  techo de brillo del propio lienzo. El velo sigue **anclado AL TEXTO** y no a un porcentaje del
  alto del hero: es la corrección de un fallo real, y lo que se cae primero es el rótulo del puesto
  y la línea de la ubicación, no el nombre. Sus intensidades se calibran contra el **mosaico**, que
  es el fondo más duro de los dos: una fotografía clara detrás de un texto pequeño es mucho peor que
  la retícula, y calibrar contra el fondo benévolo es cómo se cuela un rótulo ilegible.
- **El velo global está en el 12 %, y hay una razón para no subirlo.** Se probó al 30 % al pasar el
  campo a fondo del sitio y la web se quedó prácticamente negra: los nodos en reposo pintan a poco
  más de 0,2 de opacidad, así que un 30 % de grafito encima los borra. Si el problema es que algo
  no se lee, lo que hay que tocar es la pieza que protege ese texto, no la manta.
- **El campo tiene que verse sin tocar nada.** Un fondo que sólo aparece bajo el puntero es
  invisible en un móvil, donde no hay puntero — pasó en la primera captura, y por eso el nodo en
  reposo tiene un tamaño y una opacidad mínimos que se ven solos. Lo que la interacción añade es
  el relieve, no la existencia.
- **Verificar a 390 px antes de cerrar.** `overflow: hidden` en la capa es lo único que impide que
  el campo ensanche el documento, y es el fallo nº 1 de `check:mobile`.

#### La costura entre los dos, que es lo único delicado

El escenario es una capa **opaca** dentro del hero (`.hero-stage` lleva
`background: var(--color-ink)`): sin eso se verían los dos fondos a la vez, con la retícula asomando
por los huecos entre tejas. Y por ser opaco hay que apagarlo **antes** del borde inferior del hero,
o el canto se lee como una raya horizontal de lado a lado. Lo hace un `mask-image` que lo disuelve
entre los 16 y los 8 rem finales; el velo del texto hace lo simétrico con su propia máscara de
6 rem.

Los números salen de dos capturas, y la regla que dejan es corta: **el escenario tiene que estar
apagado del todo antes de que empiecen las cifras.** Con la disolución en 9 rem la costura
desaparecía, pero «5 AÑOS DE EXPERIENCIA» —versalitas pequeñas y apagadas— quedaba sobre la
fotografía de un armario de servidores todavía a tres cuartos de opacidad. Si tocas una de las dos
máscaras, mira el filete de cifras antes de cerrar.

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

### Qué proyectos salen: `content/projects.config.ts`

**Para añadir, quitar o reordenar un proyecto se toca un fichero y basta con el título.**
`content/projects.config.ts` es la lista de lo que se publica y en qué orden, y marca con
`featured` los cuatro por los que abre el carrusel de la portada —donde salen **todos**—. El
contenido de cada uno —resumen,
decisiones, stack, captura— vive en su ficha, en `content/projects.ts`, unida a la lista por el
`name`.

Un título de la lista sin ficha **no se publica** y deja un aviso con su nombre en el log del
build. Es deliberado: media tarjeta —sin frase, sin año y con el hueco tramado donde va la
captura— se lee como un descuido. Al revés no pasa nada: una ficha que no está en la lista
simplemente no sale, así que retirar un proyecto no obliga a borrar lo escrito.

Están todos los repositorios de github.com/luisfdzs **menos Manfisa**, retirada a propósito.

> ⚠️ **Con el panel enchufado, esta lista no manda en lo desplegado.** La regla del contenido
> dice que Sanity gana cuando tiene documentos, así que un cambio aquí sólo se ve en la web
> después de reflejarlo en el panel (ver «Pendiente»).

### Las capturas de los proyectos

Lo que se ve en la tarjeta es **la sección principal de la página principal de cada proyecto**: la
primera pantalla de la web en vivo. Las genera `npm run shots` (`scripts/build-project-shots.mjs`)
abriendo cada `liveUrl` en un Chrome real con la ventana **a 1400×700**, que es el 2:1 exacto del
hueco de la tarjeta, y guardando el viewport al doble de densidad. Medir la ventana con la
proporción de destino es lo que evita recortar: la versión anterior de este script recortaba una
captura de 1568×698 y se comía 86 px por lado, es decir el borde izquierdo del titular y de la
navegación.

```bash
npm run shots                        # todos los proyectos publicados
npm run shots -- cedece mila-barber  # sólo esos slugs
```

Las URLs salen de `content/`, así que el script no tiene ningún mapa que mantener: un proyecto
nuevo en la lista ya está aquí. Lo que **sí** hay que hacer a mano es escribir el `alt` de la
captura en la ficha, mirándola.

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

- ~~**El panel sigue con la lista de proyectos vieja.**~~ Resuelto el 2026-08-03: reimportado
  (`npm run migrate:build && npm run migrate:import`) y borrado el documento de Manfisa
  (`npx sanity documents delete project-manfisa --dataset production`), que `--replace` **no**
  borra por su cuenta. El dataset tiene ya los ocho proyectos en el orden de la lista, sin
  borradores, y el retrato del perfil quedó vacío — que es justo lo que hacía falta para que la
  web sirva el recorte de `public/luis.webp` (ver el punto de abajo).
- **Hay que VACIAR el retrato del panel para que se vea el recorte.** El campo «Retrato» del
  documento `profile` sigue teniendo el JPEG original con la calle detrás, y el panel manda cuando
  tiene una imagen elegida. Desde el 2026-08-03 basta con quitarla —`/admin` → **Perfil** → campo
  «Retrato» → borrar la imagen → _Publish_— y la web sirve `public/luis.webp`, que es el busto con
  canal alfa. La otra opción, si se prefiere tener la foto en el panel, es reemplazarla ahí por
  `public/luis.webp`; las dos valen. Lo que **no** sirve es `npm run migrate:import`: corre con
  `--replace` y machacaría las ediciones hechas a mano y el orden de los documentos arrastrables.
- **El retrato es de 200×200.** Es el original que había en el portfolio anterior. Da justo para
  el círculo de móvil (160 px) pero se ve blando en los 320 px de escritorio con pantalla de alta
  densidad. **Hace falta el original a 800×800**; las medidas declaradas en `content/profile.ts`
  son las reales, no las deseadas, porque `next/image` reserva el hueco con ellas y mentir ahí
  provoca salto de maquetación.
- **Hay que cambiar el enlace de Sangil Studio EN EL PANEL.** El `liveUrl` y el `note` de esa ficha
  están también en Sanity, que es quien manda en lo desplegado, así que la web pública sigue
  enlazando a `sangilstudiotest.vercel.app` hasta editarlo a mano: `/admin` → **Proyectos** →
  _Sangil Studio_ → poner `https://sangilstudio.com` en «Web en vivo», vaciar «Nota» → _Publish_.
  **No** con `npm run migrate:import`: corre con `--replace` y machacaría el retrato vacío del
  perfil y el orden de los documentos arrastrables.
- **Y de paso, un `highlight` de la ficha de este portfolio.** Con el carrusel infinito
  (2026-08-03) la frase «sin JavaScript salvo los dos botones» dejó de ser exacta y en `content/`
  ya dice «los dos botones y el salto del bucle». En el panel sigue la vieja: `/admin` →
  **Proyectos** → _Portfolio_ → «Lo que tiene dentro» → el punto del cover flow. Es cosmético y no
  urge, pero es una afirmación técnica en una web que se vende por que se pueden comprobar.
- **Sangil Studio apunta ya a `sangilstudio.com`,** por decisión de Luis el 2026-08-03: se cambió
  el `liveUrl` —antes `sangilstudiotest.vercel.app`— y se borró el `note` que explicaba el desvío.
  **Lo que hay que vigilar:** el día del cambio el dominio seguía sirviendo la página de «Web en
  construcción», así que el botón «Web en vivo» de esa tarjeta lleva a un cartel de en proceso
  mientras el estudio no lance. La captura de la tarjeta sí es la web terminada (se hizo contra
  test), y **no** hay que regenerarla con `npm run shots -- sangil-studio` hasta que el dominio
  sirva la web de verdad: hoy capturaría el cartel. Volver a test es cambiar una línea.
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
