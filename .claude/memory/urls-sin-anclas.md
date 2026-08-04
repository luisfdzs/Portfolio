---
name: urls-sin-anclas
description: por qué la URL nunca enseña #seccion, y las tres trampas que tiene conseguirlo con el App Router
metadata:
  type: project
---

Las seis secciones de la portada son anclas y las fichas de proyecto son páginas, pero **en la barra
de direcciones nunca debe verse una almohadilla**: decisión tomada el 2026-08-01, porque al
visitante dos formas de URL le llegan como una incoherencia. Lo hace
`components/layout/HashCleaner.tsx`, montado en el layout de `(site)`.

Desde que el índice de proyectos se retiró (2026-08-03, [[lista-de-proyectos]]) **las seis entradas
del menú son anclas** y este componente es lo único que hace que las seis dejen la URL igual. Su
otro camino —cambiar de página y buscar la sección al llegar— sigue haciendo falta: es el del enlace
«Volver a los proyectos» de una ficha y el del menú desde una ficha. Comprobado sobre el build de
producción: los dos aterrizan con el borde de la sección justo bajo la cabecera y la URL en `/es`.

**No se tocan los `href`.** Siguen llevando el ancla, y eso conserva lo que el navegador da
gratis: navegación sin JavaScript, «abrir en otra pestaña», y los enlaces viejos de LinkedIn y
las redirecciones de `next.config.ts` siguen llevando a su sección.

**La regla que lo sostiene: el ancla nunca entra en el router.** Cualquier clic normal se
intercepta con `preventDefault` y se desplaza a mano. Costó tres intentos llegar ahí:

1. **Borrar el fragmento antes de tiempo cancela el salto.** No lo descoloca: lo cancela. El
   navegador guarda el salto pendiente hasta que la sección aparece —la portada llega por
   streaming, así que el layout hidrata antes—, y si para entonces el ancla ya no está en la
   URL, se queda arriba del todo. Enlace profundo roto en silencio. De ahí que el único camino
   que aún limpia a posteriori —la visita que entra con el ancla puesta— sondee hasta que la
   sección existe **antes** de borrar nada.
2. **Limpiar después desincroniza el router, y el fallo aparece tarde.** Next lleva su propia URL
   canónica; en cuanto tiene un fragmento dentro y se lo quitas por debajo con
   `history.replaceState`, el clic siguiente compone sobre lo que él cree que hay y sale
   `/es#education#contact` — dos almohadillas, ninguna sección que corresponda y ni siquiera se
   limpia. `router.replace` tampoco vale: no actualiza la barra. **Se coló en dev y sólo apareció
   en el build de producción**, encadenando entrar con ancla y pulsar después una sección; en dev
   nunca se probaron esos dos pasos seguidos. Lección: encadenar los caminos, no probarlos
   sueltos, y comprobar sobre `npm start` y no sólo sobre `npm run dev`.
3. **El sondeo se cuenta en intentos, no en milisegundos.** En una pestaña de segundo plano el
   navegador para `requestAnimationFrame` y estira los temporizadores; un plazo en tiempo real se
   agota sin haber llegado a mirar.

Dos detalles que hay que conservar al tocarlo: `next/link` comprueba `defaultPrevented`
**después** de llamar al `onClick` del enlace, y de eso depende que la barra de móvil se siga
cerrando sola; y el desplazamiento descuenta la altura de la cabecera fija, que en móvil mide
cero porque está oculta — medirla en vez de escribir 64 px es lo que hace que valga en los dos.
El foco se mueve a mano a la sección (`tabindex="-1"`), que es lo que hace de más un ancla nativa.

Lo que se pierde, y está dicho en el README y en el propio componente: **copiar la URL ya no
comparte la sección**, y «atrás» sale de la página en vez de recorrer las secciones visitadas.

Alternativa descartada: convertir las secciones en rutas reales (`/es/experience`). Es la
respuesta más limpia en URLs, pero deja cinco páginas por idioma con el mismo CV compitiendo con
la portada por «Luis Fernández Sangil», que es el término por el que existe la web. Ver
[[decisiones-de-diseno]] y [[arquitectura-web]].

**Pendiente relacionado:** Chrome avisa en consola de que el `scroll-behavior: smooth` del
`<html>` necesita `data-scroll-behavior="smooth"` para que Next lo desactive durante las
transiciones de ruta. No se ha tocado para no cambiar un comportamiento recién verificado.
