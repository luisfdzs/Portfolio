import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { notFound } from 'next/navigation'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { AgvExperiment } from '@/components/experiments/AgvExperiment'
import { agvModelKeys, isAgvModel } from '@/components/three/agv/models'

type Params = Promise<{ locale: string; model: string }>

export function generateStaticParams() {
  return agvModelKeys.map((model) => ({ model }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, model } = await params
  if (!isLocale(locale) || !isAgvModel(model)) notFound()

  const copy = getDictionary(locale).experiments.models[model]

  return {
    title: copy.title,
    description: copy.description,
    robots: { index: false, follow: true },
  }
}

export default async function AgvExperimentPage({ params }: { params: Params }) {
  'use cache'
  cacheLife('max')

  const { locale: raw, model } = await params
  if (!isLocale(raw) || !isAgvModel(model)) notFound()
  const locale: Locale = raw

  const t = getDictionary(locale).experiments
  const entry = t.models[model]

  return (
    <AgvExperiment
      model={model}
      locale={locale}
      copy={{
        title: entry.title,
        lead: entry.lead,
        phases: { ...t.phases, drive: entry.work },
        replay: t.replay,
        pause: t.pause,
        play: t.play,
        scrub: t.scrub,
        particles: t.particles,
      }}
    />
  )
}
