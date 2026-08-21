export const COVER_FLOW_ARM = 'cover-flow-arm'

export const COVER_FLOW_MOVE = 'cover-flow-move'

export const COVER_FLOW_ITEM = 'cover-flow-item'

export const COVER_FLOW_STAGE = '(min-width: 64rem)'

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

export type Placement = {
  x: number
  z: number
  turn: number
  scale: number
  shade: number
}

export function placeCard(gap: number): Placement {
  const way = Math.sign(gap)
  const near = Math.min(Math.abs(gap), 1)
  const far = Math.max(0, Math.abs(gap) - 1)

  return {
    x: way * (near * XMB.gap + far * XMB.pack),
    z: -(near * XMB.depth + far * XMB.depth * 0.35),
    turn: -way * XMB.turn * near,
    scale: 1 - near * XMB.shrink - far * 0.03,
    shade: Math.min(0.95, near * XMB.dim + far * XMB.dim * 0.4),
  }
}

export function armCoverFlowItem(item: Element) {
  item.dispatchEvent(new CustomEvent(COVER_FLOW_ARM))
}

export function announceCoverFlowMove(scroller: Element) {
  scroller.dispatchEvent(new CustomEvent(COVER_FLOW_MOVE))
}
