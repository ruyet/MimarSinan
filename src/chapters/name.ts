/**
 * Scene 8 — Return to Mimar Sinan. The story began with his name and his monument seen from a
 * distance; it ends closer, with his face in daylight and his name set at the same scale as
 * the opening. Between the two, what the visitor now knows he did — structure, space and
 * light — written as three short sentences about him, not as three icons.
 *
 * Motion is deliberately plain: the photograph settles, the name rises once (the same gesture
 * as the opening, so the two read as a pair), the three sentences follow in order.
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import { copy } from '../content';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { picture } from '../core/picture';
import { button } from '../core/ui';

export function createName(ctx: ChapterContext): Chapter {
  const t = copy.name;

  const first = h('span', { class: 'sinan__line' }, t.first);
  const last = h('span', { class: 'sinan__line' }, t.last);
  const title = h(
    'h2',
    { id: 'name-title', class: 'sinan__name name__name', tabindex: '-1' },
    first,
    ' ',
    last,
  );
  const dates = h('p', { class: 'label name__dates' }, t.dates);

  const rows = t.synthesis.map((row) =>
    h('div', { class: 'name__row' }, h('dt', { class: 'label' }, row.term), h('dd', {}, row.text)),
  );
  const synthesis = h('dl', { class: 'name__synthesis' }, ...rows);
  const facts = h('ul', { class: 'name__facts' }, ...t.facts.map((f) => h('li', {}, f)));
  const cont = button(copy.meta.continue, 'primary', '→');

  const media = h('div', { class: 'name__frame' });
  const figure = h(
    'figure',
    { class: 'name__figure' },
    media,
    h('figcaption', { class: 'small' }, t.caption),
  );

  const el = h(
    'section',
    { class: 'chapter name', 'data-theme': 'stone', 'aria-labelledby': 'name-title' },
    h(
      'div',
      { class: 'grid name__grid' },
      h(
        'div',
        { class: 'col name__text' },
        dates,
        title,
        synthesis,
        facts,
        h('div', { class: 'actions' }, cont),
      ),
      figure,
    ),
  );

  cont.addEventListener('click', () => ctx.next());
  let prepared = false;

  function play(): void {
    if (reducedMotion()) {
      gsap.fromTo(
        [figure, dates, title, ...rows, facts, cont],
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
      );
      return;
    }
    const pic = media.querySelector('picture');
    gsap
      .timeline()
      .fromTo(figure, { opacity: 0 }, { opacity: 1, duration: 1.4, ease: EASE.soft }, 0)
      .fromTo(pic, { scale: 1.05 }, { scale: 1, duration: 3, ease: EASE.out }, 0)
      .fromTo(dates, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.3)
      .fromTo(
        [first, last],
        { yPercent: 40, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1, ease: EASE.out, stagger: 0.12 },
        0.35,
      )
      .fromTo(
        rows,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.7, ease: EASE.out, stagger: 0.35 },
        1.1,
      )
      .fromTo([facts, cont], { opacity: 0 }, { opacity: 1, duration: 0.7, stagger: 0.15 }, 2.3);
  }

  return {
    id: 'name',
    theme: 'stone',
    el,
    prepare() {
      if (prepared) return;
      prepared = true;
      media.append(
        picture('sinanPortrait', {
          sizes: '(min-width: 64rem) 45vw, 100vw',
          eager: true,
          className: 'name__picture',
        }),
      );
    },
    enter() {
      audio.setMood('stone');
      play();
    },
    leave() {},
    focusTarget: () => title,
  };
}
