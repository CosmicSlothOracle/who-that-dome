export type Seat = {
  left: number;
  top: number;
  width: number;
  height: number;
  /** Drehung des Pad-Inhalts in Grad, damit der Text zum Spieler zeigt. */
  rotate: number;
};

export const EDGE_H = 20; // % Höhe der oberen/unteren Streifen
export const EDGE_W = 18; // % Breite der seitlichen Streifen

type Layout = { seats: Seat[]; inset: { top: number; bottom: number; left: number; right: number } };

const bottom = (left = 0, width = 100): Seat => ({ left, top: 100 - EDGE_H, width, height: EDGE_H, rotate: 0 });
const top = (left = 0, width = 100): Seat => ({ left, top: 0, width, height: EDGE_H, rotate: 180 });

export function seatLayout(count: number): Layout {
  const hasTop = count === 2 || count >= 4;
  const hasSides = count >= 3;
  const topInset = hasTop ? EDGE_H : 0;
  const sideTop = topInset;
  const sideH = 100 - EDGE_H - topInset;
  const left: Seat = { left: 0, top: sideTop, width: EDGE_W, height: sideH, rotate: 90 };
  const right: Seat = { left: 100 - EDGE_W, top: sideTop, width: EDGE_W, height: sideH, rotate: -90 };

  let seats: Seat[];
  switch (count) {
    case 2:
      seats = [bottom(), top()];
      break;
    case 3:
      seats = [bottom(), left, right];
      break;
    case 4:
      seats = [bottom(), top(), left, right];
      break;
    case 5:
      seats = [bottom(0, 50), bottom(50, 50), top(), left, right];
      break;
    default:
      seats = [bottom(0, 50), bottom(50, 50), top(0, 50), top(50, 50), left, right];
  }
  return {
    seats,
    inset: {
      top: topInset,
      bottom: EDGE_H,
      left: hasSides ? EDGE_W : 0,
      right: hasSides ? EDGE_W : 0,
    },
  };
}
