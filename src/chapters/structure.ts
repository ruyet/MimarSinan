/**
 * Scene 3 — Structure (and the first sight of Space).
 * The same cut-away hall, with the dome waiting above it. Three answers can be tried:
 *   four supports  → the rim hangs over empty space and pushes outwards (red marks);
 *   sixteen        → well carried, but a ring of columns fences off the middle of the room;
 *   Sinan's eight  → carried all the way round, and the whole floor stays one open room.
 * The shaded floor shows the room you would actually stand in. No meters, no scores: the
 * drawing shows the trade-off, and the text names it in one sentence.
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import { copy } from '../content';
import { announce } from '../core/announcer';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { button, enterText, label, show, swapText, title as makeTitle } from '../core/ui';
import { buildHall } from '../render/hall';

export function createStructure(ctx: ChapterContext): Chapter {
  const t = copy.structure;

  const top = label(t.label);
  const title = makeTitle('h2', 'structure-title', t.headline);
  const body = h('p', { class: 'text' }, t.body);

  // Three answers: a radio group with roving focus and large targets.
  const options = t.options.map((o, i) =>
    h(
      'button',
      {
        type: 'button',
        role: 'radio',
        class: `choice__option${o.n === 8 ? ' choice__option--sinan' : ''}`,
        'aria-checked': 'false',
        tabindex: i === 0 ? '0' : '-1',
        'data-n': o.n,
      },
      h('span', { class: 'choice__n', 'aria-hidden': 'true' }, String(o.n)),
      h('span', { class: 'choice__label' }, o.label),
    ),
  );
  const group = h(
    'div',
    { class: 'choice', role: 'radiogroup', 'aria-label': t.groupLabel },
    ...options,
  );

  const resultTitle = h('p', { class: 'result__title' }, t.empty);
  const resultBody = h('p', { class: 'result__body' });
  const result = h('div', { class: 'result', 'aria-live': 'polite' }, resultTitle, resultBody);
  const other = h('p', { class: 'small structure__other', hidden: true }, t.other);
  const cont = button(copy.meta.continue, 'primary', '→');
  cont.hidden = true;

  const hall = buildHall('structure-figure-desc', '-structure');
  const figDesc = h('p', { id: 'structure-figure-desc', class: 'sr-only' }, t.figureLabel(0));
  const legend = h(
    'p',
    { class: 'legend', hidden: true },
    h('span', { class: 'legend__swatch', 'aria-hidden': 'true' }),
    t.floor,
  );
  const figure = h(
    'figure',
    { class: 'figure structure__figure' },
    figDesc,
    h('div', { class: 'figure__art' }, hall.svg),
    h(
      'figcaption',
      { class: 'figure__foot' },
      legend,
      h('span', { class: 'small' }, copy.meta.model),
    ),
  );

  const el = h(
    'section',
    { class: 'chapter structure', 'data-theme': 'stone', 'aria-labelledby': 'structure-title' },
    h(
      'div',
      { class: 'grid scene-split' },
      h(
        'div',
        { class: 'col scene-split__text' },
        top,
        title.el,
        body,
        group,
        result,
        other,
        h('div', { class: 'actions' }, cont),
      ),
      figure,
    ),
  );

  // Light is not part of this scene: windows, shafts and pools stay hidden.
  gsap.set(
    hall.rows.flatMap((r) => [...r.windows, ...r.rays, ...r.pools]),
    { opacity: 0 },
  );
  gsap.set(hall.shade, { opacity: 0 });

  let current = 0;

  function choose(n: number, animate = true): void {
    if (n === current) return;
    current = n;
    const o = t.options.find((x) => x.n === n);
    options.forEach((btn) => {
      const on = Number(btn.dataset.n) === n;
      btn.setAttribute('aria-checked', String(on));
      btn.tabIndex = on ? 0 : -1;
    });

    const parts = hall.setSupports(n);
    figDesc.textContent = t.figureLabel(n);
    legend.hidden = n === 0;

    if (!o) {
      resultTitle.textContent = t.empty;
      resultBody.textContent = '';
      return;
    }
    if (animate) {
      swapText(resultTitle, o.title);
      swapText(resultBody, o.body);
    } else {
      resultTitle.textContent = o.title;
      resultBody.textContent = o.body;
    }

    if (animate && !reducedMotion()) {
      // Supports rise from the floor; the open floor and any push marks follow.
      gsap.fromTo(
        parts.piers,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.6, ease: EASE.out, stagger: 0.015 },
      );
      if (parts.open)
        gsap.fromTo(parts.open, { opacity: 0 }, { opacity: 1, duration: 0.9, delay: 0.35 });
      if (parts.push.length) {
        gsap.fromTo(
          parts.push,
          { strokeDasharray: 1, strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.7, ease: EASE.inOut, delay: 0.45, stagger: 0.05 },
        );
      }
    }

    if (!animate) return;
    audio.tick(n === 8 ? 1 : 0.8);
    announce(`${o.title}. ${o.body}`);
    if (n === 8) {
      audio.lock();
      show(other, 0.5);
      show(cont, 0.7);
    }
  }

  options.forEach((btn, i) => {
    btn.addEventListener('click', () => choose(Number(btn.dataset.n)));
    btn.addEventListener('keydown', (ev) => {
      const dir =
        ev.key === 'ArrowRight' || ev.key === 'ArrowDown'
          ? 1
          : ev.key === 'ArrowLeft' || ev.key === 'ArrowUp'
            ? -1
            : 0;
      if (!dir) return;
      ev.preventDefault();
      const next = options[(i + dir + options.length) % options.length];
      next.focus();
      choose(Number(next.dataset.n));
    });
  });
  cont.addEventListener('click', () => ctx.next());

  return {
    id: 'structure',
    theme: 'stone',
    el,
    enter() {
      audio.setMood('stone');
      enterText([top, title.el, body, group, result]);
      if (!reducedMotion() && current === 0) {
        gsap.fromTo(
          hall.strokes,
          { strokeDasharray: 1, strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 1.4, stagger: 0.004, ease: EASE.inOut },
        );
      }
    },
    leave() {},
    reset() {
      choose(0, false);
      other.hidden = true;
      cont.hidden = true;
      options[0].tabIndex = 0;
    },
    focusTarget: () => title.el,
  };
}
