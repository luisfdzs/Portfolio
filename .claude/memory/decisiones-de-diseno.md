---
name: decisiones-de-diseno
description: Oscuro sin conmutador, serif de titular, un solo acento, texto centrado, hoja de impresión, la retícula del perfil que sólo se monta si hay párrafos para llenarla — y los ajustes de maquetación que hubo que corregir mirándolo
metadata:
  type: project
---

Los tokens viven en el `@theme` de `app/globals.css` y **sólo** ahí: las utilidades de Tailwind se
generan de ellos, así que no hay forma de usar un color o un espaciado fuera del sistema.

El criterio de fondo: quien lee esto es un recruiter o un cliente que le dedica **entre treinta
segundos y dos minutos**. Todo lo que no ayude a eso, sobra.

## Las cuatro decisiones

1. **Oscuro y sin conmutador de tema.** Comprometerse con un solo modo permite ajustar el contraste
   de cada tono en vez de buscar el valor que aguante los dos. Lo que sí hay es `@media print`.
2. **Una serif de titular (Instrument Serif) sobre una sans neutra (Inter).** Es lo que separa esto
   de los cientos de portfolios que usan la misma sans para todo. La serif tiene un único peso: no
   se finge negrita.
3. **Las cifras y los datos técnicos, en monoespaciada (JetBrains Mono)** con `tabular-nums`. Es lo
   que hace que la columna de fechas de la experiencia se lea en vertical como una tabla: sin
   `tabular-nums`, «ago. 2021» y «feb. 2024» empiezan en sitios distintos.
4. **Un único acento, cobre (`#e0a458`).** Marca lo accionable y el dato destacado, nunca decora.
   8.9:1 sobre el lienzo, así que puede usarse en texto y no sólo en adornos.

Las tres tipografías van autoalojadas por `next/font`: ninguna petición a Google en tiempo de
ejecución, que en una web europea es también cuestión de RGPD.

## El texto va centrado (2026-08-01)

**Todo el texto de la web se centra en el espacio que ocupa**, siguiendo el criterio de
`sangilstudio`: `text-center` en la sección, `mx-auto` en cada caja con ancho máximo y
`justify-center` en las filas que son flex. Las tres cosas hacen falta juntas — el `text-center` no
centra la caja, y un flex reparte según `justify-content` y no según la alineación de texto.

Lo que **no** se centró, y por qué:

- **El hero de la portada NO es una excepción, aunque lo fue durante unas horas el 2026-08-02.** Al
  traer la composición del hero de sanity.io vino con ella la alineación a la izquierda, que en el
  original es la columna vertebral del diseño. Luis lo mandó centrar el mismo día, así que la regla
  vuelve a no tener excepciones. Lo que sí dejó el episodio es una pieza: el velo del texto del
  hero es ahora **una elipse centrada** y no un barrido lateral. Ver [[hero-sanity]].
- **El filete y los puntos de la línea temporal** siguen a la izquierda: son la línea del tiempo, no
  texto. El texto se centra en cada una de las dos columnas.
- **La fila de estado y año de la tarjeta de proyecto** sigue anclada a los bordes de la imagen con
  el filete estirándose en medio; juntar los dos datos en el centro los deja en un amontonamiento.
- **La cabecera de escritorio y la barra de móvil**, que son controles y ya tenían su reparto.
- **`/admin`**, que es el panel de Sanity y no la web: son instrucciones numeradas de puesta en
  marcha, y centrar una lista de pasos las hace más difíciles de seguir.
- **La imagen social** (`opengraph-image.tsx`), que es una pieza con su propia maquetación.

Cuatro cosas que hubo que ajustar además de las clases:

