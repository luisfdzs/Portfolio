---
name: navegacion-y-orden
description: El orden de las secciones de la portada y las piezas pegadas a él — el menú de móvil a pantalla completa, la numeración de las cabeceras, el botón de volver arriba y el resaltado de la sección que se está leyendo
metadata:
  type: project
---

Tres cosas que parecen independientes y no lo son: **en qué orden se leen las secciones**, **qué
enseña el menú** y **cómo se vuelve arriba**. Todo esto se rehizo el **2026-08-03**, en `develop` y
por encargo directo.

## El orden de la portada (2026-08-04)

`hero → proyectos → experiencia → formación → perfil (con el stack dentro) → contacto`.

**Son CINCO secciones, no seis, desde el 2026-08-04**: el stack dejó de ser sección propia y pasó a
ser la subsección que cierra el perfil, por encargo. **Why:** las dos contestan la misma pregunta por
sus dos mitades —el perfil dice cómo trabaja alguien y el stack dice con qué—, y con un rótulo
numerado en medio la lista de tecnologías se leía como un anexo del CV en vez de como la segunda
mitad de la respuesta.

**How to apply — juntarlas arrastró seis sitios:** `stack` sale de `sections` **y** de `navigation`
(`lib/i18n/routes.ts`), se cae `nav.stack` de los dos diccionarios (el `satisfies
Record<NavKey, string>` lo exige: una clave de más no compila), `Stack.tsx` pierde su `<section>`, su
`id` y su `SectionHeading` —numerarlo diría que es la sexta sección justo después de decidir que no
lo es—, sus títulos de grupo bajan de `<h3>` a `<h4>` (dentro del perfil el `<h2>` es «Perfil» y el
`<h3>` es «Stack»), `About` recibe `skills` y lo renderiza al final, y la numeración de las cabeceras
se recorre: perfil pasa a `04` y contacto a `05`. Lo que **no** cambia es `content/` ni el esquema del
panel: los grupos de `skillGroup` siguen siendo los mismos documentos.

**Y el 2026-08-04, por la tarde, el stack se quedó sin su nota al pie** («ordenado por lo que uso a
diario, no por lo que he tocado alguna vez»): se cae la clave `stack.note` de los dos diccionarios y
el párrafo del final de `Stack.tsx`. **Why:** el argumento para tenerla era bueno mientras el stack
era una sección —decir en voz alta el criterio de orden es lo que convierte una lista de logos en
información—, pero dentro del perfil son dos líneas de letra pequeña al final de la sección de prosa
y justo antes del contacto, que es la llamada a la acción. El orden de cada grupo no cambia; lo que
ya no se hace es explicarlo. **How to apply:** reponerla son **dos** sitios, la clave y el párrafo.

De la misma tanda son los rótulos: el titular de cada sección lo reescribió Luis y quedaron
«Proyectos», «Experiencia laboral», «Quién soy» y «Tecnologías que manejo». Ojo con el primero, que
**repite el rótulo pequeño de encima** y hace que la cabecera diga «Proyectos» dos veces: está así a
propósito, es lo que él escribió, y se cambia con una línea (`projects.kicker`) si alguna vez molesta.

Antes de esto el orden era `perfil → experiencia → proyectos → formación → stack → contacto`. **Why:**
los
proyectos son la única sección con prueba visual —capturas de webs en producción—, y quien dedica
treinta segundos a un CV los gasta mirando, no leyendo. El perfil, que son tres párrafos de prosa,
era un peaje en la segunda pantalla para alguien que todavía no sabía si le interesabas; al final
es lo que lee quien ya decidió seguir.

**How to apply — cambiar el orden toca TRES sitios, y olvidar uno se ve:**

1. `app/(site)/[locale]/page.tsx`, que es donde se listan las secciones.
2. El `index` de cada `SectionHeading` (`01`…`05`). Es el índice implícito de la página, así que
   una numeración desordenada es peor que ninguna. Nadie avisa: no hay tipo ni test que lo cruce
   con el orden real del JSX.
