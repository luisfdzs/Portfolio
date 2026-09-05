'use client'

import { useChat } from '@ai-sdk/react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { cn } from '@/lib/cn'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { Chat, Close, Collapse, Expand, Send } from '@/components/ui/Icons'
import { useChatDock } from './ChatDock'

export function ChatWidget({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const { open, expanded, toggle, close, toggleExpanded } = useChatDock()
  const [draft, setDraft] = useState('')
  const { messages, sendMessage, status, error } = useChat({ id: 'portfolio' })
  const pending = status === 'submitted' || status === 'streaming'
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, pending, open, expanded])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  function submit(event: FormEvent) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || pending) return
    setDraft('')
    void sendMessage({ text })
  }

  return (
    <>
      <button
        type="button"
        data-print="hide"
        onClick={toggle}
        aria-label={open ? t.chat.close : t.chat.open}
        aria-expanded={open}
        title={open ? t.chat.close : t.chat.open}
        className={cn(
          'fixed right-6 bottom-6 z-50 hidden size-12 items-center justify-center',
          'rounded-full border border-line bg-ink-raised/90 text-paper',
          'shadow-lg shadow-ink/60 backdrop-blur-md lg:flex',
          'transition-[color,transform] duration-300 hover:-translate-y-0.5 hover:text-signal',
        )}
      >
        {open ? <Close className="size-5" /> : <Chat className="size-5" />}
      </button>

      <div
        data-print="hide"
        inert={!open}
        aria-hidden={!open}
        className={cn(
          'fixed z-50 flex flex-col overflow-hidden border border-line-strong',
          'bg-ink-raised/95 shadow-2xl shadow-ink/70 backdrop-blur-xl',
          'transition-[opacity,transform,inset,border-radius] duration-500 ease-out-soft',
          'inset-x-nav-mobile-air lg:inset-x-auto lg:right-6 lg:left-auto lg:w-[22rem]',
          expanded
            ? 'top-16 bottom-[calc(var(--spacing-nav-mobile)+0.5rem)] rounded-3xl lg:top-20 lg:bottom-24'
            : 'top-auto bottom-[calc(var(--spacing-nav-mobile)+0.5rem)] rounded-2xl lg:bottom-22',
          open ? 'opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
        )}
      >
        <header className="flex items-center gap-2 border-b border-line px-4 py-3">
          <div className="flex-1">
            <p className="text-small font-medium text-paper">{t.chat.title}</p>
            <p className="text-micro tracking-[0.14em] text-paper-faint uppercase">
              {t.chat.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleExpanded}
            aria-label={expanded ? t.chat.collapse : t.chat.expand}
            title={expanded ? t.chat.collapse : t.chat.expand}
            className="text-paper-soft transition-colors hover:text-signal"
          >
            {expanded ? <Collapse className="size-4" /> : <Expand className="size-4" />}
          </button>
          <button
            type="button"
            onClick={close}
            aria-label={t.chat.close}
            className="text-paper-soft transition-colors hover:text-signal"
          >
            <Close className="size-4" />
          </button>
        </header>

        <div
          ref={listRef}
          className={cn(
            'flex flex-col gap-2 overflow-y-auto p-4',
            expanded ? 'flex-1' : 'h-64 lg:h-72',
          )}
        >
          <p className={cn(bubbleClass, botClass)}>{t.chat.intro}</p>

          {messages.map((message) => {
            const text = message.parts
              .map((part) => (part.type === 'text' ? part.text : ''))
              .join('')
            if (!text) return null
            return (
              <p
                key={message.id}
                className={cn(
                  bubbleClass,
                  message.role === 'user' ? 'self-end bg-signal/15 text-paper' : botClass,
                )}
              >
                {text}
              </p>
            )
          })}

          {pending && messages.at(-1)?.role === 'user' ? (
            <p className={cn(bubbleClass, botClass, 'text-paper-faint')} aria-live="polite">
              {t.chat.thinking}
            </p>
          ) : null}

          {error ? (
            <p className={cn(bubbleClass, botClass, 'text-signal')} role="alert">
              {t.chat.error}
            </p>
          ) : null}
        </div>

        <form onSubmit={submit} className="flex items-center gap-2 border-t border-line p-3">
          <input
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={t.chat.placeholder}
            aria-label={t.chat.placeholder}
            className="min-w-0 flex-1 rounded-full border border-line bg-ink px-4 py-2 text-small text-paper placeholder:text-paper-faint focus:border-line-strong focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending}
            aria-label={t.chat.send}
            title={t.chat.send}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-signal text-ink transition-colors hover:bg-signal-dim disabled:opacity-50"
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </>
  )
}

const bubbleClass = 'max-w-[85%] rounded-2xl px-3 py-2 text-small'

const botClass = 'self-start border border-line bg-ink-sunken text-paper-soft'
