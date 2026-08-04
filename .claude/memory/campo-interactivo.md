---
name: campo-interactivo
description: El fondo de TODA la web — una retícula de nodos dibujada en canvas que reacciona al puntero; por qué va fija en el layout, qué garantiza la legibilidad y qué se rompe al tocarlo
metadata:
  type: project
---

El fondo de **toda la web** es un campo interactivo: una retícula de mil a tres mil nodos dibujada
en un `<canvas>` fijo del tamaño de la ventana, por debajo de todas las secciones y de todas las
páginas. **Con una excepción: el hero de la portada**, que tiene su propio montaje encima
(`.hero-stage`, ver [[hero-sanity]]) y lo tapa. El campo aparece en cuanto se baja del hero, y es
el fondo de las páginas interiores. El puntero abre un pozo de luz —los nodos se apartan, se encienden en cobre y tejen entre
ellos una constelación que sólo existe donde hay luz—, un clic lanza una onda que recorre la
pantalla y cada dos o cinco segundos un pulso viaja por una fila o una columna dejando estela.

Añadido el **2026-08-02** en la rama `feature/hero-interactivo`. Nació **sustituyendo al escenario
cinético** (el mosaico de dieciséis fotografías CC0 en cinco columnas, `HeroStage.tsx`), que se
retiró entero. El encargo fue explícito: «no quiero imágenes dentro de carruseles en movimiento,
quiero una animación completamente interactiva creada con código», con la referencia de las
portadas de Sanity, Linear, Stripe y Vercel.

**Al día siguiente el reparto cambió y ya no es «uno u otro», son los dos** (2026-08-03, misma
rama): «que en la sección principal se vea el carrusel de fotos dinámico que hay en develop, y en
el resto de la web el fondo de red tal cual está ahora». Así que `HeroStage.tsx` volvió y los dos
fondos conviven — mosaico en la primera pantalla, campo en todo lo demás. Cómo se lleva la costura
entre ellos está más abajo.

**El mismo día pasó de ser el fondo del hero a ser el fondo del sitio** (segundo encargo, igual de
explícito: «este hero como fondo para toda la web»). `HeroField.tsx` se convirtió en
`components/layout/SiteField.tsx` y se monta una sola vez en `app/(site)/[locale]/layout.tsx`.

Piezas: `components/layout/SiteField.tsx` (todo el motor), el bloque «Campo interactivo del sitio»
de `app/globals.css` (atmósfera, retícula de planos, velo), la regla de apilamiento de la capa base
de `globals.css` y `components/sections/Hero.tsx`.

## Lo que cambió al salir del hero, y por qué

- **`fixed` y del tamaño de la ventana, nunca del alto del documento.** Un lienzo tan alto como la
  página serían decenas de miles de nodos y un mapa de bits de varios megapíxeles. Fijo son siempre
  los mismos dos mil y el coste no depende de lo que mida el contenido. De regalo: el texto viaja
  sobre una superficie quieta, y al navegar entre páginas del mismo idioma el lienzo **no se
  reinicia**, porque el layout no se vuelve a montar.
- **Se cayó `rowFade`**, el degradado por filas que apagaba la mitad inferior del lienzo. En una
  capa fija sería una franja oscura permanente al pie de **todas** las pantallas del sitio. El
  contraste del bloque de la portada vuelve a darlo entero `.hero-copy::before`, cerrando al 90 %
  en vez de en grafito puro (con el campo también en la sección siguiente, un rectángulo opaco al
  final del hero se lee como un corte).
- **Se cayó el `IntersectionObserver`.** Una capa fija está siempre a la vista: no se dispararía
  nunca. Quien para el bucle ahora es `visibilitychange`.
- **Se cayó la corrección de scroll del puntero.** Con la capa fija, `clientX`/`clientY` ya son las
  coordenadas del lienzo.
- **Bajó el techo de todo** (`DOT_ALPHA.max`, `LINK_FROM`, opacidad de los halos y del rastro, y el
  intervalo entre pulsos se abrió a 2,4–5,2 s). Encendido a tope era espectacular detrás de un
  titular de seis rem y ruidoso detrás de un párrafo de diecisiete píxeles.
- **El orden de capas pasó a ser explícito.** El campo es un elemento posicionado con `z-index: 0`,
  y en el orden de pintado de CSS eso va **por encima** del contenido de los elementos estáticos
  aunque esté antes en el documento. De ahí `body > main, body > footer { position: relative;
  z-index: 1 }` en `globals.css`. Se eligió esto y no `z-index: -1` en el campo porque el negativo
  depende de que el fondo del `body` se propague al lienzo de la raíz, que funciona pero se rompe
  el día que alguien le ponga un fondo al `html`. **Si se añade un hermano directo del `<body>` que
  tenga que verse, hay que subirlo también.**

