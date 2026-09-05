'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

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

  const toggle = useCallback(() => setOpen((value) => !value), [])

  const close = useCallback(() => {
    setOpen(false)
    setExpanded(false)
  }, [])

  const toggleExpanded = useCallback(() => setExpanded((value) => !value), [])

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
