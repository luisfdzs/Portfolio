/**
 * Concatena clases descartando lo que no sea una cadena con contenido. Nada de
 * `clsx` ni `tailwind-merge`: en este proyecto las clases condicionales son cuatro y
 * ninguna necesita resolver conflictos entre utilidades.
 */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}
