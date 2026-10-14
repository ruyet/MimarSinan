/**
 * Motion preferences and shared easing names.
 * Every animated module checks `reducedMotion()` and swaps choreography for simple fades.
 *
 * Add `?reduced-motion` to the URL to force the reduced experience (for user tests),
 * regardless of the operating-system setting.
 */
const query = window.matchMedia('(prefers-reduced-motion: reduce)');
const forced = new URLSearchParams(location.search).has('reduced-motion');
if (forced) document.documentElement.classList.add('force-reduced-motion');

export const reducedMotion = (): boolean => forced || query.matches;

/** GSAP ease names, mirrored by the CSS easing tokens. No bounce, no linear. */
export const EASE = {
  out: 'expo.out',
  inOut: 'power3.inOut',
  soft: 'sine.inOut',
  hand: 'power1.inOut', // the speed of a pen: slow in, steady, slow out
} as const;
