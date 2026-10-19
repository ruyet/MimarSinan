/**
 * Chapter controller: owns which chapter is active, which are unlocked,
 * the crossfade between them, focus management and the progress indicator.
 *
 * Each chapter is a self-contained module implementing `Chapter`.
 * When a chapter is entered, the next one is asked to `prepare()` — that is where
 * later chapters lazily create their images, so photos never load before they're needed.
 */
import { gsap } from 'gsap';
import { chapters as chapterMeta, type ChapterId } from '../content';
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
  /** Optional: a closing gesture played before the crossfade to the next chapter. */
  exit?(): Promise<void>;
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
  backButton: HTMLButtonElement,
): ChapterController {
  const registered = new Map<ChapterId, Chapter>();
  const loaders = new Map<ChapterId, () => Promise<Chapter>>();
  const loading = new Map<ChapterId, Promise<Chapter>>();
  const order = chapterMeta.map((c) => c.id);
  let current = -1;
  let unlocked = 0;
  let transitioning = false;
  let queued: number | null = null;
  // The pair being crossfaded (set just before an exit gesture runs).
  let previous: Chapter | undefined;
  let finishing: (() => void) | undefined;

  /* --- Progress indicator: one dash per numbered chapter ------------- */
  const steps = chapterMeta
    .map((meta, index) => ({ meta, index }))
    .filter(({ meta }) => meta.inProgress)
    .map(({ meta, index }) => {
      const label = meta.title;
      const btn = h('button', { type: 'button', class: 'progress__step', title: label });
      btn.append(h('span', { class: 'sr-only' }, label));
      btn.addEventListener('click', () => goToIndex(index));
      progressList.append(h('li', {}, btn));
      return { btn, index };
    });

  /* --- Back: one control in the HUD, always the previous scene in the story ---- */
  backButton.addEventListener('click', () => {
    if (current > 0) goToIndex(current - 1);
  });

  function renderProgress(): void {
    // Hidden (but keeping its place) on the first scene, where there is nothing to go back to.
    const canGoBack = current > 0;
    backButton.disabled = !canGoBack;
    backButton.classList.toggle('is-waiting', !canGoBack);
    backButton.setAttribute(
      'aria-label',
      canGoBack ? `Back to ${chapterMeta[current - 1].title}` : 'Back',
    );
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
    const n = steps.findIndex((st) => st.index === current);
    progressLabel.textContent = '';
    if (n >= 0) {
      progressLabel.append(
        h('span', { class: 'sr-only' }, `Part ${n + 1} of ${steps.length}: `),
        h('span', { 'aria-hidden': 'true' }, `${n + 1}/${steps.length}  `),
      );
    }
    progressLabel.append(h('strong', {}, meta.title));
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
    const first = current < 0;
    current = index;
    // Keep the address in step with the story, so the browser's own Back button retraces it and
    // every scene can be linked to. The first scene shown replaces the entry instead of adding one.
    const hash = `#${id}`;
    if (location.hash !== hash) {
      if (first) history.replaceState(null, '', hash);
      else history.pushState(null, '', hash);
    }
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
    announce(meta.title);

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
    // A scene may play its own closing gesture first.
    const reduced = reducedMotion();
    previous = prevChapter;
    finishing = finish;
    const leaving = current > order.indexOf(prevChapter.id) && prevChapter.exit;
    void (leaving ? prevChapter.exit!() : Promise.resolve()).then(() => crossfade(reduced));
  }

  function crossfade(reduced: boolean): void {
    const prevChapter = previous!;
    const nextChapter = registered.get(order[current])!;
    const incoming = nextChapter.el;
    const tl = gsap.timeline({ onComplete: finishing! });
    gsap.set(incoming, { visibility: 'visible', zIndex: 2, opacity: 0 });
    // Enter first: every entrance sets its starting state before the first visible frame, so a
    // scene can never flash in its final state while it fades in.
    nextChapter.enter();
    tl.to(prevChapter.el, {
      opacity: reduced ? 1 : 0.4,
      duration: reduced ? 0.01 : 0.7,
      ease: EASE.inOut,
    }).fromTo(
      incoming,
      { opacity: 0 },
      { opacity: 1, duration: reduced ? 0.3 : 0.8, ease: EASE.inOut },
      reduced ? 0 : 0.1,
    );
  }

  const goTo = (id: ChapterId): void => goToIndex(order.indexOf(id));

  return {
    register: add,
    registerLazy(id, load) {
      loaders.set(id, load);
    },
    start(initial = 'sinan') {
      // Deep links (e.g. #dilemma) unlock chapters up to that point — handy for user tests.
      const index = Math.max(0, order.indexOf(initial));
      unlocked = Math.min(index, steps[steps.length - 1].index);
      goToIndex(index);
    },
    next: () => goToIndex(current + 1),
    goTo,
    restart() {
      registered.forEach((c) => c.reset?.());
      goTo('sinan');
    },
  };
}
