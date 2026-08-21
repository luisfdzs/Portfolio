export const COVER_FLOW_ARM = 'cover-flow-arm'

export const COVER_FLOW_MOVE = 'cover-flow-move'

export const COVER_FLOW_ITEM = 'cover-flow-item'

export const COVER_FLOW_CALM = '(prefers-reduced-motion: reduce)'

export const COVER_FLOW_ROOMY = '(min-width: 64rem)'

export const XMB = {
  pull: 100,
  settle: 1.01,
  flick: 0.2,
  holdDelay: 0.1,
  holdRamp: 1.4,
  holdTop: 9,
  visible: 6,
  mirror: 0.56,
  gap: 0.62,
  pack: 0.16,
  turn: 81,
  depth: 0.26,
  shrink: 0.4,
  dim: 0.34,
}

export const XMB_SNUG = {
  ...XMB,
  gap: 0.58,
  pack: 0.12,
  turn: 82,
  depth: 0.3,
  shrink: 0.46,
  dim: 0.4,
  visible: 8,
  mirror: 0.46,
}

export type Tune = typeof XMB

export type Placement = {
  x: number
  z: number
  turn: number
  scale: number
  shade: number
}

export function placeCard(gap: number, tune: Tune): Placement {
  const way = Math.sign(gap)
  const near = Math.min(Math.abs(gap), 1)
  const far = Math.max(0, Math.abs(gap) - 1)

  return {
    x: way * (near * tune.gap + far * tune.pack),
    z: -(near * tune.depth + far * tune.depth * 0.35),
    turn: -way * tune.turn * near,
    scale: 1 - near * tune.shrink - far * 0.03,
    shade: Math.min(0.95, near * tune.dim + far * tune.dim * 0.4),
  }
}

export function armCoverFlowItem(item: Element) {
  item.dispatchEvent(new CustomEvent(COVER_FLOW_ARM))
}

export function announceCoverFlowMove(scroller: Element) {
  scroller.dispatchEvent(new CustomEvent(COVER_FLOW_MOVE))
}
