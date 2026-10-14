/**
 * Chapter controller: owns which chapter is active, which are unlocked,
 * the crossfade between them, focus management and the progress indicator.
 *
 * Each chapter is a self-contained module implementing `Chapter`.
 * Chapters not yet built (later POCs) simply aren't registered; the progress
 * indicator still lists them as locked so the shape of the story is visible.
 */
import { gsap } from 'gsap';
import { chapters as chapterMeta, copy, type ChapterId } from '../content';
import { announce } from './announcer';
import { h } from './dom';
import { EASE, reducedMotion } from './motion';

export type Theme = 'night' | 'stone';

export interface ChapterContext {
  next(): void;
  goTo(id: ChapterId): void;
}

export interface Chapter {
  id: ChapterId;
  theme: Theme;
  /** The <section> root. Built once by the module. */
  el: HTMLElement;
  /** Called when the chapter becomes active (after it is visible). */
  enter(): void;
  /** Called when the chapter is left; stop loops, timers, audio here. */
  leave(): void;
  /** Element that receives focus on entry (usually the heading). */
  focusTarget(): HTMLElement | null;
}

export interface ChapterController extends ChapterContext {
  register(chapter: Chapter): void;
  start(initial?: ChapterId): void;
}

export function createChapterController(
  stage: HTMLElement,
  progressList: HTMLOListElement,
  progressLabel: HTMLElement,
): ChapterController {
  const registered = new Map<ChapterId, Chapter>();
  const order = chapterMeta.map((c) => c.id);
  let current = -1;
  let unlocked = 0;
  let transitioning = false;

  /* --- Progress indicator ------------------------------------------- */
  const stepButtons = chapterMeta.map((meta, i) => {
    const label = meta.numeral ? `Chapter ${meta.numeral}: ${meta.title}` : meta.title;
    const btn = h('button', {
      type: 'button',
      class: 'progress__step',
      'aria-label': label,
      title: label,
    });
    btn.addEventListener('click', () => goToIndex(i));
    progressList.append(h('li', {}, btn));
    return btn;
  });

  function renderProgress(): void {
    stepButtons.forEach((btn, i) => {
      const available = i <= unlocked && registered.has(order[i]);
      btn.disabled = !available;
      btn.classList.toggle('is-visited', i < current);
      if (i === current) btn.setAttribute('aria-current', 'step');
      else btn.removeAttribute('aria-current');
    });
    const meta = chapterMeta[current];
    const total = chapterMeta.length - 1;
    progressLabel.innerHTML = meta.numeral
      ? `<strong>${meta.numeral}</strong> / ${chapterMeta[total].numeral} · ${meta.title}`
      : `<strong>${meta.title}</strong>`;
  }

  /* --- Transitions --------------------------------------------------- */
  function goToIndex(index: number): void {
    const id = order[index];
    const nextChapter = id ? registered.get(id) : undefined;
    if (!nextChapter || index === current || transitioning) return;

    const prevChapter = current >= 0 ? registered.get(order[current]) : undefined;
    current = index;
    unlocked = Math.max(unlocked, index);
    transitioning = true;

    document.body.dataset.theme = nextChapter.theme;
    renderProgress();
    prevChapter?.leave();

    const incoming = nextChapter.el;
    incoming.removeAttribute('inert');
    incoming.scrollTop = 0;

    const finish = (): void => {
      if (prevChapter) {
        prevChapter.el.classList.remove('is-active');
        prevChapter.el.setAttribute('inert', '');
        gsap.set(prevChapter.el, { clearProps: 'opacity,visibility,transform,zIndex' });
      }
      gsap.set(incoming, { clearProps: 'opacity,visibility,transform,zIndex' });
      incoming.classList.add('is-active');
      transitioning = false;
      // Move focus to the new chapter, except on first load (leave the page at the top).
      if (prevChapter) nextChapter.focusTarget()?.focus({ preventScroll: true });
    };

    const meta = chapterMeta[index];
    announce(copy.meta.chapterAnnounce(meta.numeral, meta.title));

    if (!prevChapter) {
      incoming.classList.add('is-active');
      finish();
      nextChapter.enter();
      return;
    }

    // Incoming layer fades in above the outgoing one: night → stone reads as dawn.
    const reduced = reducedMotion();
    const tl = gsap.timeline({ onComplete: finish });
    gsap.set(incoming, { visibility: 'visible', zIndex: 2, opacity: 0 });
    tl.to(prevChapter.el, {
      opacity: reduced ? 1 : 0.6,
      y: reduced ? 0 : -24,
      duration: reduced ? 0.01 : 1,
      ease: EASE.inOut,
    })
      .fromTo(
        incoming,
        { opacity: 0, y: reduced ? 0 : 16 },
        { opacity: 1, y: 0, duration: reduced ? 0.35 : 1.4, ease: EASE.inOut },
        reduced ? 0 : 0.15,
      )
      // Let the chapter start its own choreography while the fade settles.
      .call(() => nextChapter.enter(), [], reduced ? 0.2 : 0.7);
  }

  function goTo(id: ChapterId): void {
    goToIndex(order.indexOf(id));
  }

  function next(): void {
    goToIndex(current + 1);
  }

  return {
    register(chapter) {
      registered.set(chapter.id, chapter);
      chapter.el.setAttribute('inert', '');
      stage.append(chapter.el);
    },
    start(initial = 'opening') {
      // Deep links (e.g. #problem) unlock chapters up to that point — handy for user tests.
      const index = Math.max(0, order.indexOf(initial));
      unlocked = index;
      goToIndex(index);
    },
    next,
    goTo,
  };
}
