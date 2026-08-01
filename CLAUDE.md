# CLAUDE.md — PORTFOLIO · Luis Fernández Sangil

> Contexto principal del proyecto. Este archivo se mantiene **actualizado en cada cambio
> relevante** (ver _Protocolo de mantenimiento_ al final). Es la fuente de verdad compartida por
> quien trabaje en el proyecto.

La memoria curada vive en `.claude/memory/` (índice en `.claude/memory/MEMORY.md`).

@.claude/memory/MEMORY.md

---

## 1. Qué es este proyecto

CV, portfolio y carta de presentación de **Luis Fernández Sangil**, ingeniero industrial y
desarrollador web en Vigo (Analista programador senior en Mobile Smart City Corp desde marzo de
2026). Sustituye al portfolio anterior en Astro, que sigue en `C:\Proyectos\Porfolio` y del que
sólo se ha recuperado el retrato.

El objetivo es explícito y conviene tenerlo presente al decidir cualquier cosa: **maximizar
oportunidades e imagen profesional.** Quien lo lee es un recruiter o un cliente potencial que le
dedica entre treinta segundos y dos minutos. Todo lo que no ayude a eso, sobra.

Reutiliza el stack, la arquitectura y la metodología de `C:\Proyectos\Swiftmet`, que a su vez los
heredó de `C:\Proyectos\sangilstudio`.

