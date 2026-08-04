---
name: flujo-de-trabajo-git
description: El error de commitear directamente en main y cómo evitarlo — comprobar la rama ANTES de editar, no después
metadata:
  type: feedback
---

**Comprobar en qué rama estás ANTES de tocar un fichero y ANTES de mergear, no antes de hacer el
commit.**

**Volvió a pasar el 2026-08-03, en la variante «merge»**: la rama `feature/integrar-sanity` se
mergeó en **`test`**, no en `develop`, porque el worktree principal estaba en `test` de una
promoción anterior y nadie lo comprobó. El `git merge --no-ff` **funcionó y creó su commit de
merge** —la señal de alarma de más abajo no salta cuando el destino es una rama que va por
detrás—, así que la única pista era el `git branch --show-current` que se ejecutó en el mismo
comando y devolvió `test`. Se arregló sin perder nada porque no estaba empujado: `git reset --hard
origin/test`, `checkout develop`, y el mismo merge otra vez. **Trabajar en un worktree no protege
de esto**: la rama de la tarea vive en el worktree, pero el merge se hace en el directorio
principal, que es justo el que puede estar en cualquier rama.

**Why:** en la sesión del 2026-08-01 el arreglo de la imagen social acabó commiteado directamente en
`main`, saltándose `develop` → `test` → `main`. La causa: la promoción anterior terminaba con
`git checkout main`, y las ediciones siguientes se hicieron sin volver a `develop`. Y el fallo pasó
desapercibido porque la cadena `git push origin develop && git checkout test && git merge develop`
**devolvió éxito**: `develop` no tenía nada nuevo, así que el push fue un no-op y el merge dijo
«Already up to date». El script imprimió «test pushed» y nada indicó que el commit estaba en el sitio
equivocado. Se detectó al mirar el contenido del fichero en la rama, no por ningún error.

Se arregló sin perder nada porque el commit **no estaba empujado**: `cherry-pick` a `develop`,
`reset --hard` de `main` a lo que ya había en `origin/main`, y promoción normal. Si hubiera estado
empujado, la única salida limpia habría sido un commit de revert en `main`.

**How to apply:**

1. Después de **cualquier** promoción, volver a `develop` en el mismo comando:
   `git checkout main && git merge --no-ff test && git push origin main && git checkout develop`.
2. Antes de la primera edición de una tanda **y antes de cualquier `merge`**,
   `git branch --show-current` y **leer la respuesta**. Cuesta un segundo. Encadenarlo con `&&` al
   propio merge no sirve de nada si no se mira lo que imprimió.
3. **No confiar en que una cadena con `&&` haya hecho algo.** Un push sin cambios y un merge
   «Already up to date» salen con código 0. Después de una promoción, comprobar el resultado:
   `git log --oneline -1` de la rama, o mejor, un `grep` del cambio que se esperaba mover.
4. La señal de alarma: si `git merge --no-ff` **no** crea un commit de merge, no había nada que
   mover y el trabajo está en otra rama.

Ver [[modelo-de-ramas]] para el flujo que esto protege.
