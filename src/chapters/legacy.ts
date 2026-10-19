/**
 * Scene 8 — After Sinan. A short beat of its own, so legacy never competes with the career
 * progression: one strong photograph and two sentences. His work went on through the architects
 * he trained; one of them designed the Sultan Ahmed Mosque, whose plan grows from Şehzade —
 * shown as the same looking-up disc as in the previous scene, so the link is visible, not just
 * stated. Selimiye's eight piers are deliberately not claimed as the model.
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import { copy, lifetimeFrame } from '../content';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { picture } from '../core/picture';
import { button, enterText, label, title as makeTitle } from '../core/ui';

export function createLegacy(ctx: ChapterContext): Chapter {
  const t = copy.legacy;

  const top = label(t.label);
  const title = makeTitle('h2', 'legacy-title', t.headline);
  const body = h('p', { class: 'text' }, t.body);

  // The link back to Şehzade: the same disc the visitor has just seen.
  const disc = h('div', { class: 'work__frame legacy__disc', 'aria-hidden': 'true' });
  const f = lifetimeFrame('sehzadeDomes');
  disc.style.setProperty('--k', String(50 / f.r));
  disc.style.setProperty('--cx', `${f.cx}%`);
  disc.style.setProperty('--cy', `${f.cy}%`);
  const link = h(
    'div',
    { class: 'legacy__link' },
    disc,
    h(
      'p',
      {},
      h('span', { class: 'label' }, t.sehzade),
      h('span', { class: 'legacy__linktext' }, t.link),
    ),
  );

  const cont = button(copy.meta.continue, 'primary', '→');
  const media = h('div', { class: 'legacy__media' });
  const figure = h(
    'figure',
    { class: 'legacy__figure' },
    media,
    h('figcaption', { class: 'small' }, t.blue),
  );

  const el = h(
    'section',
    { class: 'chapter legacy', 'data-theme': 'stone', 'aria-labelledby': 'legacy-title' },
    h(
      'div',
      { class: 'grid legacy__grid' },
      h(
        'div',
        { class: 'col legacy__text' },
        top,
        title.el,
        body,
        link,
        h('div', { class: 'actions' }, cont),
      ),
      figure,
    ),
  );

  cont.addEventListener('click', () => ctx.next());
  let prepared = false;

  return {
    id: 'legacy',
    theme: 'stone',
    el,
    prepare() {
      if (prepared) return;
      prepared = true;
      media.append(picture('sultanAhmed', { sizes: '(min-width: 64rem) 55vw, 100vw' }));
      disc.append(picture('sehzadeDomes', { sizes: '8rem', className: 'work__photo', alt: '' }));
    },
    enter() {
      audio.setMood('stone');
      enterText([top, title.el, body, link, cont.parentElement]);
      if (!reducedMotion()) {
        gsap.fromTo(figure, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: EASE.soft });
      }
    },
    leave() {},
    focusTarget: () => title.el,
  };
}
