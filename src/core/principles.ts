/**
 * The three principles — Structure, Space, Light — as a quiet "discovery index".
 *
 * Each principle has a small line-art mark in the drawing style of the site:
 *  - Structure: a pier (shaft, capital, base)
 *  - Space: a circle (one room under one dome)
 *  - Light: a fan of rays
 * Undiscovered marks are faint outlines; discovering one draws it in and fills it with gold,
 * like an annotation in an architect's notebook. No points, no badges.
 */
import { gsap } from 'gsap';
import { copy, principleOrder, principles, type Principle } from '../content';
import { announce } from './announcer';
import { h, s } from './dom';
import { EASE, reducedMotion } from './motion';

const found = new Set<Principle>();
const listeners = new Set<(p: Principle | null) => void>();

export const isDiscovered = (p: Principle): boolean => found.has(p);

/** Marks a principle as discovered (once). Returns true the first time. */
export function discover(p: Principle): boolean {
  if (found.has(p)) return false;
  found.add(p);
  listeners.forEach((fn) => fn(p));
  announce(copy.meta.discovered(principles[p].name));
  return true;
}

export function resetPrinciples(): void {
  found.clear();
  listeners.forEach((fn) => fn(null));
}

export function onPrinciplesChange(fn: (p: Principle | null) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** The line-art mark (24 × 24). `filled` shows it in its discovered state. */
export function principleMark(p: Principle, filled = false): SVGSVGElement {
  const svg = s('svg', {
    viewBox: '0 0 24 24',
    class: `mark mark--${p}${filled ? ' is-filled' : ''}`,
    'aria-hidden': 'true',
  });
  const line = (d: string) => s('path', { d, class: 'mark__line', pathLength: 1 }, svg);
  if (p === 'structure') {
    s('rect', { x: 9, y: 7.5, width: 6, height: 12.5, class: 'mark__fill' }, svg);
    line('M9 20V7.5M15 20V7.5');
    line('M7 7.5h10M8.2 5h7.6');
    line('M6.5 20h11');
  } else if (p === 'space') {
    s('circle', { cx: 12, cy: 12, r: 7.5, class: 'mark__fill' }, svg);
    line('M4.5 12a7.5 7.5 0 1 0 15 0a7.5 7.5 0 1 0 -15 0');
    line('M9 12h6');
  } else {
    s('path', { d: 'M12 19L5 7.5A9 9 0 0 1 19 7.5Z', class: 'mark__fill' }, svg);
    line('M12 19L4.5 8.5M12 19L8 5.5M12 19V4.5M12 19L16 5.5M12 19L19.5 8.5');
    line('M8.5 19h7');
  }
  return svg;
}

/** Animates a mark from outline to filled. */
function fillMark(svg: SVGSVGElement): void {
  svg.classList.add('is-filled');
  if (reducedMotion()) return;
  const lines = svg.querySelectorAll('.mark__line');
  const fill = svg.querySelector('.mark__fill');
  gsap.fromTo(
    lines,
    { strokeDasharray: 1, strokeDashoffset: 1 },
    { strokeDashoffset: 0, duration: 1.1, stagger: 0.15, ease: EASE.inOut },
  );
  if (fill)
    gsap.fromTo(fill, { opacity: 0 }, { opacity: 1, duration: 1.2, delay: 0.5, ease: EASE.soft });
  gsap.fromTo(
    svg,
    { scale: 1.35 },
    { scale: 1, duration: 1.4, ease: EASE.out, transformOrigin: '50% 50%' },
  );
}

/** The index in the HUD: three marks that fill in as principles are discovered. */
export function mountDiscoveryIndex(container: HTMLElement): void {
  container.setAttribute('role', 'list');
  container.setAttribute('aria-label', copy.meta.discoveryLabel);
  const items = principleOrder.map((p) => {
    const mark = principleMark(p);
    const status = h('span', { class: 'sr-only' });
    const item = h(
      'span',
      { class: 'discovery__item', role: 'listitem', title: principles[p].name },
      mark,
      status,
    );
    container.append(item);
    return { p, mark, status, item };
  });
  const render = (just: Principle | null): void => {
    items.forEach(({ p, mark, status, item }) => {
      const on = found.has(p);
      status.textContent = `${principles[p].name}: ${on ? copy.meta.found : copy.meta.notYet}`;
      item.title = `${principles[p].name}${on ? '' : ` (${copy.meta.notYet})`}`;
      if (p === just) fillMark(mark);
      else mark.classList.toggle('is-filled', on);
    });
  };
  render(null);
  onPrinciplesChange(render);
}

/** A row of the three marks with their names (used in the Prologue and the synthesis). */
export function principleRow(filled: boolean): HTMLElement {
  return h(
    'ul',
    { class: `principle-row${filled ? ' is-filled' : ''}` },
    ...principleOrder.map((p) =>
      h(
        'li',
        { class: 'principle-row__item' },
        principleMark(p, filled),
        h('span', {}, principles[p].name),
      ),
    ),
  );
}
