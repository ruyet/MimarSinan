/**
 * Chapter I drawing: the prayer hall (≈ 45 × 36 m, nearly square) in axonometric view,
 * its construction geometry, and a single dome (≈ 31 m) hovering above it, with guides
 * showing where it would drop. Also holds hidden crack lines for the collapse.
 *
 * Drawing units: 9 units = 1 metre, so proportions follow the verified dimensions.
 */
import { s } from '../core/dom';
import { drawDome } from './dome';
import { FORESHORTEN, createProjector, ringPoints, toPath } from './projection';
import { edgeLabel, label, stroke } from './svg';

const M = 9; // units per metre

export const PLAN = {
  width: 640,
  height: 640,
  /** Visible crop of the drawing (x, y, w, h): 4:3, trimmed to the content. */
  view: [0, 140, 640, 480] as const,
  origin: { x: 320, y: 468 },
  /** Half-sizes of the hall: 45 × 36 m. */
  hx: 22.5 * M,
  hy: 18 * M,
  wall: 1.8 * M,
  /** Dome radius: ≈ 31 m across. */
  R: 15.5 * M,
  /** Height the dome hovers above the floor before it is released. */
  lift: 150,
} as const;

export interface FloorPlanLabels {
  hall: string;
  hallSize: string;
  dome: string;
  span: string;
}

export interface FloorPlan {
  svg: SVGSVGElement;
  planLayer: SVGGElement;
  domeLayer: SVGGElement;
  domeFloat: SVGGElement;
  shadow: SVGEllipseElement;
  domeFill: SVGPathElement;
  nib: SVGCircleElement;
  outerWall: SVGPathElement;
  guides: SVGGElement;
  strokes: {
    construction: SVGPathElement[];
    walls: SVGPathElement[];
    footprint: SVGPathElement[];
    dome: SVGPathElement[];
    domeDim: SVGPathElement[];
    plumb: SVGPathElement[];
    cracks: SVGPathElement[];
  };
  /** [hall, hallSize, dome, span] */
  annotations: SVGTextElement[];
  /** Points (in SVG units) along the footprint, used to spawn dust. */
  impactPoints: { x: number; y: number }[];
  /** How far (in SVG units) the dome falls to reach the floor. */
  dropDistance: number;
}

