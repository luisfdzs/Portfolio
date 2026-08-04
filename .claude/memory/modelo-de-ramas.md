---
name: modelo-de-ramas
description: Una rama por entorno — develop no despliega, test es el entorno de test, main es producción — y por qué la indexación se decide por la rama
metadata:
  type: project
---

Heredado de Swiftmet, donde se decidió el 2026-08-01. **Cada rama larga es un entorno:**

| Rama      | Para qué                                                        | Vercel                                                         |
| --------- | --------------------------------------------------------------- | -------------------------------------------------------------- |
| `develop` | Desarrollar, depurar y subir al repositorio **sin publicar nada** | Ninguno                                                       |
| `test`    | Entorno de test                                                 | `luisfernandezsangiltest` → luisfernandezsangiltest.vercel.app |
| `main`    | Producción                                                      | `luisfernandezsangil` → luisfernandezsangil.vercel.app         |

Las ramas temporales nacen y **mueren** en `develop`. El sentido es único —`develop` → `test` →
`main`— y siempre con `git merge --no-ff`: **nunca squash**, porque crea SHA nuevos, las ramas
dejan de compartir historia y cada promoción reabre conflictos ya resueltos.

**Why:** hace falta un sitio donde trabajar sin desplegar. Con `develop` mudo, el ruido del día a
día no cuesta compilaciones —que en el plan Hobby están contadas, y aquí con dos proyectos comiendo
del mismo cupo (ver [[despliegue]])— y un despliegue vuelve a significar «esto está listo para que
alguien lo mire».

**How to apply:** trabajo normal → rama temporal desde `develop`, `merge --no-ff` a `develop`,
borrar la rama. Validado en local (`npm run check` y `npm run check:mobile`) → `merge --no-ff` de
`develop` a `test` y push, que es lo que despliega en test. Comprobado en el entorno de test
—incluido `BASE=… npm run check:mobile`— → `merge --no-ff` de `test` a `main`.

## Que `develop` no despliegue está en el repo, no en el panel

`vercel.json` lleva `git.deploymentEnabled: {"develop": false}`. Se versiona, así que **vale igual
para los dos proyectos** sin tocar la interfaz de Vercel — al contrario que la rama de producción de
cada proyecto, que sólo se puede fijar a mano.

## La indexación se decide por la RAMA, no por `VERCEL_ENV`

Es el punto que más fácil se rompe si alguien «simplifica» `lib/site-env.ts`.

El proyecto de test despliega `test` **como su propio entorno de producción**: allí
`VERCEL_ENV === 'production'` también. Usar esa variable dejaría el dominio de test con
`index, follow` y `Allow: /`, es decir, **dos copias del mismo CV compitiendo en Google por «Luis
Fernández Sangil»** — y el resultado que encontrara un recruiter podría ser el de test, con
contenido a medio revisar. En una web de empresa el daño es reparto de posiciones; aquí es que la
primera impresión sea la versión equivocada.

Así que se comprueba `VERCEL_ENV === 'production' && VERCEL_GIT_COMMIT_REF === 'main'`:

```
proyecto luisfernandezsangil      rama main  → indexable
proyecto luisfernandezsangiltest  rama test  → NO indexable
previews de cualquier rama                   → NO indexable
desarrollo local (sin variables)             → NO indexable
```

Falla del lado seguro: si mañana falta la variable, no se indexa.

**Corolario para los despliegues por CLI:** `vercel deploy` toma los metadatos de git del
repositorio local, así que hay que tener **la rama del entorno en HEAD** antes de lanzarlo. Con
`main` en HEAD, un deploy al proyecto de test se declararía indexable.
