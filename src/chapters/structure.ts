/**
 * Scene 3 — Structure (and the first sight of Space).
 * The same cut-away hall, with the dome waiting above it. Three numbers can be tried, all
 * presented alike, so the visitor finds Sinan's answer rather than being shown it:
 *   4  → long spans: the rim hangs over empty space and pushes outwards (red marks);
 *   8  → Sinan's answer at Selimiye: carried all round, and the floor stays one room;
 *   16 → well carried, but a ring of columns divides the floor.
 * The shaded floor shows the room you would actually stand in. No meters, no scores.
 *
 * Layout stability: every explanation is rendered up front and stacked in one grid cell, so the
 * cell is always as tall as the longest text; choosing a number only cross-fades between them.
 * The Continue button keeps its place while it waits to appear.
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import { copy } from '../content';
import { announce } from '../core/announcer';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { button, conceal, enterText, label, reveal, title as makeTitle } from '../core/ui';
import { buildHall } from '../render/hall';

export function createStructure(ctx: ChapterContext): Chapter {
  const t = copy.structure;

  const top = label(t.label);
  const title = makeTitle('h2', 'structure-title', t.headline);
  const body = h('p', { class: 'text' }, t.body);

  // Three numbers: a radio group with roving focus and identical buttons.
  const options = t.options.map((o, i) =>
    h(
      'button',
      {
        type: 'button',
        role: 'radio',
        class: 'choice__option',
        'aria-checked': 'false',
        'aria-label': o.label,
        tabindex: i === 0 ? '0' : '-1',
        'data-n': o.n,
      },
      String(o.n),
    ),
  );
  const group = h(
    'div',
    { class: 'choice', role: 'radiogroup', 'aria-label': t.groupLabel },
    ...options,
  );

  // One panel per state, stacked in the same cell; only the current one is visible.
  const panel = (titleText: string, bodyText: string, key: string) =>
    h(
      'div',
      { class: 'result__panel', 'data-key': key },
      h('p', { class: 'result__title' }, titleText),
      bodyText ? h('p', { class: 'result__body' }, bodyText) : null,
    );
  const panels = [
    panel(t.empty, '', '0'),
    ...t.options.map((o) => panel(o.title, o.body, String(o.n))),
  ];
  const result = h('div', { class: 'result' }, ...panels);
  const cont = button(copy.meta.continue, 'primary', '→');
  const actions = h('div', { class: 'actions is-waiting' }, cont);

  const hall = buildHall('structure-figure-desc', '-structure');
  const figDesc = h('p', { id: 'structure-figure-desc', class: 'sr-only' }, t.figureLabel(0));
  const legend = h(
    'p',
    { class: 'legend' },
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
      h('div', { class: 'col scene-split__text' }, top, title.el, body, group, result, actions),
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

  function showPanel(n: number, animate: boolean): void {
    panels.forEach((p) => {
      const on = p.dataset.key === String(n);
      p.classList.toggle('is-current', on);
      p.setAttribute('aria-hidden', String(!on));
      if (on && animate && !reducedMotion()) {
        gsap.fromTo(p, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.45, ease: EASE.out });
      } else {
        gsap.set(p, { clearProps: 'opacity,transform' });
      }
    });
  }

  function choose(n: number, animate = true): void {
    if (n === current) return;
    current = n;
    options.forEach((btn) => {
      const on = Number(btn.dataset.n) === n;
      btn.setAttribute('aria-checked', String(on));
      btn.tabIndex = on ? 0 : -1;
    });
    if (n === 0) options[0].tabIndex = 0;

    const parts = hall.setSupports(n);
    figDesc.textContent = t.figureLabel(n);
    legend.classList.toggle('is-off', n === 0);
    showPanel(n, animate);

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
    const o = t.options.find((x) => x.n === n)!;
    audio.tick(n === 8 ? 1 : 0.8);
    announce(`${o.title}. ${o.body}`);
    if (n === 8) {
      audio.lock();
      reveal(actions, 0.5);
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
  showPanel(0, false);
  legend.classList.add('is-off');

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
      conceal(actions);
    },
    focusTarget: () => title.el,
  };
}
