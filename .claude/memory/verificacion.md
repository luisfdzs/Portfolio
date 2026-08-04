---
name: verificacion
description: Qué comprueba check:mobile, los fallos reales que encontró y por qué el navegador de Claude no sirve para verificar móvil
metadata:
  type: project
---

Dos puertas, las dos obligatorias antes de promocionar una rama:

```bash
npm run check          # typecheck + ESLint + Prettier
npm run check:mobile   # 23 comprobaciones en Chrome real a 390×844
```

`check:mobile` necesita el servidor levantado y usa **el Chrome ya instalado** vía
`playwright-core` (`executablePath`): no descarga navegadores. Acepta `BASE` y `LOCALE`, así que
también se pasa contra el entorno de test desplegado, que es lo que cierra el paso `test` → `main`:

```bash
BASE=https://luisfernandezsangiltest.vercel.app npm run check:mobile
LOCALE=en npm run check:mobile
```

Estado el 2026-08-01: **21/21 en local, contra test desplegado y contra producción**, en los dos
idiomas. Desde el 2026-08-03 son **23** comprobaciones (las dos de la sección activa del menú), y
van 23/23 en local sobre el build de producción en los dos idiomas.

**El navegador de Claude tiene una segunda trampa, encontrada el 2026-08-03:** el Chrome que maneja
la extensión **no anima el scroll**. `window.scrollTo({ top: X })` con `scroll-behavior: smooth` se
queda donde estaba —comprobado en un iframe sintético con la hoja de estilos mínima, así que no es
de esta web—, y eso hace parecer que **ningún** enlace del menú funciona. Si hay que medir un
aterrizaje de scroll, se hace con Playwright y `reducedMotion: 'reduce'`, que lo vuelve instantáneo
de verdad.

## El navegador de Claude NO sirve para verificar móvil

`mcp__claude-in-chrome__resize_window` cambia el tamaño de la ventana, pero la captura sigue
llegando a 1568 px de ancho y **con la maquetación de escritorio**: se redimensionó a 420×900 y el
pantallazo seguía mostrando la cabecera y el hero a dos columnas. No es un fallo de la herramienta,
es que la captura no refleja el viewport CSS.

**Por eso existe `check:mobile`.** Es la única forma de comprobar el móvil en este proyecto. Cuando
haya que verificar algo de móvil, no se pierde el tiempo con capturas: se añade una comprobación al
script. Y **`check:mobile` necesita el servidor levantado**: sin `npm start` (o `npm run dev`, o un
`BASE=` apuntando a un despliegue) el script se queda esperando y no imprime nada — no falla, se
cuelga, que es peor de diagnosticar.

## Para lo que SÍ sirve el navegador de Claude: leer lo que Luis edita en el inspector (2026-08-04)

Luis reescribe textos **editando el HTML de la web en producción** con las herramientas de desarrollo
y luego pide traerlos al repo. Eso se recoge así, y las tres condiciones importan:

1. **La pestaña tiene que estar en el grupo de pestañas de la extensión.** Fuera de él Claude no ve
   ni el DOM ni la consola: `tabs_context_mcp` responde «no tab group exists» o sólo lista pestañas
   propias. Lo arregla Luis arrastrando su pestaña al grupo.
2. **Abrir la URL en una pestaña nueva no vale para nada.** Las ediciones del inspector viven en la
   memoria de *esa* pestaña; una nueva descarga el HTML desplegado, sin ellas. Por el mismo motivo,
   **recargar la pestaña las borra**: hay que avisar antes de tocar nada.
3. **El diff se hace contra el servidor, no contra el repo**: `fetch(location.href, {cache:
   'reload'})` desde la propia pestaña, `DOMParser`, nodos de texto de `<main>` y una alineación LCS
   para ver lo viejo y lo nuevo emparejados en orden. Hay que descartar los clones del carrusel
   (`[data-clone]`) y los nodos que inyecta la extensión, o salen diferencias falsas.

Contra el repo tampoco serviría: lo desplegado se sirve de Sanity, así que un texto que ya esté
sincronizado aparecería como cambio.

## Los cuatro fallos reales que encontró

Ninguno se veía en escritorio ni lo habría cazado el typecheck:

1. **El favicon devolvía 404 en todo el sitio.** `app/icon.tsx` en la raíz de `app/` escribía el
   `<link rel="icon">` correcto, pero la ruta no existía porque el fichero no colgaba de ningún
   layout (este proyecto no tiene `app/layout.tsx`: cada grupo de rutas es su propia raíz). Se
   detectó porque el script vigila los errores de consola. Ver [[arquitectura-web]].
2. **Un error de consola no dice qué recurso falla.** El mensaje era «Failed to load resource: 404»
   y nada más. Se añadió un `page.on('response')` que registra estado y URL; sin eso hay que abrir
   las herramientas del navegador a mano.
