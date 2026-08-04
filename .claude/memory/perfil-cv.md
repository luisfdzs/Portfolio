---
name: perfil-cv
description: De dónde salen los datos del CV, qué está verificado, la regla de no inventar nada, las dos tandas de textos del 2026-08-04 —la segunda escrita por Luis en el inspector del navegador, con el método para recogerla— y qué ha ido dejando de enseñar formación (fechas, frase del rótulo y ubicación)
metadata:
  type: project
---

**La fuente de verdad del CV es el perfil de LinkedIn**, no este repositorio:
[linkedin.com/in/luisfernandezsangil](https://www.linkedin.com/in/luisfernandezsangil). Es el
documento que Luis mantiene al día. `content/profile.ts` es una copia, y cuando LinkedIn cambie
hay que traerlo aquí (o al panel de `/admin`, que gana sobre el fichero).

## Lo que consta, leído del perfil el 2026-08-01

- **Titular:** «Ingeniero Industrial || desarrollador web». Ubicación: **Vigo y alrededores**.
- **Puesto actual:** Analista programador senior en **Mobile Smart City Corp**, desde
  **marzo de 2026**, jornada completa, España en remoto. _(La web dice «Mobile Smart City», sin el
  «Corp», desde el 2026-08-04 y por decisión de Luis.)_
- Altia (feb. 2024 – ene. 2026) para **Banco Santander Portugal · INDRA · GETNET · Kids&Us**.
- Exceltic (feb. 2023 – feb. 2024) para **Grupo Ingeteam**.
- Zemsania Global Group (ago. 2021 – dic. 2022) para **ASTI Mobile Robotics · ABB**, en Burgos.
- **Formación:** Grado en Ingeniería Industrial, **Universidade de Vigo**, sept. 2020 – jun. 2025.
- **Aptitudes listadas:** TypeScript, Node.js, MongoDB, React, React.js, JavaScript, Bootstrap,
  ASP.NET Web API, ASP.NET y ERP.
- **No hay sección de idiomas** y **no hay sección «Acerca de»**.

Suma exacta: **60 meses = 5 años** de experiencia. La carrera se cursó **en paralelo** a los tres
primeros puestos — dato verdadero y comprobable, pero **ya no es lo que dice la sección de
formación**: ver «La nota de formación habla de la base» más abajo.

## Las fechas de la carrera NO se enseñan (2026-08-03)

La sección de formación deja de pintar «sept. 2020 — jun. 2025», por encargo. En formación las
fechas sólo pueden restar: con cinco años de experiencia encima, un título acabado hace poco invita
a la cuenta de la edad y a la de cuánto se tardó, y ninguna de las dos dice nada de cómo trabaja
alguien. Lo que sí lo dice sigue ahí, en la `note` — que desde el 2026-08-04 ya no habla del
calendario sino de la base (ver más abajo).

**El dato no se borra**, y la distinción importa para la regla de no inventar: `range` sigue en
`content/profile.ts`, en el tipo y en el esquema del panel, porque es verdad y es comprobable en
LinkedIn. Lo que cambia es que `components/sections/Education.tsx` no lo renderiza. En experiencia
las fechas siguen enteras, y ahí sí son el argumento: lo primero que comprueba un recruiter es que
no haya huecos entre puestos.

## Formación se queda en el hueso: fuera la frase del rótulo y la ubicación (2026-08-04)

Tercera poda de la misma sección y el mismo criterio que las fechas. Por encargo se van dos cosas
más:

- **La frase de debajo del rótulo**, «De la ingeniería industrial al desarrollo web». Resumía la
  **trayectoria**, que es lo que cuenta la experiencia con las fechas al lado, y aquí se leía como el
  titular de una sección que tiene una sola entrada. La clave `education.kicker` se cae de los dos
  diccionarios y **`kicker` pasa a ser opcional en `SectionHeading`** — es la única sección sin ella.
- **«Vigo, Galicia»**, la ubicación de la entrada. Ya está donde importa: el hero dice «Vigo, Galicia
  · En remoto» y la experiencia la repite en cada puesto. Dónde se estudió no decide nada.

Dos consecuencias que no son evidentes:

1. **El `<h2>` de la sección cambia de sitio.** El `<h2>` era la frase; sin ella, dejar el rótulo en
   un `<span>` deja la sección **sin encabezado** y el esquema del documento salta del `<h1>` del
   hero a los `<h3>` de las entradas. `SectionHeading` pinta ahora el rótulo como `<h2>` cuando no
   hay frase, con la misma clase `eyebrow`: el aspecto es idéntico y la sección sigue en la lista de
   encabezados. Comprobado con Chrome: `H2:Formación` + `H3:Grado en Ingeniería Industrial`.
2. **Se cae la retícula de tres columnas.** Existía para compensar el carril de la izquierda; sin
   ubicación el carril está vacío, y mantenerlo sería estrechar el contenido a cambio de nada. La
   entrada ocupa la sección entera y se centra sola. Ver [[decisiones-de-diseno]], donde experiencia
   —que sí conserva su carril— se arregló el mismo día por el camino contrario.

`location` **no se borra del contenido** ni del panel, igual que `range`: es verdad y es comprobable.
Lo que cambia es que la sección no lo pinta.

## El centro de formación se traduce (2026-08-03)

`institution` era una `string` suelta, así que la versión inglesa enseñaba el nombre castellano
—«Universidad de Vigo» dentro de una página en inglés, que es lo que se veía—. Ahora es `Localized`:
`es: 'Universidad de Vigo'`, `en: 'University of Vigo'`, el nombre oficial que usa uvigo.gal en su
propia versión inglesa. Traducir el nombre oficial de una universidad no es inventar un dato.

El castellano es «Universidad» y no «Universidade» —la forma gallega que consta en LinkedIn y que
tenía el respaldo— porque **es la que Luis ya había escrito en el panel**, y el panel manda: que las
dos fuentes digan lo mismo vale más que la grafía.

**No es lo mismo que `company` en la experiencia, y por eso ese sigue siendo una `string`:** «Altia»
o «ABB» son marcas y se escriben igual en todos los idiomas; una universidad pública tiene nombre
oficial en cada uno.

El cambio toca **siete sitios**, y ninguno avisa si se olvida salvo el typecheck: el tipo
(`content/types.ts`), el respaldo (`content/profile.ts`), el esquema de validación
(`lib/content.ts`), el esquema del panel (`sanity/schemas/education.ts`, incluido el `select` del
`preview`, que pasa a `institution.es`), la consulta (`sanity/queries.ts`), la vista
(`Education.tsx`) y el JSON-LD de la portada (`alumniOf`). Más el generador del NDJSON.

**El panel se quedó desalineado un día**: su `institution` era una cadena, la consulta la proyectaba a
`null`, la validación tumbaba el documento y la formación **caía al respaldo de `content/`** —que decía
lo correcto, así que la web se veía bien, pero con dos avisos en el log del build como única señal—.
**Resuelto el 2026-08-04** en el mismo parche de los textos (ver más abajo): ya es `{es, en}` y el
documento valida. Es el caso general de [[contenido-dos-fuentes]], y el ejemplo de por qué ese fallo es
peligroso: estuvo un día en producción sin que nada se viera roto.

## Los textos reescritos (2026-08-04)

Encargo de Luis, en una sola tanda: reescribir la experiencia en los dos idiomas, cambiar la nota de
formación y dar una vuelta al perfil. **Nada de esto añade un hecho**: los cambios son de redacción
sobre los mismos datos de LinkedIn.

**Experiencia.** Los cuatro puestos, en `content/profile.ts`:

- **Mobile Smart City Corp** pasa de una línea genérica a decir **a qué se dedica la empresa**, leído
  de su web oficial (mobilesmart.city): plataforma de pagos digitales y movilidad urbana —aparcamiento,
  permisos, denuncias, control y tráfico— para ayuntamientos, universidades, aeropuertos y recintos
  privados. **Why:** el nombre no dice a qué se dedica, y un recruiter que no lo sepa no puede valorar
  el puesto. Del papel sólo se cuenta lo que consta en LinkedIn —análisis e implementación—: ni
  tecnologías concretas del producto ni logros, que sería inventar.
- Altia, Exceltic y Zemsania conservan **los mismos hechos** y ganan una frase de qué enseñó cada
  puesto. La anécdota del AGV —«aquí un error no lanza una excepción en un log: para una línea de
  producción»— se **mueve** del perfil a su puesto, que es donde tiene fecha al lado; el perfil, al
  acortarse, la habría repetido.

**La nota de formación habla de la base, no del calendario.** Decía que la carrera se cursó en
paralelo a los tres primeros puestos y ahora dice qué forma de pensar deja una ingeniería
—descomponer, medir antes de decidir, responder del resultado—. **Why:** es el mismo argumento que
tumbó las fechas de esa sección: contar cuánto se solapó invita a la cuenta de los años y a
preguntarse cómo se reparte una jornada, y ninguna de las dos cosas dice nada de lo que alguien sabe
hacer. `range` sigue en el contenido y en el panel: el dato no se borra, sólo deja de contarse.

**El perfil: tres párrafos cortos, uno por idea.** Autodidacta y programar por gusto → perfeccionista
con el trabajo y no con el ego → las habilidades blandas y la personalidad por encima de lo técnico.
Ese tercero va **al final** a propósito: es una opinión, y una opinión se defiende cuando ya se ha
demostrado lo demás. Sin una sola cifra ni un solo cliente, que están en las secciones comprobables.
Ojo: `page.tsx` usa `bio[locale][0]` como `description` del JSON-LD `Person`, así que el primer
párrafo es también lo que lee Google.

**Nada de esto llega a producción solo, y se subió al panel el mismo día.** Los textos viven también
en Sanity, que gana sobre `content/` — es el caso general de [[contenido-dos-fuentes]]—, así que hubo
un segundo paso. **Cómo se hizo, que es la receta reutilizable:** un script de un solo uso con
`npx sanity exec <script>.ts --with-user-token` que **parchea campos concretos**
(`client.patch(id).set({…})`) **leyendo los valores de `content/profile.ts`**, los seis documentos en
**una sola transacción**. Y **nunca `migrate:import`**: corre con `--replace` y machacaría el retrato
vacío del perfil, el enlace de Sangil Studio y el `orderRank` de los arrastrables.

Tres cosas que sólo se ven haciéndolo:

- **`--with-user-token` usa la sesión de `sanity login`**, así que no hace falta
  `SANITY_API_WRITE_TOKEN` — no hay ninguno en `.env.local` y sigue sin haberlo.
- **Había que arreglar el `institution` en el mismo parche o la nota no se vería.** El documento de
  formación era inválido (cadena en vez de `Localized`), así que la sección se servía del respaldo:
  subir la nota nueva al panel no habría cambiado nada en pantalla. Es el fallo silencioso de la regla
  del contenido, y aquí llegó a morderlo.
- **El webhook revalida, pero sirve la copia vieja una vez antes de regenerar.** La primera
  comprobación de las cuatro URLs decía «viejo» en las tres; a la siguiente, nuevo. No es un webhook
  que no dispara: es `stale-while-revalidate` haciendo su trabajo. No hay que redesplegar.

Verificado con un build leyendo del panel —sin avisos de validación, y `en.html` diciendo «University
of Vigo»— y con las cuatro URLs vivas (`/es` y `/en` de producción y de test) enseñando los tres
textos nuevos.

## La segunda tanda: los textos los escribió Luis en el navegador (2026-08-04)

El mismo día y encima de la tanda anterior, Luis reescribió los textos **editando el HTML de la web
en producción con las herramientas de desarrollo de Chrome** y pidió traerlos al repo y al panel. La
redacción es suya y en primera persona, y eso cambia el tono de la mitad del CV: donde antes había
una frase redonda escrita para leerse en pantalla, ahora hay una explicación de alguien contando su
trabajo.

**Cómo se recogen esas ediciones, que es el procedimiento y va a repetirse:**

1. Luis mete su pestaña en el **grupo de pestañas de la extensión** de Claude. Sin eso Claude no ve
   nada: fuera del grupo la pestaña es invisible para las herramientas, y abrir la URL en una
   pestaña nueva **no sirve** —devuelve el HTML desplegado, y las ediciones del inspector viven sólo
   en la memoria de esa pestaña—.
2. Claude compara el **DOM en vivo** contra el **HTML del servidor** (`fetch` de `location.href` con
   `cache: 'reload'`, `DOMParser`, los nodos de texto de `<main>` y una alineación LCS para verlos
   como sustituciones en orden). Salen los cambios exactos, con lo viejo y lo nuevo emparejados: 52
   en esta tanda.
3. Cuidado al leerlo: hay que descartar los clones del carrusel (`[data-clone]`) y los nodos que
   inyecta la propia extensión, o aparecen como diferencias falsas.

**Qué cambió.** Los cuatro resúmenes de experiencia, la nota de formación, el perfil (de tres
párrafos a dos), cuatro rótulos de sección, las entradillas de proyectos y de contacto, el puesto de
Altia («Desarrollador full stack») y el nombre de la empresa actual, que pasa de «Mobile Smart City
Corp» a **«Mobile Smart City»**.

**Tres cosas que arrastran código, no sólo texto:**

- **La nota al pie del stack desaparece.** Se cae la clave `stack.note` de los dos diccionarios y su
  párrafo de `Stack.tsx`. Quien la quiera de vuelta tiene que reponer las dos.
- **El cliente final se une con una flecha.** `forClient` pasa de «para»/«for» a `→`, **el mismo
  valor en los dos idiomas** porque es un signo y no una palabra, y **se quita el « · » de delante**
  en `Experience.tsx`: con los dos, quedaba « · → », que se lee como un error de plantilla. La
  descripción del campo en el esquema del panel también lo decía y se actualizó.
- **Altia pierde dos clientes**: fuera Banco Santander Portugal y GETNET, queda «INDRA & Kids&Us».
  Y ASTI pierde a ABB del rótulo, que pasa al primer párrafo del resumen con su contexto («ahora
  forma parte de…») en vez de parecer un segundo cliente simultáneo. **Es decisión de Luis sobre su
  propio CV**; lo que queda sigue constando en LinkedIn, así que la regla de no inventar no se toca
  — quitar un dato verdadero está permitido, añadir uno dudoso no.

**Las ediciones eran sólo en castellano y el inglés se tradujo aquí**, párrafo a párrafo. De paso se
corrigieron cinco erratas de la versión castellana que venían del tecleo rápido en el inspector:
«Fuí»→«Fui», «fué»→«fue», «ví»→«vi», «vén»→«ven» y «lo realmente marca»→«lo que realmente marca».

**Lo que quedó dicho y no se cambió:** el rótulo grande de proyectos es ahora «Proyectos», que es
**la misma palabra que el rótulo pequeño de encima**, así que la cabecera dice «Proyectos» dos veces.
Está aplicado tal cual porque es lo que Luis escribió; si alguna vez chirría, se cambia el `kicker`
de `projects` y nada más. Y sigue en pie la frase de la empresa actual —«la empresa más grande para
gestión de parkings»— que **no consta en ninguna fuente comprobable**: es lo único de esta tanda que
roza la regla 8, avisado y mantenido por decisión de Luis.

El panel se parcheó el mismo día con la receta de la sección anterior, sin una sola variación: script
de un solo uso, `patch().set()` sobre los mismos seis documentos, una transacción, borrado después.

## El portfolio anterior tenía los datos mal

`C:\Proyectos\Porfolio` (Astro, con la errata en el nombre) decía «+4 años», no tenía el puesto de
Mobile Smart City, ponía «Backend developer» en Altia con una descripción distinta, no tenía
sección de formación y su único «proyecto» era un curso. De ahí sólo se ha recuperado el retrato
(`public/luis.webp`).

**Why:** el primer borrador de este portfolio se hizo con esos datos y salió un CV con un año de
retraso, la ciudad equivocada (se dedujo Pamplona de Sangil Studio y del almuerziko) y un hueco
laboral inventado de siete meses que en realidad no existe —el puesto actual empezó en marzo—. Lo
corrigió Luis pasando el enlace de LinkedIn.

**How to apply:** antes de tocar `content/profile.ts`, mirar LinkedIn. Nunca deducir la ciudad, la
empresa ni las fechas de otro proyecto del disco.

## La regla: no inventar nada

Es la regla 8 del `CLAUDE.md` y aquí es la más importante de todas, porque la web habla en nombre
de una persona real ante gente que puede comprobarlo:

- Fechas, puestos, empresas, clientes y titulación son **literalmente** los de LinkedIn.
- Los resúmenes **redactan** esa información para que se lea en pantalla; no añaden hechos.
- La empresa que paga la nómina y el cliente final van **separados** (`company` y `client`):
  «desarrollador en Banco Santander» cuando firma Altia es la clase de imprecisión que se detecta
  al pedir referencias y cuesta más de lo que da.
- Lo que no consta se deja fuera. **Sin niveles de idioma inventados** (LinkedIn no los tiene) y
  sin badge de «disponible para nuevos proyectos»: la portada dice el puesto actual, que es un
  dato verificable y no una señal de búsqueda activa que pueda leer un jefe.

Ver [[cifras-calculadas]] para lo que sí se deriva de estos datos automáticamente.
