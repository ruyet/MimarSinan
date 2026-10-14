/**
 * Chapter 0 — Opening. "How do you hold up the sky?"
 * A dark room, one slow beam of light from a small arched window, drifting dust,
 * a headline that rises word by word, and a single action: Begin.
 */
import { gsap } from 'gsap';
import { audio } from '../audio/audio';
import { copy } from '../content';
import type { Chapter, ChapterContext } from '../core/chapters';
import { h } from '../core/dom';
import { EASE, reducedMotion } from '../core/motion';
import { bindSoundToggle, soundToggleContents } from '../core/soundToggle';
import { splitHeadline } from '../core/splitText';
import { createMotes } from '../render/motes';

const WINDOW_SVG = `
<svg class="opening__window" viewBox="0 0 34 56" aria-hidden="true">
  <path d="M3 55V20a14 14 0 0 1 28 0v35Z" fill="currentColor" fill-opacity=".18" stroke="currentColor" stroke-width="1.2"/>
  <path d="M17 6v49M3 30h28" stroke="currentColor" stroke-width=".8" opacity=".6"/>
</svg>`;

export function createOpening(ctx: ChapterContext): Chapter {
  const t = copy.opening;

  const title = h('h1', { id: 'opening-title', class: 'display', tabindex: '-1' });
  const words = splitHeadline(title, t.headline);

  const begin = h(
    'button',
    { type: 'button', class: 'btn btn--primary' },
    t.begin,
    h('span', { class: 'btn__arrow', 'aria-hidden': 'true' }, '→'),
  );

  const sound = h('button', {
    type: 'button',
    class: 'sound-toggle',
    'aria-pressed': 'false',
    'aria-describedby': 'opening-sound-hint',
  });
  sound.innerHTML = soundToggleContents();
  bindSoundToggle(sound);

  const canvas = h('canvas', { class: 'opening__motes', 'aria-hidden': 'true' });
  const light = h('div', { class: 'opening__light', 'aria-hidden': 'true' });
  light.innerHTML = `${WINDOW_SVG}<div class="opening__beam"></div><div class="opening__pool"></div>`;
  light.append(canvas);

  const eyebrow = h('p', { class: 'eyebrow' }, t.eyebrow);
  const lede = h('p', { class: 'lede' }, t.lede);
  const actions = h('div', { class: 'opening__actions' }, begin, sound);
  const hint = h('p', { class: 'opening__hint', id: 'opening-sound-hint' }, t.soundHint);
  const footer = h('p', { class: 'opening__footer' }, t.footer);

  const el = h(
    'section',
    { class: 'chapter opening', 'data-theme': 'night', 'aria-labelledby': 'opening-title' },
    light,
    h('div', { class: 'opening__content' }, eyebrow, title, lede, actions, hint),
    footer,
  );

  const motes = createMotes(canvas);
  let introPlayed = false;

  begin.addEventListener('click', () => {
    audio.chime(293.66, 0.12);
    ctx.next();
  });

  function playIntro(): void {
    const supporting = [eyebrow, lede, actions, hint, footer];
    if (reducedMotion()) {
      gsap.fromTo([title, ...supporting], { opacity: 0 }, { opacity: 1, duration: 0.6 });
      return;
    }
    gsap
      .timeline()
      .fromTo(light, { opacity: 0 }, { opacity: 1, duration: 3, ease: EASE.soft }, 0)
      .fromTo(
        eyebrow,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 1.2, ease: EASE.out },
        0.6,
      )
      .fromTo(
        words,
        { yPercent: 105, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.6, ease: EASE.out, stagger: 0.09 },
        0.9,
      )
      .fromTo(
        [lede, actions, hint],
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 1.2, ease: EASE.out, stagger: 0.15 },
        2.1,
      )
      .fromTo(footer, { opacity: 0 }, { opacity: 1, duration: 1.5, ease: EASE.soft }, 2.8);
  }

  return {
    id: 'opening',
    theme: 'night',
    el,
    enter() {
      audio.setMood('night');
      if (!reducedMotion()) motes.start();
      if (!introPlayed) {
        introPlayed = true;
        playIntro();
      }
    },
    leave() {
      motes.stop();
    },
    reset() {
      introPlayed = false;
    },
    focusTarget: () => title,
  };
}
