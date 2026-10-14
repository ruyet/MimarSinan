/**
 * Chapter controller: owns which chapter is active, which are unlocked,
 * the crossfade between them, focus management and the progress indicator.
 *
 * Each chapter is a self-contained module implementing `Chapter`.
 * When a chapter is entered, the next one is asked to `prepare()` — that is where
 * later chapters lazily create their images, so photos never load before they're needed.
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
  restart(): void;
}

export interface Chapter {
  id: ChapterId;
  theme: Theme;
  /** The <section> root. Built once by the module. */
  el: HTMLElement;
  /** Called when the chapter becomes active. */
  enter(): void;
  /** Called when the chapter is left; stop loops, timers, audio here. */
  leave(): void;
  /** Element that receives focus on entry (usually the heading). */
  focusTarget(): HTMLElement | null;
  /** Optional: lazily create heavy assets (images) shortly before the chapter is shown. */
  prepare?(): void;
  /** Optional: return to the initial state (used by "Start again"). */
  reset?(): void;
}

export interface ChapterController extends ChapterContext {
  register(chapter: Chapter): void;
  /** Register a chapter whose code is loaded on demand (shortly before it is needed). */
  registerLazy(id: ChapterId, load: () => Promise<Chapter>): void;
  start(initial?: ChapterId): void;
}

export function createChapterController(
  stage: HTMLElement,
  progressList: HTMLOListElement,
  progressLabel: HTMLElement,
): ChapterController {
  const registered = new Map<ChapterId, Chapter>();
  const loaders = new Map<ChapterId, () => Promise<Chapter>>();
  const loading = new Map<ChapterId, Promise<Chapter>>();
  const order = chapterMeta.map((c) => c.id);
  let current = -1;
  let unlocked = 0;
  let transitioning = false;
  let queued: number | null = null;

  /* --- Progress indicator: one dash per numbered chapter ------------- */
  const steps = chapterMeta
    .map((meta, index) => ({ meta, index }))
    .filter(({ meta }) => meta.inProgress)
    .map(({ meta, index }) => {
      const label = meta.numeral ? `Chapter ${meta.numeral}: ${meta.title}` : meta.title;
      const btn = h('button', { type: 'button', class: 'progress__step', title: label });
      btn.append(h('span', { class: 'sr-only' }, label));
      btn.addEventListener('click', () => goToIndex(index));
      progressList.append(h('li', {}, btn));
      return { btn, index };
    });

  function renderProgress(): void {
    steps.forEach(({ btn, index }) => {
      btn.disabled = index > unlocked || !known(order[index]);
      btn.classList.toggle(
        'is-visited',
        index < current || (index <= unlocked && index !== current),
      );
      if (index === current) btn.setAttribute('aria-current', 'step');
      else btn.removeAttribute('aria-current');
    });
    const meta = chapterMeta[current];
    const num = meta.numeral || (meta.inProgress ? '—' : '');
    progressLabel.innerHTML = num
      ? `<strong>${num}</strong><span aria-hidden="true"> / ${copy.meta.progressTotal}</span> · ${meta.title}`
      : `<strong>${meta.title}</strong>`;
  }

  /* --- Lazy chapters ------------------------------------------------- */
  const known = (id: ChapterId | undefined): boolean =>
    !!id && (registered.has(id) || loaders.has(id));

  function add(chapter: Chapter): void {
    registered.set(chapter.id, chapter);
    chapter.el.setAttribute('inert', '');
    stage.append(chapter.el);
  }

  function ensure(id: ChapterId | undefined): Promise<Chapter | undefined> {
    if (!id) return Promise.resolve(undefined);
    const ready = registered.get(id);
    if (ready) return Promise.resolve(ready);
    const load = loaders.get(id);
    if (!load) return Promise.resolve(undefined);
    if (!loading.has(id))
      loading.set(
        id,
        load().then((c) => (add(c), c)),
      );
    return loading.get(id)!;
  }

  /** Load the chapter's code and let it create its images, without showing it. */
  const warm = (id: ChapterId | undefined): void => {
    void ensure(id).then((c) => c?.prepare?.());
  };

  /* --- Transitions --------------------------------------------------- */
  function goToIndex(index: number): void {
    const id = order[index];
    if (id && !registered.has(id) && loaders.has(id)) {
      void ensure(id).then(() => goToIndex(index));
      return;
    }
    const nextChapter = id ? registered.get(id) : undefined;
    if (!nextChapter || index === current) return;
    if (transitioning) {
      queued = index;
      return;
    }

    const prevChapter = current >= 0 ? registered.get(order[current]) : undefined;
    current = index;
    unlocked = Math.max(unlocked, index);
    transitioning = true;

    document.body.dataset.theme = nextChapter.theme;
    renderProgress();
    prevChapter?.leave();
    nextChapter.prepare?.();

    const incoming = nextChapter.el;
    incoming.removeAttribute('inert');
    incoming.scrollTop = 0;

    const meta = chapterMeta[index];
    announce(meta.numeral ? `Chapter ${meta.numeral}: ${meta.title}` : meta.title);

    const finish = (): void => {
      if (prevChapter) {
        prevChapter.el.classList.remove('is-active');
        prevChapter.el.setAttribute('inert', '');
        gsap.set(prevChapter.el, { clearProps: 'opacity,visibility,transform,zIndex' });
      }
      gsap.set(incoming, { clearProps: 'opacity,visibility,transform,zIndex' });
      incoming.classList.add('is-active');
      transitioning = false;
      // Move focus into the new chapter, except on first load (leave the page at the top).
      if (prevChapter) nextChapter.focusTarget()?.focus({ preventScroll: true });
      // Warm up the chapter after this one.
      warm(order[index + 1]);
      if (queued !== null) {
        const q = queued;
        queued = null;
        goToIndex(q);
      }
    };

    if (!prevChapter) {
      incoming.classList.add('is-active');
      nextChapter.enter();
      finish();
      return;
    }

    // Incoming layer fades in above the outgoing one, like turning to a new page.
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
        { opacity: 1, y: 0, duration: reduced ? 0.35 : 1.3, ease: EASE.inOut },
        reduced ? 0 : 0.15,
      )
      .call(() => nextChapter.enter(), [], reduced ? 0.15 : 0.6);
  }

  const goTo = (id: ChapterId): void => goToIndex(order.indexOf(id));

  return {
    register: add,
    registerLazy(id, load) {
      loaders.set(id, load);
    },
    start(initial = 'opening') {
      // Deep links (e.g. #dilemma) unlock chapters up to that point — handy for user tests.
      const index = Math.max(0, order.indexOf(initial));
      unlocked = Math.min(index, steps[steps.length - 1].index);
      goToIndex(index);
    },
    next: () => goToIndex(current + 1),
    goTo,
    restart() {
      registered.forEach((c) => c.reset?.());
      goTo('opening');
    },
  };
}