export function buildFloorPlan(labels: FloorPlanLabels, labelledBy: string): FloorPlan {
  const { origin, hx, hy, wall, R, lift } = PLAN;
  const p = createProjector(origin);

  const svg = s('svg', {
    viewBox: PLAN.view.join(' '),
    class: 'plan',
    role: 'img',
    'aria-labelledby': labelledBy,
  });
  const defs = s('defs', {}, svg);
  const grad = s('radialGradient', { id: 'plan-shadow' }, defs);
  s('stop', { offset: '0%', 'stop-color': '#1d2838', 'stop-opacity': 0.16 }, grad);
  s('stop', { offset: '100%', 'stop-color': '#1d2838', 'stop-opacity': 0 }, grad);

  const planLayer = s('g', { class: 'plan__floor' }, svg);
  const guides = s('g', { class: 'plan__guides' }, svg);
  const domeLayer = s('g', { class: 'plan__dome' }, svg);
  const domeFloat = s('g', {}, domeLayer);

  const strokes: FloorPlan['strokes'] = {
    construction: [],
    walls: [],
    footprint: [],
    dome: [],
    domeDim: [],
    plumb: [],
    cracks: [],
  };

  /* --- Floor shadow (answers the hovering dome) ----------------------- */
  const shadow = s(
    'ellipse',
    {
      cx: origin.x,
      cy: origin.y,
      rx: R * 0.92,
      ry: R * 0.92 * FORESHORTEN,
      fill: 'url(#plan-shadow)',
    },
    planLayer,
  );

  /* --- Construction geometry ----------------------------------------- */
  const C = strokes.construction;
  const ext = 4 * M; // construction lines run past the walls, as on a drafting sheet
  stroke(planLayer, toPath([p(-hx - ext, 0), p(hx + ext, 0)]), 's-construction', C);
  stroke(planLayer, toPath([p(0, -hy - ext), p(0, hy + ext)]), 's-construction', C);
  stroke(planLayer, toPath([p(-hx, -hy), p(hx, hy)]), 's-construction', C);
  stroke(planLayer, toPath([p(hx, -hy), p(-hx, hy)]), 's-construction', C);
  stroke(planLayer, toPath(ringPoints(p, 0, 0, Math.hypot(hx, hy), 0), true), 's-construction', C);
  // Compass arcs struck from the four corners, radius = half the short side.
  (
    [
      [-hx, -hy, 0],
      [hx, -hy, Math.PI / 2],
      [hx, hy, Math.PI],
      [-hx, hy, Math.PI * 1.5],
    ] as const
  ).forEach(([x, y, a]) => {
    stroke(
      planLayer,
      toPath(ringPoints(p, x, y, hy, 0, a, a + Math.PI / 2, 32)),
      's-construction',
      C,
    );
  });

  /* --- Dome footprint on the floor ------------------------------------ */
  stroke(planLayer, toPath(ringPoints(p, 0, 0, R, 0), true), 's-footprint', strokes.footprint);

  /* --- Walls: one clean closed outline, plus the inner face ----------- */
  const outerWall = stroke(
    planLayer,
    toPath([p(-hx, -hy), p(hx, -hy), p(hx, hy), p(-hx, hy)], true),
    's-wall',
    strokes.walls,
  );
  const ix = hx - wall;
  const iy = hy - wall;
  stroke(
    planLayer,
    toPath([p(-ix, -iy), p(ix, -iy), p(ix, iy), p(-ix, iy)], true),
    's-wall-inner',
    strokes.walls,
  );

  /* --- Cracks (hidden until the collapse) ----------------------------- */
  const crack = (angle: number, length: number, seed: number): string => {
    const pts = [];
    const steps = 7;
    for (let i = 0; i <= steps; i++) {
      const r = R * 0.35 + (length * i) / steps;
      const jitter = Math.sin(seed * 12.9 + i * 78.2) * 0.07;
      pts.push(p(r * Math.cos(angle + jitter), r * Math.sin(angle + jitter), 0));
    }
    return toPath(pts);
  };
  [0.3, 1.4, 2.2, 3.5, 4.4, 5.6].forEach((a, i) => {
    stroke(planLayer, crack(a, R * (0.55 + (i % 3) * 0.2), i + 1), 's-crack', strokes.cracks);
  });

  /* --- Plumb line from the dome's centre down to the floor ------------ */
  const c = p(0, 0, lift);
  stroke(planLayer, toPath([c, origin]), 's-plumb', strokes.plumb);
  stroke(
    planLayer,
    toPath(ringPoints(p, 0, 0, 6, 0, 0, Math.PI * 2, 24), true),
    's-plumb',
    strokes.plumb,
  );

  /* --- Hall labels along the near-right wall -------------------------- */
  const annotations: SVGTextElement[] = [
    edgeLabel(planLayer, p(hx, hy), p(hx, -hy), 26, labels.hall, 'annot'),
    edgeLabel(planLayer, p(hx, hy), p(hx, -hy), 50, labels.hallSize, 'annot annot--italic'),
  ];

  /* --- Drop guides: the dome's rim projected straight down ------------ */
  // Faded in (not drawn), so they can be dashed.
  [-1, 1].forEach((side) => {
    const x = origin.x + side * R;
    s('line', { x1: x, y1: c.y, x2: x, y2: origin.y, class: 'guide' }, guides);
    const mid = (c.y + origin.y) / 2;
    s(
      'path',
      {
        d: `M${x - 5} ${mid - 4}L${x} ${mid + 3}L${x + 5} ${mid - 4}`,
        class: 'guide guide--arrow',
      },
      guides,
    );
  });

  /* --- The dome -------------------------------------------------------- */
  const dome = drawDome(domeFloat, p, R, lift, { finial: 40 });
  strokes.dome.push(...dome.strokes);

  // Diameter dimension across the dome's base, with ticks at the rim.
  const dimY = c.y;
  const a = { x: c.x - R, y: dimY };
  const b = { x: c.x + R, y: dimY };
  stroke(domeFloat, toPath([a, b]), 's-dim', strokes.domeDim);
  [a, b].forEach((pt) =>
    stroke(
      domeFloat,
      toPath([
        { x: pt.x - 5, y: pt.y + 5 },
        { x: pt.x + 5, y: pt.y - 5 },
      ]),
      's-dim',
      strokes.domeDim,
    ),
  );
  annotations.push(
    // Dome name, set beside the dome with a short leader.
    label(domeFloat, labels.dome, c.x + R * 0.8 + 34, c.y - R * 0.62 - 14, 'annot'),
    label(domeFloat, labels.span, c.x, dimY - 12, 'annot annot--italic annot--halo', {
      'text-anchor': 'middle',
    }),
  );
  const leaderFrom = { x: c.x + R * Math.cos(-0.66), y: c.y + R * Math.sin(-0.66) };
  stroke(
    domeFloat,
    toPath([leaderFrom, { x: leaderFrom.x + 28, y: leaderFrom.y - 16 }]),
    's-dim',
    strokes.domeDim,
  );

  /* --- The pen nib that leads the wall stroke -------------------------- */
  const nib = s('circle', { r: 3.5, class: 'nib', cx: -20, cy: -20, opacity: 0 }, svg);

  const impactPoints = ringPoints(p, 0, 0, R, 0, 0, Math.PI * 2, 48);

  return {
    svg,
    planLayer,
    domeLayer,
    domeFloat,
    shadow,
    domeFill: dome.fill,
    nib,
    outerWall,
    guides,
    strokes,
    annotations,
    impactPoints,
    dropDistance: origin.y - c.y,
  };
}
