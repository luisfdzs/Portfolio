---
name: cover-flow
description: El carrusel 3D de proyectos de la portada — todos los proyectos y en bucle infinito desde el 2026-08-03, la cinta de correr de tres copias, la geometría, por qué se mide por el ancho y no con view-timeline-inset, y la trampa de depurarlo en una pestaña oculta
metadata:
  type: project
---

Los proyectos de la portada van en un **carrusel «cover flow»** en vez de la
retícula de dos columnas que había hasta el 2026-08-01. Referencia visual pedida por Luis:
`blossom-carousel.com/docs/examples/advanced/cover-flow`. **No se instaló la librería**: el efecto
del ejemplo es CSS puro dirigido por el scroll, que es la técnica que este proyecto ya usa en
`reveal`, así que la dependencia no aportaba nada.

Vive en el bloque «COVER FLOW» de `app/globals.css` y en `components/ui/CoverFlow.tsx`.

## EL CARRUSEL ES INFINITO: LA CINTA DE CORRER (2026-08-03)

Encargo de Luis, directo en `develop`: «que cuando llegue al último vuelva a aparecer el primero».
Se hace en `CoverFlow.tsx`, **sin tocar el efecto**: la lista se pinta **tres veces** (`COPIES = 3`),
quien mira vive en la copia del medio (`HOME = 1`) y, cuando el scroll se ha ido una lista entera
hacia un lado, se le resta o se le suma esa lista de golpe. La tarjeta centrada antes y después del
salto **son la misma tarjeta en el mismo sitio de la pantalla**, así que el salto no se ve.

Lo que hay que saber si se toca:

1. **Tres copias, no dos.** Para dar la vuelta **en los dos sentidos** hace falta una copia de sobra
   a cada lado. Con dos, tirar hacia la izquierda desde la primera tarjeta se come el borde del
   contenedor antes de que haya sitio donde recolocarse.
2. **El salto se hace con el scroll QUIETO** —140 ms sin eventos de scroll—. Tocar `scrollLeft` en
   marcha aborta el desplazamiento suave del navegador y mata la inercia del dedo: es la sensación
   exacta de carrusel roto. Esperar sale gratis porque hay una lista entera de margen a cada lado,
   así que nadie llega al borde de verdad mientras el gesto dura.
3. **La cuenta es el resto de la división**, no un `if` por sentido:
   `wrapped = ((drift % set) + set) % set`. Así un arrastre de varias listas de una pasada se
   recoloca igual de bien — comprobado saltando a `scrollWidth` de golpe: vuelve a la banda del
   medio y no hay callejón sin salida.
4. **La geometría se vuelve a medir en cada corrección**, no una vez al montar: el ancho de tarjeta
   es un `clamp()` en `vw` y cambia con la ventana.
5. **Las copias van `inert`, no `aria-hidden`.** `inert` las saca del tabulador **y** del árbol de
   accesibilidad; `aria-hidden` a secas dejaría veinticuatro enlaces alcanzables con el teclado
   anunciando ocho proyectos. Comprobado con Playwright: `focus()` sobre los dieciséis enlaces
   clonados no mueve `document.activeElement`.

**El CSS no se enteró**, y eso era la señal de que el enfoque era el bueno: cada tarjeta se anima por
su propia posición (`view-timeline` va en cada `li`), así que las copias giran solas. Sólo hubo dos
cambios de hoja de estilos, los dos consecuencia y no mecanismo:

- **Las copias no se imprimen**: `.cover-flow-item[data-clone] { display: none }` en el `@media
print`. Sin eso, la retícula de papel saldría con los ocho proyectos tres veces, o sea seis hojas.
- **Los botones pierden el estado apagado.** En un bucle no hay principio ni final, así que ninguno
  de los dos puede quedarse sin nada que hacer — lo que era el punto 3 de la documentación del
  componente («que no haya un control que no hace nada») se cumple ahora por construcción.

El precio, dicho claro: **el HTML de la sección se triplica** (24 tarjetas para 8 proyectos). El
payload de RSC no, porque los hijos se serializan una vez y se pintan tres; y las imágenes tampoco,
porque son las mismas URLs y van perezosas. Si algún día molesta, la alternativa es clonar sólo los
extremos (tantas tarjetas como quepan en la ventana) a cambio de una lógica de umbrales bastante
peor.

## SALEN TODOS LOS PROYECTOS, NO CUATRO (2026-08-03)

Encargo de Luis, rama `feature/portada-todos-los-proyectos` en worktree propio: «quiero que todos
los proyectos se vean también en la página principal». Hasta entonces la portada enseñaba los cuatro
`featured` y remitía a `/projects`. `getFeaturedProjects(4)` pasa a ser **`getCarouselProjects()`**,
que devuelve la lista entera con los destacados delante.

- **El argumento viejo era el scroll, y no se sostenía en un carrusel.** Las tarjetas se pasan de
  lado: ocho ocupan lo mismo que cuatro. El coste sí era real —la mitad del trabajo sólo se veía
  entrando en una segunda página—, así que el cambio es a favor.
- **`featured` no se retiró: se le cambió el trabajo.** Ahora decide **por dónde abre** el carrusel
  (destacados delante, resto detrás, cada grupo en el orden de la lista; `Array.prototype.sort` es
  estable). Dejar una bandera que no hace nada es una trampa para quien la vea en el panel, y
  borrarla habría tocado la lista, el tipo, la consulta y el esquema de Sanity para no ganar nada.
