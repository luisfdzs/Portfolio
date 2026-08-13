'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { isProjectPath, sections, type SectionKey } from '@/lib/i18n/routes'

const keys = Object.keys(sections) as SectionKey[]

export function useActiveSection(): SectionKey | null {
  const pathname = usePathname()
  const onProjectPage = isProjectPath(pathname)
  const [measured, setMeasured] = useState<SectionKey | null>(null)

  useEffect(() => {
    if (onProjectPage) return

    let frame = 0

    function measure() {
      frame = 0

      const header = document.querySelector('header')
      const line = (header?.getBoundingClientRect().height ?? 0) + window.innerHeight * 0.25

      let current: SectionKey | null = null
      for (const key of keys) {
        const element = document.getElementById(sections[key])
        if (!element) continue
        const { top, bottom } = element.getBoundingClientRect()
        if (top <= line && bottom > line) {
          current = key
          break
        }
      }

      setMeasured(current)
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [onProjectPage, pathname])

  return onProjectPage ? 'projects' : measured
}
