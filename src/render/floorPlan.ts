/**
 * Builds the chapter I line drawing: a square hall in axonometric view, its construction
 * geometry, and a single dome hovering above it.
 *
 * Every stroke is a <path pathLength="1"> so any of them can be "drawn" by animating
 * stroke-dashoffset from 1 to 0, regardless of its real length.
 * The geometry constants are exported so later chapters (piers, thrust lines) share them.
 */
import { s } from '../core/dom';
import {
  FORESHORTEN,
  createProjector,
  facesViewer,
  range,
  runs,
  toPath,
  type ScreenPoint,
} from './projection';

export const PLAN = {
  width: 640,
  height: 640,
  origin: { x: 320, y: 452 },
  /** Half the side of the square hall, in drawing units. */
  half: 180,
  wall: 16,
  /** Height the dome hovers above the floor before it is released. */
  lift: 150,
} as const;

/** The dome sits on the circle inscribed in the square. */
export const DOME_RADIUS = PLAN.half;

export interface FloorPlanLabels {
  hall: string;
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
  strokes: {
    construction: SVGPathElement[];
    walls: SVGPathElement[];
    footprint: SVGPathElement[];
    dimension: SVGPathElement[];
    dome: SVGPathElement[];
    plumb: SVGPathElement[];
  };
  annotations: SVGElement[];
}

