---
name: despliegue
description: Identificadores reales de Vercel y GitHub, el paso que el CLI no puede hacer y el coste en builds de tener dos proyectos
metadata:
  type: reference
---

Montado el 2026-08-01 y verificado de punta a punta.

- **GitHub:** https://github.com/luisfdzs/Portfolio — cuenta `luisfdzs`, remoto
  `https://github.com/luisfdzs/Portfolio.git`. Ramas `main` · `test` · `develop` (una por entorno,
  y `develop` sin entorno: ver [[modelo-de-ramas]]).
- **Vercel:** cuenta/equipo `luis-fernandez` (`team_GUma4P465VXkucVFV7Vdn7Tu`), plan **Hobby**.
  - `luisfernandezsangil` (`prj_lce5lxbvQmXu72X6eKjBjnBT4Mhp`), rama `main` →
    https://luisfernandezsangil.vercel.app
  - `luisfernandezsangiltest` (`prj_5Mz5Kvuv7sbH7s5IRlUObmNAcQ6C`), rama `test` →
    https://luisfernandezsangiltest.vercel.app
- **Sanity:** proyecto `Portfolio`, id `3pdexisd`, org `ok5AKUaWz`, dataset `production` público.
  Ver [[sanity-enchufado]].
- **Variables de entorno (2026-08-03), las mismas tres en los DOS proyectos de Vercel:**
  - `NEXT_PUBLIC_SANITY_PROJECT_ID` = `3pdexisd` — All Environments, no sensible
  - `NEXT_PUBLIC_SANITY_DATASET` = `production` — All Environments, no sensible
  - `SANITY_REVALIDATE_SECRET` — Production y Preview, **marcada Sensitive** (no se puede leer
    después desde el panel ni con `vercel env pull`; la copia buena está en `.env.local`)

  Dos detalles del formulario de Vercel: **«Sensitive» no está disponible si se incluye
  Development**, de ahí que el secreto vaya sólo a Production y Preview; y al guardar ofrece un
  **«Redeploy»** que aquí **no se pulsa** — en este proyecto los despliegues los dispara un push a
  `test` o a `main`, y darle al botón se salta el flujo de ramas.

El nombre elegido para el dominio no fue el primero: **`luisfernandez.vercel.app` está ocupado**
por otro Luis Fernández (un estudiante alemán de desarrollo de aplicaciones; responde 200). No es
reclamable. `luisfernandezsangil` coincide además con el usuario de LinkedIn, que es lo que hace
que el enlace se reconozca.

## Lo que el CLI no puede hacer

**La rama de producción de un proyecto.** No hay comando: `vercel project` sólo tiene `add`,
`inspect`, `list`, `members`, `protection`… y ningún `update`. Se fija a mano en
**Settings › Environments › Production › Branch Tracking** y se guarda con «Save» (avisa con
«Branch tracking saved successfully»). Es el único paso manual de todo el montaje, y es
imprescindible: sin él, `luisfernandezsangiltest` desplegaría `main` y los dos dominios servirían
lo mismo.

Se comprueba en la portada del proyecto, que dice literalmente «To update your Production
Deployment, push to the `test` branch».

## El arranque: el CLI, y luego los pushes

Los dos proyectos se crearon **después** de subir las ramas, así que ningún push había disparado
nada y no existía despliegue de producción al que asignar el dominio. Se arrancó con
`vercel deploy --prod --yes`, y ahí hay un detalle que importa: **hay que tener la rama correcta en
HEAD**. Un `vercel deploy` toma los metadatos de git del repositorio local, así que desplegar el
proyecto de test con `main` en HEAD habría puesto `VERCEL_GIT_COMMIT_REF=main` y el dominio de test
**se habría declarado indexable** (ver [[modelo-de-ramas]]). Se hizo con `git checkout test` antes.

De ahí en adelante manda git y no hace falta el CLI.

## Verificado, no supuesto

- Push a `develop` → **ningún despliegue**, en ninguno de los dos proyectos (el commit no registra
  ni un check de Vercel en GitHub).
- Push a `test` → despliegue de **producción** en `luisfernandezsangiltest`.
- Push a `main` → despliegue de **producción** en `luisfernandezsangil`.
- `robots.txt` de producción: `Allow: /` + `Disallow: /admin` + `Sitemap:`. El de test:
  `Disallow: /`. Es la comprobación que confirma que la indexación se decide por la rama.
- Sitemap de producción: 16 URLs con `lastmod`, las dos versiones de idioma y las seis fichas.
- `npm run check:mobile` **19/19 contra el entorno de test desplegado**, en los dos idiomas.
- `/admin` responde: sin Sanity configurado, enseña el aviso de `ConnectionNotice`.

## Dos proyectos = dos builds por push

Los dos proyectos están conectados **al mismo repositorio**, así que un push a `main` genera la
producción de `luisfernandezsangil` **y un preview en `luisfernandezsangiltest`**, y al revés.
Está comprobado en el historial de despliegues: cada push deja un `Production` en uno y un
`Preview` en el otro.

Importa porque el plan Hobby tiene tope de compilaciones y a Swiftmet le pasó: con varios merges
en el mismo día los dos proyectos empezaron a fallar con `target_url` apuntando a
`?upgradeToPro=build-rate-limit`, **y el síntoma engaña** —la web sigue sirviendo la versión
anterior sin ningún aviso, y un `curl` a algo nuevo da 404 igual que si no se hubiera subido—.

Cómo comprobar el estado real de un push:

```bash
gh api repos/luisfdzs/Portfolio/commits/<sha>/status \
  --jq '[.statuses[]|"\(.context): \(.state)"]|join(" | ")'
```

`vercel.json` ya silencia `develop` (`git.deploymentEnabled: {"develop": false}`), que es donde
está el ruido del día a día. Si algún día hace falta callar también las ramas temporales, la forma
es una lista blanca en el mismo sitio: `{"**": false, "main": true, "test": true}` (una regla
`true` gana a una `false`). No se ha puesto todavía porque las ramas temporales viven y mueren en
local por convención.