3. `navigation` en `lib/i18n/routes.ts`, que es a la vez el menú de escritorio **y** el del panel
   de móvil. `mobileNavigation` es un subconjunto suyo y su orden también se sigue a mano.

## El menú de móvil, como el de Swiftmet (2026-08-03)

La barra inferior de cinco iconos no cambia. Lo que cambia es el panel que abre el quinto:

- **Enseña TODAS las entradas** (hoy cinco), no sólo las que no caben en la barra. Un menú que
  lista el sobrante obliga a mirar la barra para deducir qué falta; se abre buscando el índice del
  sitio y aparecía media lista.
- **Ocupa la pantalla entera** hasta el borde de la barra, con las entradas centradas y a tamaño
  de titular en la serif. A 390 px caben de sobra.
- **Los dos idiomas van al final, detrás de un filete horizontal.** Es lo único del panel que no
  es un destino; sin la línea se leen como una sección más.
- **Y van SIN rótulo desde el 2026-08-04**: sólo «ES / EN». Se quitó el «Cambiar de idioma» que
  llevaban delante (y con él la clave `a11y.changeLanguage` de los dos diccionarios, que quedaba sin
  uso). **Why:** decía en cuatro palabras lo que «ES / EN» dice en cuatro letras, y en un panel donde
  todo lo demás son destinos a tamaño de titular, ese rótulo pequeño se leía como la única
  instrucción de la pantalla. **No se pierde accesibilidad:** el nombre completo del idioma lo pone
  `LocaleSwitch` desde `localeLabels` —en el `aria-label` del grupo y en el `sr-only` de cada
  enlace—, que es el sitio correcto, porque es el mismo dato en los dos usos.
- **Se cayó la cortina.** Tenía sentido cuando el panel era una tira sobre la barra y quedaba
  página alrededor; a pantalla completa no hay «fuera» donde pulsar. Cierran el mismo botón —que
  la barra deja siempre encima, porque comparten `z-50` y va después en el DOM— y Escape.
- El fondo tiene que ser **opaco** (`bg-ink-raised`): con uno translúcido se leen las secciones
  por debajo de las entradas.

`check:mobile` siguió en 21/21 sin tocar el script, y eso no es casualidad: sus dos comprobaciones
del panel —que mida más de 150 px y que **no** solape la barra— las cumple igual un panel a
pantalla completa que acaba en `bottom-nav-mobile`. (Hoy son 23/23: el script ganó dos
comprobaciones, ver más abajo.)

## Las entradas del menú llevan a las secciones de la portada (2026-08-03, tarde)

Hasta esta tarde `projects` era una **ruta** y las otras cinco anclas: el menú tenía cinco entradas
que se movían por el CV y una que se iba de página. Al retirarse el índice
(ver [[lista-de-proyectos]]), `projects` pasa a `sections` en `lib/i18n/routes.ts` y `routes` se
queda con `home` a secas.

**How to apply:** la URL de una ficha ya no se compone con `href(locale, 'projects', slug)` —eso
ahora devolvería `/es#projects`, porque `href` mira primero si la clave es sección— sino con
**`projectHref(locale, slug)`**, que es una función aparte. El segmento `projects` vive en una
constante privada del módulo, y eso es a propósito: nadie debe volver a enlazar `/es/projects` a
secas.

## La sección que se está leyendo va resaltada (2026-08-03, tarde)

El menú decía a dónde se puede ir y no decía **dónde estás**, en una página de siete pantallas. Lo
mide `components/layout/useActiveSection.ts` y lo pintan `NavList` (escritorio, nuevo componente de
cliente que saca las entradas de la cabecera de servidor) y `MobileNav` (barra y panel).

- **Una línea de lectura, no `IntersectionObserver`.** Se traza una horizontal a `alto de cabecera +
  25 % de la ventana` y gana la sección que la cruza. **Why:** lo evidente —quedarse con la sección
  más visible— resalta la más alta casi todo el rato en una página cuyas secciones miden de media
  pantalla (proyectos) a cuatro (experiencia), y parpadea en los solapes. La línea da **una** sola
  respuesta y cambia exactamente al pasar de sección.
