/**
 * Scene 7 — A lifetime (the achievement, and what came after).
 * Selimiye was not a lucky stroke but the end of a long line of work. Sinan himself named three
 * stages: apprentice (Şehzade), journeyman (Süleymaniye), master (Selimiye). The visitor looks
 * up in all three, in the same circular frame as the reveal, and can see the half-domes give way
 * to a single dome over one room.
 *
 * Then one short, tangible line of legacy — an architect he trained, and the Sultan Ahmed Mosque,
 * whose plan grows from Şehzade — and one optional discovery: three stairs in one minaret.
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
  const body = h('p', { class: 'text' }, t.body);

  const works = t.works.map((w) => {
    const frame = h('div', { class: 'work__frame' });
    frame.style.setProperty('--k', String(50 / w.frame.r));
    frame.style.setProperty('--cx', `${w.frame.cx}%`);
    frame.style.setProperty('--cy', `${w.frame.cy}%`);
    const item = h(
      'li',
      { class: `work${w.stage === 'Master' ? ' work--master' : ''}` },
      frame,
      h(
        'div',
        { class: 'work__text' },
        h(
          'p',
          { class: 'work__meta' },
          h('span', { class: 'work__year' }, w.year),
          ' ',
          h('span', { class: 'work__stage' }, w.stage),
        ),
        h('h3', { class: 'work__name' }, w.name),
        h('p', { class: 'work__line' }, w.text),
      ),
    );
    return { item, frame, image: w.image };
  });
  const list = h('ol', { class: 'works' }, ...works.map((w) => w.item));
  const scaleNote = h('p', { class: 'small works__note' }, t.scale);

  // After Sinan: one architect, one building, one link back to the apprentice work.
  const afterMedia = h('div', { class: 'after__media' });
  const after = h(
    'figure',
    { class: 'after' },
    afterMedia,
    h(
      'figcaption',
      { class: 'after__text' },
      h('p', { class: 'label' }, t.after.label),
      h('p', { class: 'after__body' }, t.after.text),
      h('p', { class: 'small' }, t.after.caption),
    ),
  );

  // Optional: the minaret stairs.
  const detail = h(
    'details',
    { class: 'detail' },
    h('summary', { class: 'detail__summary' }, t.detail.summary),
    h(
      'div',
      { class: 'detail__body' },
      minaretDiagram(t.detail.label),
      h('p', { class: 'detail__text' }, t.detail.text),
    ),
  );

  const cont = button(copy.meta.continue, 'primary', '→');

  const el = h(
    'section',
    { class: 'chapter lifetime', 'data-theme': 'stone', 'aria-labelledby': 'lifetime-title' },
    h(
      'div',
      { class: 'grid lifetime__grid' },
      h('header', { class: 'col lifetime__head' }, top, title.el, body),
      h('div', { class: 'lifetime__works' }, list, scaleNote),
      h('div', { class: 'lifetime__after' }, after),
      h('div', { class: 'lifetime__detail' }, detail, h('div', { class: 'actions' }, cont)),
    ),
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
          picture(w.image, { sizes: '(min-width: 64rem) 30vw, 80vw', className: 'work__photo' }),
        ),
      );
      afterMedia.append(picture('sultanAhmed', { sizes: '(min-width: 64rem) 20vw, 60vw' }));
    },
    enter() {
      audio.setMood('stone');
      enterText([top, title.el, body]);
      if (reducedMotion()) {
        gsap.fromTo(
          [list, scaleNote, after, detail.parentElement],
          { opacity: 0 },
          { opacity: 1, duration: 0.5 },
        );
        return;
      }
      // The three works arrive in order, left to right: the passage of time.
      gsap.fromTo(
        works.map((w) => w.item),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.9, ease: EASE.out, stagger: 0.25, delay: 0.3 },
      );
      gsap.fromTo(
        [scaleNote, after, detail.parentElement],
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: EASE.out, delay: 1.2, stagger: 0.1 },
      );
    },
    leave() {},
    reset() {
      detail.open = false;
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
