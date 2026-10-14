/**
 * stability.ts — a deliberately simple, rules-based model. NOT an engineering calculation.
 *
 * It encodes one idea: a dome pushes down and outward, so it needs supports around its rim.
 *  - Stability grows with the number of piers (shorter unsupported gaps between them),
 *    with diminishing returns once the gaps are short enough.
 *  - Openness falls with every pier, because each one stands in the room; past eight it
 *    collapses quickly, as the piers start to read as a forest of columns.
 *
 * The values are illustrative and hand-tuned so that eight piers is the only arrangement
 * where both meters sit in the "sweet spot" (≥ SWEET). The UI labels this
 * "A simplified model, for illustration."
 */

export const PIER_OPTIONS = [4, 6, 8, 12, 16] as const;
export type PierCount = 0 | (typeof PIER_OPTIONS)[number];

export type StructuralState = 'none' | 'unstable' | 'strained' | 'balanced' | 'cluttered';

export interface Evaluation {
  piers: PierCount;
  /** 0–1: how well the dome's weight is carried. */
  stability: number;
  /** 0–1: how unobstructed the space below feels. */
  openness: number;
  state: StructuralState;
  stabilityLabel: string;
  opennessLabel: string;
}

/** Threshold for "both meters in the sweet spot". */
export const SWEET = 0.8;

// Hand-tuned, transparent lookup table: [stability, openness].
const TABLE: Record<PierCount, [number, number]> = {
  0: [0, 1],
  4: [0.32, 0.95],
  6: [0.66, 0.9],
  8: [0.9, 0.84],
  12: [0.96, 0.42],
  16: [0.99, 0.18],
};

function stabilityLabel(v: number): string {
  if (v === 0) return 'No support';
  if (v < 0.5) return 'Unstable';
  if (v < SWEET) return 'Strained';
  return 'Holds';
}

function opennessLabel(v: number): string {
  if (v >= 0.95) return 'Fully open';
  if (v >= SWEET) return 'Open';
  if (v >= 0.35) return 'Crowded';
  return 'Blocked';
}

export function evaluate(piers: PierCount): Evaluation {
  const [stability, openness] = TABLE[piers];
  let state: StructuralState;
  if (piers === 0) state = 'none';
  else if (stability < 0.5) state = 'unstable';
  else if (stability < SWEET) state = 'strained';
  else if (openness >= SWEET) state = 'balanced';
  else state = 'cluttered';
  return {
    piers,
    stability,
    openness,
    state,
    stabilityLabel: stabilityLabel(stability),
    opennessLabel: opennessLabel(openness),
  };
}

/** Next / previous arrangement — used when the ring is clicked (add) or a pier is clicked (remove). */
export function stepPiers(current: PierCount, dir: 1 | -1): PierCount {
  const all: PierCount[] = [0, ...PIER_OPTIONS];
  const i = all.indexOf(current);
  return all[Math.min(all.length - 1, Math.max(0, i + dir))];
}
