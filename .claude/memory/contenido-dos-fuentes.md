---
name: contenido-dos-fuentes
description: El panel manda cuando tiene contenido y content/ es el suelo — por qué, el fallo concreto que evita, y la única excepción (el retrato, por campo)
metadata:
  type: project
---

Es la decisión de arquitectura central del proyecto, y la única en la que se separa a propósito de
Swiftmet, Manfisa y Sangil Studio.

En esos tres, **Sanity es la única fuente** y su ausencia es un error: sin catálogo, la web de un
fabricante no es nada. Aquí la regla es otra, y vive entera en `lib/content.ts`:

> **El panel manda cuando tiene contenido; el repositorio es el suelo.**
>
> 1. Sin `NEXT_PUBLIC_SANITY_PROJECT_ID` → se sirve `content/`.
> 2. Con Sanity configurado pero **sin documentos de un tipo** → se sirve `content/` **para ese
>    tipo, y sólo para ese**.
> 3. Con documentos → mandan los del panel.

**Why:** un portfolio es justo el sitio donde no se quiere depender de un servicio externo para
existir. Este repositorio se clona y se despliega sin credenciales de nada y el CV sale completo.
Enchufar el panel después es una mejora (editar el CV desde el móvil sin desplegar, que es lo que
impide que un CV se quede viejo) y no un requisito. **Desde el 2026-08-03 el panel existe y
manda** —ver [[sanity-enchufado]]—, y la regla sigue siendo la misma: `content/` no se borra.

**La regla tiene un precio y conviene saberlo**: cuando el punto 2 se dispara por un fallo de
configuración en vez de por un dataset vacío de verdad, **la web no se rompe, y eso la hace difícil
de depurar**. Pasó al enchufar el panel: los dieciséis documentos estaban importados y visibles en
`/admin`, pero sus `_id` llevaban un punto y no eran legibles sin token, así que el build recibía
listas vacías y caía al respaldo. El sitio se veía perfecto. Ver [[sanity-enchufado]].

El **punto 2** es el que de verdad importa y no es obvio: evita el fallo más probable de todos —
crear el proyecto de Sanity, no haber importado todavía el contenido, y que la web se quede en
blanco justo el día que alguien la mira. Un dataset vacío no es una instrucción de borrar el CV.

**How to apply:**

- Nunca importar `content/` desde una página ni desde un componente. Todo pasa por
  `lib/content.ts`; es lo que permite cambiar de dónde sale el contenido sin tocar una vista.
- **No borrar `content/` al enchufar Sanity.** El punto 2 depende de que siga ahí.
- `sanity/env.ts` **no lanza error** si faltan las variables, al contrario que en los proyectos de
  cliente. Y `sanity/client.ts` crea el cliente **a demanda** con una función, no en el ámbito del
  módulo: `createClient` con `projectId` vacío lanza al importar, y eso reventaría el build de una
  web que no necesita Sanity.
- `/admin` sin configurar no falla: `ConnectionNotice` dice qué variable falta, dónde se consigue y
  recuerda que la web pública funciona igual.
- Para pasar de `content/` al panel: `npm run migrate:build && npm run migrate:import`. El script
  sube también las seis capturas con `_sanityAsset`; sin eso los documentos entrarían sin imagen y
  las tarjetas perderían lo que las hace convincentes. **El retrato no lo sube**, y es a propósito:
  ver la excepción de abajo.

## La única excepción: el retrato, con respaldo POR CAMPO

Los tres puntos de la regla funcionan **por documento**, y hay un caso en el que eso no alcanza. El
campo «Retrato» del «Perfil» es opcional, y un perfil sin foto elegida es un documento
**perfectamente válido**: no dispara ningún respaldo, así que el hero se quedaba con el hueco de
trama de `Figure` — un rectángulo rayado donde va la cara. Desde el **2026-08-03**:

> **Si el panel trae retrato, manda el del panel. Si el campo está vacío, se sirve
> `public/luis.webp`.**

Lo pone `getProfile`, con la imagen exportada como `portrait` en `content/profile.ts`, y
`Profile.photo` es **obligatorio** en el tipo para que ninguna vista tenga que comprobarlo. Vaciar
el campo en el panel es una acción legítima —«usa la foto que viene con la web»—, de ahí que no
lleve `required()`, y `migrate:import` no sube el retrato para no dejar de fábrica dos copias de la
misma foto con la del panel ganando. La trampa de implementarlo está en la consulta:
`select(defined(photo.asset) => …)` y **no** `photo {…}` a secas, que devuelve un objeto de nulos y
tumbaría la validación del perfil entero. Detalle en [[hero-sanity]].

## Validación: se descarta el documento, nunca la web

Cada documento se valida con **zod** por separado (`keepValid`). Uno que no cumple se descarta con
un aviso en el log del build. Un puesto sin descripción no puede hacer desaparecer los otros tres.

El perfil es el único con trato especial: afecta a la cabecera, al pie y a los metadatos de todas
las páginas, así que si el documento del panel no valida **se cae al respaldo** en vez de lanzar
error. Es lo contrario que en Swiftmet, donde «Company & contact» incompleto sí tumba el build — y
la diferencia es la misma de siempre: allí no hay respaldo al que caer.

Los `transform` de los esquemas normalizan `stack`, `highlights` y `featured` en la frontera, para
que ninguna vista tenga que escribir `?? []`. Ver [[arquitectura-web]].
