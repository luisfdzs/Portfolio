'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export function HomeLink({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: ReactNode
}) {
  const pathname = usePathname()

  return (
    <Link
      href={href}
      className={className}
      onClick={(event) => {
        if (pathname !== href) return
        event.preventDefault()
        window.scrollTo({ top: 0 })
      }}
    >
      {children}
    </Link>
  )
}
