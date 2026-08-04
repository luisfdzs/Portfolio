---
name: hero-sanity
description: El hero de la portada reproduce la composición de sanity.io — qué cinco piezas son, qué se adaptó y por qué, los ajustes que salieron de mirar capturas, y la entrada actual: sólo se animan dos líneas —el nombre enfoca, el titular se teclea— y todo lo demás está puesto desde el primer fotograma, sin JavaScript
metadata:
  type: project
---

El bloque principal de la portada reproduce **la composición del hero de sanity.io**. Encargo
explícito del **2026-08-02**, rama `feature/hero-interactivo`, y con una aclaración previa que
conviene recordar porque la frase era ambigua: «lo que hay en sanity.io» resultó ser **el hero de
la web de Sanity**, no el contenido del CMS (que además no existe todavía, ver
[[contenido-dos-fuentes]]) ni una copia literal con su marca y sus textos.

Piezas: `components/sections/Hero.tsx`, `components/ui/CopyEmail.tsx` (nuevo, cliente), el bloque
de hero de `app/globals.css` y el cálculo de `companies` en `app/(site)/[locale]/page.tsx`.

## Las cinco piezas de la composición

1. **Titular enorme a la izquierda, una palabra por línea.** Tres líneas cortas con la mitad
   derecha de la pantalla vacía: es la silueta que hace reconocible el original.
2. **Dos líneas de apoyo** debajo: el titular profesional y la ubicación.
3. **Fila de tres acciones**: botón sólido de acento, botón claro y una pastilla monoespaciada con
   un dato copiable. En el original, `npm create sanity@latest`; aquí, el correo.
4. **Banda del color de acento a sangre en el borde de abajo**, con la prueba social en
   marquesina. En el original son logotipos de clientes; aquí, empresas y clientes del CV.
5. **Fondo en movimiento.** Sanity usa un vídeo a pantalla completa; aquí es un montaje propio
   (ver más abajo). El campo interactivo ([[campo-interactivo]]) sigue por debajo y es el fondo del
   resto de la web.

## EL VÍDEO DE SANITY NO SE COPIÓ, Y NO SE VA A COPIAR

Después de montar la composición, el encargo se concretó en **poner el `.webm` de fondo de
sanity.io tal cual**. No se hizo, y la razón hay que tenerla a mano porque la petición puede
repetirse:

- Ese vídeo son 24 segundos del **carrete de marketing de Sanity**: la interfaz de su producto, su
  copy, nombres de productos de terceros y fotografías de **personas identificables**. Material con
  licencia suya, y con derechos de imagen de por medio.
- Publicarlo en el CV de otra persona no está cubierto por ninguna licencia, y rompe la regla 9 del
  CLAUDE.md (sólo material propio, CC0 o dominio público, cada pieza documentada).
- Y lo que más pesa: **habla de su producto, no de Luis**. Un recruiter vería una demo de una app
  de rutas de senderismo y una instalación de CLI de otra empresa. Es lo contrario de para lo que
  existe la web.

Lo que sí se conservó es lo que hacía que ese fondo funcionara: un collage denso de interfaces en
movimiento lento a pantalla completa, con el texto encima. Con material propio y CC0.

## El montaje del fondo (`HeroStage.tsx` + `HeroRain.tsx`)

Cinco columnas en movimiento lento y alterno sobre un resplandor de cobre, con cuatro clases de
material:

- **Seis capturas de webs propias** (`public/projects/`), recortadas por arriba —`object-position:
  top`— porque por el centro se ve media sección interior y no se reconoce la web. Dos van en las
  columnas 1 y 2, las únicas que existen a 390 px: si el trabajo real sólo saliera en las columnas
  de escritorio, en un móvil el fondo volvería a ser un banco de imágenes.
- **Dieciséis fotografías CC0** (`public/hero/`, [[perfil-cv]] no aplica: son decoración). Estuvieron
  huérfanas unas horas y volvieron el mismo día. **Menos mal que no se borraron.**
- **Cuatro paneles de interfaz dibujados en CSS**: editor, build, terminal y topología. El código
  que muestran existe de verdad en el repositorio.
- **Una lluvia de código** en un `<canvas>`, la única pieza del escenario con JavaScript.

Dos detalles técnicos que no conviene deshacer:

