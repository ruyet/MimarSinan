/**
 * Chapter II drawings.
 *  - buildPiersPlan: the dome seen from directly above, the hall's walls, a dashed ring of
 *    possible pier positions, the piers themselves and the thrust lines that flow into them.
 *  - buildFloorView: a small panorama of what a person standing at the centre would see.
 */
import { s } from '../core/dom';
import type { Evaluation } from '../model/stability';
import { stroke } from './svg';

export const TOP = {
  size: 640,
  c: 320,
  /** Dome radius (≈ 31 m across → 12.9 units per metre). */
  R: 200,
  /** Ring where piers can stand. */
  ring: 226,
  /** Hall half-sizes: 45 × 36 m. */
  hx: 290,
  hy: 232,
  pier: 26,
} as const;

/** Piers start at 22.5° so eight piers form the same octagon as the real building. */
export const pierAngle = (i: number, n: number): number =>
  -Math.PI / 2 + Math.PI / n + (i * 2 * Math.PI) / n;

const polar = (r: number, a: number) => ({
  x: TOP.c + r * Math.cos(a),
  y: TOP.c + r * Math.sin(a),
});
const f = (n: number) => n.toFixed(2);

export interface PiersPlan {
  svg: SVGSVGElement;
  ringHit: SVGCircleElement;
  dome: SVGGElement;
  pierLayer: SVGGElement;
  thrustLayer: SVGGElement;
  pulse: SVGCircleElement;
  render(e: Evaluation): SVGRectElement[];
}

export function buildPiersPlan(labelledBy: string): PiersPlan {
  const { size, c, R, ring, hx, hy, pier } = TOP;
  const svg = s('svg', {
    viewBox: `0 0 ${size} ${size}`,
    class: 'plan top-plan',
    role: 'img',
    'aria-labelledby': labelledBy,
  });

  // Hall walls (faint double line).
  s('rect', { x: c - hx, y: c - hy, width: hx * 2, height: hy * 2, class: 'top-plan__wall' }, svg);
  s(
    'rect',
    {
      x: c - hx + 14,
      y: c - hy + 14,
      width: hx * 2 - 28,
      height: hy * 2 - 28,
      class: 'top-plan__wall top-plan__wall--inner',
    },
    svg,
  );

  // Ring of possible pier positions + a wide invisible hit area for pointer input.
  s('circle', { cx: c, cy: c, r: ring, class: 'top-plan__ring' }, svg);
  const thrustLayer = s('g', { class: 'top-plan__thrust' }, svg);

  // The dome: paper disc, rim, inner rings and eight ribs.
  const dome = s('g', { class: 'top-plan__dome' }, svg);
  s('circle', { cx: c, cy: c, r: R, class: 'dome-fill' }, dome);
  stroke(dome, circlePath(R), 's-dome');
  stroke(dome, circlePath(R * 0.62), 's-dome-fine');
  stroke(dome, circlePath(R * 0.22), 's-dome-fine');
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const p0 = polar(R * 0.22, a);
    const p1 = polar(R, a);
    stroke(dome, `M${f(p0.x)} ${f(p0.y)}L${f(p1.x)} ${f(p1.y)}`, 's-dome-fine');
  }
  // Drum windows: short ticks around the rim.
  for (let i = 0; i < 32; i++) {
    const a = (i * Math.PI) / 16;
    const p0 = polar(R * 0.93, a);
    const p1 = polar(R * 0.99, a);
    stroke(dome, `M${f(p0.x)} ${f(p0.y)}L${f(p1.x)} ${f(p1.y)}`, 's-window');
  }
  s('circle', { cx: c, cy: c, r: 4, class: 'top-plan__centre' }, dome);

  // Lock-in pulse ring (scaled + faded with transforms only).
  const pulse = s('circle', { cx: c, cy: c, r: R, class: 'top-plan__pulse', opacity: 0 }, svg);

  const pierLayer = s('g', { class: 'top-plan__piers' }, svg);
  const ringHit = s('circle', { cx: c, cy: c, r: ring, class: 'top-plan__hit' }, svg);
  // Piers sit above the hit ring so clicking a pier removes rather than adds.
  svg.append(pierLayer);

  function render(e: Evaluation): SVGRectElement[] {
    pierLayer.replaceChildren();
    thrustLayer.replaceChildren();
    const n = e.piers;
    const rects: SVGRectElement[] = [];
    if (!n) return rects;

    const gap = (2 * Math.PI) / n;
    for (let i = 0; i < n; i++) {
      const a = pierAngle(i, n);
      const pos = polar(ring, a);

      // Thrust lines: from the dome's rim on either side, curving into the pier.
      [-1, 1].forEach((side) => {
        const from = polar(R, a + side * gap * 0.42);
        const ctrl = polar(R * 1.04, a + side * gap * 0.12);
        stroke(
          thrustLayer,
          `M${f(from.x)} ${f(from.y)}Q${f(ctrl.x)} ${f(ctrl.y)} ${f(pos.x)} ${f(pos.y)}`,
          'thrust',
        );
      });

      // Where support is inadequate, the dome pushes outward between the piers.
      const stress = 1 - e.stability;
      if (e.state === 'unstable' || e.state === 'strained') {
        const mid = a + gap / 2;
        const len = 18 + stress * 70;
        const p0 = polar(R + 6, mid);
        const p1 = polar(R + 6 + len, mid);
        const head1 = polar(R + 6 + len - 10, mid - 0.05);
        const head2 = polar(R + 6 + len - 10, mid + 0.05);
        stroke(
          thrustLayer,
          `M${f(p0.x)} ${f(p0.y)}L${f(p1.x)} ${f(p1.y)}M${f(head1.x)} ${f(head1.y)}L${f(p1.x)} ${f(p1.y)}L${f(head2.x)} ${f(head2.y)}`,
          'push',
        );
      }

      const rect = s(
        'rect',
        {
          x: f(pos.x - pier / 2),
          y: f(pos.y - pier / 2),
          width: pier,
          height: pier,
          rx: 2,
          class: 'pier',
          transform: `rotate(${f((a * 180) / Math.PI)} ${f(pos.x)} ${f(pos.y)})`,
        },
        pierLayer,
      );
      rects.push(rect);
    }
    return rects;
  }

  return { svg, ringHit, dome, pierLayer, thrustLayer, pulse, render };
}

