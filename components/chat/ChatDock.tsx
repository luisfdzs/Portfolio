'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

type ChatDock = {
  open: boolean
  expanded: boolean
  toggle: () => void
  close: () => void
  toggleExpanded: () => void
}

const Context = createContext<ChatDock | null>(null)

export function ChatDockProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const pushed = useRef(false)

  const toggle = useCallback(() => setOpen((value) => !value), [])

  const close = useCallback(() => {
    if (pushed.current) {
      pushed.current = false
      window.history.back()
    }
    setOpen(false)
    setExpanded(false)
  }, [])

  const toggleExpanded = useCallback(() => setExpanded((value) => !value), [])

  useEffect(() => {
    if (!open) return
    if (window.matchMedia('(min-width: 64rem)').matches) return

    window.history.pushState({ chat: true }, '')
    pushed.current = true

    function onPopState() {
      pushed.current = false
      setOpen(false)
      setExpanded(false)
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [open])

  const value = useMemo(
    () => ({ open, expanded, toggle, close, toggleExpanded }),
    [open, expanded, toggle, close, toggleExpanded],
  )

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useChatDock(): ChatDock {
  const value = useContext(Context)
  if (!value) throw new Error('useChatDock must be used inside ChatDockProvider')
  return value
}
