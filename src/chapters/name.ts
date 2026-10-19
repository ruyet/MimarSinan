/**
 * Scene 9 — Return to Mimar Sinan. The story began with his name and his monument seen from a
 * distance; it ends closer, with his face in daylight and his name set at the same scale as
 * the opening. Beneath the name, one sentence ties what the visitor saw back to him: at
 * Selimiye, structure, space and light became one building. Then three plain facts.
 *
 * Motion is deliberately plain: the photograph settles, the name rises once (the same gesture
 * as the opening, so the two read as a pair), the sentence and facts follow. Every element is
 * set to its starting state on the first frame (see the controller), so nothing flashes.
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
  const summary = h('p', { class: 'name__summary' }, t.summary);
  const facts = h('ul', { class: 'name__facts' }, ...t.facts.map((f) => h('li', {}, f)));
  const cont = button(copy.meta.continue, 'primary', '→');
  const actions = h('div', { class: 'actions' }, cont);

  const media = h('div', { class: 'name__frame' });
  const figure = h('figure', { class: 'name__figure' }, media);

  const el = h(
    'section',
    { class: 'chapter name', 'data-theme': 'stone', 'aria-labelledby': 'name-title' },
    h(
      'div',
      { class: 'grid name__grid' },
      h('div', { class: 'col name__text' }, dates, title, summary, facts, actions),
      figure,
    ),
  );

  cont.addEventListener('click', () => ctx.next());
  let prepared = false;

  function play(): void {
    const rest = [summary, facts, actions];
    if (reducedMotion()) {
      gsap.fromTo([figure, dates, title, ...rest], { opacity: 0 }, { opacity: 1, duration: 0.5 });
      return;
    }
    const pic = media.querySelector('picture');
    gsap
      .timeline()
      .fromTo(figure, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: EASE.soft }, 0)
      .fromTo(pic, { scale: 1.05 }, { scale: 1, duration: 3, ease: EASE.out }, 0)
      .fromTo(dates, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.2)
      .fromTo(
        [first, last],
        { yPercent: 40, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1, ease: EASE.out, stagger: 0.12 },
        0.25,
      )
      .fromTo(
        rest,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.7, ease: EASE.out, stagger: 0.2 },
        1,
      );
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
