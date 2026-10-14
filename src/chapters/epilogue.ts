/**
 * Chapter VIII — Epilogue. Mirrors the Prologue: night, a window, a beam of light —
 * which now falls into a small drawn dome and fills it.
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import { copy, numeralOf } from '../content';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { button, eyebrow, headline, revealWords } from '../core/ui';
import { createMotes } from '../render/motes';

const WINDOW_SVG = `
<svg class="opening__window epilogue__window" viewBox="0 0 34 56" aria-hidden="true">
  <path d="M3 55V20a14 14 0 0 1 28 0v35Z" fill="currentColor" fill-opacity=".18" stroke="currentColor" stroke-width="1.2"/>
  <path d="M17 6v49M3 30h28" stroke="currentColor" stroke-width=".8" opacity=".6"/>
</svg>`;

// A small dome in gold line: drum windows glow as the light fills it.
const DOME_SVG = `
<svg class="epilogue__dome" viewBox="0 0 240 150" aria-hidden="true">
  <defs>
    <radialGradient id="ep-glow" cx="50%" cy="85%" r="60%">
      <stop offset="0%" stop-color="#e3c27a" stop-opacity=".55"/>
      <stop offset="100%" stop-color="#e3c27a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <path class="epilogue__glow" d="M30 120A90 90 0 0 1 210 120Z" fill="url(#ep-glow)"/>
  <path d="M30 120A90 90 0 0 1 210 120" class="ep-line"/>
  <path d="M20 120H220M20 128H220" class="ep-line ep-line--fine"/>
  <path d="M120 30V10" class="ep-line"/>
  <path d="M45 82A90 90 0 0 1 195 82" class="ep-line ep-line--fine"/>
  <g class="epilogue__windows">
    <rect x="38" y="104" width="6" height="12" rx="3"/><rect x="62" y="96" width="6" height="12" rx="3"/>
    <rect x="88" y="92" width="6" height="12" rx="3"/><rect x="114" y="91" width="6" height="12" rx="3"/>
    <rect x="140" y="92" width="6" height="12" rx="3"/><rect x="166" y="96" width="6" height="12" rx="3"/>
    <rect x="192" y="104" width="6" height="12" rx="3"/>
  </g>
</svg>`;

export function createEpilogue(ctx: ChapterContext): Chapter {
  const t = copy.epilogue;

  const top = eyebrow(numeralOf('epilogue'), t.eyebrow);
  const title = headline('h2', 'epilogue-title', t.headline, 'display epilogue__title');
  const lede = h('p', { class: 'lede' }, t.lede);
  const restart = button(t.restart, 'primary', '↺');
  const credits = button(t.credits, 'ghost');
  const actions = h('div', { class: 'opening__actions' }, restart, credits);

  const canvas = h('canvas', { class: 'opening__motes', 'aria-hidden': 'true' });
  const light = h('div', { class: 'opening__light epilogue__light', 'aria-hidden': 'true' });
  light.innerHTML = `${WINDOW_SVG}<div class="opening__beam epilogue__beam"></div>${DOME_SVG}`;
  light.append(canvas);

  const el = h(
    'section',
    {
      class: 'chapter opening epilogue',
      'data-theme': 'night',
      'aria-labelledby': 'epilogue-title',
    },
    light,
    h('div', { class: 'opening__content' }, top, title.el, lede, actions),
  );

  const motes = createMotes(canvas, 50, { x0: 0.72, y0: 0.06, dx: 0, dy: 0.75 });
  const glow = light.querySelector('.epilogue__glow')!;
  const windows = light.querySelectorAll('.epilogue__windows rect');

  restart.addEventListener('click', () => ctx.restart());
  credits.addEventListener('click', () => ctx.goTo('credits'));

  return {
    id: 'epilogue',
    theme: 'night',
    el,
    enter() {
      audio.setMood('night');
      if (reducedMotion()) {
        gsap.set([glow, ...windows], { opacity: 1 });
        gsap.fromTo([top, title.el, lede, actions], { opacity: 0 }, { opacity: 1, duration: 0.6 });
        return;
      }
      motes.start();
      gsap
        .timeline()
        .fromTo(light, { opacity: 0 }, { opacity: 1, duration: 2.4, ease: EASE.soft }, 0)
        .fromTo(
          [glow, ...windows],
          { opacity: 0 },
          { opacity: 1, duration: 2.6, ease: EASE.soft, stagger: 0.12 },
          1.2,
        )
        .fromTo(top, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 1, ease: EASE.out }, 0.6)
        .call(() => revealWords(title.words, 0, 1.6), [], 0.9)
        .fromTo(
          [lede, actions],
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 1.2, ease: EASE.out, stagger: 0.2 },
          2.6,
        )
        .call(() => audio.chime(220, 0.08), [], 1.6);
    },
    leave() {
      motes.stop();
    },
    focusTarget: () => title.el,
  };
}
