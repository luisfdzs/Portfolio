import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity.config'
import { isSanityConfigured } from '@/sanity/env'
import { ConnectionNotice } from '../ConnectionNotice'

export default function StudioPage() {
  if (!isSanityConfigured) return <ConnectionNotice />

  return <NextStudio config={config} />
}
