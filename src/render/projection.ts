/**
 * A fixed axonometric camera for the line drawings.
 *
 * World space: x/y on the floor plan, z up. The plan is turned 45° and viewed from
 * 30° above the horizon. Because the projection is orthographic, a sphere's outline
 * stays a perfect circle and a floor circle becomes an ellipse with ry = r · sin(30°) —
 * that keeps the dome geometry honest and easy to reason about.
 */

export interface ScreenPoint {
  x: number;
  y: number;
}

const ROT = Math.PI / 4;
const TILT = Math.PI / 6;
const COS_R = Math.cos(ROT);
const SIN_R = Math.sin(ROT);
const SIN_T = Math.sin(TILT);
const COS_T = Math.cos(TILT);

/** Vertical squash of floor circles (ry / rx). */
export const FORESHORTEN = SIN_T;

export type Projector = (x: number, y: number, z?: number) => ScreenPoint;

export function createProjector(origin: ScreenPoint): Projector {
  return (x, y, z = 0) => {
    const xr = x * COS_R - y * SIN_R;
    const yr = x * SIN_R + y * COS_R; // positive = towards the viewer
    return { x: origin.x + xr, y: origin.y + yr * SIN_T - z * COS_T };
  };
}

/**
 * Is a point on a sphere (given relative to the sphere's centre) facing the viewer?
 * Used to draw only the visible half of the dome's ribs and rings.
 */
export function facesViewer(x: number, y: number, z: number): boolean {
  const yr = x * SIN_R + y * COS_R;
  return yr * COS_T + z * SIN_T > 0;
}

export function toPath(points: ScreenPoint[], closed = false): string {
  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join('');
  return closed ? `${d}Z` : d;
}

/** Splits a polyline into runs where `keep` is true (for visible/hidden line work). */
export function runs<T>(items: T[], keep: (item: T) => boolean): T[][] {
  const out: T[][] = [];
  let currentRun: T[] = [];
  for (const item of items) {
    if (keep(item)) currentRun.push(item);
    else if (currentRun.length) {
      out.push(currentRun);
      currentRun = [];
    }
  }
  if (currentRun.length) out.push(currentRun);
  return out.filter((r) => r.length > 1);
}

export function range(from: number, to: number, steps: number): number[] {
  return Array.from({ length: steps + 1 }, (_, i) => from + ((to - from) * i) / steps);
}

/** A circle or arc on a horizontal plane at height z, sampled and projected. */
export function ringPoints(
  p: Projector,
  cx: number,
  cy: number,
  r: number,
  z: number,
  a0 = 0,
  a1 = Math.PI * 2,
  steps = 96,
): ScreenPoint[] {
  return range(a0, a1, steps).map((a) => p(cx + r * Math.cos(a), cy + r * Math.sin(a), z));
}
