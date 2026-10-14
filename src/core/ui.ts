/**
 * Shared UI pieces so every chapter has the same anatomy:
 * eyebrow (numeral + label) → headline with one italic accent → short body → figure → action.
 */
import { gsap } from 'gsap';
import { h } from './dom';
import { EASE, reducedMotion } from './motion';
import { splitHeadline } from './splitText';

export function eyebrow(numeral: string, label: string): HTMLElement {
  return h(
    'p',
    { class: 'eyebrow' },
    numeral ? h('span', { class: 'eyebrow__num', 'aria-hidden': 'true' }, numeral) : null,
    label,
  );
}

export interface Headline {
  el: HTMLElement;
  words: HTMLElement[];
  /** Replace the text; animates word by word unless reduced motion is on. */
  set(text: string, animate?: boolean): void;
}

export function headline(
  tag: 'h1' | 'h2' | 'h3',
  id: string,
  text: string,
  className = 'headline',
): Headline {
  const el = h(tag, { id, class: className, tabindex: '-1' });
  const api: Headline = {
    el,
    words: splitHeadline(el, text),
    set(next, animate = true) {
      api.words = splitHeadline(el, next);
      if (animate) revealWords(api.words, 0, 0.9);
    },
  };
  return api;
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

/** Standard entrance for a text column: eyebrow, headline words, then the rest. */
export function introText(top: HTMLElement | null, words: HTMLElement[], rest: Element[]): void {
  const all = [top, ...words, ...rest].filter(Boolean) as Element[];
  if (reducedMotion()) {
    gsap.fromTo(all, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    return;
  }
  const tl = gsap.timeline();
  if (top)
    tl.fromTo(top, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 1, ease: EASE.out }, 0);
  tl.fromTo(
    words,
    { yPercent: 105, opacity: 0 },
    { yPercent: 0, opacity: 1, duration: 1.3, ease: EASE.out, stagger: 0.08 },
    0.15,
  );
  if (rest.length) {
    tl.fromTo(
      rest,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 1.1, ease: EASE.out, stagger: 0.14 },
      0.7,
    );
  }
}

export function button(
  label: string,
  variant: 'primary' | 'secondary' | 'ghost' = 'primary',
  arrow?: string,
): HTMLButtonElement {
  return h(
    'button',
    { type: 'button', class: `btn btn--${variant}` },
    h('span', { 'data-label': '' }, label),
    arrow ? h('span', { class: 'btn__arrow', 'aria-hidden': 'true' }, arrow) : null,
  );
}

export function setButtonLabel(btn: HTMLButtonElement, label: string): void {
  const span = btn.querySelector('[data-label]');
  if (span) span.textContent = label;
}

/** A drawing "sheet": figure with crop marks and an italic caption. */
export function sheet(
  content: Element,
  caption: string,
  className = '',
): {
  figure: HTMLElement;
  caption: HTMLElement;
} {
  const cap = h('figcaption', {}, caption);
  const figure = h('figure', { class: `sheet ${className}`.trim() }, content, cap);
  return { figure, caption: cap };
}

/** Emphasis in captions: *text* → <em>text</em> (content is trusted, but we build nodes safely). */
export function richText(el: HTMLElement, text: string): HTMLElement {
  el.textContent = '';
  text.split(/(\*[^*]+\*)/).forEach((part) => {
    if (!part) return;
    if (part.startsWith('*') && part.endsWith('*')) el.append(h('em', {}, part.slice(1, -1)));
    else el.append(part);
  });
  return el;
}

/** A margin note: the figure number set large, a rule, and one short line (wide screens only). */
export function marginNote(figLabel: string, text: string): HTMLElement {
  return h(
    'aside',
    { class: 'spread__margin margin-note', 'aria-hidden': 'true' },
    h('span', { class: 'margin-note__fig' }, figLabel),
    h('span', { class: 'margin-note__rule' }),
    h('span', {}, text),
  );
}