- **En el hero no hay nada resaltado**, y es lo correcto: no se está leyendo ninguna sección.
- **En una ficha de proyecto manda la ruta** y se marca «Proyectos». Se decide **durante el render**
  (`isProjectPath(pathname)`), no en el efecto: `setState` sincrónico dentro de un `useEffect` es un
  error de ESLint en este repo (`react-hooks/set-state-in-effect`), y con razón — la ruta ya la sabe
  React.
- **El color no es la única señal.** El activo lleva `text-signal` **y** el filete: el subrayado de
  `link-underline` se queda puesto con `&[aria-current]::after` en escritorio, y en la barra de móvil
  hay un filete de 2 px arriba. `aria-current="location"` se pone **sólo cuando toca**, nunca a
  `false`: el selector CSS mira la presencia del atributo y dejaría todas subrayadas.
- **El stack ya no tiene entrada propia**, y eso no deja un hueco de navegación: cae dentro de
  «Perfil», que es la sección que lo contiene, así que la barra sigue diciendo dónde estás mientras se
  lee la lista de tecnologías. Comprobado a 390 px.
- **El icono de «Perfil» era una casa.** Ahora es una persona (`User` en `components/ui/Icons.tsx`,
  también en la cabecera de la sección). Un icono de inicio junto a ese rótulo promete volver arriba
  y lleva a la mitad de la página, que es la clase de desajuste por el que se desconfía de una barra
  entera.

`check:mobile` gana dos comprobaciones y pasa a **23**: que sobre el hero no haya ninguna entrada
resaltada y que dentro de una sección haya **exactamente una** (dos a la vez es el fallo típico de
medir «la más visible»).

## Volver arriba: un botón flotante, y antes NO FUNCIONABA

**El fallo:** la flecha vivía en el pie y era `<Link href={href(locale, 'home')}>`, o sea un enlace
a `/es` — la ruta en la que ya estás. Next no navega y el navegador no mueve el scroll: se veía, se
pulsaba y no pasaba nada. Nadie lo detectó porque un enlace que existe y apunta a una URL válida no
falla en ningún sitio; sólo no hace nada. Y estaba, además, en el único lugar de la página donde ya
no hace falta: quien llegó al pie ha terminado de leer.

Ahora es `components/ui/BackToTop.tsx`, montado **en el layout** (hace falta también en las fichas de
proyecto, que son páginas largas):

- `window.scrollTo({ top: 0 })` **sin `behavior`**. Es el detalle que conserva lo que el ancla hacía
  bien: el valor por defecto es `auto`, que aplica el `scroll-behavior` de la hoja de estilos —suave,
  e instantáneo bajo `prefers-reduced-motion`, ya resuelto en `globals.css`—. Escribir
  `behavior: 'smooth'` ignoraría esa preferencia.
- **Aparece pasada la primera pantalla**, no siempre: sobre el hero sería una flecha para subir a
  donde ya estás, y taparía las cifras. El umbral se mide del hero real (`.hero-section`, que mide
  `100svh`) y en las páginas sin hero basta con haber bajado 240 px.
- El umbral **se recalcula en cada scroll** en vez de guardarse al montar: en móvil las barras del
  navegador se recogen al bajar y el alto del hero cambia sin disparar `resize`.
- Mientras es invisible se queda en el DOM con `inert` —no `aria-hidden`—, así no entra al tabulador
  ni al lector de pantalla pero puede desvanecerse. Mismo criterio que las copias del carrusel
  ([[cover-flow]]).
- En móvil se apoya por encima de la barra con `calc(var(--spacing-nav-mobile) + 0.75rem)`, no con
  un número a ojo. Y lleva `data-print="hide"`.

Ver [[verificacion]] para lo que sí comprueba el script, y [[decisiones-de-diseno]] para el resto de
la maquetación.
