# Tejas de la portada — procedencia y licencia

Las once fotografías de `public/hero/` son el material del **escenario cinético** de la portada
(`components/sections/HeroStage.tsx`). Este archivo existe para que dentro de dos años se pueda
responder sin dudar de dónde salió cada una, porque una foto sin procedencia documentada es una
foto que hay que quitar.

## La regla que se aplicó al elegirlas

**Sólo dominio público.** Las once están bajo **CC0 1.0** (Creative Commons Zero, renuncia
universal): uso comercial permitido, obras derivadas permitidas y **atribución no exigida**. Se
descartó a propósito todo lo que fuera CC-BY o CC-BY-SA, aunque también es gratuito: obligan a
mostrar el crédito junto a la imagen, y un escenario decorativo detrás de un titular no es sitio
para once líneas de créditos. Con CC0 no hay nada que mostrar y nada que se pueda incumplir.

La atribución **no es obligatoria**, pero se deja escrita aquí igualmente. Es cortesía con quien
publicó la foto y, sobre todo, es lo que hace verificable la afirmación de arriba.

Se localizaron con la API de [Openverse](https://openverse.org) filtrando por `license=cc0,pdm`.

## Procesado

`scripts/build-hero-tiles.mjs` las recorta a **600×400 (3:2)** con `sharp`, usando el recorte por
zona de interés (`position: 'attention'`), les aplica un grado suave horneado en el archivo
(brillo 0,92 · saturación 0,78) y las guarda en **WebP de calidad 66**. Las once juntas pesan
**152 KB**.

El grado va **horneado y no en CSS** por rendimiento: once `filter: brightness()` sobre imágenes
que además se están moviendo obligan al navegador a repintar cada fotograma. Horneado, el
escenario sólo compone capas ya listas.

**Estos archivos son lo que se descarga, sin intermediarios.** El cargador del proyecto
(`sanity/imageLoader.ts`) devuelve las rutas locales sin tocarlas —el que redimensiona es la CDN
de Sanity, y estas tejas viven en `public/`—, así que `next/image` no genera variantes de ellas.
De ahí el 600 y el 66: 600 px es el ancho máximo al que se pinta una teja en una pantalla de
densidad 2, y 66 es todo lo que necesita una fotografía que se ve detrás de una máscara, un velo
y, la mitad del tiempo, del retrato.

## Las once

| Archivo                   | Papel    | Título original                 | Licencia | Fuente    | Original                                                                              |
| ------------------------- | -------- | ------------------------------- | -------- | --------- | ------------------------------------------------------------------------------------- |
| `datacenter-aisle.webp`   | servidores | Free computer server room image | CC0 1.0  | rawpixel  | https://www.rawpixel.com/image/5906639/photo-image-light-desktop-wallpapers-public-domain |
| `switch-port.webp`        | red      | Internet modem port             | CC0 1.0  | rawpixel  | https://www.rawpixel.com/image/6038427/photo-image-public-domain-technology-line       |
| `code-editor.webp`        | código   | Programming Code                | CC0 1.0  | stocksnap | https://stocksnap.io/photo/programming-code-1STVFMTBJY                                 |
| `code-dense.webp`         | código   | Digital program source code     | CC0 1.0  | rawpixel  | https://www.rawpixel.com/image/543441/free-photo-image-technology-tech-code            |
| `laptop-code-close.webp`  | código   | Macbook Laptop                  | CC0 1.0  | stocksnap | https://stocksnap.io/photo/macbook-laptop-2UXCQG5Q7W                                   |
| `typing-laptop.webp`      | teclear  | Coding Programming              | CC0 1.0  | stocksnap | https://stocksnap.io/photo/coding-programming-F164KBFZ95                               |
| `typing-dark.webp`        | teclear  | Coding Programming              | CC0 1.0  | stocksnap | https://stocksnap.io/photo/coding-programming-PBTF1NEBCG                               |
| `typing-warm.webp`        | teclear  | Laptop Macbook                  | CC0 1.0  | stocksnap | https://stocksnap.io/photo/laptop-macbook-YRUO4LCSLB                                   |
| `circuit-board.webp`      | hardware | Free circuit board macro image  | CC0 1.0  | rawpixel  | https://www.rawpixel.com/image/5920287/photo-image-background-public-domain-technology |
| `desk-bokeh.webp`         | puesto   | Macbook Computer                | CC0 1.0  | stocksnap | https://stocksnap.io/photo/macbook-computer-6UHHE19YG7                                 |
| `dev-at-monitor.webp`     | puesto   | Coding Programming              | CC0 1.0  | stocksnap | https://stocksnap.io/photo/coding-programming-MJZPCHLERD                               |

Texto de la licencia: https://creativecommons.org/publicdomain/zero/1.0/

## Si hay que reemplazar una

1. Buscar en `https://api.openverse.org/v1/images/?q=<tema>&license=cc0,pdm` (sin clave).
2. Añadirla a `CHOSEN` en `scripts/build-hero-tiles.mjs` y ejecutarlo.
3. Actualizar la tabla de arriba **y** el `alt` correspondiente en `HeroStage.tsx`.

No vale meter una foto a mano en esta carpeta: sin pasar por el script no lleva el mismo grado ni
el mismo recorte, y se nota en cuanto se pone al lado de las otras.
