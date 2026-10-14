/**
 * Motion preferences and shared easing names.
 * Every animated module checks `reducedMotion()` and swaps choreography for simple fades.
 */
const query = window.matchMedia('(prefers-reduced-motion: reduce)');

export const reducedMotion = (): boolean => query.matches;

export function onReducedMotionChange(cb: (reduced: boolean) => void): void {
  query.addEventListener('change', (e) => cb(e.matches));
}

/** GSAP ease names, mirrored by the CSS easing tokens. No bounce, no linear. */
export const EASE = {
  out: 'expo.out',
  inOut: 'power3.inOut',
  soft: 'sine.inOut',
  hand: 'power1.inOut', // the speed of a pen: slow in, steady, slow out
} as const;
