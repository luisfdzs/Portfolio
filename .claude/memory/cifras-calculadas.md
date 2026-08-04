---
name: cifras-calculadas
description: Ninguna cifra del CV está escrita a mano, y el reloj se congela en el build en vez de leerse al renderizar
metadata:
  type: project
---

Las cuatro cifras del titular —**años de experiencia, proyectos en producción, empresas y
clientes, tecnologías**— se calculan del contenido en `app/(site)/[locale]/page.tsx`. Ninguna es
una cadena de texto.

- Los **años** se suman con `totalYearsOfExperience`, que cuenta **tiempo trabajado y no
  calendario**: entre el primer puesto y hoy hay tramos sin contrato, y restar la primera fecha de
  la última los contaría como experiencia. Se redondea **hacia abajo**, que es la única dirección
  honesta cuando la cifra va en un titular.
- **Empresas y clientes** se cuentan con un `Set` sobre `company` más los `client` partidos por
  « · »: hoy da 11, y los once están comprobables en la lista de abajo de la misma página.
- **Tecnologías** se cuenta con un `Set` sobre los cuatro grupos del stack; sin él, `React` está
  en frontend y en la experiencia y se contaría dos veces.

**Why:** el portfolio anterior decía «+4 años de experiencia» cuando ya eran cinco, porque la
cifra era texto y nadie se acuerda de un número escrito a mano. En un CV eso no es un detalle: es
la primera línea que lee alguien que está decidiendo si te llama, y estar corto se lee como
descuido o como falta de experiencia.

## El reloj se congela en el build, y es deliberado

`next.config.ts` calcula el mes del build una vez, en Node normal, y lo pasa como
`NEXT_PUBLIC_BUILD_MONTH`. `lib/format.ts` lo lee en `currentYearMonth()`, y de ahí salen la
duración del puesto actual, los años del titular, el año del copyright y el `lastModified` del
sitemap.

**Why:** con `cacheComponents` activo, un acceso al reloj dentro del render volvería **dinámica**
una ruta que existe para servirse estática — una función por visita para escribir «2026»—. Y, más
importante, dejaría la congelación como un efecto secundario invisible en vez de una decisión
escrita. La consecuencia queda dicha en voz alta en los dos ficheros: **estas cifras valen el día
que se despliega**. Cualquier commit a `main` las recalcula, así que el desfase real es de meses.

**How to apply:** si hace falta un dato que dependa de «ahora», se saca de
`currentYearMonth()`/`buildDate()`, nunca de `new Date()` en un componente. Y si algún día una
cifra tiene que ser exacta al día, hay que sacarla del prerender —no basta con cambiar la función—.

## Formato de fechas: `YYYY-MM`, nunca `Date`

Las fechas del CV son cadenas `YYYY-MM` en el contenido y en los esquemas de Sanity (con una
expresión regular, no el tipo `date`).

**Why:** un puesto empieza «en marzo de 2026», no el 1 de marzo a las 00:00. Con `Date` hay que
inventar un día que luego se ignora, y aparece el desfase de zona horaria que convierte
`2026-03-01T00:00Z` en el 28 de febrero en España. Además `YYYY-MM` ordena igual alfabética que
cronológicamente, así que la validación «el fin no es anterior al inicio» es una comparación de
cadenas.

Detalle: `formatMonth` construye el `Date` a **mediodía UTC** justo por eso — a las 00:00 el
formateador escribía el mes anterior.
