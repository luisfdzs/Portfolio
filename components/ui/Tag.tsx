import { cn } from '@/lib/cn'

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

export function TagList({ items, label }: { items: readonly string[]; label: string }) {
  if (items.length === 0) return null

  return (
    <ul aria-label={label} className="flex flex-wrap justify-center gap-2">
      {items.map((item) => (
        <Tag key={item}>{item}</Tag>
      ))}
    </ul>
  )
}
