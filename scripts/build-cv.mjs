#!/usr/bin/env node

import { mkdir, readFile } from 'node:fs/promises'
import { registerHooks } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright-core'

const ROOT = pathToFileURL(`${path.resolve('.')}${path.sep}`)

registerHooks({
  resolve(specifier, context, nextResolve) {
    const target = specifier.startsWith('@/') ? new URL(specifier.slice(2), ROOT).href : specifier
    try {
      return nextResolve(target, context)
    } catch (error) {
      if (!/^(\.|file:)/.test(target)) throw error
      return nextResolve(`${target}.ts`, context)
    }
  },
})

const load = (file) => import(new URL(file, ROOT).href)

const [content, catalogue, shots, identity, format, config, dictionaries, routes] =
  await Promise.all([
    load('content/profile.ts'),
    load('content/projects.ts'),
    load('content/project-shots.ts'),
    load('content/site.ts'),
    load('lib/format.ts'),
    load('lib/i18n/config.ts'),
    load('lib/i18n/dictionaries.ts'),
    load('lib/i18n/routes.ts'),
  ])

const { profile, experience, education, skills } = content
const { projects } = catalogue
const { projectMedia } = shots
const { site } = identity
const { currentYearMonth, formatRange, formatYearRange, totalYearsOfExperience } = format
const { isLocale, locales } = config
const { getDictionary, interpolate } = dictionaries
const { cvHref, projectHref } = routes

const CHROME =
  process.env.CHROME_PATH ??
  (process.platform === 'win32'
    ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    : process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : '/usr/bin/google-chrome')

const FONT_CDN = 'https://cdn.jsdelivr.net/npm/@fontsource'
const FACES = [
  ['Inter', 'inter', 400, 'normal'],
  ['Inter', 'inter', 500, 'normal'],
  ['Inter', 'inter', 600, 'normal'],
  ['Inter', 'inter', 700, 'normal'],
  ['Instrument Serif', 'instrument-serif', 400, 'normal'],
  ['Instrument Serif', 'instrument-serif', 400, 'italic'],
  ['JetBrains Mono', 'jetbrains-mono', 400, 'normal'],
  ['JetBrains Mono', 'jetbrains-mono', 500, 'normal'],
]
const FAMILIES = [...new Set(FACES.map(([family]) => family))]
const DOT = '#edeef0'
const SPARK = '#e0a458'
const PX_PER_MM = 96 / 25.4
const PAGES = 2
const BANNER = { width: 1584, height: 396 }
const BANNER_SCALE = (210 * PX_PER_MM) / BANNER.width
const SHOWCASE = [
  ['l2', 'sangil-studio'],
  ['l1', 'bonsai-artesania'],
  ['r2', 'cedece'],
  ['r1', 'swiftmet'],
  ['c0', 'ckm-combat-academy'],
]

const stroke = (body, width = 1.5) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`
const solid = (d) =>
  `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${d}"/></svg>`

const SPARKLE =
  '<svg class="banner__spark" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0c.7 6.4 5.6 11.3 12 12-6.4.7-11.3 5.6-12 12-.7-6.4-5.6-11.3-12-12C6.4 11.3 11.3 6.4 12 0Z" fill="currentColor"/></svg>'