1. **La lluvia borra su estela con `globalCompositeOperation = 'destination-out'`**, no tapando el
   fotograma anterior con negro translúcido. La receta clásica exige un fondo opaco; aquí el lienzo
   tiene que ser transparente porque debajo está el mosaico, y un velo negro por fotograma lo iría
   apagando hasta hacerlo desaparecer.
2. **Mide con `offsetWidth`, no con `getBoundingClientRect()`.** El rectángulo incluye los
   `transform` de los ancestros, y el lienzo cuelga de `.hero-stage__area`, que entra con una
   animación de escala de 1,06 a 1. Medido con el rectángulo, el mapa de bits salía un 2 % grande
   —1471 px en una ventana de 1440— **para siempre**: un `transform` no cambia la caja, así que el
   `ResizeObserver` no vuelve a dispararse nunca.

Y un ajuste de equilibrio: con las capturas propias dentro —dos claras y una roja entera— el
mosaico a opacidad 0,85 se leía como un tablón de recortes. El carril está en **0,78** y el velo
del texto subió a 88 % en escritorio.

## Lo que se adaptó, y por qué

- **El titular es el nombre, no un eslogan.** En un portfolio el producto es la persona. Y encaja:
  «Luis Fernández Sangil» son tres palabras y rompe en las mismas tres líneas del original.
- **La banda lleva nombres, no logotipos.** Logotipos ajenos en un CV son marcas de terceros usadas
  como reclamo. Los nombres salen de la experiencia y se comprueban en la sección de abajo con las
  fechas al lado ([[perfil-cv]]).
- **La pastilla lleva el correo.** Mantiene la decisión vieja de enseñar la dirección en vez de
  esconderla tras un formulario, y añade el camino de quien va a pegarla en un ATS.
- **Las cuatro cifras se quedan** aunque el original no las tenga: son la única prueba
  cuantitativa del CV y ninguna está escrita a mano ([[cifras-calculadas]]).

  **Y van en UNA SOLA FILA, también en móvil** (2026-08-03, por encargo). Estaban en dos columnas
  de dos, y a media pantalla del hero eso las convertía en dos parejas que se leen por separado;
  son un mismo dato de cuatro cifras y hay que abarcarlas de un golpe. A 390 px cada hueco mide
  unos 82 px, así que el reparto da — **lo que no da es el rótulo**: «PRODUCCIÓN» a 11 px con
  0,14 em de entreletra mide más que la columna y **desborda la página**, que es lo único que
  `check:mobile` no perdona. Por eso el `<dt>` **no usa la utilidad `eyebrow`**: baja a 9 px con la
  entreletra a la mitad y recupera los valores del sistema en `lg`. Y se hace con utilidades en vez
  de `eyebrow` más un tamaño encima porque las dos viven en la misma capa de CSS y quién gana lo
  decidiría el orden de la hoja generada.
- **El retrato baja a 3 rem** y se pone al lado del rótulo de estado. El original no tiene cara
  —es una empresa— pero un CV sí la necesita; a ese tamaño se lee como una firma.

## EL BLOQUE VA CENTRADO, NO A LA IZQUIERDA COMO EL ORIGINAL

Ésta es la diferencia deliberada con sanity.io. El original alinea a la izquierda y deja la mitad
derecha vacía, y así estuvo montado unas horas del 2026-08-02, documentado como la excepción a la
regla de centrado del sitio. **Luis lo mandó centrar el mismo día**, y el resultado es mejor de lo
que parecía: el sitio se queda sin ninguna excepción a la regla ([[decisiones-de-diseno]]) y el
titular de una palabra por línea, centrado, se apila sobre el mismo eje que el resto del bloque.

Lo que sí obliga es a **rehacer el velo del texto**, y ésa es la parte que hay que entender antes
de tocarlo: el velo sigue siempre a donde está el texto, y ya ha cambiado de forma tres veces.

| Cuándo | Dónde está el texto | Forma del velo |
| --- | --- | --- |
| Escenario cinético | apoyado abajo | rampa vertical de abajo arriba |
| Composición de Sanity, a la izquierda | centrado en vertical, pegado a la izquierda | barrido horizontal |
| **Ahora** | centrado en los dos ejes | **elipse centrada** |

