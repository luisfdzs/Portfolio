# CLAUDE.md — PORTFOLIO · Luis Fernández Sangil

> Contexto principal del proyecto. Este archivo se mantiene **actualizado en cada cambio
> relevante** (ver _Protocolo de mantenimiento_ al final). Es la fuente de verdad compartida por
> quien trabaje en el proyecto.

La memoria curada vive en `.claude/memory/` (índice en `.claude/memory/MEMORY.md`).

@.claude/memory/MEMORY.md

---

## 1. Qué es este proyecto

CV, portfolio y carta de presentación de **Luis Fernández Sangil**, ingeniero industrial y
desarrollador web en Vigo (Analista programador senior en Mobile Smart City Corp desde marzo de
2026). Sustituye al portfolio anterior en Astro, que sigue en `C:\Proyectos\Porfolio` y del que
sólo se ha recuperado el retrato.

El objetivo es explícito y conviene tenerlo presente al decidir cualquier cosa: **maximizar
oportunidades e imagen profesional.** Quien lo lee es un recruiter o un cliente potencial que le
dedica entre treinta segundos y dos minutos. Todo lo que no ayude a eso, sobra.

Reutiliza el stack, la arquitectura y la metodología de `C:\Proyectos\Swiftmet`, que a su vez los
heredó de `C:\Proyectos\sangilstudio`.

