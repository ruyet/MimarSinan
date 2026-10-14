/**
 * Chapter III drawing: a cut-away of the prayer hall in the same axonometric view.
 * The two far walls stand full height; the two near walls are cut low (a section),
 * so we can see inside. Eight piers on an octagon carry arches and the dome (≈ 31 m,
 * crown ≈ 42 m). Window rows in the far walls — and the ring around the dome — are
 * revealed one row at a time, each letting a shaft of light fall across the floor.
 *
 * Drawing units: 8 units = 1 metre.
 */
import { s } from '../core/dom';
import { drawDome } from './dome';
import { createProjector, toPath, type ScreenPoint } from './projection';
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
  pierSize: 3 * M,
} as const;

/** Window rows as [bottom, top] heights in metres. */
const ROWS: [number, number][] = [
  [2.5, 7],
  [9, 13],
  [15, 19.5],
];

/** Direction the light travels (into the room and down). */
const LIGHT = { x: 0.5, y: 0.32 };

export interface HallDrawing {
  svg: SVGSVGElement;
  /** Window rows: 3 wall rows + the ring of dome windows. */
  rows: { windows: SVGElement[]; rays: SVGElement[]; pools: SVGElement[] }[];
  /** Interior shade that lifts as light enters. */
  shade: SVGPathElement;
  strokes: SVGPathElement[];
}

export function buildHall(labelledBy: string, idSuffix = ''): HallDrawing {
  const { origin, hx, hy, wallH, cutH, R, domeZ, pierSize } = HALL;
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
  s('stop', { offset: '0%', 'stop-color': '#f2d48c', 'stop-opacity': 0.75 }, rayGrad);
  s('stop', { offset: '100%', 'stop-color': '#f2d48c', 'stop-opacity': 0.05 }, rayGrad);
  const poolGrad = s('radialGradient', { id: `hall-pool${idSuffix}` }, defs);
  s('stop', { offset: '0%', 'stop-color': '#f6dc9a', 'stop-opacity': 0.9 }, poolGrad);
  s('stop', { offset: '100%', 'stop-color': '#f6dc9a', 'stop-opacity': 0.15 }, poolGrad);

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
  const gPools = s('g', { class: 'hall__pools' }, svg);
  const gShade = s('g', {}, svg);
  const gBackPiers = s('g', {}, svg);
  const gDome = s('g', {}, svg);
  const gFrontPiers = s('g', {}, svg);
  const gRays = s('g', { class: 'hall__rays' }, svg);
  const gNear = s('g', {}, svg);

  /* --- Far walls (full height) ----------------------------------------- */
  // Wall A: along y = -hy (x from -hx to hx). Wall B: along x = -hx (y from -hy to hy).
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

  // Interior shade: covers the floor and far walls; fades as the light rises.
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
    // Wall A: u runs along x, at y = -hy.
    { at: (u: number, z: number) => [u, -hy, z] as const, from: -hx, to: hx },
    // Wall B: u runs along y, at x = -hx.
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
        const win = poly(archWindow(point, u, winW, z0, z1), 'hall__window', gWalls);
        rows[rowIndex].windows.push(win);

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

  /* --- Piers and arches ----------------------------------------------- */
  const rp = R / Math.cos(Math.PI / 8); // octagon vertices just outside the dome rim
  const piers = Array.from({ length: 8 }, (_, i) => {
    const a = Math.PI / 8 + (i * Math.PI) / 4;
    return { a, x: rp * Math.cos(a), y: rp * Math.sin(a), depth: Math.sin(a + Math.PI / 4) };
  });
  const span = 2 * rp * Math.sin(Math.PI / 8);
  const pierTop = domeZ - span / 2;

  const drawPier = (x: number, y: number, g: SVGGElement): void => {
    const h = pierSize / 2;
    // Visible faces in this view: +x and +y.
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
    poly(fx, 'hall__pier hall__pier--x', g);
    poly(fy, 'hall__pier hall__pier--y', g);
    poly(top, 'hall__pier hall__pier--top', g);
    [fx, fy, top].forEach((f) => strokes.push(stroke(g, toPath(f, true), 's-pier')));
  };
  const drawArch = (i: number, g: SVGGElement): void => {
    const a = piers[i];
    const b = piers[(i + 1) % 8];
    const pts = Array.from({ length: 25 }, (_, k) => {
      const t = k / 24;
      return p(
        a.x + (b.x - a.x) * t,
        a.y + (b.y - a.y) * t,
        pierTop + (span / 2) * Math.sin(Math.PI * t),
      );
    });
    strokes.push(stroke(g, toPath(pts), 's-arch'));
  };

  // Arches first, then piers far-to-near, so nearer piers overlap farther ones.
  piers.forEach((pr, i) => {
    const mid = Math.sin(pr.a + Math.PI / 8 + Math.PI / 4);
    drawArch(i, mid < 0 ? gBackPiers : gFrontPiers);
  });
  [...piers]
    .sort((a, b) => a.depth - b.depth)
    .forEach((pr) => drawPier(pr.x, pr.y, pr.depth < 0 ? gBackPiers : gFrontPiers));

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

  return { svg, rows, shade, strokes };
}
