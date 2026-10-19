/**
 * Photo annotations — photos that *demonstrate* instead of decorate.
 *
 * One reusable component, used by the dome reveal and the prayer-hall photo:
 *  - Selective darkening: an SVG mask dims the photo except a soft spotlight, which eases
 *    from one area to the next as the story advances.
 *  - Outlines: thin accent strokes drawn in with stroke-dashoffset.
 *  - Labels: short tracked-uppercase labels with a leader line.
 *  - Data-driven: shapes are stored in % of the image (content.ts), and the overlay is fitted
 *    to the *visible* image rectangle, so `object-fit: cover/contain` crops never misalign it.
 *  - Calibration: add `?annotate=1` to the URL to see a grid, every shape and live coordinates.
 *
 * The overlay is decorative (aria-hidden); chapters provide the text equivalent for each step.
 */
import { gsap } from 'gsap';
import type { Annotation, Shape } from '../content';
import { h, s } from './dom';
import { EASE, reducedMotion } from './motion';

export const CALIBRATE = new URLSearchParams(location.search).has('annotate');

let uid = 0;

export interface Annotator {
  /** Show one annotation (spotlight + outline + label), or clear with null. */
  show(a: Annotation | null): void;
  /** Quietly outline several annotations at once, without dimming. */
  outlineAll(list: Annotation[]): void;
  /** Recompute the overlay position (called automatically on resize). */
  update(): void;
}

