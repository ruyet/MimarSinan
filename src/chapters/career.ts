/**
 * Scene 8 — Fifty years of architecture. After the three mosques, the scale of the rest: eight
 * milestones set as a typographic chronology, read left to right and top to bottom like a wall
 * of dates in an exhibition. Large years are the anchors; the three works of the previous scene
 * carry the accent, so the visitor finds them again among the others. Selimiye visibly comes
 * late, but not last. One sourced sentence on the scale of his work closes the scene.
 *
 * No lines, no dots, no cards, no clicking through years. The milestones appear in order once,
 * in about a second; Continue is there from the start.
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import { copy } from '../content';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { button, enterText, label, title as makeTitle } from '../core/ui';

export function createCareer(ctx: ChapterContext): Chapter {
  const t = copy.career;

  const top = label(t.label);
  const title = makeTitle('h2', 'career-title', t.headline);
  const lede = h('p', { class: 'text career__lede' }, t.lede);

  const items = t.milestones.map((m) =>
    h(
      'li',
      { class: `milestone${'major' in m && m.major ? ' milestone--major' : ''}` },
      h('span', { class: 'milestone__year' }, m.year),
      h('span', { class: 'milestone__name' }, m.name),
      h('span', { class: 'milestone__note' }, m.note),
    ),
  );
  const list = h('ol', { class: 'milestones', 'aria-label': t.headline }, ...items);
  const scale = h('p', { class: 'career__scale' }, t.scale);
  const cont = button(copy.meta.continue, 'primary', '→');
  const actions = h('div', { class: 'actions' }, cont);

  const el = h(
    'section',
    { class: 'chapter career', 'data-theme': 'stone', 'aria-labelledby': 'career-title' },
    h(
      'div',
      { class: 'grid career__grid' },
      h('header', { class: 'col career__head' }, top, title.el, lede),
      list,
      h('div', { class: 'career__foot' }, scale, actions),
    ),
  );

  cont.addEventListener('click', () => ctx.next());

  return {
    id: 'career',
    theme: 'stone',
    el,
    enter() {
      audio.setMood('stone');
      enterText([top, title.el, lede, actions]);
      if (reducedMotion()) {
        gsap.fromTo([...items, scale], { opacity: 0 }, { opacity: 1, duration: 0.4 });
        return;
      }
      // Fifty years, in order, in about a second.
      gsap.fromTo(
        items,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.6, ease: EASE.out, stagger: 0.1, delay: 0.25 },
      );
      gsap.fromTo(scale, { opacity: 0 }, { opacity: 1, duration: 0.7, delay: 1.2 });
    },
    leave() {},
    focusTarget: () => title.el,
  };
}
