/**
 * Scene 6 — Space, at eye level. After looking up, the visitor looks around: one photograph of
 * the prayer hall, full bleed. The whole floor is one room under one dome.
 *
 * The photograph demonstrates where the light comes from, once, by itself: shortly after it is
 * visible, everything but the windows darkens for about two seconds, then the clean photo
 * returns. The same effect stays available as a toggle. The demonstration runs once per visit to
 * the scene, never overrides a choice the visitor has made, is cancelled by any click on the
 * toggle, and is skipped under reduced motion (the text says the same thing).
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
  let demo: gsap.core.Tween[] = [];
  let visit = 0;

  function setWindowsOnly(on: boolean): void {
    windowsOnly = on;
    toggle.setAttribute('aria-pressed', String(on));
    annot?.show(on ? insideWindows : null);
    if (on) announce(insideWindows.text);
  }

  function stopDemo(): void {
    demo.forEach((d) => d.kill());
    demo = [];
  }

  /** Resolves once the photograph has decoded (or after 3 s, so it never waits forever). */
  function photoReady(): Promise<void> {
    const img = media.querySelector('img');
    if (!img) return Promise.resolve();
    const ready = img.complete
      ? img.decode().catch(() => {})
      : new Promise<void>((r) => img.addEventListener('load', () => r(), { once: true }));
    return Promise.race([ready, new Promise<void>((r) => setTimeout(r, 3000))]);
  }

  function playDemo(): void {
    if (reducedMotion() || windowsOnly) return;
    const id = ++visit;
    void photoReady().then(() => {
      // Still the same visit, and the visitor has not taken over?
      if (id !== visit || windowsOnly) return;
      demo = [
        gsap.delayedCall(0.8, () => annot?.show(insideWindows)),
        gsap.delayedCall(0.8 + 2.2, () => {
          if (!windowsOnly) annot?.show(null);
        }),
      ];
    });
  }

  toggle.addEventListener('click', () => {
    stopDemo();
    setWindowsOnly(!windowsOnly);
  });
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
      playDemo();
      if (!reducedMotion()) {
        // The camera lowers its gaze: a slow settle from slightly above.
        gsap.fromTo(
          media,
          { scale: 1.08, yPercent: -2 },
          { scale: 1, yPercent: 0, duration: 3.2, ease: EASE.out },
        );
      }
    },
    leave() {
      visit++;
      stopDemo();
      if (!windowsOnly) annot?.show(null);
    },
    reset() {
      stopDemo();
      setWindowsOnly(false);
    },
    focusTarget: () => title.el,
  };
}
