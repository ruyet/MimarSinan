/**
 * Scene 7 — A lifetime. Selimiye was not a lucky stroke but the end of decades of work. Sinan
 * himself named three stages: apprentice (Şehzade), journeyman (Süleymaniye), master (Selimiye).
 * The visitor looks up in all three, in the same frame as the reveal, and can see the half-domes
 * give way to a single dome over one room. His age belongs to the story, so it is in the intro,
 * not attached to one card.
 *
 * One page, one idea. The legacy is its own scene (legacy.ts). The minaret stairs stay as an
 * optional detail in a dialog, so they never crowd the comparison.
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import { copy } from '../content';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h, s } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { picture } from '../core/picture';
import { button, enterText, label, title as makeTitle } from '../core/ui';

export function createLifetime(ctx: ChapterContext): Chapter {
  const t = copy.lifetime;

  const top = label(t.label);
  const title = makeTitle('h2', 'lifetime-title', t.headline);
  const body = h('p', { class: 'text lifetime__body' }, t.body);

  const works = t.works.map((w) => {
    const frame = h('div', { class: 'work__frame' });
    frame.style.setProperty('--k', String(50 / w.frame.r));
    frame.style.setProperty('--cx', `${w.frame.cx}%`);
    frame.style.setProperty('--cy', `${w.frame.cy}%`);
    const item = h(
      'li',
      { class: 'work' },
      frame,
      h(
        'div',
        { class: 'work__text' },
        h(
          'p',
          { class: 'work__meta' },
          h('span', { class: 'work__stage' }, w.stage),
          h('span', { class: 'work__year' }, w.year),
        ),
        h('h3', { class: 'work__name' }, w.name),
        h('p', { class: 'work__line' }, w.text),
      ),
    );
    return { item, frame, image: w.image };
  });
  const list = h('ol', { class: 'works' }, ...works.map((w) => w.item));

  // Fifty years in one line: the three works above, a few others, and his death. Years are placed
  // in proportion, so Selimiye visibly comes late, but not last.
  const L = t.lineage;
  const span = L.to - L.from;
  const line = h('span', { class: 'lineage__line', 'aria-hidden': 'true' });
  const marks = L.items.map((it) => {
    const x = ((it.year - L.from) / span) * 100;
    const edge = x < 2 ? ' is-start' : x > 98 ? ' is-end' : '';
    const li = h(
      'li',
      { class: `lineage__item${'major' in it && it.major ? ' is-major' : ''}${edge}` },
      h('span', { class: 'lineage__year' }, String(it.year)),
      h('span', { class: 'lineage__name' }, it.name),
      it.place ? h('span', { class: 'lineage__place' }, it.place) : null,
    );
    li.style.setProperty('--x', `${x}%`);
    return li;
  });
  const lineage = h(
    'div',
    { class: 'lineage' },
    h('h3', { class: 'label lineage__label' }, L.label),
    h('div', { class: 'lineage__track' }, line, h('ol', { class: 'lineage__items' }, ...marks)),
    h('p', { class: 'small lineage__scale' }, L.scale),
  );

  // Optional: one remarkable detail of Selimiye, in a dialog that covers nothing permanently.
  const d = t.detail;
  const close = button(d.close, 'ghost');
  const dialog = h(
    'dialog',
    { class: 'detail', 'aria-labelledby': 'detail-title' },
    h(
      'div',
      { class: 'detail__body' },
      minaretDiagram(d.label),
      h(
        'div',
        { class: 'detail__text' },
        h('h3', { id: 'detail-title', class: 'detail__title' }, d.title),
        h('p', {}, d.text),
        h('p', { class: 'small' }, d.note),
        h('div', { class: 'actions' }, close),
      ),
    ),
  );
  const openDetail = button(d.open, 'ghost', '+');
  openDetail.setAttribute('aria-haspopup', 'dialog');
  openDetail.addEventListener('click', () => dialog.showModal());
  close.addEventListener('click', () => dialog.close());
  // A click on the backdrop (the dialog element itself, outside its content) closes it too.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  const cont = button(copy.meta.continue, 'primary', '→');
  const foot = h(
    'div',
    { class: 'lifetime__foot' },
    h('p', { class: 'small' }, t.scale),
    h('div', { class: 'actions' }, openDetail, cont),
  );

  const el = h(
    'section',
    { class: 'chapter lifetime', 'data-theme': 'stone', 'aria-labelledby': 'lifetime-title' },
    h(
      'div',
      { class: 'grid lifetime__grid' },
      h('header', { class: 'col lifetime__head' }, top, title.el, body),
      list,
      lineage,
      foot,
    ),
    dialog,
  );

  cont.addEventListener('click', () => ctx.next());
  let prepared = false;

  return {
    id: 'lifetime',
    theme: 'stone',
    el,
    prepare() {
      if (prepared) return;
      prepared = true;
      works.forEach((w) =>
        w.frame.append(
          picture(w.image, { sizes: '(min-width: 64rem) 28vw, 80vw', className: 'work__photo' }),
        ),
      );
    },
    enter() {
      audio.setMood('stone');
      enterText([top, title.el, body]);
      const items = works.map((w) => w.item);
      if (reducedMotion()) {
        gsap.fromTo([...items, lineage, foot], { opacity: 0 }, { opacity: 1, duration: 0.5 });
        return;
      }
      // The line is drawn left to right once: the passage of time, in under a second.
      gsap.fromTo(lineage, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.9 });
      gsap.fromTo(
        line,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.9, ease: EASE.inOut, delay: 0.9, transformOrigin: '0 50%' },
      );
      gsap.fromTo(marks, { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.08, delay: 1.1 });
      // The three works arrive in order, left to right: the passage of time.
      gsap.fromTo(
        items,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.9, ease: EASE.out, stagger: 0.35, delay: 0.3 },
      );
      gsap.fromTo(foot, { opacity: 0 }, { opacity: 1, duration: 0.7, delay: 1.4 });
    },
    leave() {
      if (dialog.open) dialog.close();
    },
    reset() {
      if (dialog.open) dialog.close();
    },
    focusTarget: () => title.el,
  };
}

/**
 * A minaret cut open: three spiral staircases, offset by a third of a turn, each climbing to
 * its own balcony. Front halves solid, back halves dashed, like a draughtsman's hidden lines.
 */