function circlePath(r: number): string {
  const { c } = TOP;
  return `M${c - r} ${c}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;
}

/* ------------------------------------------------------------------------ */

export interface FloorView {
  svg: SVGSVGElement;
  render(e: Evaluation): SVGRectElement[];
}

/**
 * What a person standing under the dome sees, looking ahead (a 180° panorama).
 * Column widths follow the model's openness: the fuller the room, the more it is blocked.
 */
export function buildFloorView(): FloorView {
  const W = 360;
  const H = 180;
  const horizon = 138;
  const svg = s('svg', {
    viewBox: `0 0 ${W} ${H}`,
    class: 'floorview__art',
    'aria-hidden': 'true',
  });
  const defs = s('defs', {}, svg);
  const g = s('linearGradient', { id: 'fv-wall', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  s('stop', { offset: '0%', 'stop-color': '#f8f1e2' }, g);
  s('stop', { offset: '100%', 'stop-color': '#e7dcc8' }, g);

  s('rect', { x: 0, y: 0, width: W, height: horizon, fill: 'url(#fv-wall)' }, svg);
  s('rect', { x: 0, y: horizon, width: W, height: H - horizon, class: 'floorview__floor' }, svg);
  // The dome overhead, as a great arc, with its ring of windows.
  s(
    'path',
    { d: `M-30 ${horizon - 40}Q${W / 2} -70 ${W + 30} ${horizon - 40}`, class: 'floorview__dome' },
    svg,
  );
  for (let i = 1; i < 12; i++) {
    const x = (W / 12) * i;
    const t = x / W;
    const y = (1 - t) * (1 - t) * (horizon - 40) + 2 * (1 - t) * t * -70 + t * t * (horizon - 40);
    s('rect', { x: x - 3, y: y + 8, width: 6, height: 11, rx: 3, class: 'floorview__window' }, svg);
  }
  s('line', { x1: 0, y1: horizon, x2: W, y2: horizon, class: 'floorview__line' }, svg);
  const cols = s('g', {}, svg);

  return {
    svg,
    render(e) {
      cols.replaceChildren();
      const n = e.piers;
      if (!n) return [];
      const visible: number[] = [];
      for (let i = 0; i < n; i++) {
        const deg = -90 + ((i + 0.5) * 360) / n;
        if (deg > -90 && deg < 90) visible.push(deg);
      }
      const width = Math.max(8, ((1 - e.openness) * W) / Math.max(1, visible.length));
      return visible.map((deg) => {
        const x = W / 2 + (deg / 90) * (W / 2);
        return s(
          'rect',
          {
            x: f(x - width / 2),
            y: 22,
            width: f(width),
            height: horizon - 22,
            class: 'floorview__col',
          },
          cols,
        );
      });
    },
  };
}
