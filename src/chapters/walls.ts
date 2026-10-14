/**
 * Chapter III — Opening the walls.
 * With eight piers carrying the dome, the walls carry no main load. The user opens them —
 * with a slider or by dragging across the drawing — and windows appear row by row.
 * Each row lets a shaft of light in; the interior brightens and the page warms.
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import { copy } from '../content';
import { announce } from '../core/announcer';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { preloadImage } from '../core/picture';
import { button, eyebrow, headline, introText, richText, sheet } from '../core/ui';
import { buildHall } from '../render/hall';

const MAX = 4;

export function createWalls(ctx: ChapterContext): Chapter {
  const t = copy.walls;

  const top = eyebrow('III', t.eyebrow);
  const title = headline('h2', 'walls-title', t.headline);
  const body = h('p', { class: 'body' }, t.body);

  const slider = h('input', {
    type: 'range',
    min: 0,
    max: MAX,
    step: 1,
    value: 0,
    id: 'walls-slider',
    class: 'range',
    'aria-valuetext': t.levels[0],
  });
  const control = h(
    'div',
    { class: 'control' },
    h('label', { for: 'walls-slider', class: 'stepper__label' }, t.control),
    slider,
    h('p', { class: 'note' }, t.dragHint),
  );

  const lightText = h('span', { class: 'meter__value' }, t.levels[0]);
  const segments = Array.from({ length: MAX }, () => h('span', { class: 'light__seg' }));
  const light = h(
    'div',
    { class: 'light' },
    h(
      'div',
      { class: 'meter__head' },
      h('span', { class: 'meter__label' }, t.lightLabel),
      lightText,
    ),
    h('div', { class: 'light__bar', 'aria-hidden': 'true' }, ...segments),
  );

  const closing = richText(h('p', { class: 'closing-line', hidden: true }), t.closing);
  const cont = button(copy.meta.continue, 'primary', '→');
  cont.hidden = true;
  const actions = h('div', { class: 'spread__actions' }, cont);

  const hall = buildHall('walls-figure-desc');
  const art = h('div', { class: 'sheet__art walls__art', style: '--ratio: 4 / 3' }, hall.svg);
  const { figure } = sheet(art, t.figcaption);
  figure.prepend(h('p', { id: 'walls-figure-desc', class: 'sr-only' }, t.figureLabel));

  const warm = h('div', { class: 'walls__warm', 'aria-hidden': 'true' });
  const el = h(
    'section',
    { class: 'chapter paper walls', 'data-theme': 'stone', 'aria-labelledby': 'walls-title' },
    warm,
    h(
      'div',
      { class: 'spread spread--controls' },
      h('div', { class: 'spread__text' }, top, title.el, body),
      h('div', { class: 'spread__controls' }, control, light, closing),
      h('div', { class: 'spread__figure' }, figure),
      actions,
    ),
  );

  /* --- Light level ------------------------------------------------------ */
  let level = 0;
  const allWindowParts = hall.rows.flatMap((r) => [...r.windows, ...r.rays, ...r.pools]);

  function setLevel(next: number, animate = true): void {
    next = Math.max(0, Math.min(MAX, Math.round(next)));
    if (next === level && animate) return;
    const rising = next > level;
    level = next;
    slider.value = String(level);
    slider.setAttribute('aria-valuetext', t.levels[level]);
    lightText.textContent = t.levels[level];
    segments.forEach((seg, i) => seg.classList.toggle('is-on', i < level));

    const reduced = reducedMotion() || !animate;
    const d = reduced ? 0 : 1;
    hall.rows.forEach((row, i) => {
      const on = i < level;
      gsap.to(row.windows, {
        opacity: on ? 1 : 0,
        duration: d * 0.6,
        stagger: on && !reduced ? 0.05 : 0,
        ease: EASE.out,
      });
      gsap.to(row.rays, {
        opacity: on ? 1 : 0,
        duration: d * 1.6,
        delay: on ? d * 0.3 : 0,
        ease: EASE.soft,
      });
      gsap.to(row.pools, {
        opacity: on ? 1 : 0,
        duration: d * 1.8,
        delay: on ? d * 0.5 : 0,
        ease: EASE.soft,
      });
    });
    gsap.to(hall.shade, { opacity: 0.5 * (1 - level / MAX), duration: d * 1.6, ease: EASE.soft });
    gsap.to(warm, { opacity: level / MAX, duration: d * 1.8, ease: EASE.soft });

    if (!animate) return;
    if (rising) audio.shimmer(level);
    announce(`${t.lightLabel}: ${t.levels[level]}`);

    const full = level === MAX;
    if (full && closing.hidden) {
      closing.hidden = false;
      cont.hidden = false;
      if (!reducedMotion()) {
        gsap.from(closing, { opacity: 0, y: 12, duration: 1.2, ease: EASE.out, delay: 0.8 });
        gsap.from(cont, { opacity: 0, y: 10, duration: 0.8, ease: EASE.out, delay: 1.2 });
      }
      window.setTimeout(() => announce(closing.textContent ?? ''), 1500);
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

  gsap.set(allWindowParts, { opacity: 0 });
  gsap.set(hall.shade, { opacity: 0.5 });
  gsap.set(warm, { opacity: 0 });

  return {
    id: 'walls',
    theme: 'stone',
    el,
    prepare() {
      // The reveal photo is the most important image: fetch it while the user plays here.
      preloadImage('domeFromBelow', 'min(92vw, 78dvh)');
    },
    enter() {
      audio.setMood('stone');
      preloadImage('domeFromBelow', 'min(92vw, 78dvh)');
      introText(top, title.words, [body, control, light, actions]);
      if (!reducedMotion() && level === 0) {
        gsap.fromTo(
          hall.strokes,
          { strokeDasharray: 1, strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 1.6, stagger: 0.004, ease: EASE.inOut },
        );
      }
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