El radio vertical de la elipse es mayor que el horizontal (78 % contra 66 %). No es simetría mal
puesta: los rótulos de las cifras son el texto más pequeño y más apagado del hero y son los que más
lejos caen del centro, así que con la elipse redonda quedaban en la zona en la que el velo ya se
está abriendo. Se vio en la captura, con «TECNOLOGÍAS» sobre la foto de un portátil.

En móvil el velo es plano, con los bordes de arriba y abajo desvanecidos: a 390 px el texto ocupa
el ancho entero y una elipse dejaría fuera los extremos de las líneas más largas.

## Los tres ajustes que salieron de mirar capturas

1. **El titular rompe por MARCADO, no por `max-inline-size`.** El primer intento fue un ancho
   máximo en `em`, y funcionaba, pero hay que calibrarlo contra lo que miden «Luis Fernández» y
   «Fernández Sangil» en Instrument Serif: se quedó en dos líneas al primer intento y volvería a
   romperse el día que cambie el nombre o la tipografía. Ahora es un `<span>` de bloque por
   palabra. En papel vuelven a ser elementos en línea, y **el espacio que `Hero.tsx` deja dentro
   de cada `<span>` es lo único que separa las palabras ahí**: no se quita.
2. **El tamaño del titular vive en `.hero-title`, no en la utilidad `text-display`.** A 6 rem con
   interlineado 0,98 el nombre mide 282 px y el bloque completo empujaba la banda por debajo del
   pliegue en un portátil de 900 px, que es justo donde la banda deja de servir para nada. Está en
   5,5 rem con interlineado 0,9. Y va en la clase porque **las utilidades de Tailwind ganan a la
   capa de componentes**: la única forma de bajar el tamaño es no ponerle la utilidad al elemento.
3. **El hero reserva `--spacing-nav-mobile` por abajo.** Sin eso la banda caía **exactamente**
   detrás de la barra de iconos de móvil: medida en el DOM ocupaba de 793 a 844 px en una pantalla
   de 844, o sea «visible» y tapada del todo. De paso, el `padding-top` que despeja la cabecera
   fija pasó a aplicarse sólo en `lg`, porque en móvil no hay cabecera y eran 56 px de vacío que
   empujaban la banda contra la barra.

## Reglas al tocarlo

- **La marquesina se DESPLIEGA con `prefers-reduced-motion`, no se para.** Pararla escondería
  todos los nombres que no caben en una línea: quien pide menos movimiento acabaría con menos
  información. La copia duplicada —que sólo existe para que el bucle no tenga costura— se oculta y
  la lista real se reparte en varias filas.
- **La copia duplicada va `aria-hidden`**, o un lector de pantalla lee la lista dos veces.
- **La banda es el único sitio del proyecto donde el cobre es fondo de un bloque entero.** Se
  sostiene porque es una franja de dos líneas en el borde de la pantalla y está señalando algo
  —que hay más página—, que es lo que la regla del acento único permite.
- **Los dos objetivos pulsables de la pastilla llegan a 2 rem de alto.** Un `<a>` en línea mediría
  el alto de su texto, unos 18 px, y sería el primer fallo de `check:mobile`, que comprueba los
  24 px de WCAG 2.2 en todo lo pulsable ([[verificacion]]).
- **El botón de copiar se dibuja siempre**, sin comprobar `navigator.clipboard`. Comprobarlo exige
  un `setState` dentro de un efecto, que es lo que prohíbe `react-hooks/set-state-in-effect` —y el
  lint del proyecto lo hace fallar—. La API existe en todo contexto seguro; el único caso que
  queda fuera es servir esto por HTTP en una IP local.
- **Se quitaron dos claves del diccionario**, `hero.greeting` («Hola, soy») y `hero.scrollHint`
  («Sigue bajando»): el saludo no encaja con el nombre de titular y la banda avisa de que hay más
  mucho mejor que una flecha.

## El retrato es un RECORTE, no una foto

`public/luis.webp` dejó de ser una fotografía con fondo —Luis de traje en la calle, con un
escaparate detrás— y pasó a ser el busto recortado con canal alfa: WebP de 200×200 en RGBA,
7,9 KB, generado con `rembg` (modelo `birefnet-portrait`) sobre el original. El original
seguía siendo, pese al nombre, un **JPEG** de 200×200; el archivo nuevo sí es WebP de verdad.