1. **Centrar el texto en una columna NO lo centra en la sección, y en experiencia y formación eso se
   veía (2026-08-03).** Las dos secciones maquetan cada entrada en una retícula de `13rem` (fechas o
   ubicación) más el contenido, y el `text-center` centraba el contenido **en su columna**, que
   arranca a la derecha del carril. Resultado medido en Chrome a 1440 px: el titular de cada puesto
   caía **145 px** a la derecha del centro del rótulo de la sección, y el de formación **124 px** —el
   «desfase entre el título de la sección y el contenido» que se ve de lejos, porque la cabecera sí
   está centrada en la página—. El arreglo es **una tercera columna vacía** que devuelve lo que el
   carril empuja: `13rem` en formación y `15,5rem` en experiencia, que lleva además el `lg:pl-10` de
   la línea temporal. No hace falta ningún elemento de más: la pista existe porque la declara
   `grid-template-columns`. Con ella el desfase queda en 0–1 px a 1024, 1440 y 1920. **Quien toque
   el ancho del carril, el `gap` o el sangrado tiene que recalcular ese valor**, y no hay nada que
   avise. Es el mismo error que ya está descrito arriba para las cajas con `max-w` sin `mx-auto`,
   una escala más arriba: la caja centrada era esta vez una **columna de la retícula**.

   **Corregido el 2026-08-04 en experiencia, y con el criterio del revés: lo que se centra es el
   bloque que se VE.** Con la columna vacía entera a la derecha, el titular del puesto caía en el
   eje del rótulo —la cuenta era correcta— pero el conjunto visible (filete, fechas y puesto)
   empezaba pegado al margen izquierdo y acababa 18rem antes del derecho: de lejos la sección se
   lee corrida a la izquierda, que es exactamente lo que Luis mandó arreglar. Los 18rem se
   reparten entre el margen del `ol` y la tercera columna. **`ml` y no `pl`**, porque el filete de la
   línea temporal es el borde izquierdo de esa lista: con relleno se queda clavado en el margen y las
   fechas se van solas.
   **Formación no necesita nada de esto desde ese mismo día**: al quitarse la ubicación se quedó
   sin carril, y con él se fue la retícula entera (ver [[perfil-cv]]).

   **Y ese mismo día, segunda vuelta: el desplazamiento pasa a ser UN número y el centrado exacto
   se abandona a propósito.** Dos cosas.

   - **El centrado geométrico se lee escorado a la derecha.** Con el bloque visible centrado al
     píxel (medido a 1024, 1440 y 1920), Luis seguía viéndolo corrido, y la explicación es que el
     carril de fechas es texto pequeño, monoespaciado y apagado: el ojo no pone el borde del bloque
     en el filete, lo pone en el titular del puesto, que es lo único con peso. Así que el valor
     final **no** es el que cuadra la aritmética. La regla que queda: **en esta sección manda el
     ojo, y el centro calculado es sólo el punto de partida** (`9rem`).
   - **Y para poder moverlo a ojo hubo que quitar la trampa primero.** Eran dos valores escritos a
     mano en dos sitios —`lg:ml-36` y la columna de `6,5rem`— cuya suma tenía que ser constante, y
     bajar sólo el margen **estrecha** el bloque en vez de moverlo (se lo come la columna del
     puesto, que es `1fr`), lo cual se ve como que los párrafos se mueven la mitad que el filete.
     Ahora hay dos constantes arriba de `Experience.tsx` —`SHIFT`, cuánto se desplaza, y
     `SHIFT_TOTAL`, los `15,5rem` que empuja el carril— que viajan como `--exp-shift` y
     `--exp-shift-total` en el `style` de la sección, y la columna vacía es
     `calc(var(--exp-shift-total) - var(--exp-shift))`. **Se mueve un número y se mueve el bloque
     entero.** `SHIFT_TOTAL` sólo se toca si cambian el ancho del carril, el `gap` o el `lg:pl-10`.
   - **El coste de irse muy a la izquierda, que no es evidente:** lo que se le quita al margen se lo
     lleva la columna vacía, así que la columna del puesto se estrecha igual. A `SHIFT: 1.5rem`
     —el valor con el que quedó— la columna del puesto pasa de 464 a **344 px a 1024**. Si los
     párrafos se ven estrechos en portátil, ése es el número y no el `max-w-measure`.

   **Tercera y última vuelta, el 2026-08-04, y desmonta las dos anteriores: lo que se mueve es la
   CABECERA, no la lista.** Encargo de Luis, y su diagnóstico es la solución entera: «el header y el
   `<ol>` están centrados como elementos HTML, pero yo lo que quiero es centrar los textos, y el
   espacio se reparte entre dos div». Efectivamente. Todo lo de arriba —la columna vacía, el margen
   del `ol`, el `SHIFT` a ojo— intentaba **traer el texto al eje de la sección** moviendo la lista, y
   eso no se puede hacer sin estrechar la columna del puesto o dejar el filete descolgado: son dos
   columnas, y el eje del texto nunca es el de la sección. Al revés sí sale gratis. La cabecera
   recibe un sangrado (`textIndent="lg:pl-72"`, prop nueva y opcional de `SectionHeading`) igual a lo
   que el carril empuja el texto —2,5rem del `lg:pl-10` + 13rem de fechas + 2,5rem de `gap` =
   **18rem**— y su rótulo cae en el eje del titular del puesto. Consecuencias:

   - **La lista vuelve a ser lo que era**: `border-l border-line` a secas y retícula de dos
     columnas. Se van el `lg:ml-36`, la columna vacía de `6,5rem` y con ellos la aritmética
     duplicada; queda **un** número, y en el sitio donde se aplica.
   - **Es `pl` y no `ml` en la cabecera**, y esta vez por el motivo contrario al del `ol`: el filete
     de debajo del rótulo pequeño tiene que seguir cruzando la sección de lado a lado. Con margen se
     acortaría por la izquierda.
   - **El rótulo pequeño se centra como grupo**, así que «02 · icono · EXPERIENCIA» queda centrado
     entero y la palabra sola cae un poco a la derecha del eje. Es el comportamiento de siempre, no
     lo introduce el sangrado.
   - Medido a 1024, 1440 y 1920 con `reducedMotion`: el centro del `<h2>` y el del `<h3>` del puesto
     coinciden **al píxel** (864 vs 865 a 1440; el píxel es el `border-l` de la lista). Cero
     desbordamiento y móvil intacto, porque el sangrado es `lg:`.
