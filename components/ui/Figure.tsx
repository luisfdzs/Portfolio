import Image from 'next/image'
import type { DescribedImage } from '@/content/types'
import { cn } from '@/lib/cn'
import type { Locale } from '@/lib/i18n/config'

type Props = {
  image: DescribedImage | null | undefined
  locale: Locale
  ratio?: 'wide' | 'square' | 'fluid'
  priority?: boolean
  sizes?: string
  className?: string
}

export function Figure({
  image,
  locale,
  ratio = 'wide',
  priority = false,
  sizes = '(min-width: 1024px) 50vw, 100vw',
  className,
}: Props) {
  const shape =
    ratio === 'square' ? 'aspect-square' : ratio === 'fluid' ? undefined : 'aspect-[2/1]'

  if (!image) {
    return (
      <div
        className={cn('placeholder-grid w-full overflow-hidden rounded-lg', shape, className)}
        aria-hidden="true"
      />
    )
  }

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-lg border border-line bg-ink-raised',
        shape,
        className,
      )}
    >
      <Image
        src={image.src}
        alt={image.alt[locale]}
        width={image.width}
        height={image.height}
        sizes={sizes}
        priority={priority}
        quality={85}
        className="size-full object-cover"
      />
    </div>
  )
}
