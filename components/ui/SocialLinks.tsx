import type { Profile } from '@/content/types'
import { cn } from '@/lib/cn'
import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { GitHub, LinkedIn, Mail } from './Icons'

type Props = {
  locale: Locale
  profile: Profile
  /** «large» es la fila del pie, donde los iconos van solos y mandan ellos. */
  size?: 'default' | 'large'
  className?: string
}

// Los mismos tres accesos (LinkedIn, GitHub y correo) en la portada y en el pie:
// un solo sitio donde cambiarlos y un solo aspecto que recordar.
export function SocialLinks({ locale, profile, size = 'default', className }: Props) {
  const t = getDictionary(locale)
  const large = size === 'large'

  const links = [
    { href: profile.linkedin, label: t.contact.linkedinLabel, Icon: LinkedIn, external: true },
    { href: profile.github, label: t.contact.githubLabel, Icon: GitHub, external: true },
    { href: `mailto:${profile.email}`, label: t.contact.emailLabel, Icon: Mail, external: false },
  ]

  return (
    <ul
      data-print="hide"
      className={cn('flex items-center justify-center', large ? 'gap-3' : 'gap-1', className)}
    >
      {links.map(({ href, label, Icon, external }) => (
        <li key={href}>
          <a
            href={href}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            aria-label={external ? `${label} (${t.a11y.externalLink})` : label}
            title={label}
            className={cn(
              'flex items-center justify-center rounded-full text-paper-faint transition-colors duration-300 hover:text-signal',
              large ? 'size-12' : 'size-10',
            )}
          >
            <Icon className={large ? 'size-7' : 'size-5'} />
          </a>
        </li>
      ))}
    </ul>
  )
}
