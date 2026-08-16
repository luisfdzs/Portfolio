export const COVER_FLOW_ARM = 'cover-flow-arm'

export const COVER_FLOW_ITEM = 'cover-flow-item'

export function armCoverFlowItem(item: Element) {
  item.dispatchEvent(new CustomEvent(COVER_FLOW_ARM))
}
