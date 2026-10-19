/**
 * Scene 6 — Space, at eye level. After looking up, the visitor looks around: one photograph of
 * the prayer hall, full bleed. The whole floor is one room under one dome.
 *
 * One optional control demonstrates where the light comes from: "Show only the windows" darkens
 * the photograph except its windows (a photo that teaches, rather than decorates).
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import { copy, images, insideWindows } from '../content';
import { createAnnotator, type Annotator } from '../core/annotate';
import { announce } from '../core/announcer';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { picture } from '../core/picture';
import { button, enterText, label, title as makeTitle } from '../core/ui';

export function createInside(ctx: ChapterContext): Chapter {
  const t = copy.inside;

  const top = label(t.label);
  const title = makeTitle('h2', 'inside-title', t.headline);
  const body = h('p', { class: 'text' }, t.body);
  const toggle = h(
    'button',
    { type: 'button', class: 'switch', 'aria-pressed': 'false' },
    h('span', { class: 'switch__track', 'aria-hidden': 'true' }),
    t.toggle,
  );
  const cont = button(copy.meta.continue, 'primary', '→');

  const media = h('div', { class: 'inside__media' });
  const el = h(
    'section',
    { class: 'chapter inside', 'data-theme': 'night', 'aria-labelledby': 'inside-title' },
    h(
      'figure',
      { class: 'inside__figure' },
      media,
      h('figcaption', { class: 'sr-only' }, t.caption),
    ),
    h('div', { class: 'inside__shade', 'aria-hidden': 'true' }),
    h(
      'div',
      { class: 'inside__text' },
      top,
      title.el,
      body,
      h('div', { class: 'actions' }, toggle, cont),
    ),
  );

  let prepared = false;
  let annot: Annotator | null = null;
  let windowsOnly = false;

  function setWindowsOnly(on: boolean): void {
    windowsOnly = on;
    toggle.setAttribute('aria-pressed', String(on));
    annot?.show(on ? insideWindows : null);
    if (on) announce(insideWindows.text);
  }

  toggle.addEventListener('click', () => setWindowsOnly(!windowsOnly));
  cont.addEventListener('click', () => ctx.next());

  return {
    id: 'inside',
    theme: 'night',
    el,
    prepare() {
      if (prepared) return;
      prepared = true;
      media.append(
        picture('prayerHall', { sizes: '100vw', eager: true, className: 'inside__picture' }),
      );
      annot = createAnnotator(media, images.prayerHall, {
        labels: false,
        dim: 0.78,
        calibrate: [insideWindows],
      });
    },
    enter() {
      audio.setMood('room');
      annot?.update();
      enterText([top, title.el, body, toggle.parentElement], 0.3);
      if (!reducedMotion()) {
        // The camera lowers its gaze: a slow settle from slightly above.
        gsap.fromTo(
          media,
          { scale: 1.08, yPercent: -2 },
          { scale: 1, yPercent: 0, duration: 3.2, ease: EASE.out },
        );
      }
    },
    leave() {},
    reset() {
      setWindowsOnly(false);
    },
    focusTarget: () => title.el,
  };
}
