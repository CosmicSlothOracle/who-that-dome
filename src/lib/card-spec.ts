/** Feste Druckgröße für alle Spielkarten. Pokerformat, 300 dpi. */

export const CARD = {
  widthMm: 63.5,
  heightMm: 88.9,
  dpi: 300,
  widthPx: 750,
  heightPx: 1050,
} as const;

/** QR auf der Rückseite: 25 mm, mittig, etwas über der Mitte. */
export const QR_ON_CARD = {
  sizeMm: 25,
  sizePx: 295,
  leftPx: Math.round((CARD.widthPx - 295) / 2),
  topPx: 280,
} as const;

export const CARD_PATHS = {
  incoming: "assets/cards/incoming",
  templates: "assets/cards/templates",
  print: "handoff/drap/v001/print/cards",
} as const;

export function incomingNames(cardId: string) {
  return {
    front: `${cardId}_front.png`,
    back: `${cardId}_back.png`,
  };
}
