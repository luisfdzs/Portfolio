import type { Profile } from '@/content/types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { HeroLaunch } from '@/components/sections/HeroLaunch'

export function Hero({ locale, profile }: { locale: Locale; profile: Profile }) {
  const t = getDictionary(locale)

  return (
    <section
      aria-labelledby="hero-name"
      className="hero-section relative h-svh min-h-[560px] overflow-hidden"
    >
      <h1 id="hero-name" className="sr-only print:not-sr-only print:text-title">
        {profile.name} · {profile.headline[locale]} · {profile.location[locale]}
      </h1>
      <HeroLaunch copy={t.hero.launch} locale={locale} />
    </section>
  )
}
