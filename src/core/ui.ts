/**
 * Shared UI pieces. Every scene uses the same small vocabulary:
 * label → title → one sentence → (one control) → one action.
 *
 * Text enters with one short, shared fade so it is readable almost at once; the drawings
 * and photographs carry the motion.
 */
import { gsap } from 'gsap';
import { h } from './dom';
import { EASE, reducedMotion } from './motion';
import { splitHeadline } from './splitText';

export function label(text: string): HTMLElement {
  return h('p', { class: 'label' }, text);
}

export interface Title {
  el: HTMLElement;
  set(text: string): void;
}

/** A focusable scene heading (focus moves here when a scene opens). */
export function title(tag: 'h1' | 'h2' | 'h3', id: string, text: string, cls = 'title'): Title {
  const el = h(tag, { id, class: cls, tabindex: '-1' }, text);
  return {
    el,
    set(next) {
      swapText(el, next);
    },
  };
}

/**
 * Swap an element's text with a short crossfade. A newer swap always cancels an older one, so
 * quick successive changes can never end on a stale text.
 */
export function swapText(node: HTMLElement, text: string): void {
  gsap.killTweensOf(node);
  if (node.textContent === text) {
    gsap.set(node, { opacity: 1 });
    return;
  }
  if (reducedMotion()) {
    node.textContent = text;
    gsap.set(node, { opacity: 1 });
    return;
  }
  gsap.to(node, {
    opacity: 0,
    duration: 0.2,
    ease: EASE.out,
    onComplete: () => {
      node.textContent = text;
      gsap.to(node, { opacity: 1, duration: 0.45, ease: EASE.out });
    },
  });
}

/** The shared entrance for a text column: quick, small, readable within half a second. */
export function enterText(els: (Element | null)[], delay = 0): void {
  const list = els.filter(Boolean) as Element[];
  if (!list.length) return;
  if (reducedMotion()) {
    gsap.fromTo(list, { opacity: 0 }, { opacity: 1, duration: 0.4, delay });
    return;
  }
  gsap.fromTo(
    list,
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration: 0.7, ease: EASE.out, stagger: 0.06, delay },
  );
}

export function button(
  text: string,
  variant: 'primary' | 'ghost' = 'primary',
  arrow?: string,
): HTMLButtonElement {
  return h(
    'button',
    { type: 'button', class: variant === 'ghost' ? 'btn btn--ghost' : 'btn' },
    h('span', { 'data-label': '' }, text),
    arrow ? h('span', { class: 'btn__arrow', 'aria-hidden': 'true' }, arrow) : null,
  );
}

export function setButtonLabel(btn: HTMLButtonElement, text: string): void {
  const span = btn.querySelector('[data-label]');
  if (span) span.textContent = text;
}

/**
 * Reveal an element that already holds its place in the layout (class `is-waiting`: invisible
 * but measured). Nothing around it moves: it only fades in where it has always been.
 */
export function reveal(el: HTMLElement, delay = 0): void {
  if (!el.classList.contains('is-waiting')) return;
  el.classList.remove('is-waiting');
  if (reducedMotion()) {
    gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3, delay });
    return;
  }
  gsap.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.7, ease: EASE.out, delay });
}

/** Put an element back into its waiting state (used by reset). */
export function conceal(el: HTMLElement): void {
  gsap.killTweensOf(el);
  gsap.set(el, { clearProps: 'opacity,transform' });
  el.classList.add('is-waiting');
}

/* --- Epilogue only: the word-by-word headline it has always had ----------- */

export interface SplitTitle {
  el: HTMLElement;
  words: HTMLElement[];
}

export function splitTitle(tag: 'h2', id: string, text: string, cls: string): SplitTitle {
  const el = h(tag, { id, class: cls, tabindex: '-1' });
  return { el, words: splitHeadline(el, text) };
}

export function revealWords(words: HTMLElement[], delay = 0, duration = 1.3): void {
  if (reducedMotion()) {
    gsap.fromTo(words, { opacity: 0 }, { opacity: 1, duration: 0.4, delay });
    return;
  }
  gsap.fromTo(
    words,
    { yPercent: 105, opacity: 0 },
    { yPercent: 0, opacity: 1, duration, ease: EASE.out, stagger: 0.08, delay },
  );
}
