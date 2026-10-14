/**
 * Chapter VIII — The legacy. Short and subordinate to Selimiye.
 * Sinan's ideas outlived him through the architects he trained: Sedefkâr Mehmed Ağa designed
 * the Sultan Ahmed Mosque, whose plan grows from Sinan's Şehzade (central dome + four
 * half-domes, expanded) — not from Selimiye's eight piers. Marginalia layout: text with a small
 * pair of plans, beside one photograph.
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import { copy, numeralOf } from '../content';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { picture } from '../core/picture';
import { button, eyebrow, headline, introText } from '../core/ui';
import { drawPlan } from '../render/plans';

export function createLegacy(ctx: ChapterContext): Chapter {
  const t = copy.legacy;

  const top = eyebrow(numeralOf('legacy'), t.eyebrow);
  const title = headline('h2', 'legacy-title', t.headline);
  const body = h('p', { class: 'body' }, t.body);
  const planText = h('p', { class: 'body body--muted' }, t.plan);

  // Two small plans: the same central idea, expanded.
  const sehzade = drawPlan('sehzade', '');
  const blue = drawPlan('blue', '');
  [sehzade, blue].forEach((p) => {
    p.svg.removeAttribute('role');
    p.svg.removeAttribute('aria-label');
    p.svg.setAttribute('aria-hidden', 'true');
  });
  const plans = h(
    'figure',
    { class: 'legacy__plans', role: 'img', 'aria-label': t.plansLabel },
    h(
      'div',
      { class: 'legacy__pair' },
      h(
        'div',
        { class: 'legacy__plan' },
        sehzade.svg,
        h('span', { class: 'meta-label' }, t.sehzade),
      ),
      h('span', { class: 'legacy__arrow', 'aria-hidden': 'true' }, '→'),
      h('div', { class: 'legacy__plan' }, blue.svg, h('span', { class: 'meta-label' }, t.blue)),
    ),
    h('figcaption', { class: 'plate__caption' }, t.plansCaption),
  );

  const media = h('div', { class: 'legacy__media' });
  const photo = h(
    'figure',
    { class: 'plate legacy__photo' },
    media,
    h('figcaption', { class: 'plate__caption' }, t.photoCaption),
  );

  const cont = button(copy.meta.continue, 'primary', '→');

  const el = h(
    'section',
    { class: 'chapter paper legacy', 'data-theme': 'stone', 'aria-labelledby': 'legacy-title' },
    h(
      'div',
      { class: 'legacy__layout' },
      h(
        'div',
        { class: 'legacy__text' },
        top,
        title.el,
        body,
        planText,
        plans,
        h('div', { class: 'lineage__actions' }, cont),
      ),
      photo,
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
    },
    enter() {
      audio.setMood('stone');
      introText(top, title.words, [body, planText, plans]);
      if (reducedMotion()) return;
      gsap.fromTo(
        photo,
        { opacity: 0, x: 24 },
        { opacity: 1, x: 0, duration: 1.4, ease: EASE.out, delay: 0.3 },
      );
      gsap.fromTo(
        [...sehzade.strokes, ...blue.strokes],
        { strokeDasharray: 1, strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 1.6, ease: EASE.inOut, stagger: 0.01, delay: 0.9 },
      );
    },
    leave() {},
    focusTarget: () => title.el,
  };
}
