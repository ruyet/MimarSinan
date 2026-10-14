/**
 * Schematic plans in the site's line style, shared by chapters VII (a tradition, refined),
 * VIII (the legacy) and IX (the synthesis). They show only what the verified facts state:
 * how many half-domes or piers surround the central dome, and the kind of space that makes.
 * They are diagrams, not measured drawings.
 */
import { s } from '../core/dom';
import { label, stroke } from './svg';

export type PlanId = 'hagia' | 'sehzade' | 'suleymaniye' | 'selimiye' | 'blue';

const W = 400;
const H = 300;
const CX = W / 2;
const CY = H / 2;

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;

/** A half-dome: a semicircle on the side of the central bay, bulging outward. */
function halfDome(dir: 'n' | 'e' | 's' | 'w', r: number, bay: number): string {
  if (dir === 'e') return `M${CX + bay} ${CY - r}A${r} ${r} 0 0 1 ${CX + bay} ${CY + r}`;
  if (dir === 'w') return `M${CX - bay} ${CY - r}A${r} ${r} 0 0 0 ${CX - bay} ${CY + r}`;
  if (dir === 'n') return `M${CX - r} ${CY - bay}A${r} ${r} 0 0 1 ${CX + r} ${CY - bay}`;
  return `M${CX - r} ${CY + bay}A${r} ${r} 0 0 0 ${CX + r} ${CY + bay}`;
}

function pier(
  svg: SVGSVGElement,
  strokes: SVGPathElement[],
  x: number,
  y: number,
  size = 20,
  rot = 0,
) {
  stroke(
    svg,
    `M${x - size / 2} ${y - size / 2}h${size}v${size}h${-size}Z`,
    's-pier-fill',
    strokes,
  ).setAttribute('transform', `rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})`);
}

function axis(svg: SVGSVGElement, strokes: SVGPathElement[], half: number): void {
  stroke(
    svg,
    `M${CX - half} ${CY}H${CX + half}M${CX + half - 10} ${CY - 6}L${CX + half} ${CY}L${CX + half - 10} ${CY + 6}M${CX - half + 10} ${CY - 6}L${CX - half} ${CY}L${CX - half + 10} ${CY + 6}`,
    's-axis',
    strokes,
  );
}

function radial(svg: SVGSVGElement, strokes: SVGPathElement[], r: number): void {
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const p0 = [CX + r * 0.78 * Math.cos(a), CY + r * 0.78 * Math.sin(a)];
    const p1 = [CX + r * 0.35 * Math.cos(a), CY + r * 0.35 * Math.sin(a)];
    stroke(
      svg,
      `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}L${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`,
      's-axis',
      strokes,
    );
  }
}

