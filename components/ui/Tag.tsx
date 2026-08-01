import { cn } from '@/lib/cn'

/**
 * Etiqueta de tecnología.
 *
 * Texto y no logotipo, por dos razones. La primera es honestidad de marca: reproducir el
 * logo de React, de Microsoft o de MongoDB en un CV insinúa una relación con esas
 * empresas que no existe. La segunda es práctica: una fila de veinte logos de colores
 * distintos rompe la paleta de cualquier diseño y, a tamaño de etiqueta, la mitad no se
 * distinguen. El nombre escrito se lee siempre y se puede buscar con Ctrl+F, que es lo
 * que de verdad hace un recruiter comprobando si aparece «.NET».
 */
export function Tag({ children, className }: { children: string; className?: string }) {
  return (
    <li
      className={cn(
        'figure-num rounded-full border border-line-strong bg-ink-raised px-2.5 py-1 text-small text-paper-soft',
        className,
      )}
    >
      {children}
    </li>
  )
}

/** La lista completa. Se separa del `Tag` porque el `<ul>` necesita su propio rótulo. */
export function TagList({ items, label }: { items: readonly string[]; label: string }) {
  if (items.length === 0) return null

  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Tag key={item}>{item}</Tag>
      ))}
    </ul>
  )
}