Tres cosas que costaron más que el recorte en sí:

1. **`Figure` le pone marco a todas las imágenes** —`bg-ink-raised`, `border border-line` y
   `rounded-lg`—, y ese marco era invisible mientras la foto era opaca y lo tapaba entero. Con
   transparencia se convierte en una **tarjeta oscura alrededor del busto**, que es justo lo
   contrario de recortarlo. Lo apaga `.hero-portrait__frame`, que sustituye al `rounded-full`
   que llevaba antes el `Figure` del hero.
2. **Esa regla va SIN `@layer`**, y por eso está al final de `globals.css` y no junto a
   `.hero-portrait`. Lo que hay que ganar son utilidades de Tailwind, que viven en
   `@layer utilities`; una regla en `@layer components` pierde contra ellas **por muy
   específica que sea**, porque entre capas manda el orden de las capas. Se probó primero
   dentro de la capa y no hizo absolutamente nada. Tampoco vale pasar `bg-transparent` desde
   `Hero.tsx`: `cn()` concatena y no desempata utilidades en conflicto (ver `lib/cn.ts`).
3. **`overflow: visible` y sin redondeo**, porque el busto llega al borde inferior del cuadro:
   con el recorte del contenedor, los hombros se cortaban en arco. De paso se descubrió que el
   `rounded-full` de antes **nunca se aplicó** —`cn()` dejaba `rounded-lg` y `rounded-full` en
   la misma clase y ganaba el orden de la hoja generada—, así que el avatar llevaba desde
   siempre esquinas de 8 px en vez de ser un círculo. Con el recorte deja de importar.

### El retrato tiene respaldo POR CAMPO (2026-08-03)

El síntoma que originó esto: se cambia la imagen en `content/`, el `check` pasa, el build pasa, y
en la web se sigue viendo la vieja. No era un fallo de caché ni del cargador de imágenes, era la
regla del contenido funcionando — el `profile` importado tenía su propia copia de la foto y Sanity
manda cuando hay documentos ([[contenido-dos-fuentes]], [[sanity-enchufado]]). Comprobado
consultando el dataset: `profile.photo.asset._ref` era
`image-80d0df63003f95505204881f9a5b24842302502a-200x200-jpg`, o sea el JPEG con la calle detrás.

**Lo que se hizo:** el campo sigue en el panel y sigue mandando cuando tiene una imagen elegida,
pero **si está vacío se sirve `public/luis.webp`** en vez de dejar el hueco. Es el único respaldo
del proyecto que funciona por campo y no por documento, y el motivo es que un «Perfil» sin foto es
un documento **válido**: no dispara el respaldo general, así que el hero se quedaba con el hueco de
trama de `Figure` — un rectángulo rayado donde va la cara. La imagen se exporta como `portrait` en
`content/profile.ts`, la pone `getProfile` en `lib/content.ts`, y `Profile.photo` pasa a ser
**obligatorio** en el tipo: ninguna vista recibe un perfil sin foto.

Tres cosas no obvias del cambio:

1. **La consulta usa `select(defined(photo.asset) => photo {…})`, no `photo {…}` a secas.** Es la
   trampa: proyectar un campo vacío devuelve un objeto con las cuatro claves a `null` en vez de
   `null`, la validación del perfil **entero** falla y se cae al respaldo de `content/` con él,
   perdiendo de paso lo que sí esté editado en el panel. Verificado contra el dataset real: con el
   `select`, un campo inexistente devuelve `null` limpio.
2. **`migrate:import` deja de subir el retrato**, aunque el campo exista. Si lo subiera, un
   proyecto recién importado tendría otra vez dos copias de la misma foto con la del panel
   ganando, que es justo el fallo de arriba reproducido de fábrica.
3. **`portrait` se declara ANTES de `profile`** en `content/profile.ts`, que lo referencia en
   `photo`. Al revés es un `const` usado antes de inicializarse y el módulo rompe al cargar.
4. **El campo del panel no lleva `required()`**, y es coherente: vaciarlo es la forma de decir
   «usa la foto que viene con la web», no un documento a medias.

