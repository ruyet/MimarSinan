/**
 * The prayer hall as a cut-away, in the shared axonometric view. One drawing serves three
 * scenes, so the visitor keeps looking at the same room:
 *  - Structure: `setSupports(n)` places 4, 8 or 16 supports under the dome, shades the floor
 *    that stays open, and marks where an unsupported rim would push outwards.
 *  - Light: window rows in the far walls (and the ring around the dome) open one by one,
 *    each letting a shaft of light fall across the floor.
 *
 * The two far walls stand full height; the two near walls are cut low (a section).
 * Proportions follow the verified numbers: hall 45 × 36 m, dome ≈ 31 m, crown ≈ 42 m.
 * Drawing units: 8 units = 1 metre.
 *
 * Layering, back to front: walls → floor → open floor → light pools → shade → light shafts
 * → back supports → dome → front supports → near walls. Shafts sit *behind* every solid
 * object, so a beam can never cross in front of a pier, the dome or a cut wall.
 */
import { s } from '../core/dom';
import { drawDome } from './dome';
import { createProjector, facesViewer, toPath, type ScreenPoint } from './projection';
import { stroke } from './svg';

const M = 8;
export const HALL = {
  /** Visible crop of the drawing (x, y, w, h): 4:3, trimmed to the content. */
  view: [0, 160, 640, 480] as const,
  origin: { x: 320, y: 500 },
  hx: 22.5 * M,
  hy: 18 * M,
  wallH: 22 * M,
  cutH: 2.5 * M,
  R: 15.5 * M,
  domeZ: 26.5 * M, // crown = 26.5 + 15.5 = 42 m
} as const;

/** Window rows as [bottom, top] heights in metres. */
const ROWS: [number, number][] = [
  [2.5, 7],
  [9, 13],
  [15, 19.5],
];

/** Direction the light travels (into the room and down). */
const LIGHT = { x: 0.5, y: 0.32 };

/** Supports stand on one ring, just outside the dome's rim (the octagon at Selimiye). */
const RING = HALL.R / Math.cos(Math.PI / 8);
const PIER_SIZE: Record<number, number> = { 4: 4.5 * M, 8: 3 * M, 16: 1.8 * M };

export interface SupportsResult {
  /** New solid elements (pier faces), for an entrance animation. */
  piers: SVGElement[];
  /** Outward-push marks (only with too few supports). */
  push: SVGElement[];
  /** The shaded open floor. */
  open: SVGElement | null;
}

export interface HallDrawing {
  svg: SVGSVGElement;
  /** Window rows: 3 wall rows + the ring of dome windows. */
  rows: { windows: SVGElement[]; rays: SVGElement[]; pools: SVGElement[] }[];
  /** Interior shade that lifts as light enters. */
  shade: SVGPathElement;
  /** Strokes of the room itself (walls, dome), for a drawn entrance. */
  strokes: SVGPathElement[];
  setSupports(n: number): SupportsResult;
}