const ICONS = {
  mail: stroke('<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
  linkedin: solid(
    'M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.26 2.37 4.26 5.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12M7.12 20.45H3.56V9h3.56zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0',
  ),
  github: solid(
    'M12 .5a11.5 11.5 0 0 0-3.64 22.42c.58.1.79-.25.79-.55v-1.94c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.26 5.69.41.36.78 1.06.78 2.14v3.17c0 .3.2.66.8.55A11.5 11.5 0 0 0 12 .5z',
  ),
  arrow: stroke('<path d="M7 17 17 7"/><path d="M8 7h9v9"/>', 2),
  next: stroke('<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>'),
}

const fontFaces = FACES.map(
  ([family, slug, weight, style]) =>
    `@font-face{font-family:'${family}';font-style:${style};font-weight:${weight};font-display:block;src:url(${FONT_CDN}/${slug}@5/files/${slug}-latin-${weight}-${style}.woff2) format('woff2')}`,
).join('')

const escape = (text) => String(text).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)
const rich = (text) =>
  escape(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
const link = (href, body) => `<a href="${escape(href)}">${body}</a>`
const list = (items) => items.map((item) => `<span>${escape(item)}</span>`).join(' ')

function bare(url) {
  const { host, pathname } = new URL(url)
  return `${host.replace(/^www\./, '')}${pathname.replace(/\/$/, '')}`
}

function months(range, today) {
  const [from, to] = [range.start, range.end ?? today].map((value) => value.split('-').map(Number))
  return (to[0] - from[0]) * 12 + (to[1] - from[1]) + 1
}

function duration(total, words) {
  const years = Math.floor(total / 12)
  const rest = total % 12
  return [
    years ? `${years} ${years === 1 ? words.year : words.years}` : '',
    rest ? `${rest} ${rest === 1 ? words.month : words.months}` : '',
  ]
    .filter(Boolean)
    .join(' ')
}

function field(width, height, { seed, sparks = 0.05 }) {
  let state = seed
  const random = () => {
    state = (state + 0x6d2b79f5) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
  const step = 3.4
  const dots = []
  for (let y = step / 2; y < height; y += step) {
    for (let x = step / 2; x < width; x += step) {
      const reach = Math.max(0, (x / width - 0.4) / 0.6)
      const fade = reach ** 1.8 * (1 - 0.4 * (y / height))
      if (fade < 0.03) continue
      const lit = x / width > 0.74 && y / height < 0.6 && random() < sparks * reach
      const opacity = lit ? 0.35 + 0.55 * reach : 0.26 * fade
      dots.push(
        `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${lit ? 0.42 : 0.3}" fill="${lit ? SPARK : DOT}" opacity="${opacity.toFixed(3)}"/>`,
      )
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${dots.join('')}</svg>`
  return `style="background-image:url('data:image/svg+xml,${encodeURIComponent(svg)}')"`
}

function signature() {
  const words = profile.name.split(' ')
  const surname = words.pop()
  return `${escape(words.join(' '))} <em>${escape(surname)}</em>`
}

function contacts(locale, favicon) {
  return [
    {
      href: `${site.url}/${locale}`,
      icon: `<img src="${favicon}" alt="">`,
      label: bare(site.url),
    },
    { href: profile.linkedin, icon: ICONS.linkedin, label: bare(profile.linkedin) },
    { href: profile.github, icon: ICONS.github, label: bare(profile.github) },
    { href: `mailto:${profile.email}`, icon: ICONS.mail, label: profile.email },
  ]
    .map(
      ({ href, icon, label }) => `<li>${link(href, `${icon}<span>${escape(label)}</span>`)}</li>`,
    )
    .join('')
}

function banner(locale, t, years, photo, covers) {
  const copy = t.cv.banner
  const points = copy.points
    .map((point) => {
      const lead = point.lead ? `<b>${escape(interpolate(point.lead, { years }))}</b> ` : ''
      const accent = point.accent ? `<br><b>${escape(point.accent)}</b>` : ''
      return `<li class="banner__point"><i></i><span>${lead}${escape(point.text)}${accent}</span></li>`
    })
    .join('')
  const cards = SHOWCASE.map(
    ([slot, slug]) =>
      `<div class="banner__card banner__card--${slot}"><img src="${covers[slug]}" alt=""></div>`,
  ).join('')
  const home = `${site.url}/${locale}`

  return `<div class="banner" style="width:${BANNER.width}px;height:${BANNER.height}px;transform:scale(${BANNER_SCALE})">
    <div class="banner__dots"></div>
    <div class="banner__lines"></div>
    <figure class="banner__portrait"><img src="${photo}" alt="${escape(profile.photo.alt[locale])}"></figure>
    <div class="banner__copy">
      <p class="banner__kicker"><i></i>${escape(copy.kicker)}</p>
      <ul class="banner__points">${points}</ul>
      <p class="banner__stack">${copy.stack.map(escape).join('<b>·</b>')}</p>
      <a class="banner__cta" href="${escape(home)}">
        <span class="banner__cta-text">
          <span class="banner__cta-label">${escape(t.cv.portfolioButton)}</span>
          <span class="banner__cta-url">${escape(bare(site.url))}</span>
        </span>
        <span class="banner__cta-go">${ICONS.arrow}</span>
        ${SPARKLE}
      </a>
    </div>
    <div class="banner__stage">
      <div class="banner__glow"></div>
      ${cards}
      <div class="banner__frame"><span></span><span></span><span></span><span></span></div>
      <p class="banner__live">${escape(copy.live)}</p>
    </div>
    <div class="banner__vignette"></div>
  </div>`
}

function marker(current) {
  const ring = current
    ? '<circle cx="1.9" cy="1.9" r="1.75" fill="none" stroke="currentColor" stroke-width="0.21"/>'
    : ''
  return `<svg class="job__dot" viewBox="0 0 3.8 3.8" aria-hidden="true"><circle cx="1.9" cy="1.9" r="0.95" fill="currentColor"/>${ring}</svg>`
}

function job(entry, locale, t, today) {
  const company = entry.url ? link(entry.url, escape(entry.company)) : escape(entry.company)
  const clients = entry.clients?.length
    ? ` <span>${ICONS.next}${entry.clients
        .map((client) => (client.url ? link(client.url, escape(client.name)) : escape(client.name)))
        .join(' · ')}</span>`
    : ''
  const range = escape(formatRange(entry.range, locale, t.experience.present))
  const span = escape(duration(months(entry.range, today), t.cv.duration))

  return `<li class="job">
    ${marker(entry.range.end === null)}
    <div class="job__head">
      <h3 class="job__role">${escape(entry.role[locale])}</h3>
      <p class="dates">${range} <span>· ${span}</span></p>
    </div>
    <div class="job__meta">
      <p class="job__company">${company}${clients}</p>
      <p class="place">${escape(entry.location[locale])}</p>
    </div>
    <div class="job__summary">${entry.summary[locale].map((paragraph) => `<p>${rich(paragraph)}</p>`).join('')}</div>
    <ul class="chips">${entry.stack.map((item) => `<li>${escape(item)}</li>`).join('')}</ul>
  </li>`
}

function degree(entry, locale, t) {
  const school = entry.url
    ? link(entry.url, escape(entry.institution[locale]))
    : escape(entry.institution[locale])
  const place = entry.location ? `<p class="place">${escape(entry.location[locale])}</p>` : ''

  return `<article class="degree">
    <h3 class="degree__title">${escape(entry.title[locale])}</h3>
    <p class="degree__school">${school}</p>
    <p class="dates">${escape(formatYearRange(entry.range, t.experience.present))}</p>
    ${place}
  </article>`
}

function project(entry, locale, t) {
  const caseStudy = `${site.url}${projectHref(locale, entry.slug)}`
  const links = [
    entry.liveUrl ? link(entry.liveUrl, `${escape(bare(entry.liveUrl))}${ICONS.arrow}`) : '',
    entry.repoUrl ? link(entry.repoUrl, `${ICONS.github}${escape(t.cv.source)}`) : '',
    link(caseStudy, `${escape(t.cv.caseStudy)}${ICONS.arrow}`),
  ].filter(Boolean)

  return `<li class="project">
    <div class="project__head">
      <h3 class="project__name">${link(caseStudy, escape(entry.name))}</h3>
      <p class="status${entry.status === 'live' ? ' status--live' : ''}">${escape(t.projects.status[entry.status])}</p>
    </div>
    <p class="project__tagline">${rich(entry.tagline[locale])}</p>
    <p class="project__stack list">${list(entry.stack)}</p>
    <p class="project__links">${links.join('')}</p>
  </li>`
}

function documentFor(locale, css, photo, favicon, covers) {
  const t = getDictionary(locale)
  const today = currentYearMonth()
  const [year, month] = today.split('-').map(Number)
  const updated = interpolate(t.cv.updated, {
    date: new Intl.DateTimeFormat(locale, {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(Date.UTC(year, month - 1, 15)),
  })
  const years = totalYearsOfExperience(experience.map((entry) => entry.range))
  const headline = escape(profile.headline[locale])
  const title = escape(`${profile.name} — ${t.cv.documentTitle}`)

  const first = `<article class="page">
    <header class="masthead">
      <div class="masthead__banner">${banner(locale, t, years, photo, covers)}</div>
      <ul class="contact">${contacts(locale, favicon)}</ul>
    </header>
    <div class="columns">
      <section>
        <h2 class="section-title" data-index="01">${escape(t.cv.experience)}</h2>
        <ol>${experience.map((entry) => job(entry, locale, t, today)).join('')}</ol>
      </section>
      <aside class="sidebar">
        <section>
          <h2 class="side-title">${escape(t.cv.skills)}</h2>
          <dl class="skills">${skills
            .map(
              (group) =>
                `<div><dt>${escape(group.title[locale])}</dt><dd class="list">${list(group.items)}</dd></div>`,
            )
            .join('')}</dl>
        </section>
        <section>
          <h2 class="side-title">${escape(t.cv.education)}</h2>
          ${education.map((entry) => degree(entry, locale, t)).join('')}
        </section>
        <section>
          <h2 class="side-title">${escape(t.cv.languages)}</h2>
          <ul class="languages">${profile.languages
            .map(
              (language) =>
                `<li>${escape(language.name[locale])}<span>${escape(language.level[locale])}</span></li>`,
            )
            .join('')}</ul>
        </section>
      </aside>
    </div>
    <footer class="page-foot"><span>${escape(profile.name)} · ${headline}</span><span>1 / ${PAGES}</span></footer>
  </article>`

  const second = `<article class="page">
    <header class="running">
      <p class="running__name">${signature()}</p>
      <p class="running__meta">${escape(t.cv.eyebrow)} · 2 / ${PAGES}</p>
    </header>
    <section class="block">
      <h2 class="section-title" data-index="02">${escape(t.cv.projects)}</h2>
      <p class="section-lead">${escape(t.cv.projectsIntro)}</p>
      <ol class="projects">${projects.map((entry) => project(entry, locale, t)).join('')}</ol>
    </section>
    <section class="block block--about">
      <h2 class="section-title" data-index="03">${escape(t.cv.about)}</h2>
      <div class="about">${profile.bio[locale].map((paragraph) => `<p>${rich(paragraph)}</p>`).join('')}</div>
    </section>
    <footer class="closing field" ${field(210, 60, { seed: 11, sparks: 0 })}>
      <div class="closing__body">
        <div>
          <p class="eyebrow">${escape(t.contact.title)}</p>
          <p class="closing__title">${escape(t.contact.kicker)}</p>
          <p class="closing__lead">${escape(t.contact.lead)}</p>
        </div>
        <ul class="closing__links">${contacts(locale, favicon)}</ul>
      </div>
      <div class="closing__foot"><span>${escape(updated)}</span></div>
    </footer>
  </article>`

  return `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
    <meta name="author" content="${escape(profile.name)}">
    <meta name="description" content="${headline}">
    <style>${fontFaces}${css}</style>
  </head>
  <body>${first}${second}</body>
</html>`
}

async function main() {
  const requested = process.argv.slice(2).filter(isLocale)
  const targets = requested.length > 0 ? requested : locales
  const css = await readFile(path.resolve('scripts/cv.css'), 'utf8')
  const image = await readFile(path.join(path.resolve('public'), profile.photo.src))
  const photo = `data:image/webp;base64,${image.toString('base64')}`
  const icon = await readFile(path.resolve('scripts/cv-favicon.png'))
  const favicon = `data:image/png;base64,${icon.toString('base64')}`
  const covers = Object.fromEntries(
    await Promise.all(
      SHOWCASE.map(async ([, slug]) => {
        const file = await readFile(
          path.join(path.resolve('public'), projectMedia(slug).desktop.src),
        )
        return [slug, `data:image/webp;base64,${file.toString('base64')}`]
      }),
    ),
  )

  const browser = await chromium.launch({ executablePath: CHROME })
  let failed = false

  try {
    const page = await browser.newPage({ viewport: { width: 900, height: 1300 } })
    await page.emulateMedia({ media: 'print' })

    for (const locale of targets) {
      await page.setContent(documentFor(locale, css, photo, favicon, covers), {
        waitUntil: 'networkidle',
      })
      await page.evaluate(() => document.fonts.ready)

      const missing = await page.evaluate(
        (families) =>
          families.filter(
            (family) =>
              ![...document.fonts].some(
                (face) => face.family.replace(/"/g, '') === family && face.status === 'loaded',
              ),
          ),
        FAMILIES,
      )
      if (missing.length > 0) {
        throw new Error(`No se han podido cargar las fuentes: ${missing.join(', ')}`)
      }

      const sheets = await page.evaluate(() =>
        [...document.querySelectorAll('.page')].map((sheet) => {
          const limit = sheet.getBoundingClientRect().height
          sheet.style.height = 'auto'
          const natural = sheet.getBoundingClientRect().height
          sheet.style.height = ''
          return { limit, natural }
        }),
      )

      const overflowing = sheets.filter((sheet) => sheet.natural > sheet.limit + 0.5)
      sheets.forEach((sheet, index) => {
        const free = (sheet.limit - sheet.natural) / PX_PER_MM
        const verdict =
          free >= 0 ? `${free.toFixed(1)} mm libres` : `se sale ${(-free).toFixed(1)} mm`
        console.log(`  ${free >= 0 ? '✓' : '✗'} ${locale} · página ${index + 1}: ${verdict}`)
      })

      if (sheets.length !== PAGES || overflowing.length > 0) {
        failed = true
        continue
      }

      const target = path.join(path.resolve('public'), cvHref(locale))
      await mkdir(path.dirname(target), { recursive: true })
      await page.pdf({
        path: target,
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
        tagged: true,
        outline: true,
      })
      console.log(`  → ${path.relative(process.cwd(), target)}`)
    }
  } finally {
    await browser.close()
  }

  if (failed) {
    console.error('\nEl contenido no cabe en las páginas del CV: ajusta scripts/cv.css.')
    process.exit(1)
  }
}

await main()
