/**
 * Scene 1 — The man. The visitor meets Mimar Sinan before anything else: his name set like an
 * inscription, his monument in daylight, and two sentences that pose the question the rest of
 * the story answers: how did he build the work he called his masterwork?
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import { copy } from '../content';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { picture } from '../core/picture';
import { button, label } from '../core/ui';

export function createSinan(ctx: ChapterContext): Chapter {
  const t = copy.sinan;

  const kicker = label(t.kicker);
  const first = h('span', { class: 'sinan__line' }, t.first);
  const last = h('span', { class: 'sinan__line' }, t.last);
  const title = h(
    'h1',
    { id: 'sinan-title', class: 'sinan__name', tabindex: '-1' },
    first,
    ' ',
    last,
  );
  const lede = h('p', { class: 'text sinan__lede' }, t.lede);
  const turn = h('p', { class: 'text sinan__turn' }, t.turn);
  const begin = button(t.begin, 'primary', '→');

  const photo = picture('sinanMonument', {
    sizes: '(min-width: 64rem) 42vw, 100vw',
    eager: true,
    className: 'sinan__picture',
  });
  photo.querySelector('img')?.setAttribute('fetchpriority', 'high');
  const figure = h(
    'figure',
    { class: 'sinan__figure' },
    h('div', { class: 'sinan__frame' }, photo),
    h('figcaption', { class: 'small' }, t.caption),
  );

  const text = h(
    'div',
    { class: 'col sinan__text' },
    kicker,
    title,
    lede,
    turn,
    h('div', { class: 'actions' }, begin),
  );

  const el = h(
    'section',
    { class: 'chapter sinan', 'data-theme': 'stone', 'aria-labelledby': 'sinan-title' },
    h('div', { class: 'grid sinan__grid' }, text, figure),
  );

  begin.addEventListener('click', () => {
    audio.chime(293.66, 0.12);
    ctx.next();
  });

  let played = false;

  function play(): void {
    const rest = [lede, turn, begin.parentElement];
    if (reducedMotion()) {
      gsap.fromTo([kicker, title, ...rest, figure], { opacity: 0 }, { opacity: 1, duration: 0.5 });
      return;
    }
    gsap
      .timeline()
      // The photograph settles first, like light coming up in a gallery.
      .fromTo(figure, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: EASE.soft }, 0)
      .fromTo(photo, { scale: 1.06 }, { scale: 1, duration: 2.4, ease: EASE.out }, 0)
      .fromTo(kicker, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.2)
      // The name rises once, line by line: the one typographic gesture of the opening.
      .fromTo(
        [first, last],
        { yPercent: 40, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1, ease: EASE.out, stagger: 0.12 },
        0.25,
      )
      .fromTo(
        rest,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.7, ease: EASE.out, stagger: 0.08 },
        0.8,
      );
  }

  return {
    id: 'sinan',
    theme: 'stone',
    el,
    enter() {
      audio.setMood('stone');
      if (!played) {
        played = true;
        play();
      }
    },
    leave() {},
    reset() {
      played = false;
    },
    focusTarget: () => title,
  };
}
