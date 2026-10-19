/**
 * Scene 9 — After Sinan. One large photographic comparison of two exteriors:
 *   Şehzade Mosque (Sinan, 1548) → Sultan Ahmed Mosque (Sedefkâr Mehmed Ağa, 1609–1617),
 * whose design is based on Şehzade's: a central dome held up by four half-domes. Exteriors are
 * used because the shared idea, a dome over four half-domes with smaller domes stepping down,
 * is visible from outside at a glance.
 *
 * Sequence: the scene opens on Şehzade; once both photographs have decoded and after a pause, it
 * crossfades once to Sultan Ahmed (a plain crossfade, never a morph: these are two buildings, not
 * one). After that, or at any moment, two buttons switch between them. A choice by the visitor
 * cancels the automatic step; the sequence never loops, runs once per visit, and is skipped
 * under reduced motion. The label and line under the photo always change with it.
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import { copy } from '../content';
import { announce } from '../core/announcer';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { picture } from '../core/picture';
import { button, enterText, label, title as makeTitle } from '../core/ui';

type Key = 'sehzade' | 'blue';

export function createLegacy(ctx: ChapterContext): Chapter {
  const t = copy.legacy;

  const top = label(t.label);
  const title = makeTitle('h2', 'legacy-title', t.headline);
  const body = h('p', { class: 'text' }, t.body);

  // The photographic stage: both pictures stacked, one visible at a time.
  const layers = t.buildings.map((b) =>
    h('div', { class: 'compare__layer', 'data-key': b.key, 'aria-hidden': 'true' }),
  );
  const stage = h('div', { class: 'compare__stage' }, ...layers);

  // The label and line under the photograph, one panel per building, stacked in one cell so the
  // layout never moves when they swap.
  const captions = t.buildings.map((b) =>
    h(
      'div',
      { class: 'compare__caption', 'data-key': b.key },
      h('p', { class: 'compare__name' }, b.name),
      h('p', { class: 'compare__meta' }, b.meta),
      h('p', { class: 'compare__text' }, b.text),
    ),
  );
  const captionCell = h('div', { class: 'compare__captions', 'aria-live': 'polite' }, ...captions);

  // Two clear options, a radio group like the support choice.
  const options = t.buildings.map((b, i) =>
    h(
      'button',
      {
        type: 'button',
        role: 'radio',
        class: 'compare__option',
        'aria-checked': i === 0 ? 'true' : 'false',
        tabindex: i === 0 ? '0' : '-1',
        'data-key': b.key,
      },
      b.button,
    ),
  );
  const group = h(
    'div',
    { class: 'compare__options', role: 'radiogroup', 'aria-label': t.groupLabel },
    ...options,
  );

  const figure = h(
    'figure',
    { class: 'compare' },
    stage,
    h('figcaption', { class: 'compare__foot' }, captionCell, group),
  );

  const cont = button(copy.meta.continue, 'primary', '→');
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
        h('div', { class: 'actions' }, cont),
      ),
      figure,
    ),
  );

  let current: Key = 'sehzade';
  let chosen = false; // the visitor has picked one during this visit
  let auto: gsap.core.Tween | null = null;
  let visit = 0;
  let prepared = false;

  function show(key: Key, animate: boolean): void {
    current = key;
    const d = animate && !reducedMotion() ? 1 : 0;
    layers.forEach((l) => {
      const on = l.dataset.key === key;
      gsap.to(l, { opacity: on ? 1 : 0, duration: d, ease: EASE.soft, overwrite: true });
    });
    captions.forEach((c) => {
      const on = c.dataset.key === key;
      c.classList.toggle('is-current', on);
      c.setAttribute('aria-hidden', String(!on));
      if (on && d) gsap.fromTo(c, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: EASE.out });
    });
    options.forEach((o) => {
      const on = o.dataset.key === key;
      o.setAttribute('aria-checked', String(on));
      o.tabIndex = on ? 0 : -1;
    });
  }

  function choose(key: Key): void {
    chosen = true;
    auto?.kill();
    auto = null;
    if (key === current) return;
    show(key, true);
    const b = t.buildings.find((x) => x.key === key)!;
    announce(`${b.name}. ${b.meta}. ${b.text}`);
  }

  options.forEach((o, i) => {
    o.addEventListener('click', () => choose(o.dataset.key as Key));
    o.addEventListener('keydown', (ev) => {
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
      choose(next.dataset.key as Key);
    });
  });
  cont.addEventListener('click', () => ctx.next());

  /** Both photographs decoded (or 3 s passed): the crossfade never shows an empty frame. */
  function bothReady(): Promise<void> {
    const waits = layers.map((l) => {
      const img = l.querySelector('img');
      if (!img) return Promise.resolve();
      return img.complete
        ? img.decode().catch(() => {})
        : new Promise<void>((r) => {
            img.addEventListener('load', () => r(), { once: true });
            img.addEventListener('error', () => r(), { once: true });
          });
    });
    return Promise.race([
      Promise.all(waits).then(() => {}),
      new Promise<void>((r) => setTimeout(r, 3000)),
    ]);
  }

  function playOnce(): void {
    if (chosen || reducedMotion()) return;
    const id = ++visit;
    show('sehzade', false);
    void bothReady().then(() => {
      if (id !== visit || chosen) return;
      // Long enough to recognise Şehzade, then one crossfade to Sultan Ahmed.
      auto = gsap.delayedCall(2.6, () => {
        auto = null;
        if (id !== visit || chosen) return;
        show('blue', true);
        const b = t.buildings[1];
        announce(`${b.name}. ${b.meta}. ${b.text}`);
      });
    });
  }

  show('sehzade', false);

  return {
    id: 'legacy',
    theme: 'stone',
    el,
    prepare() {
      if (prepared) return;
      prepared = true;
      // Both eager, so the second is ready before the crossfade needs it.
      t.buildings.forEach((b, i) =>
        layers[i].append(
          picture(b.image, {
            sizes: '(min-width: 64rem) 62vw, 100vw',
            eager: true,
            className: 'compare__picture',
          }),
        ),
      );
    },
    enter() {
      audio.setMood('stone');
      enterText([top, title.el, body, cont.parentElement]);
      if (!reducedMotion()) {
        gsap.fromTo(figure, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: EASE.soft });
      }
      playOnce();
    },
    leave() {
      visit++;
      auto?.kill();
      auto = null;
      // A choice holds for this visit only; the next visit opens on Şehzade again.
      chosen = false;
    },
    reset() {
      chosen = false;
      show('sehzade', false);
    },
    focusTarget: () => title.el,
  };
}
