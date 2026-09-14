import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { sections } from '@/lib/i18n/routes'
import { Cube } from '@/components/ui/Icons'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TableSceneLoader } from '@/components/three/TableSceneLoader'

export function Lab({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)

  return (
    <section
      id={sections.lab}
      className="page-gutter mx-auto max-w-7xl section-block text-center"
    >
      <SectionHeading index="05" title={t.lab.title} kicker={t.lab.kicker} icon={Cube} />

      <div className="mx-auto h-[520px] max-w-5xl">
        <TableSceneLoader />
      </div>
    </section>
  )
}