**Estado (2026-08-01): DESPLEGADO.**
[luisfernandezsangil.vercel.app](https://luisfernandezsangil.vercel.app) (producción, rama `main`)
y [luisfernandezsangiltest.vercel.app](https://luisfernandezsangiltest.vercel.app) (test, rama
`test`, con `Disallow: /`). `npm run check` limpio y `npm run check:mobile` **21/21 en local, en
test y en producción**, en los dos idiomas. El flujo `develop` → `test` → `main` está verificado:
`develop` no despliega nada y cada push a `test` y a `main` despliega en su entorno. IDs y detalles
en la memoria [[despliegue]].

**Todavía no hay proyecto de Sanity**, y la web funciona igual sirviendo `content/` — es
exactamente lo que la arquitectura contempla (ver [[contenido-dos-fuentes]]). Enchufarlo es el
siguiente paso opcional, con los cuatro pasos del README, «Puesta en marcha del panel».

## 2. Stack técnico

- **Frontend:** Next.js 16 (App Router, Turbopack) + TypeScript estricto + Tailwind CSS 4, con
  **zod** validando el contenido. **Estático**: en servidor sólo `proxy.ts` (negocia idioma), el
  webhook de revalidación y las dos rutas de imagen generada.
- **Bilingüe:** `es` (por defecto) y `en`, en `/es` y `/en`. Sólo el castellano es obligatorio en
  el contenido; lo que falte cae al castellano en `lib/content.ts`.
- **Contenido: doble fuente con una regla.** `content/` es el suelo y Sanity manda cuando tiene
  documentos. Es la decisión de arquitectura central y está explicada en el README y en
  [[contenido-dos-fuentes]]. **Diferencia importante con los proyectos de cliente**: ahí Sanity es
  la única fuente y su ausencia es un error; aquí la web se construye y se despliega sin
  credenciales de nada.
- **Panel:** Sanity dentro de la propia web, en `/admin`. Cinco tipos de documento: el singleton
  `profile` y `experience`, `education`, `skillGroup` y `project`, los cuatro ordenables
  arrastrando.
- **Despliegue: Vercel**, dos entornos (`main` → producción, `test` → test con `noindex`).
  Framework declarado en `vercel.json`.
- **Calidad:** `npm run check` (typecheck + ESLint + Prettier) y `npm run check:mobile` (21
  comprobaciones en Chrome real a 390×844, por idioma).
- **Tipografía:** Instrument Serif (titulares), Inter (cuerpo) y JetBrains Mono (datos), las tres
  autoalojadas por `next/font` — ninguna petición a Google en tiempo de ejecución.
- **Navegación:** cabecera fija en escritorio; en móvil (`< lg`), barra inferior de cinco iconos.
  Nunca las dos a la vez.
- **Alineación: el texto va centrado** en el espacio que ocupa, como en `sangilstudio`. `text-center`
  en la sección + `mx-auto` en las cajas con ancho máximo + `justify-center` en las filas flex; las
  tres cosas juntas, porque ninguna hace el trabajo de las otras. **En papel no**: `@media print` lo
  deshace. Qué quedó sin centrar y por qué, en [[decisiones-de-diseno]].
- **Los proyectos destacados de la portada van en un carrusel «cover flow»** (bloque «COVER FLOW»
  de `app/globals.css` + `components/ui/CoverFlow.tsx`): giro 3D dirigido por el scroll, sin
  JavaScript salvo los dos botones. Fallback sin soporte o con `prefers-reduced-motion`: carrusel
  horizontal plano. En papel se deshace en retícula de dos columnas. Ver [[cover-flow]].

Detalle y razonamiento en el **README.md**, que es extenso a propósito, y en `.claude/memory/`.

## 3. Las decisiones que no hay que deshacer sin pensarlo

1. **Ninguna cifra del CV está escrita a mano.** Los años de experiencia, el número de proyectos
   en producción, las empresas y las tecnologías se calculan del contenido. El portfolio anterior
   decía «+4 años» cuando ya eran cinco. Ver [[cifras-calculadas]].
2. **El reloj no se lee durante el render.** `next.config.ts` congela el mes del build en
   `NEXT_PUBLIC_BUILD_MONTH`. Con `cacheComponents` activo, leer la fecha en un componente
   volvería dinámica una ruta que debe ser estática.
3. **La indexación se decide por la rama, no por `VERCEL_ENV`.** El proyecto de test despliega
   `test` como su propia producción, así que `VERCEL_ENV` valdría `production` allí también y
   habría dos copias del CV compitiendo en Google por el nombre.
4. **`content/` no se borra al enchufar Sanity.** Es el respaldo, y el punto 2 de la regla del
   contenido depende de que siga ahí.
5. **Nada de formulario de contacto.** Un `mailto:` con la dirección visible deja el mensaje en
   la bandeja de enviados de quien escribe, que es donde lo quiere alguien que escribe por
   trabajo.
6. **El estado laboral que se muestra es el puesto actual, no «disponible».** Es un dato
   verificable en LinkedIn y no una señal de búsqueda activa que pueda leer un jefe.
7. **El cover flow se mide por el ANCHO del carrusel, no con `view-timeline-inset`.** El inset es
   el camino evidente y obliga a un `calc()` con porcentaje; medirlo por el ancho deja la
   geometría en un sitio y, de paso, convierte el carrusel en una ventana centrada en vez de una
   banda a sangre con medio metro de vacío a la izquierda en un monitor ancho. Ver
   [[cover-flow]].

## 4. Reglas del proyecto

Heredadas de la metodología de `sangilstudio` y `Swiftmet`:

1. **Contexto siempre a nivel de proyecto, nada global** — memorias, skills y reglas viven en
   `.claude/` de este repo. (`.claude/` está gitignorado: es local a la máquina.)
2. **Nunca subir secretos** — credenciales, keys, tokens y `.env` jamás se sincronizan con
   GitHub; al añadir uno nuevo se incluye en `.gitignore` **antes** de subir nada.
3. **Claude nunca hace commit ni push** — modifica ficheros y **propone un mensaje de commit
   CORTO y en inglés**; el usuario revisa y ejecuta. Sólo si lo pide explícitamente en el momento,
   Claude ejecuta el commit. _(En la sesión del 2026-08-01, Luis autorizó explícitamente el git y
   el alta en Vercel del montaje inicial.)_
4. **Sincronizar antes de trabajar** — `fetch`/`pull` antes de empezar una modificación.
5. **Rama por tarea, y la rama se BORRA al mergear** — rama con nombre representativo sacada de
   `develop`; al terminar, `git merge --no-ff` en `develop`, push, y `git branch -d` +
   `git push origin --delete`. **Nunca squash** en las promociones `develop` → `test` → `main`.
6. **Una tarea de interfaz no está hecha hasta verla en móvil** — `npm run check:mobile` antes de
   cerrarla.
7. **Los despliegues se validan con un preview real de Vercel**, nunca con `vercel build` en
   local: en Windows falla siempre por un bug del builder, no de la web.
8. **No inventar datos del CV.** Es la regla más importante de este proyecto. Fechas, puestos,
   empresas, clientes y titulación son los que constan en LinkedIn
   (linkedin.com/in/luisfernandezsangil). Los resúmenes redactan esa información pero **no añaden
   hechos**. Lo que no consta se deja fuera; un CV con un dato dudoso vale menos que uno con un
   hueco, porque el dato dudoso se comprueba al pedir referencias.

### Modelo de ramas

| Rama      | Para qué                                                            | Vercel                                                         |
| --------- | ------------------------------------------------------------------- | -------------------------------------------------------------- |
| `develop` | Día a día: desarrollar, depurar y subir al repositorio sin publicar | **Nada.** No despliega                                         |
| `test`    | Entorno de test                                                     | `luisfernandezsangiltest` → luisfernandezsangiltest.vercel.app |
| `main`    | Producción                                                          | `luisfernandezsangil` → luisfernandezsangil.vercel.app         |

Detalle en [[modelo-de-ramas]].

## 5. Protocolo de mantenimiento

En **cada cambio relevante**, sin que se lo pidan:

1. Actualizar las memorias afectadas en `.claude/memory/` y su índice `MEMORY.md`.
2. Actualizar este `CLAUDE.md` si el cambio afecta a la estructura, el stack, el estado o las
   convenciones.
3. Actualizar el `README.md` si el cambio afecta a algo que deba saber quien despliegue o edite
   contenido — en particular la sección «Pendiente».

Regla de oro: **el contexto nunca debe quedar desactualizado respecto al estado real del
proyecto.**

---

_Última actualización: 2026-08-01 — montaje inicial del proyecto. Stack de Swiftmet (Next 16 +
Sanity + Vercel) con dos diferencias deliberadas: contenido de doble fuente para que la web no
dependa de Sanity para existir, y bilingüe es/en en vez de trilingüe. Datos del CV tomados del
perfil de LinkedIn (el portfolio anterior en Astro los tenía desactualizados: faltaba el puesto
de Mobile Smart City, la ubicación decía otra cosa y no había formación)._

_2026-08-01 — todo el texto de la web pasa a estar centrado en el espacio que ocupa, con el criterio
de `sangilstudio`. El bloque `@media print` lo deshace: en papel el CV sigue alineado a la izquierda._
