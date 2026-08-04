---
name: respuestas-cortas
description: Norma local del proyecto — responder siempre con menos de 50 palabras por defecto, salvo que se pida lo contrario
metadata:
  type: feedback
---

**Responder por defecto con menos de 50 palabras siempre**, a no ser que se pida específicamente lo
contrario (un resumen largo, una explicación detallada, un documento).

Vale para el texto de respuesta al usuario, no para lo que se escribe en los ficheros: el
`CLAUDE.md`, el `README.md` y las memorias de este proyecto son extensos a propósito (ver
[[arquitectura-web]]).

**Why:** Luis lee las respuestas en la terminal mientras trabaja. Una respuesta de veinte líneas
para un cambio de dos ficheros obliga a buscar el dato dentro del texto; el detalle ya queda
escrito en el repo, que es donde se consulta después.

**How to apply:** decir qué se ha hecho, si está comprobado y qué queda pendiente. Nada de
recapitular el razonamiento, enumerar alternativas descartadas ni repetir lo que ya está en el
`CLAUDE.md`. Si hace falta más, se pide.
