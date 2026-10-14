/**
 * Chapter IX — Why Mimar Sinan matters. The synthesis.
 * Four numbered plates in the manner of an architectural monograph. Each reuses a figure the
 * visitor has already seen (to trigger memory, not to add information) and states one idea in
 * one sentence. The three principle marks appear fully drawn.
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import { copy, numeralOf, principleOrder } from '../content';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { discover, principleMark, principleRow } from '../core/principles';
import { button, eyebrow, headline } from '../core/ui';
import { evaluate } from '../model/stability';
import { buildHall } from '../render/hall';
import { buildPiersPlan, buildRoomView } from '../render/piersPlan';
import { drawPlan } from '../render/plans';

/** The figure for each plate, rebuilt from the same drawing code as the original chapter. */
function plateFigure(i: number): SVGSVGElement | HTMLElement {
  if (i === 0) {
    const plan = buildPiersPlan('synthesis-fig-1');
    plan.svg.dataset.state = 'balanced';
    plan.render(evaluate(8));
    return plan.svg;
  }
  if (i === 1) return buildRoomView('-synthesis');
  if (i === 2) {
    const hall = buildHall('synthesis-fig-3', '-synthesis');
    gsap.set(hall.shade, { opacity: 0 });
    hall.svg
      .querySelectorAll<SVGElement>('.hall__dome-glow')
      .forEach((g) => (g.style.opacity = '1'));
    return hall.svg;
  }
  const a = drawPlan('sehzade', '');
  const b = drawPlan('blue', '');
  return h(
    'div',
    { class: 'synthesis__pair' },
    a.svg,
    h('span', { class: 'legacy__arrow', 'aria-hidden': 'true' }, '→'),
    b.svg,
  );
}

export function createSynthesis(ctx: ChapterContext): Chapter {
  const t = copy.synthesis;

  const top = eyebrow(numeralOf('synthesis'), t.eyebrow);
  const title = headline('h2', 'synthesis-title', t.headline, 'display synthesis__title');
  const lede = h('p', { class: 'lede synthesis__lede' }, t.lede);
  const marks = principleRow(true);

  const plates = t.plates.map((p, i) => {
    const figure = plateFigure(i);
    figure.setAttribute('aria-hidden', 'true');
    figure.removeAttribute('role');
    figure.removeAttribute('aria-labelledby');
    return h(
      'li',
      { class: `synthesis__plate synthesis__plate--${i + 1}` },
      h('span', { class: 'synthesis__numeral', 'aria-hidden': 'true' }, p.numeral),
      h('div', { class: 'synthesis__figure' }, figure),
      h(
        'div',
        { class: 'synthesis__caption' },
        p.principle ? principleMark(p.principle, true) : null,
        h('p', { class: 'synthesis__statement' }, p.title),
        h('p', { class: 'synthesis__text' }, p.text),
        h('p', { class: 'synthesis__ref' }, `after ${p.ref}`),
      ),
    );
  });
  const list = h('ol', { class: 'synthesis__plates' }, ...plates);

  const cont = button(copy.meta.continue, 'primary', '→');

  const el = h(
    'section',
    {
      class: 'chapter paper synthesis',
      'data-theme': 'stone',
      'aria-labelledby': 'synthesis-title',
    },
    h(
      'div',
      { class: 'synthesis__layout' },
      h(
        'header',
        { class: 'synthesis__head' },
        top,
        title.el,
        lede,
        marks,
        h('div', { class: 'lineage__actions synthesis__actions' }, cont),
      ),
      list,
    ),
  );

  cont.addEventListener('click', () => ctx.next());

  return {
    id: 'synthesis',
    theme: 'stone',
    el,
    enter() {
      audio.setMood('stone');
      // Arriving here (even by a deep link) completes the notebook: all three are known now.
      principleOrder.forEach((p) => discover(p));
      if (reducedMotion()) {
        gsap.fromTo(
          [top, title.el, lede, marks, ...plates, cont],
          { opacity: 0 },
          { opacity: 1, duration: 0.6 },
        );
        return;
      }
      gsap
        .timeline()
        .fromTo(top, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: EASE.soft }, 0)
        // Typographic entrance: the title tracks in rather than rising like the other chapters.
        .fromTo(
          title.el,
          { opacity: 0, letterSpacing: '0.12em' },
          { opacity: 1, letterSpacing: '-0.022em', duration: 1.8, ease: EASE.out },
          0.1,
        )
        .fromTo(
          [lede, marks],
          { opacity: 0 },
          { opacity: 1, duration: 1, ease: EASE.soft, stagger: 0.2 },
          0.9,
        )
        .fromTo(
          marks.querySelectorAll('.mark__line'),
          { strokeDasharray: 1, strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 1, ease: EASE.inOut, stagger: 0.1 },
          1,
        )
        .fromTo(
          plates,
          { opacity: 0, clipPath: 'inset(0 0 100% 0)' },
          {
            opacity: 1,
            clipPath: 'inset(0 0 0% 0)',
            duration: 1.2,
            ease: EASE.inOut,
            stagger: 0.22,
          },
          1.3,
        )
        .fromTo(cont, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 2.6);
    },
    leave() {},
    focusTarget: () => title.el,
  };
}