**Por qué el cambio no es cosmético:** el mosaico era material grabado en bucle, indiferente a
quien estuviera delante. Esto es un sistema que responde. En un portfolio de desarrollo, un fondo
generado con código dice en tres segundos lo que el CV tarda dos pantallas en argumentar — y de
paso quita 281 KB de fotografías de la primera pantalla. Ver [[decisiones-de-diseno]].

## El reparto entre CSS y lienzo, que es la regla del bloque

**El CSS pone lo que no cambia y el lienzo lo que responde.** La atmósfera desenfocada
(`.site-field__aurora`) y la retícula de planos (`.site-field__grid`) son degradados grandes que el
compositor dibuja una vez; pedírselos al contexto 2D sesenta veces por segundo costaría más que
todos los nodos juntos. Y al revés: nada de lo que reacciona al puntero está en CSS, porque haría
falta escribir una variable CSS —y con ella un recálculo de estilo— por fotograma.

## Las seis cosas que no son obvias

1. **EL MISMO FALLO, DOS VECES, Y LAS DOS SE VIERON EN UNA CAPTURA: un fondo que hay que buscar no
   es un fondo.** Primero con el nodo en reposo a 0,85 px y opacidad 0,14: el campo sólo existía
   alrededor del puntero, y **en móvil la primera pantalla era negra con un chip**. Y otra vez al
   pasarlo a fondo del sitio, cuando el velo global se puso al 30 % «para no competir con el
   texto»: los nodos en reposo pintan a poco más de 0,2 de opacidad, así que un 30 % de grafito
   encima los borra y la web entera se quedó negra. Está en el **12 %**. La regla, en las dos
   direcciones: el suelo tiene que verse sin hacer nada (`AMBIENT.base`, `DOT_ALPHA.min`,
   `DOT_RADIUS.min`) y lo que la interacción añade es el relieve, no la existencia; y si algo no se
   lee, se toca la pieza que protege ESE texto, nunca la manta.
2. **Los nodos se pintan en doce grupos de brillo, no uno a uno, y es lo que lo hace fluido.** Un
   color propio por nodo son miles de cambios de `fillStyle` y miles de `fill()` por fotograma, sin
   posibilidad de que el navegador agrupe nada. Redondeando el brillo a doce escalones, cada
   escalón cabe en un `Path2D` y el fotograma se pinta con doce llamadas. Doce y no seis porque por
   debajo se ve el escalón en el borde del halo.
3. **El suavizado va en `1 - e^(-dt·k)`, no en un factor por fotograma.** `valor += (destino -
   valor) * 0.12` avanza el doble en una pantalla de 120 Hz que en una de 60: el mismo código se
   siente pastoso en un portátil y nervioso en un monitor bueno.
4. **La legibilidad se reparte entre tres piezas, y ninguna es un velo global fuerte:** el velo del
   texto de la portada (`.hero-copy::before`), la pastilla del rótulo del puesto (`.hero-chip`) y
   el techo de brillo del propio lienzo. El velo global del campo sólo quita el filo (12 %) y
   protege las dos franjas de los elementos fijos: 85 % en los primeros 4 rem, donde vive la
   cabecera translúcida, y 72 % en los últimos, donde en móvil vive la barra de iconos.
5. **El puntero se escucha en `window`, nunca en la capa.** Toda la capa lleva `pointer-events:
   none` — un fondo decorativo que se come el clic de un botón es un fallo de accesibilidad, y
   además nunca recibiría un evento propio. Con la capa fija, `clientX`/`clientY` ya son las
   coordenadas del lienzo: no hay que cachear el rectángulo ni escuchar el scroll, que es lo que
   hacía falta cuando vivía dentro del hero.
6. **`.hero-copy::before` y `.hero-chip` siguen, y el velo recuperó trabajo** al desaparecer
   `rowFade`. La regla vieja no cambia: **va anclado al TEXTO y con los topes en `rem`**, nunca a
   un porcentaje del alto del hero. Ese fallo ya pasó una vez y lo que se cae primero es el rótulo
   del puesto y la línea de la ubicación, no el nombre.

## Reglas al tocarlo

- **Cero dependencias.** Contexto 2D, tipos de datos planos y un bucle. Ni Three, ni una librería
  de partículas: añadir 40 KB de JavaScript a la primera pantalla de un CV para dibujar puntos es
  el error que este proyecto lleva evitando desde el primer commit. Junto a la navegación es el
  **único** componente de cliente del sitio; el resto sigue siendo HTML estático
  ([[arquitectura-web]]).
- **Todo en `Float32Array`, sin un objeto por nodo.** Y la posición de reposo no se guarda: el
  retículo es regular, así que se calcula.
