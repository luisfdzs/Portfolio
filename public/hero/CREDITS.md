# Tejas de la portada — procedencia y licencia

Las dieciséis fotografías de `public/hero/` son el material del **escenario cinético** de la
portada (`components/sections/HeroStage.tsx`). Este archivo existe para que dentro de dos años se
pueda responder sin dudar de dónde salió cada una, porque una foto sin procedencia documentada es
una foto que hay que quitar.

## La regla que se aplicó al elegirlas

**Sólo dominio público.** Las dieciséis están bajo **CC0 1.0** (Creative Commons Zero, renuncia
universal): uso comercial permitido, obras derivadas permitidas y **atribución no exigida**. Se
descartó a propósito todo lo que fuera CC-BY o CC-BY-SA, aunque también es gratuito: obligan a
mostrar el crédito junto a la imagen, y un escenario decorativo detrás de un titular no es sitio
para dieciséis líneas de créditos. Con CC0 no hay nada que mostrar y nada que se pueda incumplir.

La atribución **no es obligatoria**, pero se deja escrita aquí igualmente. Es cortesía con quien
publicó la foto y, sobre todo, es lo que hace verificable la afirmación de arriba.

Se localizaron con la API de [Openverse](https://openverse.org) filtrando por `license=cc0,pdm`.

## Procesado

`scripts/build-hero-tiles.mjs` las recorta a **600×400 (3:2)** con `sharp`, usando el recorte por
zona de interés (`position: 'attention'`), les aplica un grado suave horneado en el archivo
(brillo 0,92 · saturación 0,78) y las guarda en **WebP de calidad 66**. Las dieciséis juntas pesan
**281 KB**. Al terminar, el script imprime la tabla de procedencia de abajo ya formateada: es el
paso que antes había que copiar a mano de la respuesta de la API, y el que se salta quien va con
prisa.

**En pantalla no se ven en 3:2.** El CSS les fija el alto en `vh` y las recorta con
`object-fit: cover`, así que la proporción real depende del ancho de columna de cada tramo. El
3:2 del archivo es el encuadre de partida —el que decide qué parte de la foto sobrevive al
recorte—, no la forma final. El porqué del alto en `vh` está en `.hero-stage__tile`.

Las cinco últimas (`metrics-dashboard`, `patch-panel`, `fiber-optics`, `code-angled`,
`code-bokeh`) se añadieron al pasar el escenario a pantalla completa: con once tejas repartidas
en cinco columnas se veía la misma foto dos veces a la vez. Tres de ellas —las dos de código y
la del panel de parcheo— pesan el triple que la media porque son de detalle fino, que es lo que
peor comprime; se probó a bajarles la calidad y la diferencia era del 15 % a cambio de
degradarlas, así que se quedan como están.

El grado va **horneado y no en CSS** por rendimiento: once `filter: brightness()` sobre imágenes
que además se están moviendo obligan al navegador a repintar cada fotograma. Horneado, el
escenario sólo compone capas ya listas.

**Estos archivos son lo que se descarga, sin intermediarios.** El cargador del proyecto
(`sanity/imageLoader.ts`) devuelve las rutas locales sin tocarlas —el que redimensiona es la CDN
de Sanity, y estas tejas viven en `public/`—, así que `next/image` no genera variantes de ellas.
De ahí el 600 y el 66: 600 px es el ancho máximo al que se pinta una teja en una pantalla de
densidad 2, y 66 es todo lo que necesita una fotografía que se ve detrás de un velo, moviéndose y
—buena parte del tiempo— por detrás de un bloque de texto.

## Las dieciséis

| Archivo | Papel | Título original | Licencia | Fuente | Original |
| --- | --- | --- | --- | --- | --- |
| `datacenter-aisle.webp` | servidores | Free computer server room image | CC0 1.0 | rawpixel | https://www.rawpixel.com/image/5906639/photo-image-light-desktop-wallpapers-public-domain |
| `switch-port.webp` | red | Internet modem port | CC0 1.0 | rawpixel | https://www.rawpixel.com/image/6038427/photo-image-public-domain-technology-line |
| `code-editor.webp` | código | Programming Code | CC0 1.0 | stocksnap | https://stocksnap.io/photo/programming-code-1STVFMTBJY |
| `code-dense.webp` | código | Digital program source code | CC0 1.0 | rawpixel | https://www.rawpixel.com/image/543441/free-photo-image-technology-tech-code |
| `laptop-code-close.webp` | código | Macbook Laptop | CC0 1.0 | stocksnap | https://stocksnap.io/photo/macbook-laptop-2UXCQG5Q7W |
| `typing-laptop.webp` | teclear | Coding Programming | CC0 1.0 | stocksnap | https://stocksnap.io/photo/coding-programming-F164KBFZ95 |
| `typing-dark.webp` | teclear | Coding Programming | CC0 1.0 | stocksnap | https://stocksnap.io/photo/coding-programming-PBTF1NEBCG |
| `typing-warm.webp` | teclear | Laptop Macbook | CC0 1.0 | stocksnap | https://stocksnap.io/photo/laptop-macbook-YRUO4LCSLB |
| `circuit-board.webp` | hardware | Free circuit board macro image | CC0 1.0 | rawpixel | https://www.rawpixel.com/image/5920287/photo-image-background-public-domain-technology |
| `desk-bokeh.webp` | puesto | Macbook Computer | CC0 1.0 | stocksnap | https://stocksnap.io/photo/macbook-computer-6UHHE19YG7 |
| `dev-at-monitor.webp` | puesto | Coding Programming | CC0 1.0 | stocksnap | https://stocksnap.io/photo/coding-programming-MJZPCHLERD |
| `metrics-dashboard.webp` | observabilidad | Grafana dashboard for MusicBrainz Hetzner Yamaoka server screenshot | CC0 1.0 | wikimedia | https://commons.wikimedia.org/w/index.php?curid=168618603 |
| `patch-panel.webp` | red | Computer Servers | CC0 1.0 | flickr | https://www.flickr.com/photos/29155878@N03/26655728191 |
| `fiber-optics.webp` | red | Fiber Optics Close-Up | CC0 1.0 | rawpixel | https://www.rawpixel.com/image/5966166/fiber-optics-close-up |
| `code-angled.webp` | código | Binary source code | CC0 1.0 | rawpixel | https://www.rawpixel.com/image/680868/computer-code |
| `code-bokeh.webp` | código | Computer Code | CC0 1.0 | stocksnap | https://stocksnap.io/photo/computer-code-AWXC4NOFZN |

Texto de la licencia: https://creativecommons.org/publicdomain/zero/1.0/

## Si hay que reemplazar una

1. Buscar en `https://api.openverse.org/v1/images/?q=<tema>&license=cc0,pdm` (sin clave).
2. Añadirla a `CHOSEN` en `scripts/build-hero-tiles.mjs` y ejecutarlo.
3. Pegar la tabla que imprime el script en «Las dieciséis», sustituyendo la de arriba.
4. Poner el nuevo `slug` en `COLUMNS`, en `HeroStage.tsx`. **Una teja que no está en `COLUMNS` no
   se ve**: el archivo existe, pesa en el repositorio y no aparece en la portada. Y al colocarlo,
   respetar las dos reglas de la mezcla —que no se repita dentro de su columna y que no coincida
   con la teja de la misma altura en la columna de al lado—, que están explicadas allí.

No hay `alt` que actualizar: el escenario entero es `aria-hidden` y las fotos van con `alt=""` a
propósito (ver `HeroStage.tsx`).

No vale meter una foto a mano en esta carpeta: sin pasar por el script no lleva el mismo grado ni
el mismo recorte, y se nota en cuanto se pone al lado de las otras.
