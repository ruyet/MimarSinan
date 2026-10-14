/**
 * A hemispherical dome drawn in the shared axonometric projection:
 * paper body, silhouette, hidden back rim, ribs, two rings, a ring of drum windows and a finial.
 */
import { s } from '../core/dom';
import {
  FORESHORTEN,
  facesViewer,
  range,
  runs,
  toPath,
  type Projector,
  type ScreenPoint,
} from './projection';
import { stroke } from './svg';

export interface DomeParts {
  /** Centre of the base circle on screen. */
  centre: ScreenPoint;
  fill: SVGPathElement;
  strokes: SVGPathElement[];
  /** Small window marks around the base (front half only). */
  windows: SVGPathElement[];
}

export function drawDome(
  parent: SVGGElement,
  p: Projector,
  R: number,
  z: number,
  opts: { finial?: number; windowCount?: number } = {},
): DomeParts {
  const strokes: SVGPathElement[] = [];
  const windows: SVGPathElement[] = [];
  const c = p(0, 0, z);
  const left = `${(c.x - R).toFixed(2)} ${c.y.toFixed(2)}`;
  const right = `${(c.x + R).toFixed(2)} ${c.y.toFixed(2)}`;

  // Paper body (silhouette + near half of the base) so the dome reads as a solid object.
  const fill = s(
    'path',
    {
      d: `M${left}A${R} ${R} 0 0 1 ${right}A${R} ${R * FORESHORTEN} 0 0 1 ${left}Z`,
      class: 'dome-fill',
    },
    parent,
  );

  const base = range(0, Math.PI * 2, 128).map((t) => ({
    pt: p(R * Math.cos(t), R * Math.sin(t), z),
    front: facesViewer(Math.cos(t), Math.sin(t), 0),
  }));
  // Hidden (far) half of the rim, faint like a draughtsman's hidden line.
  runs(base, (r) => !r.front).forEach((run) =>
    stroke(parent, toPath(run.map((r) => r.pt)), 's-dome-hidden', strokes),
  );
  stroke(parent, `M${left}A${R} ${R} 0 0 1 ${right}`, 's-dome', strokes);
  runs(base, (r) => r.front).forEach((run) =>
    stroke(parent, toPath(run.map((r) => r.pt)), 's-dome', strokes),
  );

  // Ribs (meridians) and two rings (parallels), visible parts only.
  [0, 45, 90, 135].forEach((deg) => {
    const ang = (deg * Math.PI) / 180;
    const pts = range(0, Math.PI, 64).map((phi) => {
      const x = Math.cos(ang) * Math.cos(phi);
      const y = Math.sin(ang) * Math.cos(phi);
      const zz = Math.sin(phi);
      return { pt: p(R * x, R * y, z + R * zz), vis: facesViewer(x, y, zz) };
    });
    runs(pts, (q) => q.vis).forEach((run) =>
      stroke(parent, toPath(run.map((q) => q.pt)), 's-dome-fine', strokes),
    );
  });
  [0.6, 1.1].forEach((phi) => {
    const r = Math.cos(phi);
    const zz = Math.sin(phi);
    const pts = range(0, Math.PI * 2, 96).map((t) => ({
      pt: p(R * r * Math.cos(t), R * r * Math.sin(t), z + R * zz),
      vis: facesViewer(r * Math.cos(t), r * Math.sin(t), zz),
    }));
    runs(pts, (q) => q.vis).forEach((run) =>
      stroke(parent, toPath(run.map((q) => q.pt)), 's-dome-fine', strokes),
    );
  });

  // Drum windows: short vertical marks just above the rim.
  const n = opts.windowCount ?? 24;
  range(0, Math.PI * 2, n)
    .slice(0, -1)
    .forEach((t) => {
      const x = Math.cos(t);
      const y = Math.sin(t);
      if (!facesViewer(x, y, 0.05)) return;
      const lo = p(R * x, R * y, z + R * 0.03);
      const hi = p(R * 0.985 * x, R * 0.985 * y, z + R * 0.11);
      windows.push(stroke(parent, toPath([lo, hi]), 's-window', strokes));
    });

  // Finial.
  const pole = p(0, 0, z + R);
  stroke(
    parent,
    toPath([pole, { x: pole.x, y: pole.y - (opts.finial ?? R * 0.25) }]),
    's-dome',
    strokes,
  );

  return { centre: c, fill, strokes, windows };
}
