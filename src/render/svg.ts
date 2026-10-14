/** SVG stroke helpers shared by all line drawings. */
import { s } from '../core/dom';

/**
 * A drawable stroke: pathLength="1" lets any path be "drawn" by animating
 * stroke-dashoffset from 1 → 0, whatever its real length.
 */
export function stroke(
  parent: Element,
  d: string,
  cls: string,
  bucket?: SVGPathElement[],
): SVGPathElement {
  const path = s('path', { d, class: `stroke ${cls}`, pathLength: 1 }, parent);
  bucket?.push(path);
  return path;
}

/** Label text with a paper-coloured halo so it stays legible over line work. */
export function label(
  parent: Element,
  text: string,
  x: number,
  y: number,
  cls = 'annot',
  attrs: Record<string, string | number> = {},
): SVGTextElement {
  const t = s(
    'text',
    { x: x.toFixed(2), y: y.toFixed(2), class: cls, 'aria-hidden': 'true', ...attrs },
    parent,
  );
  t.textContent = text;
  return t;
}

/** Text set parallel to an edge, offset along the edge's (downward) normal. */
export function edgeLabel(
  parent: Element,
  from: { x: number; y: number },
  to: { x: number; y: number },
  offset: number,
  text: string,
  cls = 'annot',
): SVGTextElement {
  const rad = Math.atan2(to.y - from.y, to.x - from.x);
  const x = (from.x + to.x) / 2 - Math.sin(rad) * offset;
  const y = (from.y + to.y) / 2 + Math.cos(rad) * offset;
  return label(parent, text, x, y, cls, {
    'text-anchor': 'middle',
    'dominant-baseline': 'middle',
    transform: `rotate(${((rad * 180) / Math.PI).toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)})`,
  });
}