Para que producción enseñe el recorte hay que **vaciar el campo** en `/admin` → **Perfil** →
_Publish_ (el webhook revalida los dos entornos), o bien reemplazar ahí la imagen por
`public/luis.webp`; las dos valen. Lo que **no** vale es `npm run migrate:import`: corre con
`--replace` y borraría el dataset entero, con las ediciones del panel y el orden de los documentos
arrastrables. No hay token de escritura en `.env.local` a propósito, así que no se puede hacer por
API desde aquí.

En papel no hay que tocar nada: el bloque `@media print` ya apaga el resplandor y el
`drop-shadow`, y un recorte sobre blanco sale limpio.

## EL HALO DORADO DEL RETRATO SE QUITÓ (2026-08-03)

`.hero-portrait::before` era un degradado radial que empezaba en `--color-signal` al 26 %: un aro
de cobre alrededor de la cara. **Se quitó por encargo explícito de Luis**, así que quien vea el
degradado y piense en «devolverle un toque de acento» está deshaciendo una decisión, no afinando
un matiz.

Lo que **no** se quitó es el degradado: sigue ahí en grafito (`--color-ink` al 88 % en el centro),
porque cumple una función que el cobre sólo acompañaba —apagar el fondo pegado a la silueta— y el
retrato vive **fuera de `.hero-copy`**, o sea sobre las tejas del mosaico y sin el velo del texto
que protege a las demás líneas. Con una teja clara justo detrás y sin esto, la cara se lee como
una foto más del fondo. Sobre grafito el degradado no se ve; sobre una fotografía clara, sí, y
para eso está.

## LA ENTRADA DE LA PORTADA: SÓLO DOS LÍNEAS SE ANIMAN (2026-08-04, tercera vuelta)

**Estado actual, y lo que hay que respetar.** El nombre aparece entero y **desenfocado** y enfoca de
golpe en 760 ms (`.hero-name` + `hero-focus`); «Ingeniero industrial y desarrollador web» se
**teclea** carácter a carácter a 18 ms, arrancando **180 ms antes** de que el enfoque acabe. Todo lo
demás —«Hola, soy», la ubicación con su icono, los dos botones y los tres iconos, las cuatro cifras
y el «Sigue bajando»— está puesto desde el primer fotograma. La secuencia acaba en **1,34 s**. Cero
JavaScript: `components/ui/Typed.tsx` (servidor) y el bloque «Texto que se escribe» de `globals.css`.

**Por qué se dejó de animar todo, que es la decisión de fondo.** Durante el día se escribieron las
cuatro líneas y detrás iban apareciendo los botones y las cifras en cadena (`hero-enter`, ya
retirada). El coste era medible: la primera pantalla no existía hasta los **2,9 s**, o sea que el
10 % de la atención que alguien dedica a decidir si esto merece un scroll se gastaba viendo una web
montarse, sin nada que pulsar. Concentrar el gesto en las dos líneas que dicen **quién eres y qué
haces** deja lo demás legible y accionable en el milisegundo cero, y hace que la animación signifique
algo en vez de ser el tono de la página.

**Por qué el nombre NO se teclea.** Se compararon cuatro versiones en pantalla —tecleado (45/20 ms),
tecleado rápido (26/11), palabra a palabra y enfoque— con un conmutador de desarrollo, y eligió Luis.
El argumento: el tecleado es el gesto más visto en un portfolio de desarrollador, así que en el
`<h1>` le dice «plantilla» justo a quien ve diez portfolios al mes. El enfoque dura menos, se lee
como algo hecho a mano y deja el guiño de teclado en el titular de debajo, donde no compite con el
nombre. **El conmutador y `heroVariants.ts` se borraron al decidir**: eran material de decisión.

**Why:** el objetivo del sitio es un recruiter que decide en treinta segundos. Cada décima de
animación se paga con atención, así que la animación tiene que estar donde dice algo y no en toda la
página.

**How to apply:**

- **Los dos tiempos son UNA cuenta y viven en el CSS.** `--hero-focus-duration` y
  `--hero-headline-start` se declaran juntos en `.hero-copy`, y `Typed` recibe `start`/`step` como
  **variables de CSS** —de ahí que sus props acepten `number | string`— en vez de números calculados
  en `Hero.tsx`. Es lo que impide que cambiar la duración del enfoque descuadre en silencio el solape
  de 180 ms, que es lo que hace que las dos líneas se lean como un movimiento y no como dos turnos.