3. **`networkidle` resolvía antes de que la ruta cambiara.** La navegación de Next es de cliente, así
   que la red se queda quieta enseguida: la comprobación de «la ficha carga» fallaba con la URL del
   índice, dando a entender que el enlace estaba roto. Se cambió por `waitForURL`.
4. **La imagen de apertura social devolvía 500 en todo el sitio.** Satori —el motor de
   `ImageResponse`— exige `display: flex`, `contents` o `none` en cualquier `div` con **más de un
   hijo**, y la interpolación `{t.nav.projects} · CV` creaba dos hijos: la variable y el texto. El
   error era «failed to pipe response» y nada más, y el favicon —que tiene un único hijo de texto—
   funcionaba, lo que despistó al diagnosticar.

   Este es el fallo que justifica la comprobación de **metadatos sociales**: un navegador **nunca**
   pide `og:image`; sólo la piden LinkedIn, WhatsApp o Slack al desplegar la vista previa. Así que
   era invisible en local, invisible en producción y visible justo el día que se comparte el enlace
   en una candidatura. Se añadió una comprobación que lee el `<meta>` del HTML y pide la imagen a
   mano.

   Detalle del propio chequeo: `og:image` se escribe **absoluta y apuntando al dominio canónico de
   producción** (lo exige `metadataBase`), así que hay que reconstruir la URL contra `BASE` o una
   revisión en local acaba comprobando producción. La primera ejecución lo hizo, y de paso delató
   que producción seguía con el build roto.

Y dos falsos positivos del propio script, corregidos: el enlace «Saltar al contenido» mide 1×1 a
propósito (`sr-only`, sólo se ve al recibir el foco) y se contaba como área pulsable pequeña; y la
holgura del pie sobre la barra sale **−1 px** por redondeo, porque el hueco reservado por el
`<body>` y el alto de la barra son los dos exactamente 4rem.

## Lo que vigila, y por qué cada cosa

- **Desbordamiento horizontal** en portada y ficha. Cuando falla, imprime **el elemento
  culpable** con su clase y su texto, porque «desborda 240 px» sin más obliga a buscarlo a mano. El
  candidato número uno es el correo a tamaño de titular en una caja de 390 px.
- **El panel del menú midiendo 0 px de alto.** El `backdrop-blur` de la barra convierte al elemento
  que lo contiene en bloque contenedor de sus descendientes `fixed` y el panel se colapsa: se ve
  correcto en el DOM y no se ve en pantalla.
- **El panel no solapa la barra**, o taparía los iconos con los que se cierra.
- **Contraste de las entradas del menú** (calculado, no supuesto): papel sobre papel es el fallo
  clásico al heredar el color que la cabecera usa sobre un hero oscuro.
- **El pie no queda debajo de la barra fija.**
- **Áreas pulsables de 24×24** (WCAG 2.2), sumando lo que amplía la utilidad `tap` con su `::before`.
- **`href()` devuelve rutas absolutas**, comprobado **desde una ficha** y no desde la portada: es
  donde una ruta relativa se encadena y da 404.
- **Los dos `<nav>` tienen nombres accesibles distintos.** Cabecera y barra de móvil coexisten en el
  DOM; si comparten `aria-label`, un lector de pantalla las lista idénticas.
- **La sección activa del menú** (desde el 2026-08-03, y son las dos comprobaciones que llevan la
  cuenta de 21 a **23**): sobre el hero **ninguna** entrada resaltada, y dentro de una sección
  **exactamente una**. Dos a la vez es el fallo típico de resaltar «la más visible» en vez de usar
  una línea de lectura. Ver [[navegacion-y-orden]].
- **Que `/es/projects` redirige a la portada.** El índice se retiró y esa URL estuvo en el
  `sitemap.xml`. El 404 lo cazaría igual el escuchador de respuestas, pero diciendo sólo «HTTP 404»
  sin explicar qué se esperaba.
- **Cero errores de consola.**

Detalle del recorrido de la ficha, que cambió al retirarse el índice: empieza en la portada y
selecciona la tarjeta con **`li:not([data-clone])`**. Las otras dos copias del carrusel son clones
`inert` y un clic sobre ellas no llega a ningún sitio ([[cover-flow]]).

## Lo que NO se ha verificado

- **El panel con un proyecto de Sanity de verdad.** Los esquemas compilan y `/admin` responde con el
  aviso de falta de configuración, pero nadie ha abierto el Studio contra un dataset. Los
  identificadores de documento que espera `sanity/structure.ts` (`profile`) y los que genera
  `migrate:build` coinciden **por construcción**, no por prueba.
- **El webhook de revalidación.** La ruta existe y replica la de Swiftmet, incluida la advertencia
  del `PATCH` con `rule`, pero sin proyecto de Sanity no hay nada que dispare.
- **La hoja de impresión, a ojo.** Las reglas están y `.reveal` se neutraliza, pero nadie ha mirado
  un PDF.
