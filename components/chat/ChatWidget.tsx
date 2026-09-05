'use client'

import { useChat } from '@ai-sdk/react'
import Image from 'next/image'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { DescribedImage } from '@/content/types'
import { cn } from '@/lib/cn'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { Chat, Close, Collapse, Expand, Send } from '@/components/ui/Icons'
import { useChatDock } from './ChatDock'

const DESKTOP = '(min-width: 64rem)'

export function ChatWidget({ locale, photo }: { locale: Locale; photo: DescribedImage }) {
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
    if (!open) return
    if (!window.matchMedia(DESKTOP).matches) return
    inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') close()
    }

    const previousOverflow = document.body.style.overflow
    if (!window.matchMedia(DESKTOP).matches) document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, close])

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
          'rounded-full border border-line-strong bg-ink-float/90 text-paper',
          'shadow-lg shadow-ink/60 backdrop-blur-md lg:flex',
          'transition-[color,transform] duration-300 hover:-translate-y-0.5 hover:text-signal',
        )}
      >
        {open ? <Close className="size-5" /> : <Chat className="size-5" />}
      </button>

      <section
        data-print="hide"
        inert={!open}
        aria-hidden={!open}
        aria-label={t.chat.title}
        className={cn(
          'fixed inset-0 z-50 flex flex-col bg-ink-float',
          'transition-[opacity,transform] duration-300 ease-out-soft',
          'lg:inset-auto lg:right-6 lg:w-[22rem] lg:overflow-hidden lg:rounded-2xl',
          'lg:border lg:border-line-strong lg:bg-ink-float/95 lg:shadow-2xl lg:shadow-ink/70 lg:backdrop-blur-xl',
          expanded ? 'lg:top-20 lg:bottom-24' : 'lg:top-auto lg:bottom-22',
          open ? 'opacity-100' : 'pointer-events-none translate-y-3 opacity-0 lg:translate-y-3',
        )}
      >
        <header
          className="flex items-center gap-3 border-b border-line-strong px-4 py-3"
          style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}
        >
          <Image
            src={photo.src}
            alt={photo.alt[locale]}
            width={photo.width}
            height={photo.height}
            sizes="2.25rem"
            quality={85}
            className="size-9 shrink-0 rounded-full border border-line-strong object-cover lg:hidden"
          />

          <div className="flex-1">
            <p className="font-medium text-paper">{t.chat.title}</p>
            <p className="text-micro tracking-[0.14em] text-paper-faint uppercase">
              {t.chat.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={toggleExpanded}
            aria-label={expanded ? t.chat.collapse : t.chat.expand}
            title={expanded ? t.chat.collapse : t.chat.expand}
            className="hidden text-paper-soft transition-colors hover:text-signal lg:block"
          >
            {expanded ? <Collapse className="size-4" /> : <Expand className="size-4" />}
          </button>

          <button
            type="button"
            onClick={close}
            aria-label={t.chat.close}
            className="text-paper-soft transition-colors hover:text-signal"
          >
            <Close className="size-5 lg:size-4" />
          </button>
        </header>

        <div
          ref={listRef}
          className={cn(
            'flex flex-1 flex-col gap-2.5 overflow-y-auto p-4',
            expanded ? 'lg:flex-1' : 'lg:h-72 lg:flex-none',
          )}
        >
          <p className={cn(bubble, bot)}>{t.chat.intro}</p>

          {messages.map((message) => {
            const text = message.parts
              .map((part) => (part.type === 'text' ? part.text : ''))
              .join('')
            if (!text) return null
            return (
              <p
                key={message.id}
                className={cn(bubble, message.role === 'user' ? user : bot)}
              >
                {text}
              </p>
            )
          })}

          {pending && messages.at(-1)?.role === 'user' ? (
            <p className={cn(bubble, bot, 'text-paper-faint')} aria-live="polite">
              {t.chat.thinking}
            </p>
          ) : null}

          {error ? (
            <p className={cn(bubble, bot, 'text-signal')} role="alert">
              {t.chat.error}
            </p>
          ) : null}
        </div>

        <form
          onSubmit={submit}
          className="flex items-center gap-2 border-t border-line-strong p-3"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
        >
          <input
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={t.chat.placeholder}
            aria-label={t.chat.placeholder}
            className="min-w-0 flex-1 rounded-full border border-line-strong bg-ink px-4 py-2.5 text-small text-paper placeholder:text-paper-faint focus:border-signal-dim focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending}
            aria-label={t.chat.send}
            title={t.chat.send}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-signal text-ink-float transition-colors hover:bg-signal-dim disabled:opacity-50"
          >
            <Send className="size-4" />
          </button>
        </form>
      </section>
    </>
  )
}

const bubble = 'max-w-[86%] rounded-2xl px-3.5 py-2.5 text-small leading-relaxed'

const bot = 'self-start border border-line-strong bg-ink-bubble text-paper-mild'

const user = 'self-end border border-signal/30 bg-signal/18 text-paper'
