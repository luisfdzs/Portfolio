// Aviso que el carrusel le da a una tarjeta antes de viajar hasta ella: «te toca, tapa lo
// que tengas puesto». Lo escucha el clip de la tarjeta para poner su loader ya, sin esperar
// a llegar al centro —esperar era lo que dejaba ver la captura antes que nada—.
export const COVER_FLOW_ARM = 'cover-flow-arm'

export const COVER_FLOW_ITEM = 'cover-flow-item'

export function armCoverFlowItem(item: Element) {
  item.dispatchEvent(new CustomEvent(COVER_FLOW_ARM))
}