export function buildFloorPlan(labels: FloorPlanLabels, titleId: string): FloorPlan {
  const { width, height, origin, half: H, wall, lift } = PLAN;
  const R = DOME_RADIUS;
  const p = createProjector(origin);

  const svg = s('svg', {
    viewBox: `0 0 ${width} ${height}`,
    class: 'plan',
    role: 'img',
    'aria-labelledby': titleId,
  });

  const defs = s('defs', {}, svg);
  const grad = s('radialGradient', { id: 'plan-shadow' }, defs);
  s('stop', { offset: '0%', 'stop-color': '#1d2838', 'stop-opacity': 0.16 }, grad);
  s('stop', { offset: '100%', 'stop-color': '#1d2838', 'stop-opacity': 0 }, grad);

  const planLayer = s('g', { class: 'plan__floor' }, svg);
  const domeLayer = s('g', { class: 'plan__dome' }, svg);
  const domeFloat = s('g', {}, domeLayer);

  const strokes: FloorPlan['strokes'] = {
    construction: [],
    walls: [],
    footprint: [],
    dimension: [],
    dome: [],
    plumb: [],
  };
  const annotations: SVGElement[] = [];

  const line = (
    d: string,
    cls: string,
    parent: SVGGElement,
    bucket: SVGPathElement[],
  ): SVGPathElement => {
    const path = s('path', { d, class: `stroke ${cls}`, pathLength: 1 }, parent);
    bucket.push(path);
    return path;
  };

  /** A circle (or arc) on a horizontal plane, sampled into projected points. */
  const ring = (
    cx: number,
    cy: number,
    r: number,
    z: number,
    a0 = 0,
    a1 = Math.PI * 2,
    steps = 96,
  ): ScreenPoint[] =>
    range(a0, a1, steps).map((a) => p(cx + r * Math.cos(a), cy + r * Math.sin(a), z));

  /* --- Floor shadow (grows/shrinks as the dome floats) ---------------- */
  const shadow = s(
    'ellipse',
    {
      cx: origin.x,
      cy: origin.y,
      rx: R * 0.9,
      ry: R * 0.9 * FORESHORTEN,
      fill: 'url(#plan-shadow)',
    },
    planLayer,
  );

  /* --- Construction geometry ----------------------------------------- */
  const ext = 36; // construction lines run past the walls, as on a drafting sheet
  const C = strokes.construction;
  line(toPath([p(-H - ext, 0), p(H + ext, 0)]), 's-construction', planLayer, C);
  line(toPath([p(0, -H - ext), p(0, H + ext)]), 's-construction', planLayer, C);
  line(toPath([p(-H, -H), p(H, H)]), 's-construction', planLayer, C);
  line(toPath([p(H, -H), p(-H, H)]), 's-construction', planLayer, C);
  // Circumscribed circle and the four compass arcs struck from the corners.
  line(toPath(ring(0, 0, H * Math.SQRT2, 0), true), 's-construction', planLayer, C);
  const corners: [number, number, number][] = [
    [-H, -H, 0],
    [H, -H, Math.PI / 2],
    [H, H, Math.PI],
    [-H, H, Math.PI * 1.5],
  ];
  corners.forEach(([x, y, a]) => {
    line(toPath(ring(x, y, H, 0, a, a + Math.PI / 2, 32)), 's-construction', planLayer, C);
  });

  /* --- Dome footprint on the floor ------------------------------------ */
  line(toPath(ring(0, 0, R, 0), true), 's-footprint', planLayer, strokes.footprint);

  /* --- Walls ---------------------------------------------------------- */
  // Outer wall, with a small mihrab niche in the far (qibla) wall.
  const niche = 14;
  const outerPts = [
    p(-H, -H),
    p(-niche, -H),
    p(-niche, -H - niche),
    p(niche, -H - niche),
    p(niche, -H),
    p(H, -H),
    p(H, H),
    p(-H, H),
  ];
  const outerWall = line(toPath(outerPts, true), 's-wall', planLayer, strokes.walls);
  const hi = H - wall;
  line(
    toPath([p(-hi, -hi), p(hi, -hi), p(hi, hi), p(-hi, hi)], true),
    's-wall-inner',
    planLayer,
    strokes.walls,
  );

  /* --- Dimension line along the near-left wall ------------------------ */
  const dy = H + 32;
  const a = p(-H, dy);
  const b = p(H, dy);
  const D = strokes.dimension;
  line(toPath([p(-H, H + 8), p(-H, dy + 8)]), 's-dim', planLayer, D);
  line(toPath([p(H, H + 8), p(H, dy + 8)]), 's-dim', planLayer, D);
  line(toPath([a, b]), 's-dim', planLayer, D);
  [a, b].forEach((pt) => {
    line(
      toPath([
        { x: pt.x - 5, y: pt.y + 5 },
        { x: pt.x + 5, y: pt.y - 5 },
      ]),
      's-dim',
      planLayer,
      D,
    );
  });
  annotations.push(edgeLabel(a, b, 18, labels.span, 'annot annot--italic', planLayer));
  // Hall label runs along the near-right wall, outside the drawing.
  annotations.push(edgeLabel(p(H, H), p(H, -H), 30, labels.hall, 'annot', planLayer));

  /* --- Plumb line from the dome's centre to the floor's centre -------- */
  const c = p(0, 0, lift);
  line(toPath([c, origin]), 's-plumb', planLayer, strokes.plumb);
  line(toPath(ring(0, 0, 6, 0, 0, Math.PI * 2, 24), true), 's-plumb', planLayer, strokes.plumb);

  /* --- The dome (hemisphere) ------------------------------------------ */
  const DM = strokes.dome;
  const baseRing = range(0, Math.PI * 2, 128).map((t) => ({
    pt: p(R * Math.cos(t), R * Math.sin(t), lift),
    front: facesViewer(Math.cos(t), Math.sin(t), 0),
  }));
  // A translucent paper body (silhouette + near half of the base) so the dome reads as
  // a solid object floating above the plan rather than a wireframe lying on it.
  const left = `${(c.x - R).toFixed(2)} ${c.y.toFixed(2)}`;
  const right = `${(c.x + R).toFixed(2)} ${c.y.toFixed(2)}`;
  const domeFill = s(
    'path',
    {
      d: `M${left}A${R} ${R} 0 0 1 ${right}A${R} ${R * FORESHORTEN} 0 0 1 ${left}Z`,
      class: 'dome-fill',
    },
    domeFloat,
  );

  // Hidden (far) half of the base ring, drawn faint like a draughtsman's hidden line.
  runs(baseRing, (r) => !r.front).forEach((run) =>
    line(toPath(run.map((r) => r.pt)), 's-dome-hidden', domeFloat, DM),
  );
  // Outline: upper half of the sphere's silhouette circle + the near half of the base.
  line(`M${left}A${R} ${R} 0 0 1 ${right}`, 's-dome', domeFloat, DM);
  runs(baseRing, (r) => r.front).forEach((run) =>
    line(toPath(run.map((r) => r.pt)), 's-dome', domeFloat, DM),
  );

  // Ribs (meridians) and two rings (parallels), visible parts only.
  [0, 45, 90, 135].forEach((deg) => {
    const ang = (deg * Math.PI) / 180;
    const pts = range(0, Math.PI, 64).map((phi) => {
      const x = Math.cos(ang) * Math.cos(phi);
      const y = Math.sin(ang) * Math.cos(phi);
      const z = Math.sin(phi);
      return { pt: p(R * x, R * y, lift + R * z), vis: facesViewer(x, y, z) };
    });
    runs(pts, (q) => q.vis).forEach((run) =>
      line(toPath(run.map((q) => q.pt)), 's-dome-fine', domeFloat, DM),
    );
  });
  [0.6, 1.1].forEach((phi) => {
    const r = Math.cos(phi);
    const z = Math.sin(phi);
    const pts = range(0, Math.PI * 2, 96).map((t) => ({
      pt: p(R * r * Math.cos(t), R * r * Math.sin(t), lift + R * z),
      vis: facesViewer(r * Math.cos(t), r * Math.sin(t), z),
    }));
    runs(pts, (q) => q.vis).forEach((run) =>
      line(toPath(run.map((q) => q.pt)), 's-dome-fine', domeFloat, DM),
    );
  });

  // A ring of small windows at the base of the dome — a quiet foreshadowing of chapter IV.
  range(0, Math.PI * 2, 24)
    .slice(0, -1)
    .forEach((t) => {
      const x = Math.cos(t);
      const y = Math.sin(t);
      if (!facesViewer(x, y, 0.05)) return;
      const lo = p(R * x, R * y, lift + 5);
      const hiPt = p(R * 0.985 * x, R * 0.985 * y, lift + 18);
      line(toPath([lo, hiPt]), 's-window', domeFloat, DM);
    });

  // Finial.
  const pole = p(0, 0, lift + R);
  line(toPath([pole, { x: pole.x, y: pole.y - 44 }]), 's-dome', domeFloat, DM);

  // Dome label with a short leader line.
  const leaderFrom = { x: c.x + R * Math.cos(-0.7), y: c.y + R * Math.sin(-0.7) };
  const leaderTo = { x: leaderFrom.x + 30, y: leaderFrom.y - 18 };
  line(toPath([leaderFrom, leaderTo]), 's-dim', domeFloat, DM);
  const domeLabel = s(
    'text',
    {
      x: leaderTo.x + 8,
      y: leaderTo.y + 5,
      class: 'annot',
      'aria-hidden': 'true',
    },
    domeFloat,
  );
  domeLabel.textContent = labels.dome;
  annotations.push(domeLabel);

  /* --- The pen nib that leads the wall stroke -------------------------- */
  const nib = s('circle', { r: 3.5, class: 'nib', cx: -20, cy: -20, opacity: 0 }, svg);

  return {
    svg,
    planLayer,
    domeLayer,
    domeFloat,
    shadow,
    domeFill,
    nib,
    outerWall,
    strokes,
    annotations,
  };
}

/** Text set parallel to an edge, offset along the edge's outward (downward) normal. */
function edgeLabel(
  from: ScreenPoint,
  to: ScreenPoint,
  offset: number,
  text: string,
  cls: string,
  parent: SVGGElement,
): SVGTextElement {
  const rad = Math.atan2(to.y - from.y, to.x - from.x);
  const x = (from.x + to.x) / 2 - Math.sin(rad) * offset;
  const y = (from.y + to.y) / 2 + Math.cos(rad) * offset;
  const label = s(
    'text',
    {
      x: x.toFixed(2),
      y: y.toFixed(2),
      class: cls,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      transform: `rotate(${((rad * 180) / Math.PI).toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)})`,
      'aria-hidden': 'true',
    },
    parent,
  );
  label.textContent = text;
  return label;
}
