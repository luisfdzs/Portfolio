'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const POLL_INTERVAL_MS = 100

const MAX_POLLS = 100

function scrollTargetFor(element: Element) {
  const header = document.querySelector('header')
  const offset = header ? header.getBoundingClientRect().height : 0
  return element.getBoundingClientRect().top + window.scrollY - offset
}

function focusSection(element: HTMLElement) {
  element.setAttribute('tabindex', '-1')
  element.focus({ preventScroll: true })
}

export function HashCleaner() {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    let pollTimer: ReturnType<typeof setTimeout> | undefined

    function goTo(target: HTMLElement) {
      window.scrollTo({ top: scrollTargetFor(target) })
      focusSection(target)
    }

    function pollForSection(id: string, remaining: number) {
      if (cancelled) return

      const target = document.getElementById(id)
      if (!target) {
        if (remaining > 0) {
          pollTimer = setTimeout(() => pollForSection(id, remaining - 1), POLL_INTERVAL_MS)
        }
        return
      }

      window.scrollTo({ top: scrollTargetFor(target), behavior: 'instant' })
      focusSection(target)
    }

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const from = event.target
      if (!(from instanceof Element)) return

      const link = from.closest('a[href*="#"]')
      if (!(link instanceof HTMLAnchorElement)) return
      if (link.origin !== window.location.origin || link.target === '_blank') return

      const id = link.hash.slice(1)
      if (!id) return

      event.preventDefault()
      clearTimeout(pollTimer)

      const target = document.getElementById(id)
      if (link.pathname === window.location.pathname && target instanceof HTMLElement) {
        goTo(target)
        return
      }

      router.push(link.pathname + link.search)
      pollForSection(id, MAX_POLLS)
    }

    function cleanInboundHash(remaining: number) {
      if (cancelled || !window.location.hash) return

      const id = window.location.hash.slice(1)
      const target = document.getElementById(id)
      if (!target) {
        if (remaining > 0) {
          pollTimer = setTimeout(() => cleanInboundHash(remaining - 1), POLL_INTERVAL_MS)
        }
        return
      }

      const { top, bottom } = target.getBoundingClientRect()
      const arrived = bottom > 0 && top < window.innerHeight
      if (!arrived) window.scrollTo({ top: scrollTargetFor(target), behavior: 'instant' })

      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }

    function onInbound() {
      if (!window.location.hash) return
      clearTimeout(pollTimer)
      cleanInboundHash(MAX_POLLS)
    }

    document.addEventListener('click', onClick, { capture: true })
    window.addEventListener('hashchange', onInbound)
    window.addEventListener('popstate', onInbound)

    onInbound()

    return () => {
      cancelled = true
      clearTimeout(pollTimer)
      document.removeEventListener('click', onClick, { capture: true })
      window.removeEventListener('hashchange', onInbound)
      window.removeEventListener('popstate', onInbound)
    }
  }, [router])

  return null
}