export function buildHall(labelledBy: string, idSuffix = ''): HallDrawing {
  const { origin, hx, hy, wallH, cutH, R, domeZ } = HALL;
  const p = createProjector(origin);
  const svg = s('svg', {
    viewBox: HALL.view.join(' '),
    class: 'plan hall',
    role: 'img',
    'aria-labelledby': labelledBy,
  });
  const defs = s('defs', {}, svg);
  const rayGrad = s(
    'linearGradient',
    { id: `hall-ray${idSuffix}`, x1: 0, y1: 0, x2: 0, y2: 1 },
    defs,
  );
  s('stop', { offset: '0%', 'stop-color': '#f1d38c', 'stop-opacity': 0.95 }, rayGrad);
  s('stop', { offset: '100%', 'stop-color': '#f1d38c', 'stop-opacity': 0.12 }, rayGrad);
  const poolGrad = s('radialGradient', { id: `hall-pool${idSuffix}` }, defs);
  s('stop', { offset: '0%', 'stop-color': '#f6e0a8', 'stop-opacity': 0.95 }, poolGrad);
  s('stop', { offset: '100%', 'stop-color': '#f6e0a8', 'stop-opacity': 0.15 }, poolGrad);

  const strokes: HallDrawing['strokes'] = [];
  const rows: HallDrawing['rows'] = [0, 1, 2, 3].map(() => ({ windows: [], rays: [], pools: [] }));

  const poly = (
    pts: ScreenPoint[],
    cls: string,
    parent: Element,
    extra: Record<string, string> = {},
  ) => s('path', { d: toPath(pts, true), class: cls, ...extra }, parent);

  /* --- Layers, back to front ------------------------------------------ */
  const gWalls = s('g', {}, svg);
  const gFloor = s('g', {}, svg);
  const gOpen = s('g', { class: 'hall__open-layer' }, svg);
  const gPools = s('g', { class: 'hall__pools' }, svg);
  const gShade = s('g', {}, svg);
  const gRays = s('g', { class: 'hall__rays' }, svg);
  const gBack = s('g', {}, svg);
  const gPushBack = s('g', {}, svg);
  const gDome = s('g', {}, svg);
  const gFront = s('g', {}, svg);
  const gPushFront = s('g', {}, svg);
  const gNear = s('g', {}, svg);

  /* --- Far walls (full height) ----------------------------------------- */
  const wallA = [p(-hx, -hy, 0), p(hx, -hy, 0), p(hx, -hy, wallH), p(-hx, -hy, wallH)];
  const wallB = [p(-hx, -hy, 0), p(-hx, hy, 0), p(-hx, hy, wallH), p(-hx, -hy, wallH)];
  poly(wallA, 'hall__wall hall__wall--a', gWalls);
  poly(wallB, 'hall__wall hall__wall--b', gWalls);
  strokes.push(stroke(gWalls, toPath(wallA, true), 's-wall-inner'));
  strokes.push(stroke(gWalls, toPath(wallB, true), 's-wall-inner'));

  /* --- Floor ---------------------------------------------------------- */
  const floor = [p(-hx, -hy), p(hx, -hy), p(hx, hy), p(-hx, hy)];
  poly(floor, 'hall__floor', gFloor);
  strokes.push(stroke(gFloor, toPath(floor, true), 's-wall'));

  const shade = poly(
    [p(-hx, hy), p(-hx, hy, wallH), p(-hx, -hy, wallH), p(hx, -hy, wallH), p(hx, -hy), p(hx, hy)],
    'hall__shade',
    gShade,
  ) as SVGPathElement;

  /* --- Windows + light shafts, row by row ----------------------------- */
  const archWindow = (
    point: (u: number, z: number) => ScreenPoint,
    uc: number,
    w: number,
    zb: number,
    zt: number,
  ): ScreenPoint[] => {
    const pts: ScreenPoint[] = [point(uc - w / 2, zb)];
    const spring = zt - w / 2;
    pts.push(point(uc - w / 2, spring));
    for (let i = 1; i < 10; i++) {
      const a = Math.PI - (Math.PI * i) / 10;
      pts.push(point(uc + (w / 2) * Math.cos(a), spring + (w / 2) * Math.sin(a)));
    }
    pts.push(point(uc + w / 2, spring), point(uc + w / 2, zb));
    return pts;
  };
  /** Where a ray from wall point (x, y, z) reaches the floor. */
  const hit = (x: number, y: number, z: number): ScreenPoint =>
    p(x + LIGHT.x * z, y + LIGHT.y * z, 0);

  const walls = [
    { at: (u: number, z: number) => [u, -hy, z] as const, from: -hx, to: hx },
    { at: (u: number, z: number) => [-hx, u, z] as const, from: -hy, to: hy },
  ];
  const spacing = 4.5 * M;
  const winW = 1.8 * M;

  ROWS.forEach(([zb, zt], rowIndex) => {
    const z0 = zb * M;
    const z1 = zt * M;
    walls.forEach((wall) => {
      const point = (u: number, z: number) => p(...wall.at(u, z));
      for (let u = wall.from + spacing; u <= wall.to - spacing * 0.6; u += spacing) {
        const [x, y] = wall.at(u, 0);
        // Skip shafts that would land outside the hall.
        if (x + LIGHT.x * z1 > hx - M || y + LIGHT.y * z1 > hy - M) continue;
        rows[rowIndex].windows.push(
          poly(archWindow(point, u, winW, z0, z1), 'hall__window', gWalls),
        );
        const l = wall.at(u - winW / 2, z1);
        const r = wall.at(u + winW / 2, z1);
        const lb = wall.at(u - winW / 2, z0);
        const rb = wall.at(u + winW / 2, z0);
        rows[rowIndex].rays.push(
          poly([p(...l), p(...r), hit(...r), hit(...l)], 'hall__ray', gRays, {
            fill: `url(#hall-ray${idSuffix})`,
          }),
        );
        rows[rowIndex].pools.push(
          poly([hit(...lb), hit(...rb), hit(...r), hit(...l)], 'hall__pool', gPools, {
            fill: `url(#hall-pool${idSuffix})`,
          }),
        );
      }
    });
  });

  /* --- Dome, with the 4th "row" of windows around its base ------------- */
  const dome = drawDome(gDome, p, R, domeZ, { finial: 34, windowCount: 32 });
  strokes.push(...dome.strokes);
  rows[3].windows.push(...dome.windows);
  const glow = s(
    'ellipse',
    {
      cx: dome.centre.x,
      cy: dome.centre.y + R * 0.06,
      rx: R * 1.05,
      ry: R * 0.62,
      class: 'hall__dome-glow',
    },
    gDome,
  );
  gDome.insertBefore(glow, gDome.firstChild);
  rows[3].pools.push(glow);

  /* --- Near walls, cut low (section) ---------------------------------- */
  const nearA = [p(hx, -hy, 0), p(hx, hy, 0), p(hx, hy, cutH), p(hx, -hy, cutH)];
  const nearB = [p(-hx, hy, 0), p(hx, hy, 0), p(hx, hy, cutH), p(-hx, hy, cutH)];
  poly(nearA, 'hall__cut', gNear);
  poly(nearB, 'hall__cut', gNear);
  strokes.push(stroke(gNear, toPath(nearA, true), 's-wall'));
  strokes.push(stroke(gNear, toPath(nearB, true), 's-wall'));

  /* --- Supports: piers, arches, the open floor, outward push ----------- */
  function setSupports(n: number): SupportsResult {
    [gBack, gFront, gOpen, gPushBack, gPushFront].forEach((g) => g.replaceChildren());
    const result: SupportsResult = { piers: [], push: [], open: null };

    if (n > 0) {
      const size = PIER_SIZE[n] ?? 3 * M;
      const piers = Array.from({ length: n }, (_, i) => {
        const a = Math.PI / n + (i * 2 * Math.PI) / n;
        return {
          a,
          x: RING * Math.cos(a),
          y: RING * Math.sin(a),
          depth: Math.sin(a + Math.PI / 4),
        };
      });
      const span = 2 * RING * Math.sin(Math.PI / n);
      const pierTop = domeZ - span / 2;

      const drawPier = (x: number, y: number, g: SVGGElement): void => {
        const h = size / 2;
        // Visible faces in this view: +x and +y, and the top.
        const fx = [
          p(x + h, y - h, 0),
          p(x + h, y + h, 0),
          p(x + h, y + h, pierTop),
          p(x + h, y - h, pierTop),
        ];
        const fy = [
          p(x - h, y + h, 0),
          p(x + h, y + h, 0),
          p(x + h, y + h, pierTop),
          p(x - h, y + h, pierTop),
        ];
        const top = [
          p(x - h, y - h, pierTop),
          p(x + h, y - h, pierTop),
          p(x + h, y + h, pierTop),
          p(x - h, y + h, pierTop),
        ];
        const group = s('g', { class: 'hall__pier' }, g);
        poly(fx, 'hall__pier--x', group);
        poly(fy, 'hall__pier--y', group);
        poly(top, 'hall__pier--top', group);
        [fx, fy, top].forEach((f) => stroke(group, toPath(f, true), 's-pier'));
        result.piers.push(group);
      };
      const drawArch = (i: number, g: SVGGElement): void => {
        const a = piers[i];
        const b = piers[(i + 1) % n];
        const pts = Array.from({ length: 25 }, (_, k) => {
          const t = k / 24;
          return p(
            a.x + (b.x - a.x) * t,
            a.y + (b.y - a.y) * t,
            pierTop + (span / 2) * Math.sin(Math.PI * t),
          );
        });
        result.piers.push(stroke(g, toPath(pts), 's-arch'));
      };

      // Arches first, then supports far-to-near, so nearer ones overlap farther ones.
      piers.forEach((pr, i) => {
        const mid = Math.sin(pr.a + Math.PI / n + Math.PI / 4);
        drawArch(i, mid < 0 ? gBack : gFront);
      });
      [...piers]
        .sort((a, b) => a.depth - b.depth)
        .forEach((pr) => drawPier(pr.x, pr.y, pr.depth < 0 ? gBack : gFront));

      // The open floor: with many supports the colonnade fences off a smaller middle.
      const inset = M * 1.2;
      result.open =
        n >= 16
          ? poly(
              piers.map((pr) => p(pr.x * 0.9, pr.y * 0.9)),
              'hall__open',
              gOpen,
            )
          : poly(
              [
                p(-hx + inset, -hy + inset),
                p(hx - inset, -hy + inset),
                p(hx - inset, hy - inset),
                p(-hx + inset, hy - inset),
              ],
              'hall__open',
              gOpen,
            );

      // Too few supports: the rim overhangs between them and pushes outwards.
      if (n <= 4) {
        for (let i = 0; i < n; i++) {
          const mid = (i * 2 * Math.PI) / n + (2 * Math.PI) / n; // between two supports
          const front = facesViewer(Math.cos(mid), Math.sin(mid), 0);
          const rimG = front ? gPushFront : gPushBack;
          const arc = Array.from({ length: 17 }, (_, k) => {
            const t = mid - 0.55 + (1.1 * k) / 16;
            return p(R * Math.cos(t), R * Math.sin(t), domeZ);
          });
          result.push.push(stroke(rimG, toPath(arc), 's-push-rim'));
          const o = (r: number, z = domeZ) => p(r * Math.cos(mid), r * Math.sin(mid), z);
          const tip = o(R + 5.5 * M);
          const side = (d: number) =>
            p((R + 4.2 * M) * Math.cos(mid + d), (R + 4.2 * M) * Math.sin(mid + d), domeZ);
          result.push.push(
            stroke(
              rimG,
              `${toPath([o(R + 0.6 * M), tip])}${toPath([side(-0.05), tip, side(0.05)])}`,
              's-push',
            ),
          );
        }
      }
    }
    return result;
  }

  return { svg, rows, shade, strokes, setSupports };
}
