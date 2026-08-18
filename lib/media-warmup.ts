type Warm = () => Promise<unknown>

type Entry = { node: Element; run: Warm; near: boolean }

type Link = { saveData?: boolean; effectiveType?: string }

const SLOW = /(^|-)2g$/
const IDLE_CAP = 2000
const WARM_MAX = 4
const REACH = '200% 0px'

const pending = new Set<Entry>()

let running = false
let served = 0
let idle = 0
let watching = false

function whenIdle(run: () => void) {
  if (typeof requestIdleCallback === 'function')
    return requestIdleCallback(run, { timeout: IDLE_CAP })
  return window.setTimeout(run, 200)
}

function allowed() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false

  const link = (navigator as Navigator & { connection?: Link }).connection
  if (!link) return true
  if (link.saveData) return false
  return !SLOW.test(link.effectiveType ?? '')
}

function booted() {
  return document.documentElement.dataset.boot !== 'hold'
}

function gap(node: Element) {
  const box = node.getBoundingClientRect()
  if (!box.width) return Number.POSITIVE_INFINITY

  const scroller = node.closest('.cover-flow')
  const view = scroller?.getBoundingClientRect()
  const middle = view ? view.left + view.width / 2 : window.innerWidth / 2
  return Math.abs(box.left + box.width / 2 - middle)
}

function closest() {
  let best: Entry | null = null
  let reach = Number.POSITIVE_INFINITY

  for (const entry of pending) {
    if (!entry.near) continue
    const offset = gap(entry.node)
    if (offset >= reach) continue
    reach = offset
    best = entry
  }

  return best
}

function pump() {
  if (running || served >= WARM_MAX || !allowed()) return

  const entry = closest()
  if (!entry) return

  pending.delete(entry)
  running = true
  served += 1
  entry.run().then(
    () => {
      running = false
      schedule()
    },
    () => {
      running = false
      schedule()
    },
  )
}

function schedule() {
  if (idle || running || served >= WARM_MAX || !pending.size || !booted()) return
  idle = whenIdle(() => {
    idle = 0
    pump()
  }) as unknown as number
}

function watch() {
  if (watching || booted()) return schedule()

  watching = true
  const observer = new MutationObserver(() => {
    if (!booted()) return
    observer.disconnect()
    watching = false
    schedule()
  })

  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-boot'] })
}

export function warmWhenIdle(node: Element, run: Warm) {
  const entry: Entry = { node, run, near: false }
  pending.add(entry)

  const observer = new IntersectionObserver(
    ([sight]) => {
      if (!sight?.isIntersecting) return
      observer.disconnect()
      entry.near = true
      watch()
    },
    { rootMargin: REACH },
  )
  observer.observe(node)

  return () => {
    observer.disconnect()
    pending.delete(entry)
  }
}
