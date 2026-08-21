import { preload } from 'react-dom'
import { projectMedia } from '@/content/project-shots'
import type { ProjectEntry } from '@/content/types'

const WIDE = '(min-width: 48rem)'
const NARROW = '(max-width: 47.9375rem)'

export function ProjectMediaHints({ projects }: { projects: readonly ProjectEntry[] }) {
  const hints = new Map<string, string | null>()

  for (const project of projects) {
    const chrome = projectMedia(project.slug)?.chrome
    if (!chrome) continue

    for (const [side, query] of [
      [chrome.desktop, WIDE],
      [chrome.mobile, NARROW],
    ] as const) {
      if (!side?.clips.length) continue

      for (const href of side.mark ? [side.src, side.mark.src] : [side.src]) {
        if (!hints.has(href)) hints.set(href, query)
        else if (hints.get(href) !== query) hints.set(href, null)
      }
    }
  }

  for (const [href, query] of hints) {
    preload(href, {
      as: 'image',
      fetchPriority: 'low',
      ...(query ? { media: query } : {}),
    })
  }

  return null
}