2. **`link-underline` crece desde el centro**, no desde la izquierda. Un subrayado que nace en el
   borde izquierdo de una línea centrada arranca en un punto que no coincide con nada.
3. **El bloque de nota de la ficha de proyecto lleva el filete arriba**, no a la izquierda: un filete
   lateral marca el margen desde el que arranca cada línea, y con el texto centrado no hay tal
   margen.
4. **El número de cada punto destacado va encima del párrafo**, no a su izquierda, por lo mismo.

## En papel NO va centrado

El bloque `@media print` deshace el centrado con `body * { text-align: left !important }`. Un CV
impreso con los párrafos centrados se lee peor —el ojo pierde el punto de retorno de cada línea— y es
justo lo que hace un currículum de plantilla. Centrar es una decisión de la web como pieza de diseño,
no del documento imprimible.

## Hay hoja de impresión, y no es un detalle

Un recruiter que quiere guardar el CV pulsa **Ctrl+P**: es el camino más corto entre esta web y una
carpeta de candidaturas. Sin `@media print` saldrían diez páginas de fondo negro. Con él sale en
papel blanco, sin la navegación (`data-print="hide"`), sin las animaciones y **con las URLs de los
enlaces escritas al lado**, porque en papel un enlace no se puede pulsar. Los `mailto:` se excluyen
de eso: el texto del enlace ya es la dirección y saldría dos veces.

## Tres cosas que hubo que corregir mirándolas

Ninguna la habría detectado un test. Están aquí porque son el tipo de fallo que vuelve.

1. **Los paddings de secciones contiguas se sumaban.** Con `py-section` en las seis, entre el final
   de una y el rótulo de la siguiente quedaban 18rem de vacío y la página parecía partida. Ahora
   hay una utilidad `section-block` que aplica **la mitad** de `--spacing-section` arriba y abajo,
   así que la suma de dos adyacentes es exactamente el token — que es lo que ese token dice ser: el
   aire *entre* bloques.
2. **La sección «Perfil» dejaba media pantalla en blanco.** Es la única que es prosa y nada más, y
   con una columna de medida de lectura a 1400 px el vacío de la derecha se leía como un error de
   maquetación justo en el bloque más personal. Ahora la entradilla va a ancho de medida y **los
   párrafos siguientes a dos columnas**; sólo los siguientes, porque partir la entradilla obligaría
   a subir y bajar la vista para leer las tres primeras frases.
3. **El hero forzaba altura de pantalla.** `min-h` + `justify-center` metía un hueco muerto antes de
   la primera sección y recortaba en móvil apaisado. El contenido ya llenaba la pantalla solo.

   **Esto se revirtió a propósito el 2026-08-01**, y la distinción importa: el hero vuelve a medir
   una pantalla (`min-h-svh`), pero con `justify-end` y no `justify-center`, y porque ahora hay algo
   que llenar ese alto — el fondo a pantalla completa: primero el escenario cinético de
   fotografías y, desde el 2026-08-02, el campo interactivo ([[campo-interactivo]]). Lo que
   sigue siendo cierto es el diagnóstico: **`justify-center` es lo que metía el hueco muerto**. Con
   el texto apoyado abajo no hay hueco, y el `svh` (no `vh`) es lo que evita el recorte en móvil.

Y un cuarto, pequeño pero visible: el icono de enlace externo en `opacity-0` **seguía ocupando su
hueco** en la línea de la empresa, así que metía un espacio de más entre «Altia» y el «·» del
cliente. Se quitó; el subrayado al pasar por encima ya dice que es un enlace.