**Estado (2026-08-01): DESPLEGADO.**
[luisfernandezsangil.vercel.app](https://luisfernandezsangil.vercel.app) (producción, rama `main`)
y [luisfernandezsangiltest.vercel.app](https://luisfernandezsangiltest.vercel.app) (test, rama
`test`, con `Disallow: /`). `npm run check` limpio y `npm run check:mobile` **21/21 en local, en
test y en producción**, en los dos idiomas. El flujo `develop` → `test` → `main` está verificado:
`develop` no despliega nada y cada push a `test` y a `main` despliega en su entorno. IDs y detalles
en la memoria [[despliegue]].

**La web publica ocho proyectos y la lista se decide en un fichero (2026-08-03).**
`content/projects.config.ts` dice qué proyectos salen y en qué orden; las fichas viven en
`content/projects.ts` unidas por el `name`. **Los ocho salen en la portada y los ocho en el índice
de `/projects`** (2026-08-03): `featured` ya no decide quién sale, sólo por dónde abre el carrusel.
Están todos los repositorios de github.com/luisfdzs **menos Manfisa**, retirada a propósito, y las
portadas de las tarjetas son **la primera pantalla de cada web en vivo**, capturadas por
`npm run shots`. **Ojo:
el panel manda en lo desplegado, así que la lista no cambia la web pública hasta reflejarla en el
panel** — hecho ya por CLI el 2026-08-03, con el documento de Manfisa borrado aparte porque
`--replace` no borra. Y **retirar un proyecto necesita además un despliegue**: el webhook no se
lleva ni su ficha prerrenderizada ni el `sitemap.xml`. Ver [[lista-de-proyectos]].

**El panel está enchufado (2026-08-03).** Proyecto de Sanity `Portfolio`, id `3pdexisd`, dataset
`production` público, con los dieciséis documentos del CV y las siete imágenes importados; la web
se construye ya leyendo del panel y `content/` queda como respaldo, que es su papel (ver
[[contenido-dos-fuentes]]). Detalles y las dos trampas que costaron la sesión —el `_id` con punto
y el host del endpoint de webhooks— en [[sanity-enchufado]].

## 2. Stack técnico

- **Frontend:** Next.js 16 (App Router, Turbopack) + TypeScript estricto + Tailwind CSS 4, con
  **zod** validando el contenido. **Estático**: en servidor sólo `proxy.ts` (negocia idioma), el
  webhook de revalidación y las dos rutas de imagen generada.
- **Bilingüe:** `es` (por defecto) y `en`, en `/es` y `/en`. Sólo el castellano es obligatorio en
  el contenido; lo que falte cae al castellano en `lib/content.ts`.
- **Contenido: doble fuente con una regla.** `content/` es el suelo y Sanity manda cuando tiene
  documentos. Es la decisión de arquitectura central y está explicada en el README y en
  [[contenido-dos-fuentes]]. **Diferencia importante con los proyectos de cliente**: ahí Sanity es
  la única fuente y su ausencia es un error; aquí la web se construye y se despliega sin
  credenciales de nada. **La regla cae por documento, con UNA excepción: el retrato del hero cae
  por campo.** Si el campo «Retrato» del panel está vacío se sirve `public/luis.webp`, porque un
  perfil sin foto es un documento válido y no dispararía el respaldo — el hero se quedaría con el
  hueco de trama. Ver [[hero-sanity]].
- **Panel:** Sanity dentro de la propia web, en `/admin`. Cinco tipos de documento: el singleton
  `profile` y `experience`, `education`, `skillGroup` y `project`, los cuatro ordenables
  arrastrando. Proyecto `3pdexisd`, dataset `production` **público** (la web lee sin token al
  construir; un dataset privado obligaría a repartir una credencial de lectura para servir un CV
  que es público igual). Dos webhooks de revalidación, uno por entorno. Ver [[sanity-enchufado]].
- **Despliegue: Vercel**, dos entornos (`main` → producción, `test` → test con `noindex`).
  Framework declarado en `vercel.json`.
- **Calidad:** `npm run check` (typecheck + ESLint + Prettier) y `npm run check:mobile` (21
  comprobaciones en Chrome real a 390×844, por idioma).
- **Los proyectos: la lista en un sitio y las fichas en otro.** `content/projects.config.ts` es
  qué se publica y en qué orden; `content/projects.ts` es el contenido de cada uno. `featured`
  **no** decide quién sale —en la portada salen todos—, sino por cuáles abre el carrusel. Se unen
  por el `name` exacto, y **un título sin ficha no se publica**: avisa en el log del build en vez
  de sacar media tarjeta. Las portadas de las tarjetas son la
  primera pantalla de cada web en vivo y las genera `npm run shots` con el viewport a 1400×700 —el
  2:1 del hueco—, sin recortar nada. Ver [[lista-de-proyectos]].
- **Imágenes locales: lo que hay en `public/` es lo que viaja.** El cargador
  (`sanity/imageLoader.ts`) sólo transforma URLs de la CDN de Sanity y devuelve las rutas locales
  intactas, así que en las capturas de proyecto **`sizes` y `quality` no ahorran ni un byte**: el
  peso se decide al generar el archivo.
- **Tipografía:** Instrument Serif (titulares), Inter (cuerpo) y JetBrains Mono (datos), las tres
  autoalojadas por `next/font` — ninguna petición a Google en tiempo de ejecución.
- **Navegación:** cabecera fija en escritorio; en móvil (`< lg`), barra inferior de cinco iconos.
  Nunca las dos a la vez. **La URL nunca enseña `#seccion`**: los `href` siguen llevando el
  ancla, pero `components/layout/HashCleaner.tsx` la borra en cuanto ha hecho su trabajo, y en
  las navegaciones entre páginas no llega ni a escribirse. Ver [[urls-sin-anclas]].
- **Alineación: el texto va centrado** en el espacio que ocupa, como en `sangilstudio`. `text-center`
  en la sección + `mx-auto` en las cajas con ancho máximo + `justify-center` en las filas flex; las
  tres cosas juntas, porque ninguna hace el trabajo de las otras. **En papel no**: `@media print` lo
  deshace. Qué quedó sin centrar y por qué, en [[decisiones-de-diseno]].
- **Los proyectos de la portada van en un carrusel «cover flow», y van TODOS** (bloque «COVER
  FLOW» de `app/globals.css` + `components/ui/CoverFlow.tsx`): giro 3D dirigido por el scroll, sin
  JavaScript salvo los dos botones. Fallback sin soporte o con `prefers-reduced-motion`: carrusel
  horizontal plano. En papel se deshace en retícula de dos columnas — y con ocho tarjetas eso son
  **dos hojas de proyectos**, no una. Ver [[cover-flow]].
- **HAY DOS FONDOS Y CADA UNO TIENE SU SITIO.** En la **primera sección** manda el **escenario
  cinético**: el mosaico a pantalla completa de dieciséis fotografías CC0 y cuatro paneles de
  interfaz dibujados, en cinco columnas que se desplazan despacio y en direcciones alternas
  (`components/sections/HeroStage.tsx` + bloque «Escenario cinético de la portada» de
  `globals.css`, sin una línea de JavaScript). En **todo lo demás** manda el **campo interactivo**:
  una retícula de mil a tres mil nodos dibujada en un `<canvas>` que **reacciona al puntero** —pozo
  de luz que aparta y enciende los nodos, constelación que sólo existe donde hay luz, onda al hacer
  clic y pulsos que viajan por filas y columnas—, montada **una sola vez en el layout**
  (`components/layout/SiteField.tsx` + bloque «Campo interactivo del sitio» de `globals.css`) en
  una capa **fija** del tamaño de la ventana por la que pasan por encima todas las secciones y
  todas las páginas. Cero dependencias, `aria-hidden`, `pointer-events: none` en toda la capa, el
  bucle se para al cambiar de pestaña, con `prefers-reduced-motion` se dibuja un solo fotograma y
  ninguno de los dos se imprime. El texto del hero es corto a propósito —puesto, nombre, una línea,
  ubicación y las cuatro cifras—: la entradilla larga se quitó porque sobre un fondo que se mueve no
  se lee. Ver [[campo-interactivo]].
- **Conviven porque el escenario es OPACO y se disuelve antes del borde del hero.** `.hero-stage`
  lleva `background: var(--color-ink)` —si no, se verían los dos a la vez, la retícula asomando por
  los huecos entre tejas— y un `mask-image` que lo apaga entre los 16 y los 8 rem finales del hero;
  el velo del texto hace lo simétrico con su propia máscara de 6 rem. Ésa es la única costura entre
  los dos fondos: **quien toque uno tiene que mirarla**, y calibrarla contra el filete de cifras,
  que es el texto que se cae primero. Ver [[campo-interactivo]].
- **El orden de capas lo fija una regla explícita**, no el orden del documento: la capa del campo
  es un elemento posicionado con `z-index: 0`, y en CSS eso gana al contenido de los elementos
  estáticos aunque venga antes. Por eso `globals.css` sube `body > main` y `body > footer` a
  `position: relative` con `z-index: 1`. **Si añades un hermano directo del `<body>` que tenga que
  verse, súbelo también.**
- **El contraste del hero lo da un velo anclado al TEXTO** (`.hero-copy::before`), no un
  porcentaje del alto del hero, y el rótulo del puesto lleva pastilla propia (`.hero-chip`). Las
  dos cosas son la corrección de un fallo real. Regla corta: **si tocas el velo, vuelve a mirar el
  rótulo del puesto y la línea de la ubicación**, que son los dos textos que fallan primero — no
  el nombre, que es enorme y aguanta cualquier cosa detrás. Ver [[campo-interactivo]].

Detalle y razonamiento en el **README.md**, que es extenso a propósito, y en `.claude/memory/`.

## 3. Las decisiones que no hay que deshacer sin pensarlo

1. **Ninguna cifra del CV está escrita a mano.** Los años de experiencia, el número de proyectos
   en producción, las empresas y las tecnologías se calculan del contenido. El portfolio anterior
   decía «+4 años» cuando ya eran cinco. Ver [[cifras-calculadas]].
2. **El reloj no se lee durante el render.** `next.config.ts` congela el mes del build en
   `NEXT_PUBLIC_BUILD_MONTH`. Con `cacheComponents` activo, leer la fecha en un componente
   volvería dinámica una ruta que debe ser estática.
3. **La indexación se decide por la rama, no por `VERCEL_ENV`.** El proyecto de test despliega
   `test` como su propia producción, así que `VERCEL_ENV` valdría `production` allí también y
   habría dos copias del CV compitiendo en Google por el nombre.
4. **`content/` no se borra al enchufar Sanity.** Es el respaldo, y el punto 2 de la regla del
   contenido depende de que siga ahí.
5. **Nada de formulario de contacto.** Un `mailto:` con la dirección visible deja el mensaje en
   la bandeja de enviados de quien escribe, que es donde lo quiere alguien que escribe por
   trabajo.
6. **El estado laboral que se muestra es el puesto actual, no «disponible».** Es un dato
   verificable en LinkedIn y no una señal de búsqueda activa que pueda leer un jefe.
7. **El cover flow se mide por el ANCHO del carrusel, no con `view-timeline-inset`.** El inset es
   el camino evidente y obliga a un `calc()` con porcentaje; medirlo por el ancho deja la
   geometría en un sitio y, de paso, convierte el carrusel en una ventana centrada en vez de una
   banda a sangre con medio metro de vacío a la izquierda en un monitor ancho. Ver
   [[cover-flow]].
8. **Ningún fondo compite con el texto, y los dos tienen que verse sin tocarlos.** Son dos
   condiciones a la vez, las dos salen de fallos reales y aplican a **todas** las secciones. Si al
   tocar el velo, los nodos o las máscaras hay que esforzarse para leer **cualquier** línea del hero
   a 390 px, el cambio está mal —y el listón son el rótulo del puesto, la ubicación y **los rótulos
   de las cifras**, no el nombre—; lo que garantiza el contraste va anclado al texto y con los topes
   en `rem`, nunca en porcentajes del alto del hero. Y al revés: si el campo sólo aparece bajo el
   puntero, en móvil no aparece nunca. **Ojo con la tentación de resolverlo subiendo el velo
   global**: se probó al 30 % y dejó el fondo prácticamente negro en toda la web, porque los nodos
   en reposo pintan a poco más de 0,2 de opacidad. Está en el 12 %. Y **la calibración se hace
   siempre contra el fondo más duro de los dos**, que es el mosaico: los topes del velo del texto
   son los del escenario (28 / 58 / 88 %) y no los más flojos que bastaban con la retícula detrás.
   Ver [[campo-interactivo]].
9. **Sólo entran imágenes CC0 o dominio público**, y cada una queda documentada donde vive. Nada
   de CC-BY: obligaría a mostrar el crédito en la propia página. La regla nació con las dieciséis
   fotografías del escenario cinético (`public/hero/` + su `CREDITS.md`) y vale para cualquier
   imagen que entre al proyecto. **Esas dieciséis estuvieron un día sin uso y no se borraron; al día
   siguiente volvieron.** Es el argumento a favor de documentar en vez de barrer.
10. **Las secciones de la portada no se convierten en rutas** para quitar la almohadilla de la
    URL. Serían cinco páginas por idioma con el mismo CV compitiendo con la portada por «Luis
    Fernández Sangil». La almohadilla se quita en cliente; ver [[urls-sin-anclas]].

## 4. Reglas del proyecto

Heredadas de la metodología de `sangilstudio` y `Swiftmet`:

1. **Contexto siempre a nivel de proyecto, nada global** — memorias, skills y reglas viven en
   `.claude/` de este repo. (`.claude/` está gitignorado: es local a la máquina.)
2. **Nunca subir secretos** — credenciales, keys, tokens y `.env` jamás se sincronizan con
   GitHub; al añadir uno nuevo se incluye en `.gitignore` **antes** de subir nada.
3. **Claude nunca hace commit ni push** — modifica ficheros y **propone un mensaje de commit
   CORTO y en inglés**; el usuario revisa y ejecuta. Sólo si lo pide explícitamente en el momento,
   Claude ejecuta el commit. _(En la sesión del 2026-08-01, Luis autorizó explícitamente el git y
   el alta en Vercel del montaje inicial.)_
4. **Sincronizar antes de trabajar** — `fetch`/`pull` antes de empezar una modificación.
5. **Rama por tarea, y la rama se BORRA al mergear** — rama con nombre representativo sacada de
   `develop`; al terminar, `git merge --no-ff` en `develop`, push, y `git branch -d` +
   `git push origin --delete`. **Nunca squash** en las promociones `develop` → `test` → `main`.
6. **Una tarea de interfaz no está hecha hasta verla en móvil** — `npm run check:mobile` antes de
   cerrarla.
7. **Los despliegues se validan con un preview real de Vercel**, nunca con `vercel build` en
   local: en Windows falla siempre por un bug del builder, no de la web.
8. **No inventar datos del CV.** Es la regla más importante de este proyecto. Fechas, puestos,
   empresas, clientes y titulación son los que constan en LinkedIn
   (linkedin.com/in/luisfernandezsangil). Los resúmenes redactan esa información pero **no añaden
   hechos**. Lo que no consta se deja fuera; un CV con un dato dudoso vale menos que uno con un
   hueco, porque el dato dudoso se comprueba al pedir referencias.

### Modelo de ramas

| Rama      | Para qué                                                            | Vercel                                                         |
| --------- | ------------------------------------------------------------------- | -------------------------------------------------------------- |
| `develop` | Día a día: desarrollar, depurar y subir al repositorio sin publicar | **Nada.** No despliega                                         |
| `test`    | Entorno de test                                                     | `luisfernandezsangiltest` → luisfernandezsangiltest.vercel.app |
| `main`    | Producción                                                          | `luisfernandezsangil` → luisfernandezsangil.vercel.app         |

Detalle en [[modelo-de-ramas]].

## 5. Protocolo de mantenimiento

En **cada cambio relevante**, sin que se lo pidan:

1. Actualizar las memorias afectadas en `.claude/memory/` y su índice `MEMORY.md`.
2. Actualizar este `CLAUDE.md` si el cambio afecta a la estructura, el stack, el estado o las
   convenciones.
3. Actualizar el `README.md` si el cambio afecta a algo que deba saber quien despliegue o edite
   contenido — en particular la sección «Pendiente».

Regla de oro: **el contexto nunca debe quedar desactualizado respecto al estado real del
proyecto.**

---

_2026-08-03 (rama `feature/portada-todos-los-proyectos`, en worktree propio): **la portada enseña
los ocho proyectos, y Sangil Studio apunta a su dominio.** Dos cosas. (1) El carrusel de la portada
pasa de los cuatro `featured` a **todos**: `getFeaturedProjects(4)` se convierte en
`getCarouselProjects()`, que devuelve la lista entera con los destacados delante —`sort` estable, así
que dentro de cada grupo no se mueve nada—. El argumento viejo era ahorrar scroll y no se sostiene en
un carrusel, donde las tarjetas se pasan de lado: ocho ocupan lo mismo que cuatro, y el coste sí era
real, porque la mitad del trabajo sólo se veía entrando en `/projects`. **`featured` no se retira: se
le cambia el trabajo**, y ahora decide por dónde abre el carrusel —una bandera que no hace nada es
una trampa, y borrarla habría tocado la lista, el tipo, la consulta y el esquema del panel—. El
enlace al índice deja de ser condicional (`total > featured.length` ya nunca es cierto) y pasa a
decir «Ver el índice de los 8 proyectos»: el índice sigue teniendo sentido porque es una URL que se
manda suelta, no un catálogo más largo. (2) `liveUrl` de Sangil Studio pasa de
`sangilstudiotest.vercel.app` a `https://sangilstudio.com` y se borra su `note`. **Ojo con esto: el
dominio servía todavía la página de «Web en construcción» el día del cambio**, así que el botón «Web
en vivo» de esa tarjeta lleva a un cartel hasta que el estudio lance; volver a test es una línea. Y
**la captura de la tarjeta no hay que regenerarla** (`npm run shots -- sangil-studio`) hasta
entonces, porque hoy capturaría el cartel en vez de la web. `npm run check` limpio y `check:mobile`
21/21 en los dos idiomas sobre el build de producción, con las ocho tarjetas en la portada y cero
desbordamiento a 390. **Lo que este cambio NO arregla solo:** el `liveUrl` y el `note` viven también
en el panel, que es quien manda en lo desplegado, así que la web pública sigue enlazando a test hasta
editar `/admin` → Proyectos → Sangil Studio (poner el dominio, borrar la nota) → *Publish* — **nunca
con `migrate:import`**, que corre con `--replace`. Es el caso general de [[contenido-dos-fuentes]]._

_2026-08-03 (en `develop`, por encargo de trabajar ahí directamente): **el retrato pierde el halo
dorado y los proyectos pasan a decidirse en un fichero de configuración.** Tres cosas en una
sesión. (1) `.hero-portrait::before` era un aro de cobre alrededor de la cara y ahora es el mismo
degradado en grafito: **el resplandor se quitó, el degradado no**, porque el retrato vive fuera de
`.hero-copy` —sobre las tejas del mosaico y sin el velo del texto— y sin nada detrás la cara se
pierde cuando pasa una teja clara. (2) `content/projects.config.ts`: la lista de qué se publica, en
qué orden y cuáles son los cuatro del carrusel, con las fichas en `content/projects.ts` unidas por
el `name`; `featured` sale de la ficha y se va a la lista. Entran **todos los repositorios de
github.com/luisfdzs menos Manfisa** —se añaden Mila Barber, Cedecé y esta misma web—, y un título
sin ficha no se publica pero avisa con su nombre. El único detalle técnico feo es que el import
lleva la extensión escrita y hace falta `allowImportingTsExtensions`: los scripts de `scripts/`
importan `content/projects.ts` con el despojado de tipos de Node, que no resuelve especificadores
sin extensión. (3) `npm run shots` reescrito: la portada de cada tarjeta es **la primera pantalla de
su web en vivo**, capturada con la ventana a 1400×700 —el 2:1 exacto del hueco— en vez de recortada
de una captura de otra proporción; adiós al mapa de sufijos que había que mantener a mano. `npm run
check` limpio y `check:mobile` 21/21 en los dos idiomas sobre el build de producción.
Promocionado a `test` y a `main`, y **el panel sincronizado por CLI** a continuación
(`migrate:build` + `migrate:import` + borrado de `project-manfisa`, que `--replace` no borra): el
dataset tiene los ocho proyectos en el orden de la lista y el campo del retrato quedó vacío, con lo
que producción pasa a servir el recorte de `public/luis.webp` y se cierra de rebote el pendiente
del retrato. **El hallazgo de la sesión llegó al comprobar el resultado:** el webhook pone al día
la portada, el índice y las fichas vivas —sirviendo una vez la copia vieja antes de regenerar—,
pero **no** se lleva la ficha prerrenderizada del proyecto retirado ni el `sitemap.xml`, que es
estático del build. Los dos se van con un despliegue, así que la regla es **borrar el documento y
desplegar después**. Ver [[lista-de-proyectos]]._

_2026-08-03 (en `develop`): **el retrato del hero gana respaldo por campo.** El campo «Retrato» del
panel sigue mandando cuando tiene una imagen elegida, pero **si está vacío la web sirve
`public/luis.webp`** en vez de dejar el hueco de trama de `Figure`. Es la única excepción a la regla
del contenido, que cae por documento: un «Perfil» sin foto es un documento **válido** y por eso no
disparaba ningún respaldo. La imagen se exporta como `portrait` en `content/profile.ts` —declarada
**antes** de `profile`, que la referencia—, la pone `getProfile`, y `Profile.photo` pasa a ser
obligatorio en el tipo. **La trampa está en la consulta**: `select(defined(photo.asset) => photo
{…})` y no `photo {…}` a secas, porque proyectar un campo vacío devuelve un objeto con las claves a
`null` en vez de `null`, y eso tumbaría la validación del perfil **entero** y se caería al respaldo
con él, perdiendo lo que sí esté editado en el panel. De paso, `migrate:import` deja de subir el
retrato: subirlo dejaría de fábrica dos copias de la misma foto con la del panel ganando, que es el
fallo que esto arregla. `npm run check` limpio y `check:mobile` 21/21 en los dos idiomas sobre el
build de producción, con las dos ramas comprobadas —con foto en el panel y sin ella—.
**Pendiente:** el panel de producción sigue teniendo el JPEG con la calle detrás, así que para que
se vea el recorte hay que **vaciar el campo** en `/admin` → Perfil → *Publish* (o reemplazar ahí la
imagen por `public/luis.webp`); **nunca con `migrate:import`**, que corre con `--replace`. Ver
[[hero-sanity]]._

_2026-08-03 (en `develop`): **el retrato del hero pasa a ser un recorte con
transparencia.** `public/luis.webp` era una fotografía de Luis de traje con la calle detrás —y,
pese al nombre, un JPEG—; ahora es el busto recortado con canal alfa (WebP RGBA 200×200, 7,9 KB,
hecho con `rembg`/`birefnet-portrait`). El trabajo no está en el recorte sino en el marco: `Figure`
pone fondo, filete y esquinas a todas las imágenes, y eso era invisible mientras la foto era opaca
y lo tapaba entero — con transparencia el busto se leía como una tarjeta oscura. Lo apaga
`.hero-portrait__frame`, **una regla sin `@layer` al final de `globals.css`**, porque lo que hay
que ganar son utilidades de Tailwind y entre capas manda el orden de las capas, no la
especificidad. De paso se vio que el `rounded-full` del avatar nunca se había aplicado. `npm run
check` limpio y `check:mobile` 21/21 en los dos idiomas sobre el build de producción.
**Pendiente:** lo desplegado lee la foto de Sanity, así que el recorte no llega a producción hasta
subirlo al panel — `/admin` → Perfil → «Retrato de Luis Fernández Sangil» → *Publish*, **nunca con
`migrate:import`**, que corre con `--replace`. Es el caso general de la regla del contenido y el
síntoma engaña: **cambiar una imagen en `content/` no cambia la web mientras Sanity tenga la suya**,
y ni el `check` ni el build se quejan. Ver [[hero-sanity]]._

_2026-08-03 (rama `feature/integrar-sanity`): **el panel deja de ser opcional y pasa a mandar.**
Proyecto `Portfolio` (`3pdexisd`) con dataset `production` público, los dieciséis documentos y las
siete imágenes importados, tres orígenes CORS y dos webhooks de revalidación, uno por entorno. En
código sólo cambian dos cosas, y las dos son arreglos: los `_id` que genera
`scripts/build-sanity-import.mjs` pasan de `experience.altia` a `experience-altia` —**un `_id` con
punto es un subcamino privado en Sanity y no se lee sin token**, y ese fue el fallo de la sesión:
importación correcta, panel lleno y la web sirviendo `content/` sin un solo error, porque la regla
del contenido cae al respaldo cuando la consulta vuelve vacía— y `migrate:import` deja de usar el
argumento posicional de dataset, que está deprecado. De paso se corrige una advertencia del README
que era falsa: el `PATCH` con `rule` no hace falta si se llama al endpoint del host del proyecto en
vez de al global. `npm run check` limpio y `check:mobile` 21/21 en los dos idiomas sobre el build
de producción leyendo de Sanity. Ver [[sanity-enchufado]]._

_2026-08-03 (rama `feature/hero-interactivo`): **vuelve el escenario cinético, y ahora hay DOS
fondos con el sitio repartido entre ellos.** El encargo: mosaico de fotografías en la primera
sección, campo de nodos en el resto. `HeroStage.tsx` se recupera de `develop` tal cual y se vuelve
a montar en `Hero.tsx`; `SiteField.tsx` no se toca. Lo que sí es nuevo es **la costura**, que es
donde está todo el trabajo: `.hero-stage` pasa a ser una capa opaca (`background: var(--color-ink)`,
o la retícula asomaría por los huecos entre tejas) y se disuelve con un `mask-image` entre los 16 y
los 8 rem finales del hero, mientras el velo del texto hace lo simétrico con su propia máscara de
6 rem y el sobrante de abajo baja de `-10rem` a `-1.5rem`. **Los dos fallos de la sesión salieron de
capturas y son el mismo fallo dos veces: calibrar la costura mirando la costura.** Primero, sin
máscara, una raya horizontal de lado a lado en el borde del hero, entre grafito liso y retícula.
Después, con la disolución en 9 rem, el filete de cifras —«5 AÑOS DE EXPERIENCIA», versalitas
pequeñas y apagadas— sobre una fotografía de un armario de servidores a tres cuartos de opacidad.
La regla que queda: **el escenario tiene que estar apagado del todo antes de que empiecen las
cifras**, y los desvanecidos se miden contra ese filete. De paso, los topes del velo del texto
vuelven a los del escenario (28 / 58 / 88 %), porque detrás del texto ya no hay nodos sino fotos.
Las dieciséis imágenes de `public/hero/` dejan de estar huérfanas. `npm run check` limpio y
`check:mobile` 21/21 en los dos idiomas sobre el build de producción._

_2026-08-02 (rama `feature/hero-interactivo`): **el campo deja de ser el fondo de la portada y pasa
a ser el fondo de toda la web.** `HeroField.tsx` se convierte en `components/layout/SiteField.tsx`
y se monta una sola vez en el layout, en una capa **fija** del tamaño de la ventana: está en las
páginas interiores, no se reinicia al navegar entre ellas y no se arrastra con el scroll. Fija y no
del alto del documento porque lo contrario serían decenas de miles de nodos. Se cayeron por el
camino dos piezas que sólo tenían sentido dentro del hero: el degradado por filas que apagaba la
mitad inferior del lienzo —en una capa fija sería una franja oscura permanente al pie de todas las
pantallas— y el `IntersectionObserver`, que en algo siempre visible no se dispara nunca; el bucle
lo para ahora la pestaña. El contraste del hero vuelve a darlo entero `.hero-copy::before`, con los
topes subidos. **El fallo de la sesión, encontrado en la primera captura**: el velo global se puso
al 30 % y dejó el sitio prácticamente negro —los nodos en reposo pintan a poco más de 0,2 de
opacidad, así que taparlos con un 30 % de grafito los borra—; está en el 12 %. Y una regla nueva en
`globals.css` que conviene no perder de vista: `body > main, body > footer { z-index: 1 }`, porque
un elemento posicionado con `z-index: 0` gana al contenido de los estáticos aunque venga antes en
el documento. `npm run check` limpio y `check:mobile` 21/21 en los dos idiomas sobre el build de
producción._

_2026-08-02 (rama `feature/hero-interactivo`): **el fondo de la portada se rehace con código y
pasa a ser interactivo.** Se retira el escenario cinético entero —`HeroStage.tsx`, los cuatro
paneles dibujados y el mosaico de dieciséis fotografías— y lo sustituye `HeroField.tsx`: una
retícula de nodos en un `<canvas>` que se aparta y se enciende bajo el puntero, teje una
constelación sólo donde hay luz, lanza una onda al hacer clic y deja pasar pulsos por filas y
columnas. Sin dependencias nuevas; es el único componente de cliente de la portada. El encargo
pedía explícitamente «una animación completamente interactiva creada con código», con la
referencia de Sanity, Linear, Stripe y Vercel. **Dos fallos encontrados mirando capturas**: con el
nodo en reposo demasiado apagado el fondo sólo existía bajo el puntero —o sea, en móvil no existía—
y hubo que subir el suelo de brillo y tamaño; y al reescribir el bloque de CSS se comió el `*/` de
un comentario de la hoja de impresión y el halo del retrato volvió a salir como un nubarrón gris
alrededor de la cara. `npm run check` limpio y `check:mobile` 21/21 en los dos idiomas sobre el
build de producción, con cero desbordamiento a 390, 834, 1440 y 1920 px. Las fotografías de
`public/hero/` quedan huérfanas pero no se borran: es una decisión aparte._

_2026-08-01 (rama `feature/hero-inmersivo`): **el escenario pasa a ser la primera pantalla.** El
hero ocupa `min-h-svh` con el texto apoyado abajo; el mosaico es a sangre, con cinco columnas en
monitor ancho, dieciséis fotografías CC0 (cinco nuevas: panel de métricas, panel de parcheo, fibra
óptica y dos de código) y cuatro paneles dibujados (editor, build, terminal y topología). Se
quitaron la entradilla de tres líneas y la retícula de dos columnas del hero, y el retrato pasó a
avatar de 5 rem. **Se retiraron tres piezas frágiles** —el «el carril empieza en el 62 %», la
máscara de franja de móvil y el velo lateral—: el contraste lo dan ahora un velo anclado al texto
(`.hero-copy::before`, topes en `rem`) y una pastilla en el rótulo del puesto. El alto de teja va
en `vh`, que es lo que impide que el bucle enseñe la costura en pantallas altas y estrechas. Se
arreglaron de paso tres defectos de la hoja de impresión que la captura destapó: el halo del
retrato salía como un nubarrón negro, la pastilla como una píldora ilegible y el hero reservaba una
hoja casi en blanco. `npm run check` limpio y `check:mobile` 21/21 en los dos idiomas sobre el
build de producción, con cero desbordamiento a 390, 834, 1440 y 1920 px._

_2026-08-01 (rama `feature/hero-cinetico`): la portada estrena el
**escenario cinético**. Once fotografías CC0 descargadas vía Openverse (`public/hero/`, 152 KB,
procedencia en `CREDITS.md`, reconstruibles con `scripts/build-hero-tiles.mjs`), dos paneles de
interfaz dibujados en CSS y `HeroStage.tsx`. Sin JavaScript ni dependencias nuevas: `npm run check`
limpio, `check:mobile` 21/21 en los dos idiomas sobre el build de producción, y cero desbordamiento
a 390, 834, 1440 y 1920 px. El hero sigue siendo estático y el titular sigue siendo el nombre._

_Última actualización: 2026-08-01 — montaje inicial del proyecto. Stack de Swiftmet (Next 16 +
Sanity + Vercel) con dos diferencias deliberadas: contenido de doble fuente para que la web no
dependa de Sanity para existir, y bilingüe es/en en vez de trilingüe. Datos del CV tomados del
perfil de LinkedIn (el portfolio anterior en Astro los tenía desactualizados: faltaba el puesto
de Mobile Smart City, la ubicación decía otra cosa y no había formación)._

_2026-08-01 — todo el texto de la web pasa a estar centrado en el espacio que ocupa, con el criterio
de `sangilstudio`. El bloque `@media print` lo deshace: en papel el CV sigue alineado a la izquierda._