function minaretDiagram(labelText: string): SVGSVGElement {
  const W = 180;
  const H = 300;
  const cx = 90;
  const r = 26;
  const base = 286;
  const balconies = [210, 140, 70];
  const svg = s('svg', {
    viewBox: `0 0 ${W} ${H}`,
    class: 'plan minaret',
    role: 'img',
    'aria-label': labelText,
  });
  // Shaft, cap and balconies.
  s('path', { d: `M${cx - r} ${base}V40M${cx + r} ${base}V40`, class: 'stroke s-wall-inner' }, svg);
  s('path', { d: `M${cx - r} 40L${cx} 6L${cx + r} 40`, class: 'stroke s-wall-inner' }, svg);
  s('path', { d: `M${cx - r - 14} ${base}H${cx + r + 14}`, class: 'stroke s-wall' }, svg);
  balconies.forEach((y, i) => {
    s('path', { d: `M${cx - r - 12} ${y}H${cx + r + 12}`, class: 'stroke s-wall' }, svg);
    const t = s('text', { x: cx + r + 18, y: y + 4, class: 'annot minaret__n' }, svg);
    t.textContent = String(i + 1);
  });
  // Three helices: same pitch, offset by 120°, each stopping at its balcony.
  const pitch = 52; // px per turn
  ['minaret__stair--1', 'minaret__stair--2', 'minaret__stair--3'].forEach((cls, i) => {
    const offset = (i * 2 * Math.PI) / 3;
    const end = balconies[i];
    const turns = (base - end) / pitch;
    const paths = { front: '', back: '' };
    const steps = Math.ceil(turns * 48);
    let prev: boolean | null = null;
    for (let k = 0; k <= steps; k++) {
      const th = (k / steps) * turns * 2 * Math.PI;
      const x = cx + r * Math.sin(th + offset);
      const y = base - (th / (2 * Math.PI)) * pitch;
      const isFront = Math.cos(th + offset) > 0;
      // Start a new sub-path whenever the stair passes from front to back or back again.
      paths[isFront ? 'front' : 'back'] +=
        `${prev === isFront ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
      prev = isFront;
    }
    s('path', { d: paths.back, class: `stroke minaret__stair minaret__stair--back ${cls}` }, svg);
    s('path', { d: paths.front, class: `stroke minaret__stair ${cls}` }, svg);
  });
  return svg;
}