## La retícula del perfil se monta según cuántos párrafos haya (2026-08-04)

El bloque de detrás de la entradilla del perfil se maquetaba en `lg:grid-cols-2` **fijo**. La razón
era buena: es la única sección del sitio que es prosa y nada más, y con una sola columna de medida de
lectura, a 1400 px quedaba la mitad derecha en blanco. Pero cuando el perfil bajó de tres párrafos a
dos, sólo quedaba **uno** detrás de la entradilla — y la retícula lo pintaba en la columna izquierda
dejando la derecha vacía, o sea produciendo exactamente el vacío que existía para evitar. Luis lo vio
antes de que lo viera nadie más: «queda raro el segundo texto, porque borré el que había a su
derecha».

Ahora la condición es `rest.length > 1`: con dos o más párrafos, la retícula; con uno, `mx-auto
max-w-measure`, la misma caja que la entradilla. **Se cambia el contenedor entero y no una clase
suelta**, porque lo que sobra con un párrafo es la retícula, no una de sus columnas.

**How to apply:** una maquetación en columnas fijas es una apuesta sobre cuántos elementos va a
haber, y en este repo el contenido lo edita otra persona en un panel — así que la apuesta se pierde
sin que nada avise. Condicionar el contenedor cuesta tres líneas. Vale para cualquier sección que
reciba una lista de longitud variable.

Medido a 1440 px sobre el build de producción: el bloque va de 388 a 1052 px en una sección que va de
80 a 1360, o sea centrado al píxel; a 390 px no cambia nada, porque la retícula era `lg:`.

## Detalles que responden a un porqué

- **Las etiquetas de tecnología son texto, no logotipos.** Reproducir el logo de React o de
  Microsoft insinúa una relación que no existe, veinte logos de colores rompen la paleta, y a tamaño
  de etiqueta la mitad no se distinguen. El nombre escrito se busca con Ctrl+F, que es lo que de
  verdad hace un recruiter comprobando si aparece «.NET».
- **Las secciones van numeradas** (01…06). Convierte una página larga en un documento con índice
  implícito y reduce la sensación de scroll infinito que hunde a los portfolios de una página. La
  numeración va **escrita a mano en cada sección**, así que cambiar el orden de la portada obliga a
  renumerar: ver [[navegacion-y-orden]].
- **El rótulo de sección tiene dos anchos máximos, no uno**: 24ch en móvil y **52ch en escritorio**,
  para que un rótulo de una frase quepa en **una sola línea** (2026-08-03, por encargo). El que lo
  pedía era «Cinco años entregando software en producción», que a 24ch se partía en tres líneas y
  hacía que el titular de la sección más importante del CV pareciera un párrafo. No es
  `max-w-none`: sin tope, en 1920 px el rótulo se estiraría a los 80rem del contenedor y dejaría de
  leerse como un titular.
- **La tarjeta de proyecto es pulsable entera**, con un `<span absolute inset-0>` dentro del enlace
  del `<h3>`. En móvil el área pulsable es el dedo, y obligar a acertar en un enlace de 13 px es
  hostil.
- **No hay formulario de contacto.** Añade backend, servicio de correo, captcha y una pantalla de
  «gracias», y a cambio pide confiar en que el mensaje ha salido. Un `mailto:` deja el mensaje en la
  bandeja de enviados de quien escribe, que es donde lo quiere alguien que escribe por trabajo. Y la
  dirección escrita entera se puede copiar a mano, que es lo que hace la mitad de la gente.
- **Las apariciones al hacer scroll son CSS puro** (`animation-timeline: view()`), sin JavaScript, y
  el fallback en navegadores sin soporte es que el contenido **se ve** — nunca contenido invisible
  por una animación que no corre.
- **El hueco de imagen sin imagen se ve tramado** (`placeholder-grid`), no gris. Un hueco declarado
  es información; un hueco camuflado es un descuido que parece intencionado.

## Las capturas de los proyectos

`scripts/build-project-shots.mjs` recorta las capturas a **2:1 anclado arriba e izquierda**. Arriba,
porque ahí están la cabecera y el titular, que es lo que hace que se reconozca como una web. A la
izquierda, porque una web se maqueta de izquierda a derecha: con el recorte **centrado** —lo primero
que se probó— salía «NGIL STUDIO» en vez de «SANGIL STUDIO» y un titular de Manfisa empezado por la
mitad de la primera letra.

Y 2:1 y no 16:10 porque el viewport da 698 px de alto: a 16:10 habría que recortar 225 px por lado y
ahí se va la tercera columna de la cuadrícula de Bonsái.
