---
name: sanity-enchufado
description: El panel real (ids, dataset público, CORS, webhooks) y las dos trampas de enchufarlo — el _id con punto y el host del endpoint de webhooks
metadata:
  type: project
---

El panel de Sanity se enchufó el **2026-08-03**, en la rama `feature/integrar-sanity`.

## Lo que existe

- **Proyecto** `Portfolio`, id **`3pdexisd`** (creado con `npx sanity projects create`, no por la
  web). Los otros proyectos de la cuenta son Swiftmet `3caofriy`, Manfisa `65pypeao`,
  SangilStudio `d88iemmi` y Mila Barber `qb7n9gwn`.
- **Dataset** `production`, **público**. A propósito: la web lee **sin token** durante el build, y
  un dataset privado obligaría a repartir una credencial de lectura entre los dos proyectos de
  Vercel para servir un CV que es público de todas formas.
- **Dieciséis documentos** importados (1 perfil, 4 puestos, 1 formación, 4 grupos de stack, 6
  proyectos) y **siete imágenes** (retrato y seis capturas) subidas como assets.
- **Tres orígenes CORS con credenciales**: `http://localhost:3000` y los dos dominios de Vercel.
  Sin esto `/admin` carga la interfaz pero no puede hablar con Sanity.
- **Dos webhooks** de revalidación (`WVFgoOA9Qk20DhWM` producción, `jsRLtUneaoiWWB0p` test), los
  dos sobre `production`, con `rule.on = ["create","update","delete"]` y filtro
  `_type in ["profile","experience","education","skillGroup","project"]` para que una subida de
  imagen no regenere el sitio.
- **No hay token de escritura.** No hace falta: el importador usa la sesión de `sanity login` y el
  panel, la del navegador. `SANITY_API_WRITE_TOKEN` sigue declarado en `.env.example` y vacío.

## Trampa 1 — un `_id` con punto es privado, y el fallo es SILENCIOSO

**Para Sanity el `_id` es una ruta separada por puntos y sólo la raíz es pública.** `experience.altia`
está en un subcamino y **exige token de lectura**, que es el mismo mecanismo con el que `drafts.`
esconde los borradores (https://www.sanity.io/docs/content-lake/ids). El script de importación
generaba exactamente eso.

**Cómo se manifestó:** `npm run migrate:import` dijo «Done! Imported 16 documents», el panel
enseñaba los dieciséis, y **la web seguía sirviendo `content/`**. Ni un error, ni un aviso raro:
sólo la línea «El panel no tiene el proyecto publicado» en el log del build, que es exactamente lo
que `lib/content.ts` debe imprimir cuando una consulta vuelve vacía (ver
[[contenido-dos-fuentes]]). El sitio se veía perfecto.

**Por qué costó encontrarlo:** `profile` es el único `_id` sin punto, así que la cabecera, el pie y
los metadatos **sí** venían de Sanity. Con el perfil funcionando, la hipótesis natural era que
fallaba la validación de zod en los otros tipos, no la lectura. Lo que lo destapó fue consultar
`*[]._id` con un cliente **anónimo** —igual que el del build— y ver ocho assets y un solo
documento.

**How to apply:**

- Los `_id` van con guion: `idFor()` en `scripts/build-sanity-import.mjs` lo centraliza y el
  comentario explica por qué. No usar plantilla con punto «porque queda más limpio».
- **Depurar siempre con un cliente anónimo**, no con `npx sanity documents query`: el CLI va
  autenticado y ve los documentos privados, así que confirma la hipótesis equivocada.
- Al cambiar los `_id` hay que **borrar los antiguos** (`npx sanity documents delete …`):
  `--replace` sólo reemplaza los que coinciden, y quedarían quince duplicados invisibles.

## Trampa 2 — los webhooks se crean contra el host del PROYECTO

El endpoint es `https://<projectId>.api.sanity.io/v2025-02-19/hooks/projects/<projectId>`, con
`type: "document"` obligatorio en el cuerpo. Contra `api.sanity.io` (el host global) responde un
endpoint más viejo que va rechazando campo por campo: `"rule" is not allowed`, luego `apiVersion`,
luego `httpMethod`, luego `secret`.

**De ahí salía la advertencia del README** —heredada de Swiftmet— de que había que crear el webhook
y **parchearlo después** con `rule: {on: [...]}` porque el `POST` no lo aceptaba. Era falso: contra
el host correcto el `POST` acepta `rule` a la primera. La advertencia queda corregida en el README.

**How to apply:** `npx sanity openapi get webhooks` devuelve el contrato exacto, incluido el
`servers:` con el host correcto. Es más rápido que adivinar el cuerpo campo por campo, y es lo que
resolvió esto. `npx sanity hooks create` existe pero es interactivo y no sirve desde aquí.

## Verificado

`npm run check` limpio, `npm run build` **sin una sola línea de respaldo** en el log, y
`check:mobile` 21/21 en los dos idiomas contra el build de producción leyendo de Sanity. El
`/api/revalidate` local devuelve 401 a una petición sin firma, que es la prueba de que el secreto
está cargado. Ver [[verificacion]] y [[despliegue]].