/** Draws plan `id` into a new SVG. `dims` adds the verified dome-width label where one exists. */
export function drawPlan(id: PlanId, ariaLabel: string, dims = false) {
  const svg = s('svg', {
    viewBox: `0 0 ${W} ${H}`,
    class: 'plan compare__plan',
    role: 'img',
    'aria-label': ariaLabel,
  });
  const strokes: SVGPathElement[] = [];

  if (id === 'hagia') {
    const r = 62;
    s('ellipse', { cx: CX, cy: CY, rx: r * 2.6, ry: r * 0.95, class: 'compare__space' }, svg);
    stroke(svg, `M${CX - 186} ${CY - 92}h372v184h-372Z`, 's-wall', strokes);
    stroke(svg, circle(CX, CY, r), 's-dome', strokes);
    stroke(svg, halfDome('w', r, r), 's-half', strokes);
    stroke(svg, halfDome('e', r, r), 's-half', strokes);
    [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ].forEach(([sx, sy]) => pier(svg, strokes, CX + sx * r, CY + sy * r, 22));
    axis(svg, strokes, 170);
    if (dims)
      label(svg, 'dome ⌀ ≈ 31–32 m', CX, CY + 92 + 22, 'annot annot--italic', {
        'text-anchor': 'middle',
      });
  }

  if (id === 'sehzade' || id === 'blue') {
    const r = id === 'blue' ? 52 : 56;
    const half = id === 'blue' ? 128 : 120;
    s('circle', { cx: CX, cy: CY, r: r * 2, class: 'compare__space' }, svg);
    stroke(
      svg,
      `M${CX - half} ${CY - half}h${half * 2}v${half * 2}h${-half * 2}Z`,
      's-wall',
      strokes,
    );
    stroke(svg, circle(CX, CY, r), 's-dome', strokes);
    (['n', 'e', 's', 'w'] as const).forEach((d) =>
      stroke(svg, halfDome(d, r, r), 's-half', strokes),
    );
    [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ].forEach(([sx, sy]) => pier(svg, strokes, CX + sx * r, CY + sy * r, 18));
    if (id === 'blue') {
      // Additional exedrae: small half-domes added around each half-dome.
      const er = 18;
      (['n', 'e', 's', 'w'] as const).forEach((d) => {
        [-1, 1].forEach((side) => {
          const along = r * 0.72;
          const out = r + r * 0.62;
          const [ex, ey] =
            d === 'n' || d === 's'
              ? [CX + side * along, CY + (d === 'n' ? -out : out)]
              : [CX + (d === 'w' ? -out : out), CY + side * along];
          const a0 = Math.atan2(ey - CY, ex - CX);
          const p0 = [ex + er * Math.cos(a0 + Math.PI / 2), ey + er * Math.sin(a0 + Math.PI / 2)];
          const p1 = [ex + er * Math.cos(a0 - Math.PI / 2), ey + er * Math.sin(a0 - Math.PI / 2)];
          stroke(
            svg,
            `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}A${er} ${er} 0 0 0 ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`,
            's-exedra',
            strokes,
          );
        });
      });
    }
    radial(svg, strokes, r * 2);
  }

  if (id === 'suleymaniye') {
    const r = 58;
    s('ellipse', { cx: CX, cy: CY, rx: r * 2.4, ry: r * 1.15, class: 'compare__space' }, svg);
    stroke(svg, `M${CX - 175} ${CY - 112}h350v224h-350Z`, 's-wall', strokes);
    stroke(svg, circle(CX, CY, r), 's-dome', strokes);
    stroke(svg, halfDome('w', r, r), 's-half', strokes);
    stroke(svg, halfDome('e', r, r), 's-half', strokes);
    [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ].forEach(([sx, sy]) => pier(svg, strokes, CX + sx * r, CY + sy * r, 20));
    axis(svg, strokes, 160);
  }

  if (id === 'selimiye') {
    const hx = 150;
    const hy = 120; // 45 × 36 m
    const r = (15.5 / 22.5) * hx; // dome ≈ 31 m in a 45 m hall
    s('circle', { cx: CX, cy: CY, r: r * 1.08, class: 'compare__space' }, svg);
    stroke(svg, `M${CX - hx} ${CY - hy}h${hx * 2}v${hy * 2}h${-hx * 2}Z`, 's-wall', strokes);
    stroke(svg, `M${CX - 14} ${CY - hy}v-12a14 14 0 0 1 28 0v12`, 's-wall-inner', strokes);
    stroke(svg, circle(CX, CY, r), 's-dome', strokes);
    [1, 3, 5, 7].forEach((k) => {
      const a = (k * Math.PI) / 4;
      const mx = CX + r * Math.cos(a);
      const my = CY + r * Math.sin(a);
      const hr = 22;
      const ax = mx + hr * Math.cos(a + Math.PI / 2);
      const ay = my + hr * Math.sin(a + Math.PI / 2);
      const bx = mx - hr * Math.cos(a + Math.PI / 2);
      const by = my - hr * Math.sin(a + Math.PI / 2);
      stroke(
        svg,
        `M${ax.toFixed(1)} ${ay.toFixed(1)}A${hr} ${hr} 0 0 0 ${bx.toFixed(1)} ${by.toFixed(1)}`,
        's-half',
        strokes,
      );
    });
    const rp = r / Math.cos(Math.PI / 8);
    for (let i = 0; i < 8; i++) {
      const a = Math.PI / 8 + (i * Math.PI) / 4;
      pier(svg, strokes, CX + rp * Math.cos(a), CY + rp * Math.sin(a), 16, (a * 180) / Math.PI);
    }
    radial(svg, strokes, r);
    if (dims)
      label(svg, 'dome ⌀ ≈ 31 m', CX, CY + 5, 'annot annot--italic annot--halo', {
        'text-anchor': 'middle',
      });
  }

  return { svg, strokes };
}
