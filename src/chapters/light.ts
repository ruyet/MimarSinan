/**
 * Scene 4 — Light. The same hall, now with Sinan's eight piers. Because the piers carry the
 * dome and buttresses hide in the walls, the walls between them can open. One control opens
 * them row by row (slider, or drag across the drawing); each row lets shafts of light fall
 * across the floor, and the page itself warms as the room brightens.
 *
 * Every light element is tweened with `overwrite`, so closing the walls again always wins over
 * a delayed "on" tween that has not started yet — the shafts can never linger in the dark.
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import { copy } from '../content';
import { announce } from '../core/announcer';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { preloadImage } from '../core/picture';
import { button, enterText, label, show, title as makeTitle } from '../core/ui';
import { buildHall } from '../render/hall';

const MAX = 4;

export function createLight(ctx: ChapterContext): Chapter {
  const t = copy.light;

  const top = label(t.label);
  const title = makeTitle('h2', 'light-title', t.headline);
  const body = h('p', { class: 'text' }, t.body);

  const slider = h('input', {
    type: 'range',
    min: 0,
    max: MAX,
    step: 1,
    value: 0,
    id: 'light-slider',
    class: 'range',
    'aria-valuetext': t.levels[0],
  });
  const control = h(
    'div',
    { class: 'control' },
    h('label', { for: 'light-slider', class: 'control__label' }, t.control),
    slider,
  );

  const closing = h('p', { class: 'closing', hidden: true }, t.closing);
  const cont = button(copy.meta.continue, 'primary', '→');
  cont.hidden = true;

  const hall = buildHall('light-figure-desc', '-light');
  hall.setSupports(8);
  const art = h('div', { class: 'figure__art light__art' }, hall.svg);
  const figure = h(
    'figure',
    { class: 'figure light__figure' },
    h('p', { id: 'light-figure-desc', class: 'sr-only' }, t.figureLabel),
    art,
  );

  const warm = h('div', { class: 'light__warm', 'aria-hidden': 'true' });
  const el = h(
    'section',
    { class: 'chapter light', 'data-theme': 'stone', 'aria-labelledby': 'light-title' },
    warm,
    h(
      'div',
      { class: 'grid scene-split scene-split--mirror' },
      h(
        'div',
        { class: 'col scene-split__text' },
        top,
        title.el,
        body,
        control,
        closing,
        h('div', { class: 'actions' }, cont),
      ),
      figure,
    ),
  );

  let level = 0;
  const parts = hall.rows.flatMap((r) => [...r.windows, ...r.rays, ...r.pools]);

  function setLevel(next: number, animate = true): void {
    next = Math.max(0, Math.min(MAX, Math.round(next)));
    if (next === level && animate) return;
    const rising = next > level;
    level = next;
    slider.value = String(level);
    slider.setAttribute('aria-valuetext', t.levels[level]);

    const d = reducedMotion() || !animate ? 0 : 1;
    hall.rows.forEach((row, i) => {
      const on = i < level;
      // On: windows first, then the shafts, then the pools of light on the floor.
      // Off: everything at once, cancelling any delayed "on" tween.
      const tween = (els: SVGElement[], duration: number, delay: number) =>
        gsap.to(els, {
          opacity: on ? 1 : 0,
          duration: d * (on ? duration : 0.5),
          delay: on ? d * delay : 0,
          ease: EASE.soft,
          overwrite: true,
        });
      tween(row.windows, 0.6, 0);
      tween(row.rays, 1.4, 0.25);
      tween(row.pools, 1.6, 0.45);
    });
    gsap.to(hall.shade, {
      opacity: 0.45 * (1 - level / MAX),
      duration: d * 1.4,
      ease: EASE.soft,
      overwrite: true,
    });
    gsap.to(warm, { opacity: level / MAX, duration: d * 1.6, ease: EASE.soft, overwrite: true });

    if (!animate) return;
    if (rising) audio.shimmer(level);
    announce(t.levels[level]);

    if (level === MAX && closing.hidden) {
      show(closing, 0.6);
      show(cont, 0.9);
      window.setTimeout(() => announce(t.closing), 1200);
    }
  }

  slider.addEventListener('input', () => setLevel(Number(slider.value)));

  // Drag across the drawing: each fifth of its width opens one more row.
  let drag: { x: number; start: number } | null = null;
  art.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, start: level };
    art.setPointerCapture(e.pointerId);
  });
  art.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const step = art.clientWidth / (MAX + 1);
    setLevel(drag.start + (e.clientX - drag.x) / step);
  });
  const endDrag = (): void => {
    drag = null;
  };
  art.addEventListener('pointerup', endDrag);
  art.addEventListener('pointercancel', endDrag);

  cont.addEventListener('click', () => ctx.next());

  gsap.set(parts, { opacity: 0 });
  gsap.set(hall.shade, { opacity: 0.45 });
  gsap.set(warm, { opacity: 0 });

  return {
    id: 'light',
    theme: 'stone',
    el,
    prepare() {
      // The reveal photo is the most important image: fetch it while the visitor is here.
      preloadImage('domeFromBelow', 'min(92vw, 82dvh)');
    },
    enter() {
      audio.setMood('stone');
      preloadImage('domeFromBelow', 'min(92vw, 82dvh)');
      enterText([top, title.el, body, control]);
    },
    leave() {},
    reset() {
      closing.hidden = true;
      cont.hidden = true;
      setLevel(0, false);
    },
    focusTarget: () => title.el,
  };
}