- El enlace al índice dejó de ser condicional (`total > featured.length` ya nunca era cierto) y pasó
  a decir «Ver el índice de los 8 proyectos». **Esa misma tarde el índice se retiró y el enlace se
  cayó con él**: con los ocho aquí, era una segunda URL con las mismas ocho tarjetas. Ver
  [[lista-de-proyectos]].
- Consecuencia **en papel**: la retícula de impresión pasa de cuatro tarjetas a ocho, o sea de una
  hoja de proyectos a dos.

## La geometría, en tres piezas

- `--cover-flow-card` es lo que **mide** la tarjeta; `--cover-flow-step` (0,6 · tarjeta) lo que
  **avanza** el scroll de una a la siguiente. Al ser el paso más corto que la tarjeta, las
  tarjetas se solapan — y ese solape ES el efecto. Se consigue con **márgenes laterales
  negativos**, no con posicionamiento absoluto: así cada tarjeta conserva su alto natural y la
  fila se iguala con `align-items: stretch`.
- **El ancho del carrusel es lo que decide cuánto dura el giro.** Con `animation-range: contain`,
  el giro completo ocupa `ancho − tarjeta`, así que un `max-width` de `tarjeta + 2,6 · paso` deja
  el giro en 2,6 pasos: la vecina inmediata a media vuelta y la siguiente al máximo.
- El **`z-index` se anima** en una ventana estrecha (44–56 %) alrededor del centro. Sin él la
  tarjeta de la derecha —posterior en el DOM— tapa el borde de la centrada. La ventana es estrecha
  porque `z-index` **no se anima a saltos**: se interpola como entero y se redondea, así que con
  fotogramas repartidos (0 / 40 / 60 %) la vecina empataba con la centrada y ganaba por orden de
  DOM.

## Por qué NO se usa `view-timeline-inset`

Es el camino evidente —recortar el scrollport en vez de medirlo— y lo que hace el ejemplo de
referencia. Se descartó porque obliga a un `calc()` con porcentaje (`50% − algo`) y porque medirlo
por el ancho da gratis lo que faltaba: el carrusel deja de ser una banda a sangre y pasa a ser una
**ventana centrada**. A ancho completo, en un monitor de 1900 px quedaba medio metro de vacío a la
izquierda de la primera tarjeta, porque un carrusel centrado sólo tiene tarjetas a un lado cuando
está al principio.

## Dos fallos reales que costaron tiempo

1. **El relleno que centra la primera y la última tarjeta va en la PISTA (`<ul>`), y la pista
   necesita `width: max-content`.** Puesto en el contenedor con scroll, el relleno se come el
   ancho de contenido —265 px de caja útil en una pantalla de 1900— y el desbordamiento se calcula
   contra esa caja: el recorrido se quedaba en 185 px cuando hacen falta 807 para centrar la
   cuarta tarjeta, así que **las dos últimas no se podían mirar de frente**. Un `<ul>` es de
   bloque, y con el ancho automático se queda clavado al ancho del contenedor, así que el
   `max-content` es imprescindible para que el recorrido salga exacto.
2. **Las animaciones dirigidas por scroll NO CORREN en una pestaña oculta** (`document.hidden`).
   Depurando con las herramientas de navegador remotas, la pestaña se quedaba en segundo plano y
   `animation.currentTime` era `null` en **todas** las líneas de tiempo —incluida la de `reveal`,
   que llevaba meses funcionando—. Eso manda a buscar el fallo en el CSS, donde no está. Antes de
   dudar del CSS: comprobar `document.hidden`.

## Lo que hay de JavaScript, y por qué

Desde el 2026-08-03, dos cosas: **los dos botones** y **el salto del bucle** (arriba).
`CoverFlow.tsx` era de cliente sólo por **los dos botones**. Con el dedo se arrastra y con el
tabulador el navegador trae al foco cada tarjeta, pero una rueda de ratón no hace scroll
horizontal y la barra está oculta a propósito: sin los botones, quien mira esto en un portátil con
ratón no pasa de la primera tarjeta. Miden con `offsetLeft`, que **no cuenta las
transformaciones** — el rectángulo en pantalla de una tarjeta girada no dice dónde está su sitio
en la fila.

No hay puntos indicadores: serían enlaces a un ancla, y el navegador, al llevar el foco a un ancla
dentro de un contenedor con scroll, desplaza también la página.

## Los dos fallbacks

- **Sin soporte de `animation-timeline` o con `prefers-reduced-motion: reduce`**: carrusel
  horizontal normal, tarjetas separadas por un hueco y ninguna girada. Mismo criterio que
  [[decisiones-de-diseno]]: el fallback nunca esconde contenido.
- **En papel**: se deshace en la retícula de dos columnas que tenía la sección antes. Sin eso, un
  `overflow-x` imprimiría el primer proyecto y recortaría todos los demás; y a una tarjeta por fila
  la captura queda a 19 cm con un hueco de 9,5 cm de alto, así que ya con cuatro proyectos se comía
  dos páginas.

## Lo que cuesta, dicho claro

En una retícula se verían todos de un golpe; aquí hay uno de frente y dos asomando. Se compensa con
el solape —que hace evidente que hay más a los lados— y con los botones. Y desde que no hay índice
([[lista-de-proyectos]]) esto es lo único que hay: si alguna vez se mide que la gente no pasa de la
primera tarjeta, la alternativa es volver a la retícula **en `Projects.tsx`**, no reabrir una
segunda página.