- **`inline-block` en `.hero-name` no es decorativo.** Un elemento en línea ignora `transform`, así
  que sin él el enfoque pierde el punto de escala. No cambia el reparto de líneas: es el único hijo
  de un `<h1>` que ya es bloque centrado.
- **Al nombre hay que apagarle el `filter` a mano** en movimiento reducido y en papel, no sólo la
  opacidad: una regla que devuelva la opacidad dejando el desenfoque de 14 px deja el titular del CV
  ilegible **para siempre**, que es peor que la animación que se estaba evitando.
- **El nombre va completo en el HTML** y el tecleado del titular se revela **en su sitio**
  (`opacity: 0`, no `display: none`): el hero apoya su texto en el borde de abajo con `justify-end`,
  así que un texto que crece lo empuja entero. Por lo mismo **no hay cursor** — hubo uno y se quitó
  al verlo en una captura: parado al final de una frase que se revela en su sitio, señala donde no
  pasa nada.
- **Cada palabra del tecleado va en un `nowrap`.** Con un `<span>` por letra el navegador puede meter
  el salto de línea entre dos cualesquiera, y a 390 px se partiría una palabra por la mitad. El
  espacio entre palabras queda fuera, como nodo de texto, y es ahí donde el salto tiene que caer.
- **Nada de un contador en `useState`.** El nombre es el `<h1>` que se busca en Google: el texto tiene
  que estar completo en el HTML de servidor, y la hidratación borrándolo para reescribirlo sería un
  destello del texto final antes de la animación.

**Medido sobre el build de producción**, congelando las animaciones con `getAnimations()` y situando
`currentTime` (que es lo que da fotogramas exactos; con el navegador de la extensión no se puede,
porque en una pestaña oculta `requestAnimationFrame` no dispara y `setTimeout` se estrangula a un
segundo): en t=0 el nombre está a `opacity: 0` con `blur(14px)` y **el saludo, la ubicación, los
botones, las cifras y el aviso a 1,00**; a 700 ms el nombre está enfocado y el titular va por 4/36;
a 1400 ms, 36/36. Cero desbordamiento a 390 y a 1440. Con `reducedMotion: 'reduce'` y en `media:
print`, nombre a `opacity: 1` con `filter: none` y el titular completo. `npm run check` limpio, build
sin un aviso y `check:mobile` **23/23 en los dos idiomas**.

### EL FALLO DE LA SESIÓN: el escalonado NO puede ir en `animation-delay`

Lo evidente es una animación mínima con `animation-delay: índice × paso`, y **en Chrome se queda a
medias**. Medido sobre esta misma página: con `1ms` de duración, todo carácter cuyo retardo pase del
segundo se queda en `opacity: 0` **para siempre** — la portada decía «Hola, soy Luis Fernánde» y ahí
se paraba, con «z Sangil» invisible. El navegador da por finiquitada una animación de duración
despreciable y deja de aplicar su `forwards`. Subir la duración a 60 ms sólo mueve la frontera
(fallaba a partir del carácter 25); a 200 ms aguantaba, pero es una frontera y no una garantía.

**How to apply:** el escalonado va en la **duración**, no en el retardo. Cada carácter arranca a la
vez y **dura hasta su propio momento** —`animation: typed-char calc(var(--typed-index) *
var(--typed-step) + 60ms) steps(1, end) forwards`, sin `animation-delay` ninguno—, y `steps(1, end)`
lo hace saltar a visible justo al terminar. El efecto en pantalla es idéntico y no hay frontera que
respetar. Comprobado con sesenta caracteres, el doble de los que hay en la portada. El `+ 60ms` es
para que el índice 0 no tenga duración cero, que es el caso que el navegador se salta.

**Y lo peor del fallo es que no avisa:** el HTML está completo, el `check` pasa, `check:mobile` pasa
y el build no dice nada. Sólo se ve mirando la pantalla o contando cuántos `.typed__char` tienen
`opacity: 1` unos segundos después de cargar, que es como se cazó.

Movimiento reducido y papel: la frase aparece puesta, con `opacity: 1` explícito en los dos bloques.
El atajo general de 0,01 ms de la capa base bastaría **hoy** —al estar el escalonado en la duración—,
pero depender de eso es depender de una coincidencia: el día que alguien vuelva a un
`animation-delay`, el atajo dejaría de servir sin que nada avise.
