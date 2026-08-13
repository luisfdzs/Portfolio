import type { SkillGroup } from '@/content/types'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { Layers } from '@/components/ui/Icons'
import { Reveal } from '@/components/ui/Reveal'
import { Tag } from '@/components/ui/Tag'

export function Stack({ locale, groups }: { locale: Locale; groups: readonly SkillGroup[] }) {
  const t = getDictionary(locale)

  return (
    <div className="mt-16 border-t border-line pt-14 lg:mt-20">
      <Reveal>
        <div className="flex items-center justify-center gap-3 border-b border-line pb-4">
          <Layers className="size-4 text-paper-faint" />
          <h3 className="eyebrow">{t.stack.title}</h3>
        </div>
      </Reveal>

      <Reveal step={1}>
        <p className="mt-6 mx-auto max-w-measure text-lead text-paper-soft">{t.stack.kicker}</p>
      </Reveal>

      <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {groups.map((group, index) => (
          <Reveal key={group.key} step={index}>
            <h4 className="figure-num border-b border-line pb-3 text-small text-signal uppercase">
              {group.title[locale]}
            </h4>
            <ul className="mt-5 flex flex-wrap justify-center gap-2">
              {group.items.map((item) => (
                <Tag key={item}>{item}</Tag>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