export interface AnnotatorOptions {
  /** Brightness of the dimmed area is roughly 1 − dim (default 0.6 → ~40 %). */
  dim?: number;
  /** Show labels on the photo (default true). */
  labels?: boolean;
  /** Shapes to show in calibration mode. */
  calibrate?: Annotation[];
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Bounding box of a set of shapes, in % of the image. */
function bounds(shapes: Shape[]): Box {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const sh of shapes) {
    const pts: [number, number][] =
      sh.kind === 'rect'
        ? [
            [sh.x, sh.y],
            [sh.x + sh.w, sh.y + sh.h],
          ]
        : sh.kind === 'ellipse'
          ? [
              [sh.cx - sh.rx, sh.cy - sh.ry],
              [sh.cx + sh.rx, sh.cy + sh.ry],
            ]
          : sh.kind === 'ring'
            ? [
                [sh.cx - sh.r2, sh.cy - sh.r2],
                [sh.cx + sh.r2, sh.cy + sh.r2],
              ]
            : sh.points;
    for (const [x, y] of pts) {
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x);
      y1 = Math.max(y1, y);
    }
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/** Parses one component of CSS object-position (percent or px) into a 0–1 fraction. */
function posFraction(v: string, free: number): number {
  if (v.endsWith('%')) return parseFloat(v) / 100;
  if (v.endsWith('px')) return free ? parseFloat(v) / free : 0.5;
  return v === 'left' || v === 'top' ? 0 : v === 'right' || v === 'bottom' ? 1 : 0.5;
}

export function createAnnotator(
  frame: HTMLElement,
  image: { width: number; height: number },
  opts: AnnotatorOptions = {},
): Annotator {
  const W = image.width;
  const H = image.height;
  const id = `annot-${++uid}`;
  const dimLevel = opts.dim ?? 0.6;
  const showLabels = opts.labels ?? true;
  // Stroke width in viewBox units, recomputed so outlines stay ~1.8 px on screen at any size.
  let stroke = Math.max(W, H) / 650;
  const STROKE_PX = 1.8;

  const layer = h('div', { class: 'annot-layer', 'aria-hidden': 'true' });
  const svg = s('svg', {
    class: 'annot-svg',
    viewBox: `0 0 ${W} ${H}`,
    preserveAspectRatio: 'none',
  });
  const defs = s('defs', {}, svg);
  const blur = s(
    'filter',
    { id: `${id}-soft`, x: '-50%', y: '-50%', width: '200%', height: '200%' },
    defs,
  );
  s('feGaussianBlur', { stdDeviation: Math.max(W, H) / 70 }, blur);
  const mask = s(
    'mask',
    { id: `${id}-mask`, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H },
    defs,
  );
  s('rect', { x: 0, y: 0, width: W, height: H, fill: '#fff' }, mask);
  const hole = s(
    'ellipse',
    { cx: W / 2, cy: H / 2, rx: 0, ry: 0, fill: '#000', filter: `url(#${id}-soft)` },
    mask,
  );
  // Large or ring-shaped areas use their own shapes as the hole (an ellipse would swallow the photo).
  const holeShapes = s('g', { filter: `url(#${id}-soft)` }, mask);
  const dimRect = s(
    'rect',
    { x: 0, y: 0, width: W, height: H, class: 'annot-dim', mask: `url(#${id}-mask)`, opacity: 0 },
    svg,
  );
  const outlines = s('g', { class: 'annot-outlines' }, svg);
  layer.append(svg);
  frame.append(layer);

  let label: HTMLElement | null = null;
  let current: Annotation | null = null;
  let holeShown = false;
  let visible: Box = { x: 0, y: 0, w: 0, h: 0 };

  const px = (xPct: number) => (xPct / 100) * W;
  const py = (yPct: number) => (yPct / 100) * H;

  function shapeEl(sh: Shape, cls: string, parent: Element): SVGElement {
    const common = { class: cls, pathLength: 1, 'stroke-width': stroke };
    if (sh.kind === 'rect') {
      return s(
        'rect',
        { ...common, x: px(sh.x), y: py(sh.y), width: px(sh.w), height: py(sh.h), rx: stroke * 2 },
        parent,
      );
    }
    if (sh.kind === 'ellipse') {
      return s(
        'ellipse',
        { ...common, cx: px(sh.cx), cy: py(sh.cy), rx: px(sh.rx), ry: py(sh.ry) },
        parent,
      );
    }
    if (sh.kind === 'ring') {
      const ring = (r: number) => {
        const rx = px(r);
        const ry = py(r);
        const cx = px(sh.cx);
        const cy = py(sh.cy);
        return `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${rx * 2} 0a${rx} ${ry} 0 1 0 ${-rx * 2} 0`;
      };
      return s('path', { ...common, d: ring(sh.r2) + ring(sh.r1), 'fill-rule': 'evenodd' }, parent);
    }
    return s(
      'polygon',
      { ...common, points: sh.points.map(([x, y]) => `${px(x)},${py(y)}`).join(' ') },
      parent,
    );
  }

  /** Fits the overlay to the visible image rectangle inside the frame. */
  function update(): void {
    const img = frame.querySelector('img');
    const fw = img?.clientWidth || frame.clientWidth;
    const fh = img?.clientHeight || frame.clientHeight;
    const ox = img?.offsetLeft ?? 0;
    const oy = img?.offsetTop ?? 0;
    const cs = img ? getComputedStyle(img) : null;
    const fit = cs?.objectFit ?? 'fill';
    let dw = fw;
    let dh = fh;
    if (fit === 'cover' || fit === 'contain') {
      const scale = fit === 'cover' ? Math.max(fw / W, fh / H) : Math.min(fw / W, fh / H);
      dw = W * scale;
      dh = H * scale;
    }
    const [posX = '50%', posY = '50%'] = (cs?.objectPosition ?? '50% 50%').split(' ');
    const left = ox + (fw - dw) * posFraction(posX, fw - dw);
    const top = oy + (fh - dh) * posFraction(posY, fh - dh);
    visible = { x: left, y: top, w: dw, h: dh };
    if (dw > 0) {
      stroke = (STROKE_PX * W) / dw;
      svg
        .querySelectorAll('.annot-outline')
        .forEach((el) => el.setAttribute('stroke-width', String(stroke)));
    }
    Object.assign(svg.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${dw}px`,
      height: `${dh}px`,
    });
    if (current && label) placeLabel(current, label);
  }

  /**
   * Places the label next to the highlighted area: above it if there is room, otherwise beside
   * it (right, then left), and only below it as a last resort.
   */
  function placeLabel(a: Annotation, el: HTMLElement): void {
    const b = bounds(a.shapes);
    const fw = frame.clientWidth;
    const fh = frame.clientHeight;
    const lw = el.offsetWidth;
    const lh = el.offsetHeight;
    const left = visible.x + (b.x / 100) * visible.w;
    const right = visible.x + ((b.x + b.w) / 100) * visible.w;
    const top = Math.max(visible.y + (b.y / 100) * visible.h, 0);
    const bottom = visible.y + ((b.y + b.h) / 100) * visible.h;
    const clampX = (x: number) => Math.max(12, Math.min(x, fw - lw - 12));
    const clampY = (y: number) => Math.max(64, Math.min(y, fh - lh - 12));
    let place: 'above' | 'right' | 'left' | 'below';
    if (top - lh - 10 >= 64) place = 'above';
    else if (right + 14 + lw <= fw - 12) place = 'right';
    else if (left - 14 - lw >= 12) place = 'left';
    else place = 'below';
    const pos =
      place === 'above'
        ? { x: clampX(left), y: top - lh - 10 }
        : place === 'right'
          ? { x: right + 14, y: clampY(top + 8) }
          : place === 'left'
            ? { x: left - 14 - lw, y: clampY(top + 8) }
            : { x: clampX(left), y: bottom + 10 };
    el.style.left = `${pos.x}px`;
    el.style.top = `${pos.y}px`;
    el.dataset.place = place;
  }

  function holeFor(a: Annotation) {
    const b = bounds(a.shapes);
    // An ellipse that circumscribes the bounding box, with a little air.
    return {
      cx: px(b.x + b.w / 2),
      cy: py(b.y + b.h / 2),
      rx: px((b.w / 2) * Math.SQRT2) + W * 0.015,
      ry: py((b.h / 2) * Math.SQRT2) + H * 0.015,
    };
  }

  function show(a: Annotation | null): void {
    const reduced = reducedMotion();
    current = a;
    // Outlines and label of the previous step fade out.
    const old = [...outlines.children];
    gsap.to(old, {
      opacity: 0,
      duration: reduced ? 0 : 0.35,
      onComplete: () => old.forEach((n) => n.remove()),
    });
    label?.remove();
    label = null;

    if (!a) {
      gsap.to(dimRect, { opacity: 0, duration: reduced ? 0 : 0.8, ease: EASE.soft });
      holeShown = false;
      return;
    }

    // Spotlight: an ellipse that eases between compact areas, or the area's own shapes.
    const b = bounds(a.shapes);
    const spot = a.spot ?? (b.w > 55 || b.h > 55 ? a.shapes : null);
    const oldHoles = [...holeShapes.children];
    gsap.to(oldHoles, {
      opacity: 0,
      duration: reduced ? 0 : 0.6,
      onComplete: () => oldHoles.forEach((n) => n.remove()),
    });
    if (spot) {
      gsap.to(hole, { attr: { rx: 0, ry: 0 }, duration: reduced ? 0 : 0.6, ease: EASE.soft });
      const els = spot.map((sh) => {
        const el = shapeEl(sh, 'annot-hole', holeShapes);
        el.setAttribute('fill', '#000');
        return el;
      });
      if (!reduced)
        gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: EASE.soft });
      holeShown = false;
    } else {
      const target = holeFor(a);
      if (!holeShown || reduced) gsap.set(hole, { attr: target });
      else gsap.to(hole, { attr: target, duration: 1.1, ease: EASE.inOut });
      holeShown = true;
    }
    gsap.to(dimRect, { opacity: dimLevel, duration: reduced ? 0 : 0.9, ease: EASE.soft });

    if (a.outline !== false) {
      const g = s('g', {}, outlines);
      const els = a.shapes.map((sh) => shapeEl(sh, 'annot-outline', g));
      if (!reduced) {
        gsap.fromTo(
          els,
          { strokeDasharray: 1, strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 1.2, ease: EASE.inOut, delay: 0.35, stagger: 0.08 },
        );
      }
    }

    if (showLabels && a.label) {
      label = h('div', { class: 'annot-label' }, h('span', {}, a.label));
      layer.append(label);
      placeLabel(a, label);
      if (!reduced)
        gsap.fromTo(
          label,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.7, delay: 0.5, ease: EASE.out },
        );
    }
  }

  function outlineAll(list: Annotation[]): void {
    show(null);
    const g = s('g', { class: 'annot-quiet' }, outlines);
    const els = list.flatMap((a) =>
      a.shapes.map((sh) => shapeEl(sh, 'annot-outline annot-outline--quiet', g)),
    );
    if (!reducedMotion())
      gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: EASE.soft });
  }

  /* --- Calibration mode (?annotate=1) ----------------------------------- */
  if (CALIBRATE) {
    layer.classList.add('is-calibrating');
    const grid = s('g', { class: 'annot-grid' }, svg);
    for (let i = 1; i < 20; i++) {
      s(
        'line',
        { x1: px(i * 5), y1: 0, x2: px(i * 5), y2: H, 'stroke-width': i % 2 ? stroke / 2 : stroke },
        grid,
      );
      s(
        'line',
        { x1: 0, y1: py(i * 5), x2: W, y2: py(i * 5), 'stroke-width': i % 2 ? stroke / 2 : stroke },
        grid,
      );
      if (i % 2 === 0) {
        const tx = s(
          'text',
          { x: px(i * 5) + stroke * 2, y: stroke * 14, 'font-size': stroke * 12 },
          grid,
        );
        tx.textContent = String(i * 5);
        const ty = s(
          'text',
          { x: stroke * 2, y: py(i * 5) - stroke * 2, 'font-size': stroke * 12 },
          grid,
        );
        ty.textContent = String(i * 5);
      }
    }
    (opts.calibrate ?? []).forEach((a) => {
      a.shapes.forEach((sh) => shapeEl(sh, 'annot-raw', grid));
      const b = bounds(a.shapes);
      const tx = s('text', { x: px(b.x), y: py(b.y) - stroke * 3, 'font-size': stroke * 11 }, grid);
      tx.textContent = a.id;
    });
    const readout = h('div', { class: 'annot-readout' }, 'x — · y —');
    layer.append(readout);
    frame.addEventListener('pointermove', (e) => {
      const r = frame.getBoundingClientRect();
      const x = ((e.clientX - r.left - visible.x) / visible.w) * 100;
      const y = ((e.clientY - r.top - visible.y) / visible.h) * 100;
      readout.textContent = `x ${x.toFixed(1)} · y ${y.toFixed(1)}`;
    });
  }

  new ResizeObserver(update).observe(frame);
  frame.querySelector('img')?.addEventListener('load', update);
  update();

  return { show, outlineAll, update };
}