- **El bucle lo para la pestaña** (`visibilitychange`). El `IntersectionObserver` que lo paraba al
  salir el hero de pantalla ya no está: con una capa fija no se dispara nunca.
- **Con `prefers-reduced-motion: reduce` no se registra ni un escuchador** y se dibuja un único
  fotograma. Se escucha el cambio de preferencia en caliente: en el sistema operativo se activa sin
  recargar. La atmósfera se congela a media respiración a propósito — sin animación valdría 1 y
  quien pide menos movimiento acabaría con MÁS cobre del que se ve nunca.
- **Verificar a 390 px antes de cerrar.** `overflow: hidden` en la capa es lo único que impide que
  el campo ensanche el documento, y es el fallo nº 1 de `check:mobile` ([[verificacion]]).
- **Mirar la captura en `media: print` antes de cerrar**, y ahora con más motivo: una capa fija se
  imprime en **todas** las hojas, así que si `.site-field { display: none }` se cae, el CV entero
  sale con retícula detrás. Este hero ya obligó a cinco anulaciones en la hoja de impresión, y al
  reescribir el bloque se rompió una de ellas por un `*/` comido: el halo del retrato volvió a
  imprimirse como un nubarrón gris alrededor de la cara. Se ve en la captura y no se ve en pantalla.

## Trampas de TypeScript que costaron tiempo

Las dos salen del `tsconfig`, que es estricto de más a propósito ([[arquitectura-web]]):

- **`noUncheckedIndexedAccess` afecta también a las `Float32Array`**, así que `array[i]` es
  `number | undefined`. En este archivo todos los índices salen de bucles acotados por `cols`,
  `rows` o la longitud, así que las lecturas llevan `!` y los `+=` se escriben desmontados
  (`a[i] = a[i]! + x`), porque una aserción no vale como destino de asignación.
- **TypeScript conserva el estrechamiento de un `const` capturado dentro de una función flecha,
  pero NO dentro de una declaración `function`** — se sube al principio del ámbito, así que el
  compilador supone que podría llamarse antes del `if (!ctx) return`. Por eso todas las funciones
  internas del efecto son flechas: con `function` había que sembrar el archivo de `ctx!`.

## LA COSTURA ENTRE LOS DOS FONDOS, QUE ES LA PIEZA NUEVA

El escenario es una capa **opaca** dentro del hero (`.hero-stage` lleva `background:
var(--color-ink)`) y tapa el campo mientras dura la primera pantalla. Sin ese fondo se verían los
dos a la vez, la retícula asomando por los huecos entre tejas.

Y como es opaco, hay que apagarlo antes del borde inferior del hero o el canto se lee como una raya
horizontal de lado a lado. Lo hace un `mask-image` que lo disuelve **entre los 16 y los 8 rem
finales** del hero. Los dos números salen de una captura, y el fallo es fácil de repetir:

1. Primer intento, disolver sólo los últimos 9 rem: mata la raya, pero deja el filete de cifras
   —«5 AÑOS DE EXPERIENCIA», versalitas pequeñas y apagadas— sobre una fotografía de un armario de
   servidores todavía a tres cuartos de opacidad. Ilegible.
2. La regla que sale de ahí: **el escenario tiene que estar del todo apagado ANTES de que empiecen
   las cifras**, no a mitad de camino. Por eso acaba a 8 rem del borde y no a 0.

El velo del texto (`.hero-copy::before`) hace el movimiento simétrico: lleva su propio
`mask-image: linear-gradient(to top, transparent 0, #000 6rem)` y el sobrante de abajo bajó de
`-10rem` a `-1.5rem`, para llegar a cero **por encima** del borde de la sección. Seis rem y no
doce, también por las cifras: con doce el velo llegaba al filete a menos de la mitad de su valor.
**Los dos desvanecidos se calibran contra el filete de cifras, no contra la costura**, y ése es el
resumen de este apartado.

Los topes de intensidad del velo volvieron a los del escenario (28 / 58 / 88 %): detrás del texto
de la portada ya no hay retícula, hay fotografías, que es el fondo más duro de los dos. **Calibrar
contra el más benévolo es cómo se cuela un rótulo ilegible.**

## Lo que estuvo huérfano y volvió

`public/hero/*.webp` (dieciséis fotografías CC0, 281 KB), `public/hero/CREDITS.md` y
`scripts/build-hero-tiles.mjs` estuvieron sin uso entre el 2026-08-02 y el 2026-08-03, cuando
volvió el escenario. **Menos mal que no se borraron**, y ésa es la moraleja que conviene guardar:
se dejaron en el repositorio documentados y reconstruibles porque borrarlos era una decisión
aparte, y al día siguiente hicieron falta. Sigue en pie el punto 9 del CLAUDE.md sobre licencias
CC0.
