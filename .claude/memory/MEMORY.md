# MEMORY.md — Índice de memorias (PORTFOLIO · Luis Fernández Sangil)

Índice de las memorias del proyecto. Una línea por memoria. El contenido vive en cada archivo
`.md`, nunca aquí.

- [Respuestas cortas](respuestas-cortas.md) — norma local: menos de 50 palabras por defecto, salvo que se pida lo contrario
- [Perfil y datos del CV](perfil-cv.md) — qué datos son firmes, de dónde salen, qué NO se puede inventar, las tres tandas de textos del 2026-08-04 (dos las escribió Luis en el inspector del navegador: aquí está cómo se recoge eso), la nota de formación que pasa a ser dos párrafos y las tres podas de formación
- [Contenido: dos fuentes y una regla](contenido-dos-fuentes.md) — por qué la web funciona sin Sanity, qué gana el panel, y la única excepción: el retrato cae por campo
- [Sanity enchufado](sanity-enchufado.md) — el panel real (id, dataset público, CORS, webhooks) y las dos trampas: el `_id` con punto y el host de los webhooks
- [Lista de proyectos](lista-de-proyectos.md) — qué proyectos salen se decide con un título en `projects.config.ts`, la captura es el viewport de su web en vivo, el índice de `/projects` retirado y todo lo que arrastró, por qué la lista no manda en lo desplegado, y el enlace de Sangil Studio pendiente en el panel
- [Cifras calculadas](cifras-calculadas.md) — ninguna cifra del CV está escrita a mano, y por qué el reloj se congela en el build
- [Arquitectura de la web](arquitectura-web.md) — stack, patrones heredados de Swiftmet y decisiones propias
- [Decisiones de diseño](decisiones-de-diseno.md) — oscuro sin conmutador, serif de titular, un solo acento, texto centrado, experiencia centrada moviendo la CABECERA y no la lista (y las dos vueltas anteriores que lo intentaron al revés), la retícula del perfil que sólo se monta si hay párrafos para llenarla, hoja de impresión
- [Hero de la portada](hero-sanity.md) — la composición de sanity.io adaptada: las cinco piezas, la excepción a la regla de centrado, los tres ajustes que salieron de las capturas, el retrato con respaldo por campo, el halo dorado que se quitó, y la entrada actual —sólo se animan dos líneas: el nombre enfoca y el titular se teclea, con el resto puesto desde el primer fotograma— con el fallo de Chrome que decide cómo se escribe
- [Campo interactivo](campo-interactivo.md) — el fondo de la web menos la portada, dibujado en canvas: capa fija en el layout, la costura con el escenario del hero, por qué se pinta en doce grupos, el velo que no hay que subir y las trampas del TypeScript estricto
- [Cover flow](cover-flow.md) — el carrusel 3D de proyectos: todos y en bucle infinito desde el 2026-08-03, la cinta de correr de tres copias, por qué se mide por el ancho, y por qué una pestaña oculta miente
- [Navegación y orden de la portada](navegacion-y-orden.md) — las CINCO secciones de la portada desde que el stack va dentro del perfil, el menú de móvil a pantalla completa con los idiomas sin rótulo, la numeración escrita a mano, el botón de volver arriba que antes no funcionaba, el resaltado de la sección que se está leyendo con una línea de lectura, y los rótulos reescritos con la nota del stack retirada
- [URLs sin anclas](urls-sin-anclas.md) — por qué nunca se ve `#seccion` en la barra, y las tres trampas de conseguirlo (y desde que no hay índice, las seis entradas del menú son anclas)
- [Modelo de ramas](modelo-de-ramas.md) — una rama por entorno: develop no despliega, test es test, main es producción
- [Flujo de trabajo con git](flujo-de-trabajo-git.md) — comprobar la rama antes de editar, y por qué una promoción puede «funcionar» sin mover nada
- [Despliegue](despliegue.md) — IDs reales de Vercel y GitHub, y los pasos que el CLI no puede hacer
- [Verificación](verificacion.md) — qué comprueban las 23 comprobaciones de `check:mobile`, los fallos reales que encontró, y las dos razones por las que el navegador de Claude no sirve para móvil (viewport y scroll sin animar) y para qué SÍ sirve: leer lo que Luis edita en el inspector
